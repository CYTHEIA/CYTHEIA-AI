import type { PlacedComponent, Connection, SimulationState, SimulationComponentState, SimulationPinState } from '@/types';
import type { EnvironmentObject } from '@/types';
import { COMPONENT_MAP } from '@/components/library';
import { ArduinoInterpreter } from './interpreter';
import { uid } from '@/utils/uid';
import { resolveNetworkState } from './network';

export class SimulationEngine {
  private components: PlacedComponent[];
  private connections: Connection[];
  private environment: EnvironmentObject[];
  private interpreter: ArduinoInterpreter | null = null;
  private state: SimulationState;
  private running: boolean = false;
  private paused: boolean = false;
  private speed: number = 1;
  private lastTime: number = 0;
  private motorAngle: number = 0;
  private servoAngle: number = 90;
  private onStateUpdate: (state: SimulationState) => void = () => {};

  constructor() {
    this.components = [];
    this.connections = [];
    this.state = {
      time: 0,
      components: {},
      serialOutput: [],
      errors: [],
      arduinoPins: {},
    };
    this.environment = [];
  }

  setOnStateUpdate(cb: (state: SimulationState) => void) {
    this.onStateUpdate = cb;
  }

  load(components: PlacedComponent[], connections: Connection[], code: string, speed: number, environment: EnvironmentObject[] = []) {
    this.components = components;
    this.connections = connections;
    this.environment = environment;
    this.speed = speed;
    this.interpreter = new ArduinoInterpreter({ components, connections, code, speed, environment });
    this.interpreter.onSerialOutput = (text) => {
      this.state.serialOutput.push({ id: uid(), text, timestamp: Date.now() } as any);
      this.onStateUpdate(this.state);
    };
    this.interpreter.onError = (msg) => {
      this.state.errors.push(msg);
      this.onStateUpdate(this.state);
    };
    this.interpreter.onPinChange = (pin, value, mode) => {
      this.state.arduinoPins[pin] = {
        voltage: value ? 5 : 0,
        digital: value ? 'HIGH' : 'LOW',
        analog: mode === 'pwm' ? value : value * 1023,
        pwm: mode === 'pwm' ? { duty: value / 255, frequency: 490 } : undefined,
      };
    };
  }

  start(): boolean {
    if (!this.interpreter) return false;
    this.state = {
      time: 0,
      components: {},
      serialOutput: [],
      errors: [],
      arduinoPins: {},
    };
    this.running = true;
    this.paused = false;
    this.lastTime = Date.now();
    const ok = this.interpreter.start();
    if (!ok) {
      this.running = false;
      this.onStateUpdate(this.state);
      return false;
    }
    this.updateComponentStates();
    this.onStateUpdate(this.state);
    return true;
  }

  pause() {
    this.paused = true;
    if (this.interpreter) this.interpreter.pause();
  }

  resume() {
    this.paused = false;
    this.lastTime = Date.now();
    if (this.interpreter) this.interpreter.resume();
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this.interpreter) this.interpreter.stop();
    this.state = {
      time: 0,
      components: {},
      serialOutput: [],
      errors: [],
      arduinoPins: {},
    };
    this.updateComponentStates();
    this.onStateUpdate(this.state);
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  isRunning() {
    return this.running;
  }

  isPaused() {
    return this.paused;
  }

  tick() {
    if (!this.running || this.paused || !this.interpreter) return;

    const now = Date.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.state.time += delta;

    this.interpreter.step(delta);
    this.updateComponentStates();
    this.onStateUpdate(this.state);
  }

  getState(): SimulationState {
    return this.state;
  }

  private updateComponentStates() {
    const compStates: Record<string, SimulationComponentState> = {};

    // Find arduino
    const arduino = this.components.find((c) => c.type.startsWith('arduino'));
    const arduinoPins = this.interpreter
      ? Array.from({ length: 20 }, (_, i) => {
          const val = this.interpreter!.getPinValue(i);
          return { pin: i, val };
        })
      : [];

    for (const comp of this.components) {
      const def = COMPONENT_MAP[comp.type];
      if (!def) continue;
      const pins: Record<string, SimulationPinState> = {};

      for (const pin of def.pins) {
        let voltage = 0;
        let digital: 'HIGH' | 'LOW' | 'FLOATING' = 'FLOATING';
        let analog = 0;

        const resolved = resolveNetworkState({ componentId: comp.id, pinId: pin.id }, {
          components: this.components,
          connections: this.connections,
          readArduinoPin: (pinNumber) => this.interpreter?.getPinValue(pinNumber) ?? 0,
        });
        voltage = resolved.voltage;
        digital = resolved.digital;
        analog = resolved.analog;
        const pwm = pin.type === 'pwm' && analog > 0 && analog <= 255
          ? { duty: analog / 255, frequency: 490 }
          : undefined;

        // Self-powered components
        if (comp.type === 'power-5v' && pin.id === '+') {
          voltage = 5;
          digital = 'HIGH';
        }
        if (comp.type === 'power-3v3' && pin.id === '+') {
          voltage = 3.3;
          digital = 'HIGH';
        }
        if (comp.type === 'battery' && pin.id === '+') {
          voltage = comp.props.voltage || 9;
          digital = 'HIGH';
        }
        if (pin.type === 'ground' || pin.id === 'gnd' || pin.id === '-') {
          voltage = 0;
          digital = 'LOW';
        }

        pins[pin.id] = { voltage, digital, analog, pwm };
      }

      const visual = this.computeVisualState(comp, pins);
      if (comp.type === 'ultrasonic-sensor') visual.distance = this.getNearestObstacleDistance(comp);
      if (comp.type === 'ir-sensor') visual.detected = this.isObstacleNear(comp);
      compStates[comp.id] = { componentId: comp.id, pins, visual };
    }

    this.state.components = compStates;
  }

  private computeVisualState(comp: PlacedComponent, pins: Record<string, SimulationPinState>): Record<string, any> {
    const visual: Record<string, any> = {};

    switch (comp.type) {
      case 'led': {
        const a = pins['a'];
        const c = pins['c'];
        visual.lit = a?.digital === 'HIGH' && c?.digital === 'LOW';
        visual.brightness = visual.lit ? Math.min(1, (a?.analog ?? 1023) / 1023) : 0;
        break;
      }
      case 'dc-motor': {
        const plus = pins['+'];
        if (plus?.digital === 'HIGH') {
          this.motorAngle = (this.motorAngle + 10) % 360;
          visual.angle = this.motorAngle;
          visual.running = true;
        } else {
          visual.running = false;
        }
        break;
      }
      case 'servo': {
        const sig = pins['sig'];
        if (sig?.pwm) {
          this.servoAngle = sig.pwm.duty * 180;
          visual.angle = this.servoAngle;
        } else if (sig?.analog > 0 && sig.analog <= 255) {
          this.servoAngle = (sig.analog / 255) * 180;
          visual.angle = this.servoAngle;
        } else if (sig?.digital === 'HIGH') {
          visual.angle = 180;
        } else {
          visual.angle = 90;
        }
        break;
      }
      case 'seven-segment': {
        // Show number based on which pins are high
        const segMap: Record<number, number[]> = {
          0: [1,1,1,1,1,1,0],
          1: [0,1,1,0,0,0,0],
          2: [1,1,0,1,1,0,1],
          3: [1,1,1,1,0,0,1],
          4: [0,1,1,0,0,1,1],
          5: [1,0,1,1,0,1,1],
          6: [1,0,1,1,1,1,1],
          7: [1,1,1,0,0,0,0],
          8: [1,1,1,1,1,1,1],
          9: [1,1,1,1,0,1,1],
        };
        const val = comp.props.value || 0;
        visual.segments = segMap[val] || [false, false, false, false, false, false, false];
        break;
      }
      case 'led-matrix': {
        // Simple pattern
        const grid = Array(8).fill(null).map(() => Array(8).fill(false));
        const vcc = pins['vcc'];
        if (vcc?.digital === 'HIGH') {
          for (let i = 0; i < 8; i++) {
            grid[i][i] = true;
          }
        }
        visual.grid = grid;
        break;
      }
    }

    return visual;
  }

  getErrors(): string[] {
    return this.state.errors;
  }

  clearErrors() {
    this.state.errors = [];
  }

  private getNearestObstacleDistance(sensor: PlacedComponent): number {
    const obstacles = this.environment.filter((object) => ['obstacle', 'wall', 'box', 'moving-obstacle', 'reflective-surface'].includes(object.type));
    if (obstacles.length === 0) return Number(sensor.props.range ?? 400);
    return Math.min(...obstacles.map((object) => Math.max(1, Math.hypot(object.x - sensor.x, object.y - sensor.y) / 4)));
  }

  private isObstacleNear(sensor: PlacedComponent): boolean {
    return this.getNearestObstacleDistance(sensor) <= Number(sensor.props.detectionRange ?? 20);
  }
}

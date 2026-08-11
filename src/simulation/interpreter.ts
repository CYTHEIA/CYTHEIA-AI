import type { PlacedComponent, Connection, SimulationState, SimulationComponentState, SimulationPinState } from '@/types';
import { COMPONENT_MAP } from '@/components/library';

export interface InterpreterConfig {
  components: PlacedComponent[];
  connections: Connection[];
  code: string;
  speed: number;
}

interface PinMode {
  pin: number;
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
}

export class ArduinoInterpreter {
  private code: string;
  private components: PlacedComponent[];
  private connections: Connection[];
  private speed: number;

  // Arduino runtime state
  private pinModes: Map<number, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'> = new Map();
  private pinValues: Map<number, number> = new Map(); // digital: 0/1, analog: 0-1023, pwm: 0-255
  private serialBuffer: string[] = [];
  private serialBaud: number = 9600;
  private serialInit: boolean = false;
  private startTime: number = 0;
  private loopCount: number = 0;

  // Compiled functions
  private setupFn: (() => void) | null = null;
  private loopFn: (() => void) | null = null;

  // Running state
  private running: boolean = false;
  private paused: boolean = false;
  private nextDelay: number = 0;
  private delayRemaining: number = 0;

  // Callbacks
  onSerialOutput: (text: string) => void = () => {};
  onPinChange: (pin: number, value: number, mode: string) => void = () => {};
  onError: (msg: string) => void = () => {};

  constructor(config: InterpreterConfig) {
    this.code = config.code;
    this.components = config.components;
    this.connections = config.connections;
    this.speed = config.speed;
  }

  compile(): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    try {
      const code = this.code;

      // Extract setup and loop
      const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
      const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);

      if (!setupMatch) {
        errors.push('Missing setup() function');
        return { success: false, errors };
      }
      if (!loopMatch) {
        errors.push('Missing loop() function');
        return { success: false, errors };
      }

      const setupBody = setupMatch[1];
      const loopBody = loopMatch[1];

      // Build runtime API
      const api = this.createRuntimeAPI();

      // Compile setup
      try {
        this.setupFn = new Function(
          ...Object.keys(api),
          setupBody
        ).bind(null, ...Object.values(api));
      } catch (e: any) {
        errors.push(`Setup error: ${e.message}`);
      }

      // Compile loop
      try {
        this.loopFn = new Function(
          ...Object.keys(api),
          loopBody
        ).bind(null, ...Object.values(api));
      } catch (e: any) {
        errors.push(`Loop error: ${e.message}`);
      }

      return { success: errors.length === 0, errors };
    } catch (e: any) {
      errors.push(`Compilation error: ${e.message}`);
      return { success: false, errors };
    }
  }

  private createRuntimeAPI(): Record<string, any> {
    const self = this;

    return {
      pinMode: (pin: number, mode: string) => {
        self.pinModes.set(pin, mode as any);
      },
      digitalWrite: (pin: number, value: any) => {
        const val = value === 'HIGH' || value === 1 || value === true ? 1 : 0;
        self.pinValues.set(pin, val);
        self.onPinChange(pin, val, 'digital');
      },
      digitalRead: (pin: number): number => {
        // Read from connected component
        const val = self.readPinFromCircuit(pin);
        return val;
      },
      analogRead: (pin: number): number => {
        const val = self.readAnalogFromCircuit(pin);
        return val;
      },
      analogWrite: (pin: number, value: number) => {
        self.pinValues.set(pin, value);
        self.onPinChange(pin, value, 'pwm');
      },
      delay: (ms: number) => {
        self.delayRemaining = ms;
      },
      delayMicroseconds: (us: number) => {
        self.delayRemaining = us / 1000;
      },
      millis: (): number => {
        return Date.now() - self.startTime;
      },
      micros: (): number => {
        return (Date.now() - self.startTime) * 1000;
      },
      Serial: {
        begin: (baud: number) => {
          self.serialBaud = baud;
          self.serialInit = true;
        },
        print: (text: any) => {
          self.onSerialOutput(String(text));
        },
        println: (text?: any) => {
          self.onSerialOutput((text !== undefined ? String(text) : '') + '\n');
        },
        write: (data: any) => {
          self.onSerialOutput(String.fromCharCode(data));
        },
        available: (): number => 0,
        read: (): number => -1,
      },
      map: (x: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
        return Math.round((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
      },
      constrain: (x: number, a: number, b: number): number => {
        return Math.max(a, Math.min(b, x));
      },
      abs: (x: number): number => Math.abs(x),
      min: (a: number, b: number): number => Math.min(a, b),
      max: (a: number, b: number): number => Math.max(a, b),
      pow: (a: number, b: number): number => Math.pow(a, b),
      sqrt: (x: number): number => Math.sqrt(x),
      sin: (x: number): number => Math.sin(x),
      cos: (x: number): number => Math.cos(x),
      tan: (x: number): number => Math.tan(x),
      random: (min: number, max?: number): number => {
        if (max === undefined) {
          max = min;
          min = 0;
        }
        return Math.floor(Math.random() * (max - min)) + min;
      },
      bitRead: (x: number, n: number): number => (x >> n) & 1,
      bitWrite: (x: number, n: number, b: number): number => (x & ~(1 << n)) | ((b ? 1 : 0) << n),
      bitSet: (x: number, n: number): number => x | (1 << n),
      bitClear: (x: number, n: number): number => x & ~(1 << n),
      bit: (n: number): number => 1 << n,
      HIGH: 1,
      LOW: 0,
      INPUT: 'INPUT',
      OUTPUT: 'OUTPUT',
      INPUT_PULLUP: 'INPUT_PULLUP',
      LED_BUILTIN: 13,
      A0: 14,
      A1: 15,
      A2: 16,
      A3: 17,
      A4: 18,
      A5: 19,
      true: true,
      false: false,
      Serial1: {
        begin: () => {},
        print: () => {},
        println: () => {},
      },
    };
  }

  private readPinFromCircuit(pin: number): number {
    // Find Arduino component
    const arduino = this.components.find((c) => c.type.startsWith('arduino'));
    if (!arduino) return 0;

    const pinId = `d${pin}`;
    // Find connections to this pin
    const conns = this.connections.filter(
      (c) => (c.fromComponent === arduino.id && c.fromPin === pinId) || (c.toComponent === arduino.id && c.toPin === pinId)
    );

    for (const conn of conns) {
      const otherCompId = conn.fromComponent === arduino.id ? conn.toComponent : conn.fromComponent;
      const otherPinId = conn.fromComponent === arduino.id ? conn.toPin : conn.fromPin;
      const otherComp = this.components.find((c) => c.id === otherCompId);
      if (!otherComp) continue;

      if (otherComp.type === 'push-button') {
        return otherComp.props.pressed ? 1 : 0;
      }
      if (otherComp.type === 'switch') {
        return otherComp.props.closed ? 1 : 0;
      }
      if (otherComp.type === 'pir-sensor') {
        return otherComp.props.motion ? 1 : 0;
      }
      if (otherComp.type === 'ir-sensor') {
        return otherComp.props.detected ? 1 : 0;
      }
      if (otherComp.type === 'ultrasonic-sensor' && otherPinId === 'echo') {
        return 1;
      }
    }

    // Check pullup
    const mode = this.pinModes.get(pin);
    if (mode === 'INPUT_PULLUP') return 1;

    return 0;
  }

  private readAnalogFromCircuit(pin: number): number {
    const arduino = this.components.find((c) => c.type.startsWith('arduino'));
    if (!arduino) return 0;

    const pinId = `a${pin}`;
    const conns = this.connections.filter(
      (c) => (c.fromComponent === arduino.id && c.fromPin === pinId) || (c.toComponent === arduino.id && c.toPin === pinId)
    );

    for (const conn of conns) {
      const otherCompId = conn.fromComponent === arduino.id ? conn.toComponent : conn.fromComponent;
      const otherPinId = conn.fromComponent === arduino.id ? conn.toPin : conn.fromPin;
      const otherComp = this.components.find((c) => c.id === otherCompId);
      if (!otherComp) continue;

      if (otherComp.type === 'potentiometer' && otherPinId === 'w') {
        return Math.round((otherComp.props.value ?? 0.5) * 1023);
      }
      if (otherComp.type === 'temp-sensor' && otherPinId === 'out') {
        return Math.round((otherComp.props.temperature ?? 25) * 20.48);
      }
      if (otherComp.type === 'light-sensor' && otherPinId === 'out') {
        return Math.round((otherComp.props.light ?? 0.5) * 1023);
      }
    }

    return 0;
  }

  start() {
    const result = this.compile();
    if (!result.success) {
      result.errors.forEach((e) => this.onError(e));
      return false;
    }
    this.running = true;
    this.paused = false;
    this.startTime = Date.now();
    this.loopCount = 0;
    this.delayRemaining = 0;
    try {
      this.setupFn?.();
    } catch (e: any) {
      this.onError(`Setup runtime error: ${e.message}`);
    }
    return true;
  }

  step(deltaMs: number) {
    if (!this.running || this.paused) return;

    if (this.delayRemaining > 0) {
      this.delayRemaining -= deltaMs * this.speed;
      if (this.delayRemaining > 0) return;
    }

    try {
      this.loopFn?.();
      this.loopCount++;
    } catch (e: any) {
      this.onError(`Loop runtime error: ${e.message}`);
      this.running = false;
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  stop() {
    this.running = false;
    this.paused = false;
    this.delayRemaining = 0;
    this.pinModes.clear();
    this.pinValues.clear();
  }

  isRunning() {
    return this.running;
  }

  isPaused() {
    return this.paused;
  }

  getPinValue(pin: number): number {
    return this.pinValues.get(pin) ?? 0;
  }

  getPinMode(pin: number): string | undefined {
    return this.pinModes.get(pin);
  }
}

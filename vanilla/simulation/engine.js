import { COMPONENT_MAP } from "../library.js";
import { ArduinoInterpreter } from "./interpreter.js";
import { uid } from "../utils_uid.js";

class SimulationEngine {
  components;
  connections;
  interpreter = null;
  state;
  running = false;
  paused = false;
  speed = 1;
  lastTime = 0;
  motorAngle = 0;
  onStateUpdate = () => {};

  constructor() {
    this.components = [];
    this.connections = [];
    this.state = {
      time: 0,
      components: {},
      serialOutput: [],
      errors: [],
      arduinoPins: {}
    };
  }

  setOnStateUpdate(cb) {
    this.onStateUpdate = cb;
  }

  load(components, connections, code, speed) {
    this.components = components;
    this.connections = connections;
    this.speed = speed;
    this.interpreter = new ArduinoInterpreter({ components, connections, code, speed });
    this.interpreter.onSerialOutput = (text) => {
      this.state.serialOutput.push({ id: uid(), text, timestamp: Date.now() });
      this.onStateUpdate(this.state);
    };
    this.interpreter.onError = (msg) => {
      this.state.errors.push(msg);
      this.onStateUpdate(this.state);
    };
    this.interpreter.onPinChange = (pin, value, mode) => {
      if (mode === "pwm") {
        this.state.arduinoPins[pin] = {
          voltage: (value / 255) * 5,
          digital: value > 0 ? "HIGH" : "LOW",
          analog: Math.round((value / 255) * 1023),
          pwm: { duty: value / 255, frequency: 490 }
        };
      } else {
        this.state.arduinoPins[pin] = {
          voltage: value ? 5 : 0,
          digital: value ? "HIGH" : "LOW",
          analog: value * 1023
        };
      }
    };
  }

  start() {
    if (!this.interpreter) return false;
    this.state = {
      time: 0,
      components: {},
      serialOutput: [],
      errors: [],
      arduinoPins: {}
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
      arduinoPins: {}
    };
    this.updateComponentStates();
    this.onStateUpdate(this.state);
  }

  setSpeed(speed) {
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

  getState() {
    return this.state;
  }

  updateComponentStates() {
    const compStates = {};
    const arduino = this.components.find((c) => c.type.startsWith("arduino"));
    for (const comp of this.components) {
      const def = COMPONENT_MAP[comp.type];
      if (!def) continue;
      const pins = {};
      for (const pin of def.pins) {
        let voltage = 0;
        let digital = "FLOATING";
        let analog = 0;
        let pwm = undefined;

        const conn = this.connections.find(
          (c) => c.fromComponent === comp.id && c.fromPin === pin.id || c.toComponent === comp.id && c.toPin === pin.id
        );

        if (conn && arduino) {
          const otherCompId = conn.fromComponent === comp.id ? conn.toComponent : conn.fromComponent;
          const otherPinId = conn.fromComponent === comp.id ? conn.toPin : conn.fromPin;

          if (otherCompId === arduino.id) {
            const match = otherPinId.match(/^d(\d+)$/);
            if (match) {
              const pinNum = parseInt(match[1]);
              const val = this.interpreter?.getPinValue(pinNum) ?? 0;
              const mode = this.interpreter?.getPinMode(pinNum);

              if (mode === "OUTPUT" && val > 1) {
                voltage = (val / 255) * 5;
                digital = val > 0 ? "HIGH" : "LOW";
                analog = Math.round((val / 255) * 1023);
                pwm = { duty: val / 255, frequency: 490 };
              } else {
                voltage = val ? 5 : 0;
                digital = val ? "HIGH" : "LOW";
                analog = val * 1023;
              }
            }
            if (otherPinId === "5v") {
              voltage = 5;
              digital = "HIGH";
              analog = 1023;
            }
            if (otherPinId === "3v3") {
              voltage = 3.3;
              digital = "HIGH";
              analog = 674;
            }
            if (otherPinId.startsWith("gnd")) {
              voltage = 0;
              digital = "LOW";
              analog = 0;
            }
          } else {
            const otherComp = this.components.find((c) => c.id === otherCompId);
            if (otherComp) {
              if (otherComp.type === "push-button") {
                const pressed = otherComp.props.pressed;
                if (pin.type === "ground" || pin.id === "c" || pin.id === "-") {
                  voltage = 0;
                  digital = "LOW";
                } else if (pressed) {
                  voltage = 5;
                  digital = "HIGH";
                  analog = 1023;
                }
              }
              if (otherComp.type === "switch") {
                if (otherComp.props.closed) {
                  voltage = 5;
                  digital = "HIGH";
                  analog = 1023;
                } else {
                  voltage = 0;
                  digital = "LOW";
                }
              }
              if (otherComp.type === "power-5v" || (otherComp.type === "battery" && otherComp.props.voltage >= 4)) {
                voltage = 5;
                digital = "HIGH";
                analog = 1023;
              }
              if (otherComp.type === "power-3v3") {
                voltage = 3.3;
                digital = "HIGH";
                analog = 674;
              }
              if (otherComp.type === "gnd") {
                voltage = 0;
                digital = "LOW";
              }
            }
          }
        }

        if (comp.type === "power-5v" && pin.id === "+") {
          voltage = 5;
          digital = "HIGH";
        }
        if (comp.type === "power-3v3" && pin.id === "+") {
          voltage = 3.3;
          digital = "HIGH";
        }
        if (comp.type === "battery" && pin.id === "+") {
          voltage = comp.props.voltage || 9;
          digital = "HIGH";
        }
        if (pin.type === "ground" || pin.id === "gnd" || pin.id === "-") {
          voltage = 0;
          digital = "LOW";
        }

        pins[pin.id] = { voltage, digital, analog, pwm };
      }

      const visual = this.computeVisualState(comp, pins);
      compStates[comp.id] = { componentId: comp.id, pins, visual };
    }
    this.state.components = compStates;
  }

  computeVisualState(comp, pins) {
    const visual = {};

    switch (comp.type) {
      case "led": {
        const a = pins["a"];
        const c = pins["c"];
        visual.lit = a?.digital === "HIGH" && c?.digital === "LOW";
        break;
      }
      case "rgb-led": {
        const r = pins["r"];
        const g = pins["g"];
        const b = pins["b"];
        visual.r = r?.digital === "HIGH";
        visual.g = g?.digital === "HIGH";
        visual.b = b?.digital === "HIGH";
        break;
      }
      case "dc-motor": {
        const plus = pins["+"];
        if (plus?.digital === "HIGH") {
          this.motorAngle = (this.motorAngle + 10) % 360;
          visual.angle = this.motorAngle;
          visual.running = true;
        } else {
          visual.running = false;
          visual.angle = this.motorAngle;
        }
        break;
      }
      case "servo": {
        const sig = pins["sig"];
        if (sig?.pwm) {
          visual.angle = Math.round(sig.pwm.duty * 180);
        } else if (sig?.digital === "HIGH") {
          visual.angle = 180;
        } else {
          visual.angle = 90;
        }
        break;
      }
      case "buzzer": {
        const plus = pins["+"];
        visual.active = plus?.digital === "HIGH";
        break;
      }
      case "seven-segment": {
        const segMap = {
          0: [true, true, true, true, true, true, false],
          1: [false, true, true, false, false, false, false],
          2: [true, true, false, true, true, false, true],
          3: [true, true, true, true, false, false, true],
          4: [false, true, true, false, false, true, true],
          5: [true, false, true, true, false, true, true],
          6: [true, false, true, true, true, true, true],
          7: [true, true, true, false, false, false, false],
          8: [true, true, true, true, true, true, true],
          9: [true, true, true, true, false, true, true]
        };
        const val = comp.props.value || 0;
        visual.segments = segMap[val] || [false, false, false, false, false, false, false];
        break;
      }
      case "led-matrix": {
        const grid = Array(8).fill(null).map(() => Array(8).fill(false));
        const vcc = pins["vcc"];
        if (vcc?.digital === "HIGH") {
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

  getErrors() {
    return this.state.errors;
  }

  clearErrors() {
    this.state.errors = [];
  }
}

export { SimulationEngine };

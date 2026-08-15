class ArduinoInterpreter {
  code;
  components;
  connections;
  speed;
  // Arduino runtime state
  pinModes = /* @__PURE__ */ new Map();
  pinValues = /* @__PURE__ */ new Map();
  // digital: 0/1, analog: 0-1023, pwm: 0-255
  serialBuffer = [];
  serialBaud = 9600;
  serialInit = false;
  startTime = 0;
  loopCount = 0;
  // Compiled functions
  setupFn = null;
  loopFn = null;
  loopGenerator = null;
  // Running state
  running = false;
  paused = false;
  nextDelay = 0;
  delayRemaining = 0;
  // Callbacks
  onSerialOutput = () => {
  };
  onPinChange = () => {
  };
  onError = () => {
  };
  constructor(config) {
    this.code = config.code;
    this.components = config.components;
    this.connections = config.connections;
    this.speed = config.speed;
  }
  compile() {
    const errors = [];
    try {
      const code = this.code;
      const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
      const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
      if (!setupMatch) {
        errors.push("Missing setup() function");
        return { success: false, errors };
      }
      if (!loopMatch) {
        errors.push("Missing loop() function");
        return { success: false, errors };
      }
      const setupBody = setupMatch[1];
      const loopBody = loopMatch[1];
      const api = this.createRuntimeAPI();
      try {
        this.setupFn = new Function(
          ...Object.keys(api),
          setupBody
        ).bind(null, ...Object.values(api));
      } catch (e) {
        errors.push(`Setup error: ${e.message}`);
      }
      try {
        // Compile loop() as a generator so delay() can suspend execution
        // instead of executing the entire loop in one synchronous call.
        const generatorBody = loopBody
          .replace(/\bdelayMicroseconds\s*\(/g, "yield __delayMicroseconds(")
          .replace(/\bdelay\s*\(/g, "yield __delay(");

        const generatorFactory = new Function(
          ...Object.keys(api),
          "__delay",
          "__delayMicroseconds",
          `return function*() { ${generatorBody} };`
        );

        this.loopFn = generatorFactory(
          ...Object.values(api),
          (ms) => ms,
          (us) => us / 1000
        );
      } catch (e) {
        errors.push(`Loop error: ${e.message}`);
      }
      return { success: errors.length === 0, errors };
    } catch (e) {
      errors.push(`Compilation error: ${e.message}`);
      return { success: false, errors };
    }
  }
  createRuntimeAPI() {
    const self = this;
    return {
      pinMode: (pin, mode) => {
        self.pinModes.set(pin, mode);
      },
      digitalWrite: (pin, value) => {
        const val = value === "HIGH" || value === 1 || value === true ? 1 : 0;
        self.pinValues.set(pin, val);
        self.onPinChange(pin, val, "digital");
      },
      digitalRead: (pin) => {
        const val = self.readPinFromCircuit(pin);
        return val;
      },
      analogRead: (pin) => {
        const val = self.readAnalogFromCircuit(pin);
        return val;
      },
      analogWrite: (pin, value) => {
        self.pinValues.set(pin, value);
        self.onPinChange(pin, value, "pwm");
      },
      delay: (ms) => {
        self.delayRemaining = ms;
      },
      delayMicroseconds: (us) => {
        self.delayRemaining = us / 1e3;
      },
      millis: () => {
        return Date.now() - self.startTime;
      },
      micros: () => {
        return (Date.now() - self.startTime) * 1e3;
      },
      Serial: {
        begin: (baud) => {
          self.serialBaud = baud;
          self.serialInit = true;
        },
        print: (text) => {
          self.onSerialOutput(String(text));
        },
        println: (text) => {
          self.onSerialOutput((text !== void 0 ? String(text) : "") + "\n");
        },
        write: (data) => {
          self.onSerialOutput(String.fromCharCode(data));
        },
        available: () => 0,
        read: () => -1
      },
      map: (x, inMin, inMax, outMin, outMax) => {
        return Math.round((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
      },
      constrain: (x, a, b) => {
        return Math.max(a, Math.min(b, x));
      },
      abs: (x) => Math.abs(x),
      min: (a, b) => Math.min(a, b),
      max: (a, b) => Math.max(a, b),
      pow: (a, b) => Math.pow(a, b),
      sqrt: (x) => Math.sqrt(x),
      sin: (x) => Math.sin(x),
      cos: (x) => Math.cos(x),
      tan: (x) => Math.tan(x),
      random: (min, max) => {
        if (max === void 0) {
          max = min;
          min = 0;
        }
        return Math.floor(Math.random() * (max - min)) + min;
      },
      bitRead: (x, n) => x >> n & 1,
      bitWrite: (x, n, b) => x & ~(1 << n) | (b ? 1 : 0) << n,
      bitSet: (x, n) => x | 1 << n,
      bitClear: (x, n) => x & ~(1 << n),
      bit: (n) => 1 << n,
      HIGH: 1,
      LOW: 0,
      INPUT: "INPUT",
      OUTPUT: "OUTPUT",
      INPUT_PULLUP: "INPUT_PULLUP",
      LED_BUILTIN: 13,
      A0: 14,
      A1: 15,
      A2: 16,
      A3: 17,
      A4: 18,
      A5: 19,
      Serial1: {
        begin: () => {
        },
        print: () => {
        },
        println: () => {
        }
      }
    };
  }
  readPinFromCircuit(pin) {
    const arduino = this.components.find((c) => c.type.startsWith("arduino"));
    if (!arduino) return 0;
    const pinId = `d${pin}`;
    const conns = this.connections.filter(
      (c) => c.fromComponent === arduino.id && c.fromPin === pinId || c.toComponent === arduino.id && c.toPin === pinId
    );
    for (const conn of conns) {
      const otherCompId = conn.fromComponent === arduino.id ? conn.toComponent : conn.fromComponent;
      const otherPinId = conn.fromComponent === arduino.id ? conn.toPin : conn.fromPin;
      const otherComp = this.components.find((c) => c.id === otherCompId);
      if (!otherComp) continue;
      if (otherComp.type === "push-button") {
        return otherComp.props.pressed ? 1 : 0;
      }
      if (otherComp.type === "switch") {
        return otherComp.props.closed ? 1 : 0;
      }
      if (otherComp.type === "pir-sensor") {
        return otherComp.props.motion ? 1 : 0;
      }
      if (otherComp.type === "ir-sensor") {
        return otherComp.props.detected ? 1 : 0;
      }
      if (otherComp.type === "ultrasonic-sensor" && otherPinId === "echo") {
        return 1;
      }
    }
    const mode = this.pinModes.get(pin);
    if (mode === "INPUT_PULLUP") return 1;
    return 0;
  }
  readAnalogFromCircuit(pin) {
    const arduino = this.components.find((c) => c.type.startsWith("arduino"));
    if (!arduino) return 0;
    const pinId = `a${pin}`;
    const conns = this.connections.filter(
      (c) => c.fromComponent === arduino.id && c.fromPin === pinId || c.toComponent === arduino.id && c.toPin === pinId
    );
    for (const conn of conns) {
      const otherCompId = conn.fromComponent === arduino.id ? conn.toComponent : conn.fromComponent;
      const otherPinId = conn.fromComponent === arduino.id ? conn.toPin : conn.fromPin;
      const otherComp = this.components.find((c) => c.id === otherCompId);
      if (!otherComp) continue;
      if (otherComp.type === "potentiometer" && otherPinId === "w") {
        return Math.round((otherComp.props.value ?? 0.5) * 1023);
      }
      if (otherComp.type === "temp-sensor" && otherPinId === "out") {
        return Math.round((otherComp.props.temperature ?? 25) * 20.48);
      }
      if (otherComp.type === "light-sensor" && otherPinId === "out") {
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
    this.loopGenerator = null;
    try {
      this.setupFn?.();
    } catch (e) {
      this.onError(`Setup runtime error: ${e.message}`);
    }
    return true;
  }
  step(deltaMs) {
    if (!this.running || this.paused) return;

    if (this.delayRemaining > 0) {
      this.delayRemaining -= deltaMs * this.speed;
      if (this.delayRemaining > 0) return;
      this.delayRemaining = 0;
    }

    try {
      if (!this.loopGenerator) {
        this.loopGenerator = this.loopFn?.();
      }

      if (!this.loopGenerator) return;

      const result = this.loopGenerator.next();

      if (result.done) {
        this.loopGenerator = null;
        this.loopCount++;
      } else if (typeof result.value === "number") {
        this.delayRemaining = result.value;
      }
    } catch (e) {
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
    this.loopGenerator = null;
    this.pinModes.clear();
    this.pinValues.clear();
  }
  isRunning() {
    return this.running;
  }
  isPaused() {
    return this.paused;
  }
  getPinValue(pin) {
    return this.pinValues.get(pin) ?? 0;
  }
  getPinMode(pin) {
    return this.pinModes.get(pin);
  }
}
export {
  ArduinoInterpreter
};

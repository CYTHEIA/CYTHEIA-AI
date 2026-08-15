class ArduinoInterpreter {
  code;
  components;
  connections;
  speed;
  pinModes = new Map();
  pinValues = new Map();
  serialBuffer = [];
  serialBaud = 9600;
  serialInit = false;
  startTime = 0;
  loopCount = 0;
  setupFn = null;
  loopFn = null;
  loopGenerator = null;
  running = false;
  paused = false;
  delayRemaining = 0;
  servoAngles = new Map();
  tonePins = new Set();
  onSerialOutput = () => {};
  onPinChange = () => {};
  onError = () => {};

  constructor(config) {
    this.code = config.code;
    this.components = config.components;
    this.connections = config.connections;
    this.speed = config.speed;
  }

  preprocess(code) {
    let lines = code.split('\n');
    let result = [];
    let defines = new Map();

    for (let line of lines) {
      let trimmed = line.trim();

      if (trimmed.startsWith('#include')) {
        result.push('');
        continue;
      }

      if (trimmed.startsWith('#define')) {
        let match = trimmed.match(/^#define\s+(\w+)\s+(.+)$/);
        if (match) {
          defines.set(match[1], match[2]);
        }
        result.push('');
        continue;
      }

      if (trimmed.startsWith('#')) {
        result.push('');
        continue;
      }

      let processed = line;
      for (let [key, value] of defines) {
        let regex = new RegExp(`\\b${key}\\b`, 'g');
        processed = processed.replace(regex, value);
      }
      result.push(processed);
    }

    return result.join('\n');
  }

  stripArduinoTypes(code) {
    return code
      .replace(/\b(int|float|double|long|byte|boolean|char|String)\s+(\w+)\s*\[\s*\]\s*=\s*\{([^}]*)\};/g, "var $2 = [$3];")
      .replace(/\b(int|float|double|long|byte|boolean|char|String)\s+/g, "var ")
      .replace(/\bunsigned\s+var\b/g, "var ")
      .replace(/\bconst\s+var\b/g, "var ")
      .replace(/\bvar\s+(?:int|float|double|long|byte|boolean|char|String)\b/g, "var ");
  }

  extractFunction(code, name) {
    const idx = code.search(new RegExp(`\\bvoid\\s+${name}\\s*\\(`));
    if (idx === -1) return null;
    const open = code.indexOf("{", idx);
    if (open === -1) return null;
    let depth = 1;
    let i = open + 1;
    while (depth > 0 && i < code.length) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") depth--;
      i++;
    }
    if (depth !== 0) return null;
    return { start: idx, open, body: code.slice(open + 1, i - 1) };
  }

  buildPreamble(code, setupIndex) {
    const head = code.slice(0, setupIndex);
    return this.stripArduinoTypes(
      head.replace(/\bServo\s+\w+;/g, "")
    );
  }

  compile() {
    const errors = [];
    try {
      const code = this.preprocess(this.code);
      const setup = this.extractFunction(code, "setup");
      const loop = this.extractFunction(code, "loop");
      if (!setup) {
        errors.push("Missing setup() function");
        return { success: false, errors };
      }
      if (!loop) {
        errors.push("Missing loop() function");
        return { success: false, errors };
      }
      const preamble = this.buildPreamble(code, setup.start);
      const setupBody = preamble + "\n" + this.stripArduinoTypes(setup.body);
      const loopBody = preamble + "\n" + this.stripArduinoTypes(loop.body);
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

    class Servo {
      constructor() {
        this._pin = null;
        this._angle = 90;
      }
      attach(pin) {
        this._pin = pin;
      }
      write(angle) {
        this._angle = angle;
        if (this._pin !== null) {
          self.servoAngles.set(this._pin, angle);
          self.pinValues.set(this._pin, Math.round(angle * 255 / 180));
          self.onPinChange(this._pin, Math.round(angle * 255 / 180), "pwm");
        }
      }
      read() {
        return this._angle;
      }
      detach() {
        this._pin = null;
      }
    }

    const api = {
      pinMode: (pin, mode) => {
        self.pinModes.set(pin, mode);
      },
      digitalWrite: (pin, value) => {
        const val = value === "HIGH" || value === 1 || value === true ? 1 : 0;
        self.pinValues.set(pin, val);
        self.onPinChange(pin, val, "digital");
      },
      digitalRead: (pin) => {
        return self.readPinFromCircuit(pin);
      },
      analogRead: (pin) => {
        return self.readAnalogFromCircuit(pin);
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
      tone: (pin, frequency, duration) => {
        self.tonePins.add(pin);
        self.pinValues.set(pin, 1);
        self.onPinChange(pin, 1, "digital");
      },
      noTone: (pin) => {
        self.tonePins.delete(pin);
        self.pinValues.set(pin, 0);
        self.onPinChange(pin, 0, "digital");
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
      Servo,
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
        begin: () => {},
        print: () => {},
        println: () => {}
      }
    };

    const servoNames = [...this.code.matchAll(/\bServo\s+(\w+);/g)].map((m) => m[1]);
    for (const name of servoNames) {
      api[name] = new Servo();
    }

    return api;
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
    const pinId = pin >= 14 && pin <= 19 ? `a${pin - 14}` : `a${pin}`;
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
      if (otherComp.type === "dht11" && otherPinId === "out") {
        // DHT11 uses a digital protocol, return a simulated temperature reading
        return Math.round((otherComp.props.temperature ?? 25) * 20.48);
      }
      if (otherComp.type === "dht22" && otherPinId === "out") {
        // DHT22 uses a digital protocol, return a simulated temperature reading
        return Math.round((otherComp.props.temperature ?? 25) * 20.48);
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
    this.servoAngles.clear();
    this.tonePins.clear();
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
  getServoAngle(pin) {
    return this.servoAngles.get(pin) ?? 90;
  }
}

export { ArduinoInterpreter };

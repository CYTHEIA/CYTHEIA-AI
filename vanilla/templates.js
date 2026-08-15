import { uid } from "./utils_uid.js";
function makeProjectData(components, connections, code) {
  const compMap = {};
  const typeCount = {};
  for (const c of components) typeCount[c.type] = (typeCount[c.type] || 0) + 1;
  const comps = components.map((c) => {
    const id = uid();
    compMap[c.type + (c.props?.label || "")] = id;
    if (typeCount[c.type] === 1) compMap[c.type] = id;
    return {
      id,
      type: c.type,
      x: c.x,
      y: c.y,
      rotation: 0,
      props: c.props || {}
    };
  });
  const conns = connections.map((c) => ({
    id: uid(),
    fromComponent: compMap[c.from] || c.from,
    fromPin: c.fp,
    toComponent: compMap[c.to] || c.to,
    toPin: c.tp
  }));
  return {
    components: comps,
    connections: conns,
    code: [{ name: "main.ino", language: "cpp", content: code }],
    simulation: { running: false, speed: 1 }
  };
}
const TEMPLATES = [
  {
    name: "LED Blinker",
    description: "Classic Arduino blink \u2014 LED on pin 13 with resistor to GND.",
    category: "LED & Lighting",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 300 },
        { type: "resistor", x: 700, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 850, y: 200, props: { color: "#ff3b30", label: "LED" } },
        { type: "gnd", x: 950, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "d13", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// LED Blinker
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(13, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`
    )
  },
  {
    name: "Traffic Light",
    description: "Red, yellow, green LEDs cycling like a traffic light.",
    category: "LED & Lighting",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "resistor", x: 750, y: 200, props: { resistance: 220, label: "R-Red" } },
        { type: "led", x: 900, y: 200, props: { color: "#ff3b30", label: "Red" } },
        { type: "resistor", x: 750, y: 350, props: { resistance: 220, label: "R-Yellow" } },
        { type: "led", x: 900, y: 350, props: { color: "#ffd60a", label: "Yellow" } },
        { type: "resistor", x: 750, y: 500, props: { resistance: 220, label: "R-Green" } },
        { type: "led", x: 900, y: 500, props: { color: "#30d158", label: "Green" } },
        { type: "gnd", x: 1050, y: 350 }
      ],
      [
        { from: "arduino-uno", fp: "d11", to: "resistorR-Red", tp: "a" },
        { from: "resistorR-Red", fp: "b", to: "ledRed", tp: "a" },
        { from: "ledRed", fp: "c", to: "gnd", tp: "g" },
        { from: "arduino-uno", fp: "d12", to: "resistorR-Yellow", tp: "a" },
        { from: "resistorR-Yellow", fp: "b", to: "ledYellow", tp: "a" },
        { from: "ledYellow", fp: "c", to: "gnd", tp: "g" },
        { from: "arduino-uno", fp: "d13", to: "resistorR-Green", tp: "a" },
        { from: "resistorR-Green", fp: "b", to: "ledGreen", tp: "a" },
        { from: "ledGreen", fp: "c", to: "gnd", tp: "g" }
      ],
      `// Traffic Light Controller
void setup() {
  pinMode(11, OUTPUT); // Red
  pinMode(12, OUTPUT); // Yellow
  pinMode(13, OUTPUT); // Green
  Serial.begin(9600);
}

void loop() {
  // Green
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  Serial.println("GO - Green");
  delay(3000);

  // Yellow
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  digitalWrite(11, LOW);
  Serial.println("CAUTION - Yellow");
  delay(1000);

  // Red
  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  digitalWrite(11, HIGH);
  Serial.println("STOP - Red");
  delay(3000);
}
`
    )
  },
  {
    name: "Button Controlled LED",
    description: "Press a button to turn on an LED.",
    category: "Input & Controls",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "push-button", x: 200, y: 200, props: { pressed: false, label: "Button" } },
        { type: "resistor", x: 750, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 900, y: 200, props: { color: "#0a84ff", label: "LED" } },
        { type: "gnd", x: 1050, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "push-button", tp: "a" },
        { from: "push-button", fp: "b", to: "arduino-uno", tp: "d2" },
        { from: "arduino-uno", fp: "d13", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// Button Controlled LED
void setup() {
  pinMode(2, INPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int buttonState = digitalRead(2);
  if (buttonState == HIGH) {
    digitalWrite(13, HIGH);
    Serial.println("Button pressed - LED ON");
  } else {
    digitalWrite(13, LOW);
    Serial.println("Button released - LED OFF");
  }
  delay(100);
}
`
    )
  },
  {
    name: "Potentiometer Reading",
    description: "Read a potentiometer and display its value on the serial monitor.",
    category: "Input & Controls",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "potentiometer", x: 200, y: 200, props: { value: 0.5, label: "Pot" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "potentiometer", tp: "a" },
        { from: "potentiometer", fp: "w", to: "arduino-uno", tp: "a0" },
        { from: "arduino-uno", fp: "gnd2", to: "potentiometer", tp: "b" }
      ],
      `// Potentiometer Reading
void setup() {
  Serial.begin(9600);
}

void loop() {
  int val = analogRead(A0);
  Serial.print("Pot value: ");
  Serial.println(val);
  delay(500);
}
`
    )
  },
  {
    name: "RGB Mood Light",
    description: "RGB LED cycling through colors using PWM.",
    category: "LED & Lighting",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "rgb-led", x: 800, y: 200, props: { label: "RGB" } },
        { type: "gnd", x: 950, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "d9", to: "rgb-led", tp: "r" },
        { from: "arduino-uno", fp: "d10", to: "rgb-led", tp: "g" },
        { from: "arduino-uno", fp: "d11", to: "rgb-led", tp: "b" },
        { from: "rgb-led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// RGB Mood Light
int r = 0, g = 0, b = 0;

void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 256; i++) {
    analogWrite(9, i);
    analogWrite(10, 255 - i);
    delay(10);
  }
  for (int i = 0; i < 256; i++) {
    analogWrite(10, i);
    analogWrite(11, 255 - i);
    delay(10);
  }
  for (int i = 0; i < 256; i++) {
    analogWrite(11, i);
    analogWrite(9, 255 - i);
    delay(10);
  }
}
`
    )
  },
  {
    name: "Potentiometer LED Dimmer",
    description: "Turn the knob to control LED brightness with PWM.",
    category: "LED & Lighting",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "potentiometer", x: 150, y: 200, props: { value: 0.5, label: "Pot" } },
        { type: "resistor", x: 750, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 900, y: 200, props: { color: "#0a84ff", label: "LED" } },
        { type: "gnd", x: 1050, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "potentiometer", tp: "a" },
        { from: "potentiometer", fp: "w", to: "arduino-uno", tp: "a0" },
        { from: "arduino-uno", fp: "gnd2", to: "potentiometer", tp: "b" },
        { from: "arduino-uno", fp: "d9", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// Potentiometer LED Dimmer
void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int val = analogRead(A0);
  int brightness = map(val, 0, 1023, 0, 255);
  analogWrite(9, brightness);
  Serial.print("Brightness: ");
  Serial.println(brightness);
  delay(50);
}
`
    )
  },
  {
    name: "Servo Sweep",
    description: "Servo motor sweeping back and forth 0 to 180 degrees.",
    category: "Motors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "servo", x: 800, y: 200, props: { angle: 90, label: "Servo" } }
      ],
      [
        { from: "arduino-uno", fp: "d9", to: "servo", tp: "sig" },
        { from: "arduino-uno", fp: "5v", to: "servo", tp: "vcc" },
        { from: "arduino-uno", fp: "gnd2", to: "servo", tp: "gnd" }
      ],
      `// Servo Sweep
#include <Servo.h>

Servo myservo;
int pos = 0;

void setup() {
  myservo.attach(9);
  Serial.begin(9600);
}

void loop() {
  for (pos = 0; pos <= 180; pos += 1) {
    myservo.write(pos);
    Serial.print("Angle: ");
    Serial.println(pos);
    delay(15);
  }
  for (pos = 180; pos >= 0; pos -= 1) {
    myservo.write(pos);
    delay(15);
  }
}
`
    )
  },
  {
    name: "Servo Potentiometer Control",
    description: "Control a servo's position with a potentiometer knob.",
    category: "Motors",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "potentiometer", x: 200, y: 200, props: { value: 0.5, label: "Pot" } },
        { type: "servo", x: 800, y: 200, props: { angle: 90, label: "Servo" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "potentiometer", tp: "a" },
        { from: "potentiometer", fp: "w", to: "arduino-uno", tp: "a0" },
        { from: "arduino-uno", fp: "gnd2", to: "potentiometer", tp: "b" },
        { from: "arduino-uno", fp: "d9", to: "servo", tp: "sig" },
        { from: "arduino-uno", fp: "5v", to: "servo", tp: "vcc" },
        { from: "arduino-uno", fp: "gnd2", to: "servo", tp: "gnd" }
      ],
      `// Servo Potentiometer Control
#include <Servo.h>

Servo myservo;

void setup() {
  myservo.attach(9);
  Serial.begin(9600);
}

void loop() {
  int val = analogRead(A0);
  int angle = map(val, 0, 1023, 0, 180);
  myservo.write(angle);
  Serial.print("Angle: ");
  Serial.println(angle);
  delay(20);
}
`
    )
  },
  {
    name: "DC Motor Control",
    description: "Flip the switch to start and stop a DC motor.",
    category: "Motors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "switch", x: 200, y: 200, props: { closed: false, label: "Switch" } },
        { type: "dc-motor", x: 800, y: 200, props: { label: "Motor" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "switch", tp: "a" },
        { from: "switch", fp: "b", to: "arduino-uno", tp: "d2" },
        { from: "arduino-uno", fp: "d5", to: "dc-motor", tp: "+" },
        { from: "arduino-uno", fp: "gnd2", to: "dc-motor", tp: "-" }
      ],
      `// DC Motor Control
void setup() {
  pinMode(2, INPUT);
  pinMode(5, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int on = digitalRead(2);
  if (on == HIGH) {
    digitalWrite(5, HIGH);
    Serial.println("Motor ON");
  } else {
    digitalWrite(5, LOW);
    Serial.println("Motor OFF");
  }
  delay(200);
}
`
    )
  },
  {
    name: "Temperature Monitor",
    description: "Read temperature sensor and display on serial monitor.",
    category: "Sensors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "temp-sensor", x: 200, y: 200, props: { temperature: 25, label: "Temp" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "temp-sensor", tp: "vcc" },
        { from: "temp-sensor", fp: "out", to: "arduino-uno", tp: "a0" },
        { from: "arduino-uno", fp: "gnd2", to: "temp-sensor", tp: "gnd" }
      ],
      `// Temperature Monitor
void setup() {
  Serial.begin(9600);
}

void loop() {
  int reading = analogRead(A0);
  float voltage = reading * 5.0 / 1024.0;
  float tempC = voltage * 100;
  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.println(" C");
  delay(1000);
}
`
    )
  },
  {
    name: "Light Activated Switch",
    description: "Turn on an LED when light level drops below a threshold.",
    category: "Sensors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "light-sensor", x: 200, y: 200, props: { light: 0.5, label: "LDR" } },
        { type: "resistor", x: 750, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 900, y: 200, props: { color: "#ffd60a", label: "LED" } },
        { type: "gnd", x: 1050, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "light-sensor", tp: "vcc" },
        { from: "light-sensor", fp: "out", to: "arduino-uno", tp: "a0" },
        { from: "arduino-uno", fp: "gnd2", to: "light-sensor", tp: "gnd" },
        { from: "arduino-uno", fp: "d13", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// Light Activated Switch
int threshold = 500;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(A0);
  Serial.print("Light: ");
  Serial.println(lightLevel);

  if (lightLevel < threshold) {
    digitalWrite(13, HIGH);
    Serial.println("Dark - LED ON");
  } else {
    digitalWrite(13, LOW);
    Serial.println("Bright - LED OFF");
  }
  delay(500);
}
`
    )
  },
  {
    name: "Ultrasonic Distance Meter",
    description: "Measure distance using HC-SR04 ultrasonic sensor.",
    category: "Sensors",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "ultrasonic-sensor", x: 200, y: 200, props: { distance: 100, label: "HC-SR04" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "ultrasonic-sensor", tp: "vcc" },
        { from: "arduino-uno", fp: "d7", to: "ultrasonic-sensor", tp: "trig" },
        { from: "ultrasonic-sensor", fp: "echo", to: "arduino-uno", tp: "d6" },
        { from: "arduino-uno", fp: "gnd2", to: "ultrasonic-sensor", tp: "gnd" }
      ],
      `// Ultrasonic Distance Meter
#define TRIG 7
#define ECHO 6

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duration = 1000;
  float distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  delay(500);
}
`
    )
  },
  {
    name: "PIR Motion Detector",
    description: "Light an LED whenever motion is detected.",
    category: "Sensors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "pir-sensor", x: 200, y: 200, props: { motion: false, label: "PIR" } },
        { type: "resistor", x: 750, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 900, y: 200, props: { color: "#30d158", label: "LED" } },
        { type: "gnd", x: 1050, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "pir-sensor", tp: "vcc" },
        { from: "pir-sensor", fp: "out", to: "arduino-uno", tp: "d7" },
        { from: "pir-sensor", fp: "gnd", to: "arduino-uno", tp: "gnd2" },
        { from: "arduino-uno", fp: "d13", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" }
      ],
      `// PIR Motion Detector
void setup() {
  pinMode(7, INPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int motion = digitalRead(7);
  if (motion == HIGH) {
    digitalWrite(13, HIGH);
    Serial.println("Motion detected");
  } else {
    digitalWrite(13, LOW);
    Serial.println("No motion");
  }
  delay(500);
}
`
    )
  },
  {
    name: "IR Obstacle Detector",
    description: "Detect obstacles with an IR sensor and sound a buzzer.",
    category: "Sensors",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "ir-sensor", x: 200, y: 200, props: { detected: false, label: "IR" } },
        { type: "buzzer", x: 700, y: 200, props: { label: "Buzzer" } },
        { type: "led", x: 850, y: 200, props: { color: "#ff3b30", label: "LED" } },
        { type: "gnd", x: 1000, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "ir-sensor", tp: "vcc" },
        { from: "ir-sensor", fp: "out", to: "arduino-uno", tp: "d4" },
        { from: "ir-sensor", fp: "gnd", to: "arduino-uno", tp: "gnd2" },
        { from: "arduino-uno", fp: "d13", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" },
        { from: "arduino-uno", fp: "d8", to: "buzzer", tp: "+" },
        { from: "buzzer", fp: "-", to: "gnd", tp: "g" }
      ],
      `// IR Obstacle Detector
void setup() {
  pinMode(4, INPUT);
  pinMode(13, OUTPUT);
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int obstacle = digitalRead(4);
  if (obstacle == HIGH) {
    digitalWrite(13, HIGH);
    tone(8, 880, 100);
    Serial.println("Obstacle detected");
  } else {
    digitalWrite(13, LOW);
    noTone(8);
    Serial.println("Clear");
  }
  delay(100);
}
`
    )
  },
  {
    name: "Buzzer Melody",
    description: "Play a simple melody with a buzzer.",
    category: "Arduino",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "buzzer", x: 800, y: 200, props: { label: "Buzzer" } },
        { type: "gnd", x: 950, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "d8", to: "buzzer", tp: "+" },
        { from: "buzzer", fp: "-", to: "gnd", tp: "g" }
      ],
      `// Buzzer Melody
int melody[] = {262, 294, 330, 349, 392, 440, 494, 523};
int noteDuration = 200;

void setup() {
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 8; i++) {
    tone(8, melody[i], noteDuration);
    Serial.print("Playing: ");
    Serial.println(melody[i]);
    delay(noteDuration + 50);
  }
  delay(1000);
}
`
    )
  },
  {
    name: "Buzzer Alarm",
    description: "Press and hold the button to sound the alarm buzzer.",
    category: "Input & Controls",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "push-button", x: 200, y: 200, props: { pressed: false, label: "Button" } },
        { type: "buzzer", x: 750, y: 200, props: { label: "Buzzer" } },
        { type: "gnd", x: 900, y: 300 }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "push-button", tp: "a" },
        { from: "push-button", fp: "b", to: "arduino-uno", tp: "d2" },
        { from: "arduino-uno", fp: "d8", to: "buzzer", tp: "+" },
        { from: "buzzer", fp: "-", to: "gnd", tp: "g" }
      ],
      `// Buzzer Alarm
void setup() {
  pinMode(2, INPUT);
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int pressed = digitalRead(2);
  if (pressed == HIGH) {
    tone(8, 1000, 200);
    Serial.println("ALARM!");
  } else {
    noTone(8);
    Serial.println("Armed");
  }
  delay(100);
}
`
    )
  },
  {
    name: "16x2 LCD Hello World",
    description: "Display text on a 16x2 character LCD.",
    category: "Displays",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "lcd-16x2", x: 820, y: 280, props: { text: "Hello, World!\nCYTHEIA", label: "LCD" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "lcd-16x2", tp: "vcc" },
        { from: "arduino-uno", fp: "gnd2", to: "lcd-16x2", tp: "gnd" },
        { from: "arduino-uno", fp: "d12", to: "lcd-16x2", tp: "rs" },
        { from: "arduino-uno", fp: "d11", to: "lcd-16x2", tp: "e" },
        { from: "arduino-uno", fp: "d5", to: "lcd-16x2", tp: "d4" },
        { from: "arduino-uno", fp: "d4", to: "lcd-16x2", tp: "d5" },
        { from: "arduino-uno", fp: "d3", to: "lcd-16x2", tp: "d6" },
        { from: "arduino-uno", fp: "d2", to: "lcd-16x2", tp: "d7" }
      ],
      `// 16x2 LCD Hello World
void setup() {
  pinMode(12, OUTPUT); // RS
  pinMode(11, OUTPUT); // E
  pinMode(5, OUTPUT);  // D4
  pinMode(4, OUTPUT);  // D5
  pinMode(3, OUTPUT);  // D6
  pinMode(2, OUTPUT);  // D7
  Serial.begin(9600);
  Serial.println("LCD ready");
}

void loop() {
  delay(1000);
}
`
    )
  },
  {
    name: "7-Segment Counter",
    description: "Drive a 7-segment display digit from the Arduino.",
    category: "Displays",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "seven-segment", x: 800, y: 280, props: { value: 0, label: "7-Seg" } }
      ],
      [
        { from: "arduino-uno", fp: "d2", to: "seven-segment", tp: "a" },
        { from: "arduino-uno", fp: "d3", to: "seven-segment", tp: "b" },
        { from: "arduino-uno", fp: "d4", to: "seven-segment", tp: "c" },
        { from: "arduino-uno", fp: "d5", to: "seven-segment", tp: "d" },
        { from: "arduino-uno", fp: "d6", to: "seven-segment", tp: "e" },
        { from: "arduino-uno", fp: "d7", to: "seven-segment", tp: "f" },
        { from: "arduino-uno", fp: "d8", to: "seven-segment", tp: "g" },
        { from: "arduino-uno", fp: "gnd2", to: "seven-segment", tp: "com" }
      ],
      `// 7-Segment Counter
void setup() {
  for (int i = 2; i <= 8; i++) {
    pinMode(i, OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  for (int digit = 0; digit <= 9; digit++) {
    Serial.print("Count: ");
    Serial.println(digit);
    delay(500);
  }
}
`
    )
  },
  {
    name: "OLED Display",
    description: "0.96-inch I2C OLED screen powered by the Arduino.",
    category: "Displays",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "oled", x: 750, y: 280, props: { text: "CYTHEIA", label: "OLED" } }
      ],
      [
        { from: "arduino-uno", fp: "3v3", to: "oled", tp: "vcc" },
        { from: "arduino-uno", fp: "gnd2", to: "oled", tp: "gnd" },
        { from: "arduino-uno", fp: "a5", to: "oled", tp: "scl" },
        { from: "arduino-uno", fp: "a4", to: "oled", tp: "sda" }
      ],
      `// OLED Display (SSD1306 via I2C)
void setup() {
  Serial.begin(9600);
  Serial.println("OLED ready");
}

void loop() {
  delay(1000);
}
`
    )
  },
  {
    name: "LED Matrix",
    description: "Drive an 8x8 LED matrix from the Arduino.",
    category: "Displays",
    difficulty: "Intermediate",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 400 },
        { type: "led-matrix", x: 750, y: 250, props: { label: "Matrix" } }
      ],
      [
        { from: "arduino-uno", fp: "5v", to: "led-matrix", tp: "vcc" },
        { from: "arduino-uno", fp: "gnd2", to: "led-matrix", tp: "gnd" },
        { from: "arduino-uno", fp: "d12", to: "led-matrix", tp: "din" },
        { from: "arduino-uno", fp: "d13", to: "led-matrix", tp: "cs" },
        { from: "arduino-uno", fp: "d11", to: "led-matrix", tp: "clk" }
      ],
      `// LED Matrix
void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("Matrix ON");
  delay(1000);
  digitalWrite(13, LOW);
  Serial.println("Matrix OFF");
  delay(1000);
}
`
    )
  },
  {
    name: "Serial Monitor",
    description: "Read live sensor-style output on the serial monitor.",
    category: "Arduino",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "arduino-uno", x: 400, y: 300 }
      ],
      [],
      `// Serial Monitor
void setup() {
  Serial.begin(9600);
  Serial.println("CYTHEIA Serial Monitor");
}

void loop() {
  Serial.print("Uptime: ");
  Serial.print(millis());
  Serial.println(" ms");
  delay(1000);
}
`
    )
  },
  {
    name: "Battery Powered LED",
    description: "A self-contained circuit \u2014 flip the switch to power an LED from a 9V battery.",
    category: "LED & Lighting",
    difficulty: "Beginner",
    data: makeProjectData(
      [
        { type: "battery", x: 300, y: 300, props: { voltage: 9, label: "9V" } },
        { type: "switch", x: 500, y: 200, props: { closed: true, label: "Switch" } },
        { type: "resistor", x: 700, y: 200, props: { resistance: 220, label: "220\u03A9" } },
        { type: "led", x: 850, y: 200, props: { color: "#ffd60a", label: "LED" } },
        { type: "gnd", x: 1000, y: 300 }
      ],
      [
        { from: "battery", fp: "+", to: "switch", tp: "a" },
        { from: "switch", fp: "b", to: "resistor", tp: "a" },
        { from: "resistor", fp: "b", to: "led", tp: "a" },
        { from: "led", fp: "c", to: "gnd", tp: "g" },
        { from: "battery", fp: "-", to: "gnd", tp: "g" }
      ],
      `// Battery Powered LED
// A pure hardware circuit: the switch closes the loop
// between the 9V battery, resistor and LED.
void setup() {
}

void loop() {
  delay(1000);
}
`
    )
  }
];
export {
  TEMPLATES
};

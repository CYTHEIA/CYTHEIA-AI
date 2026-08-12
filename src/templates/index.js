import { uid } from "@/utils/uid";
function makeProjectData(components, connections, code) {
  const compMap = {};
  const comps = components.map((c) => {
    const id = uid();
    compMap[c.type + (c.props?.label || "")] = id;
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
    name: "Servo Sweep",
    description: "Servo motor sweeping back and forth 0 to 180 degrees.",
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
    name: "Temperature Monitor",
    description: "Read temperature sensor and display on serial monitor.",
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
    name: "Buzzer Melody",
    description: "Play a simple melody with a buzzer.",
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
    name: "Light Activated Switch",
    description: "Turn on an LED when light level drops below a threshold.",
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
  }
];
export {
  TEMPLATES
};

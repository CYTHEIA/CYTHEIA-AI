import { COMPONENT_MAP } from "./library";
function getPinWorldPosition(component, pinId) {
  const def = COMPONENT_MAP[component.type];
  if (!def) return { x: component.x, y: component.y };
  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: component.x, y: component.y };
  const cx = def.width / 2;
  const cy = def.height / 2;
  const rad = component.rotation * Math.PI / 180;
  const dx = pin.x - cx;
  const dy = pin.y - cy;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return { x: component.x + rx, y: component.y + ry };
}
function ComponentRenderer({ component, simState, selected, hoveredPin, onPinClick, onComponentClick, showPinLabels }) {
  const def = COMPONENT_MAP[component.type];
  if (!def) return null;
  const cx = def.width / 2;
  const cy = def.height / 2;
  return /* @__PURE__ */ React.createElement(
    "g",
    {
      transform: `translate(${component.x - cx}, ${component.y - cy}) rotate(${component.rotation}, ${cx}, ${cy})`,
      onClick: onComponentClick,
      className: "cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: -4,
        y: -4,
        width: def.width + 8,
        height: def.height + 8,
        fill: "none",
        stroke: selected ? "#0a84ff" : "transparent",
        strokeWidth: 2,
        rx: 8,
        className: "transition-all"
      }
    ),
    /* @__PURE__ */ React.createElement(ComponentSVG, { type: component.type, component, simState }),
    def.pins.map((pin) => {
      const pinState = simState?.pins[pin.id];
      const isHigh = pinState?.digital === "HIGH";
      const isHovered = hoveredPin === pin.id;
      return /* @__PURE__ */ React.createElement("g", { key: pin.id }, /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: pin.x,
          cy: pin.y,
          r: isHovered ? 6 : 4,
          fill: isHigh ? "#ffd60a" : "#86868b",
          stroke: isHovered ? "#0a84ff" : "#48484a",
          strokeWidth: isHovered ? 2 : 1,
          className: "transition-all cursor-crosshair",
          onClick: (e) => {
            e.stopPropagation();
            onPinClick?.(pin.id, e);
          }
        }
      ), showPinLabels && /* @__PURE__ */ React.createElement(
        "text",
        {
          x: pin.x,
          y: pin.y - 8,
          textAnchor: "middle",
          className: "fill-gray-500 text-[8px] pointer-events-none",
          style: { fontSize: "8px" }
        },
        pin.label || pin.name
      ));
    })
  );
}
function ComponentSVG({ type, component, simState }) {
  switch (type) {
    case "arduino-uno":
      return /* @__PURE__ */ React.createElement(ArduinoUnoSVG, { simState });
    case "arduino-nano":
      return /* @__PURE__ */ React.createElement(ArduinoNanoSVG, { simState });
    case "raspberry-pi-pico":
      return /* @__PURE__ */ React.createElement(PicoSVG, { simState });
    case "esp32":
      return /* @__PURE__ */ React.createElement(Esp32SVG, { simState });
    case "resistor":
      return /* @__PURE__ */ React.createElement(ResistorSVG, { component });
    case "capacitor":
      return /* @__PURE__ */ React.createElement(CapacitorSVG, null);
    case "led":
      return /* @__PURE__ */ React.createElement(LedSVG, { component, simState });
    case "rgb-led":
      return /* @__PURE__ */ React.createElement(RgbLedSVG, { simState });
    case "diode":
      return /* @__PURE__ */ React.createElement(DiodeSVG, null);
    case "push-button":
      return /* @__PURE__ */ React.createElement(PushButtonSVG, { component });
    case "switch":
      return /* @__PURE__ */ React.createElement(SwitchSVG, { component });
    case "potentiometer":
      return /* @__PURE__ */ React.createElement(PotentiometerSVG, { component });
    case "buzzer":
      return /* @__PURE__ */ React.createElement(BuzzerSVG, { simState });
    case "dc-motor":
      return /* @__PURE__ */ React.createElement(DcMotorSVG, { simState });
    case "servo":
      return /* @__PURE__ */ React.createElement(ServoSVG, { simState });
    case "relay":
      return /* @__PURE__ */ React.createElement(RelaySVG, { simState });
    case "lcd-16x2":
      return /* @__PURE__ */ React.createElement(LcdSVG, { component });
    case "oled":
      return /* @__PURE__ */ React.createElement(OledSVG, { component });
    case "seven-segment":
      return /* @__PURE__ */ React.createElement(SevenSegmentSVG, { simState });
    case "led-matrix":
      return /* @__PURE__ */ React.createElement(LedMatrixSVG, { simState });
    case "temp-sensor":
      return /* @__PURE__ */ React.createElement(TempSensorSVG, { component });
    case "light-sensor":
      return /* @__PURE__ */ React.createElement(LightSensorSVG, { component });
    case "ultrasonic-sensor":
      return /* @__PURE__ */ React.createElement(UltrasonicSVG, { component });
    case "pir-sensor":
      return /* @__PURE__ */ React.createElement(PirSVG, { component });
    case "ir-sensor":
      return /* @__PURE__ */ React.createElement(IrSVG, { component });
    case "battery":
      return /* @__PURE__ */ React.createElement(BatterySVG, { component });
    case "power-5v":
      return /* @__PURE__ */ React.createElement(PowerSVG, { component, color: "#ff453a" });
    case "power-3v3":
      return /* @__PURE__ */ React.createElement(PowerSVG, { component, color: "#ff9f0a" });
    case "gnd":
      return /* @__PURE__ */ React.createElement(GndSVG, null);
    case "and-gate":
      return /* @__PURE__ */ React.createElement(GateSVG, { label: "AND", simState });
    case "or-gate":
      return /* @__PURE__ */ React.createElement(GateSVG, { label: "OR", simState });
    case "not-gate":
      return /* @__PURE__ */ React.createElement(NotGateSVG, { simState });
    case "nand-gate":
      return /* @__PURE__ */ React.createElement(GateSVG, { label: "NAND", simState });
    case "nor-gate":
      return /* @__PURE__ */ React.createElement(GateSVG, { label: "NOR", simState });
    case "xor-gate":
      return /* @__PURE__ */ React.createElement(GateSVG, { label: "XOR", simState });
    case "breadboard":
      return /* @__PURE__ */ React.createElement(BreadboardSVG, null);
    default:
      return /* @__PURE__ */ React.createElement(DefaultSVG, { label: component.props.label || type });
  }
}
function ArduinoUnoSVG({ simState }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 360, height: 200, rx: 8, fill: "#2d7a4a", stroke: "#1a5c33", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("rect", { x: 8, y: 8, width: 344, height: 184, rx: 4, fill: "#236b3d", stroke: "#1a5c33", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("rect", { x: 320, y: 60, width: 50, height: 36, rx: 3, fill: "#c0c0c0", stroke: "#888", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("rect", { x: 328, y: 66, width: 34, height: 24, rx: 1, fill: "#888" }), /* @__PURE__ */ React.createElement("rect", { x: 320, y: 110, width: 45, height: 30, rx: 3, fill: "#1a1a1a", stroke: "#333", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("circle", { cx: 342, cy: 125, r: 8, fill: "#333" }), /* @__PURE__ */ React.createElement("rect", { x: 140, y: 70, width: 60, height: 60, rx: 2, fill: "#1a1a1a", stroke: "#000", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("circle", { cx: 150, cy: 80, r: 2, fill: "#444" }), /* @__PURE__ */ React.createElement("text", { x: 170, y: 105, textAnchor: "middle", fill: "#666", style: { fontSize: "7px" } }, "ATmega328P"), /* @__PURE__ */ React.createElement("circle", { cx: 310, cy: 170, r: 8, fill: "#333", stroke: "#555", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("circle", { cx: 310, cy: 170, r: 4, fill: "#666" }), /* @__PURE__ */ React.createElement("rect", { x: 28, y: -4, width: 304, height: 8, fill: "#c0c0c0", rx: 1 }), /* @__PURE__ */ React.createElement("rect", { x: 28, y: 196, width: 304, height: 8, fill: "#c0c0c0", rx: 1 }), simState && /* @__PURE__ */ React.createElement("text", { x: 170, y: 40, textAnchor: "middle", fill: "#fff", style: { fontSize: "7px", fontWeight: "bold" } }, "ARDUINO UNO"), !simState && /* @__PURE__ */ React.createElement("text", { x: 170, y: 40, textAnchor: "middle", fill: "#fff", style: { fontSize: "7px", fontWeight: "bold" } }, "ARDUINO UNO"), /* @__PURE__ */ React.createElement("circle", { cx: 290, cy: 170, r: 3, fill: "#30d158" }), /* @__PURE__ */ React.createElement("circle", { cx: 278, cy: 170, r: 3, fill: "#ff9f0a" }), (() => {
    const pin13 = simState?.pins["d13"];
    const on = pin13?.digital === "HIGH";
    return /* @__PURE__ */ React.createElement("circle", { cx: 266, cy: 170, r: 3, fill: on ? "#ffd60a" : "#3a3a3c", className: "transition-all" });
  })());
}
function ArduinoNanoSVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 160, height: 240, rx: 6, fill: "#2d7a4a", stroke: "#1a5c33", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("rect", { x: 6, y: 6, width: 148, height: 228, rx: 3, fill: "#236b3d" }), /* @__PURE__ */ React.createElement("rect", { x: 60, y: 0, width: 40, height: 20, fill: "#c0c0c0", rx: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 64, y: 4, width: 32, height: 12, fill: "#888" }), /* @__PURE__ */ React.createElement("rect", { x: 50, y: 100, width: 60, height: 40, rx: 2, fill: "#1a1a1a" }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 125, textAnchor: "middle", fill: "#666", style: { fontSize: "6px" } }, "ATmega328P"), /* @__PURE__ */ React.createElement("text", { x: 80, y: 30, textAnchor: "middle", fill: "#fff", style: { fontSize: "6px", fontWeight: "bold" } }, "NANO"));
}
function PicoSVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 160, height: 200, rx: 6, fill: "#1d6fb8", stroke: "#0d4a87", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("rect", { x: 6, y: 6, width: 148, height: 188, rx: 3, fill: "#155a96" }), /* @__PURE__ */ React.createElement("rect", { x: 60, y: 0, width: 40, height: 16, fill: "#c0c0c0", rx: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 50, y: 80, width: 60, height: 40, rx: 2, fill: "#1a1a1a" }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 105, textAnchor: "middle", fill: "#666", style: { fontSize: "6px" } }, "RP2040"), /* @__PURE__ */ React.createElement("text", { x: 80, y: 50, textAnchor: "middle", fill: "#fff", style: { fontSize: "6px", fontWeight: "bold" } }, "PICO"));
}
function Esp32SVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 180, height: 260, rx: 6, fill: "#1a1a1a", stroke: "#333", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("rect", { x: 6, y: 6, width: 168, height: 248, rx: 3, fill: "#0d0d0d" }), /* @__PURE__ */ React.createElement("rect", { x: 50, y: 100, width: 80, height: 60, rx: 2, fill: "#333", stroke: "#555" }), /* @__PURE__ */ React.createElement("text", { x: 90, y: 135, textAnchor: "middle", fill: "#888", style: { fontSize: "6px" } }, "ESP32-WROOM"), /* @__PURE__ */ React.createElement("text", { x: 90, y: 50, textAnchor: "middle", fill: "#fff", style: { fontSize: "6px", fontWeight: "bold" } }, "ESP32"));
}
function ResistorSVG({ component }) {
  const r = component.props.resistance || 220;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 20, x2: 20, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 80, y1: 20, x2: 100, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 20, y: 10, width: 60, height: 20, rx: 3, fill: "#d4a574", stroke: "#a07c4a", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("rect", { x: 30, y: 10, width: 4, height: 20, fill: "#8b4513" }), /* @__PURE__ */ React.createElement("rect", { x: 40, y: 10, width: 4, height: 20, fill: "#1a1a1a" }), /* @__PURE__ */ React.createElement("rect", { x: 50, y: 10, width: 4, height: 20, fill: "#ff4500" }), /* @__PURE__ */ React.createElement("rect", { x: 60, y: 10, width: 4, height: 20, fill: "#ffd700" }), /* @__PURE__ */ React.createElement("text", { x: 50, y: 5, textAnchor: "middle", fill: "#86868b", style: { fontSize: "8px" } }, component.props.label || `${r}\u03A9`));
}
function CapacitorSVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 25, x2: 30, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 50, y1: 25, x2: 80, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 30, y1: 10, x2: 30, y2: 40, stroke: "#86868b", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("line", { x1: 50, y1: 10, x2: 50, y2: 40, stroke: "#86868b", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("text", { x: 40, y: 5, textAnchor: "middle", fill: "#86868b", style: { fontSize: "8px" } }, "10\xB5F"));
}
function LedSVG({ component, simState }) {
  const color = component.props.color || "#ff3b30";
  const anodeState = simState?.pins["a"];
  const cathodeState = simState?.pins["c"];
  const lit = anodeState?.digital === "HIGH" && cathodeState?.digital === "LOW";
  const glow = lit ? 1 : 0;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 25, x2: 15, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 45, y1: 25, x2: 60, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 25, r: 15, fill: lit ? color : "#2a2a2e", stroke: color, strokeWidth: 2, opacity: lit ? 1 : 0.4, className: "transition-all" }), lit && /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 25, r: 22, fill: color, opacity: 0.15 * glow, className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: "22,18 27,25 22,32", fill: "#86868b" }), /* @__PURE__ */ React.createElement("line", { x1: 25, y1: 18, x2: 35, y2: 32, stroke: "#86868b", strokeWidth: 1 }));
}
function RgbLedSVG({ simState }) {
  const r = simState?.pins["r"]?.digital === "HIGH";
  const g = simState?.pins["g"]?.digital === "HIGH";
  const b = simState?.pins["b"]?.digital === "HIGH";
  const fillColor = `rgb(${r ? 255 : 0}, ${g ? 255 : 0}, ${b ? 255 : 0})`;
  const lit = r || g || b;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 18, fill: lit ? fillColor : "#2a2a2e", stroke: "#86868b", strokeWidth: 2, opacity: lit ? 1 : 0.4, className: "transition-all" }), lit && /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 26, fill: fillColor, opacity: 0.15, className: "transition-all" }));
}
function DiodeSVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 20, x2: 25, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 55, y1: 20, x2: 80, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("polygon", { points: "25,10 25,30 55,20", fill: "#86868b", stroke: "#666", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("line", { x1: 55, y1: 10, x2: 55, y2: 30, stroke: "#86868b", strokeWidth: 2 }));
}
function PushButtonSVG({ component }) {
  const pressed = component.props.pressed;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 20, x2: 15, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 45, y1: 20, x2: 60, y2: 20, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 40, x2: 15, y2: 40, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 45, y1: 40, x2: 60, y2: 40, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 14, fill: pressed ? "#0a84ff" : "#3a3a3c", stroke: "#86868b", strokeWidth: 2, className: "transition-all" }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: pressed ? 8 : 6, fill: pressed ? "#409cff" : "#555", className: "transition-all" }));
}
function SwitchSVG({ component }) {
  const closed = component.props.closed;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 25, x2: 15, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 55, y1: 25, x2: 70, y2: 25, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 15, cy: 25, r: 3, fill: "#86868b" }), /* @__PURE__ */ React.createElement("circle", { cx: 55, cy: 25, r: 3, fill: "#86868b" }), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: 15,
      y1: 25,
      x2: closed ? 55 : 50,
      y2: closed ? 25 : 10,
      stroke: closed ? "#30d158" : "#86868b",
      strokeWidth: 2,
      className: "transition-all"
    }
  ));
}
function PotentiometerSVG({ component }) {
  const val = component.props.value ?? 0.5;
  const angle = -135 + val * 270;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("circle", { cx: 40, cy: 30, r: 22, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 40, cy: 30, r: 16, fill: "#2a2a2e" }), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: 40,
      y1: 30,
      x2: 40 + 14 * Math.cos(angle * Math.PI / 180),
      y2: 30 + 14 * Math.sin(angle * Math.PI / 180),
      stroke: "#0a84ff",
      strokeWidth: 2,
      className: "transition-all"
    }
  ), /* @__PURE__ */ React.createElement("text", { x: 40, y: 5, textAnchor: "middle", fill: "#86868b", style: { fontSize: "7px" } }, Math.round(val * 100), "%"));
}
function BuzzerSVG({ simState }) {
  const active = simState?.pins["+"]?.digital === "HIGH";
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 22, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 16, fill: "#2a2a2e" }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 8, fill: active ? "#0a84ff" : "#555", className: "transition-all" }), active && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 28, fill: "none", stroke: "#0a84ff", strokeWidth: 1, opacity: 0.5 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 30, r: 34, fill: "none", stroke: "#0a84ff", strokeWidth: 1, opacity: 0.3 })));
}
function DcMotorSVG({ simState }) {
  const active = simState?.pins["+"]?.digital === "HIGH";
  const angle = simState?.visual?.angle || 0;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("circle", { cx: 40, cy: 30, r: 24, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 40, cy: 30, r: 18, fill: "#2a2a2e" }), /* @__PURE__ */ React.createElement("g", { transform: `rotate(${angle}, 40, 30)`, className: "transition-all" }, /* @__PURE__ */ React.createElement("line", { x1: 40, y1: 14, x2: 40, y2: 46, stroke: active ? "#0a84ff" : "#666", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("line", { x1: 24, y1: 30, x2: 56, y2: 30, stroke: active ? "#0a84ff" : "#666", strokeWidth: 3 })), /* @__PURE__ */ React.createElement("text", { x: 40, y: 5, textAnchor: "middle", fill: "#86868b", style: { fontSize: "7px" } }, "M"));
}
function ServoSVG({ simState }) {
  const angle = simState?.visual?.angle ?? 90;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 20, width: 50, height: 40, rx: 3, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 15, r: 12, fill: "#2a2a2e", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("g", { transform: `rotate(${angle - 90}, 30, 15)` }, /* @__PURE__ */ React.createElement("line", { x1: 30, y1: 15, x2: 30, y2: 3, stroke: "#0a84ff", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("circle", { cx: 30, cy: 15, r: 3, fill: "#0a84ff" })), /* @__PURE__ */ React.createElement("text", { x: 30, y: 70, textAnchor: "middle", fill: "#86868b", style: { fontSize: "7px" } }, Math.round(angle), "\xB0"));
}
function RelaySVG({ simState }) {
  const active = simState?.pins["sig"]?.digital === "HIGH";
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 5, width: 70, height: 60, rx: 4, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 12, y: 12, width: 30, height: 20, rx: 2, fill: "#2a2a2e" }), /* @__PURE__ */ React.createElement("circle", { cx: 55, cy: 30, r: 6, fill: active ? "#ffd60a" : "#555", className: "transition-all" }), /* @__PURE__ */ React.createElement("line", { x1: 55, y1: 30, x2: active ? 70 : 65, y2: active ? 15 : 25, stroke: "#86868b", strokeWidth: 2, className: "transition-all" }));
}
function LcdSVG({ component }) {
  const text = component.props.text || "Hello, World!";
  const line1 = text.split("\n")[0] || "";
  const line2 = text.split("\n")[1] || "";
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 220, height: 100, rx: 6, fill: "#1a6b3a", stroke: "#0d4a26", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 15, y: 15, width: 190, height: 70, rx: 2, fill: "#a5e8b5" }), /* @__PURE__ */ React.createElement("text", { x: 20, y: 40, fill: "#1a3a1a", style: { fontSize: "11px", fontFamily: "monospace", fontWeight: "bold" } }, line1.slice(0, 16)), /* @__PURE__ */ React.createElement("text", { x: 20, y: 65, fill: "#1a3a1a", style: { fontSize: "11px", fontFamily: "monospace", fontWeight: "bold" } }, line2.slice(0, 16)));
}
function OledSVG({ component }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 160, height: 120, rx: 4, fill: "#1a1a1a", stroke: "#333", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 15, y: 15, width: 130, height: 90, rx: 2, fill: "#0a0a0a" }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 60, textAnchor: "middle", fill: "#30d158", style: { fontSize: "10px", fontFamily: "monospace" } }, component.props.text || "Nextel AI"));
}
function SevenSegmentSVG({ simState }) {
  const segments = simState?.visual?.segments || [false, false, false, false, false, false, false];
  const segColors = segments.map((s) => s ? "#ff3b30" : "#3a0a08");
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 80, height: 120, rx: 4, fill: "#1a1a1a", stroke: "#333", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("polygon", { points: `20,15 60,15 55,20 25,20`, fill: segColors[0], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `62,17 62,57 57,52 57,22`, fill: segColors[1], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `62,63 62,103 57,98 57,68`, fill: segColors[2], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `20,105 60,105 55,100 25,100`, fill: segColors[3], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `18,63 18,103 23,98 23,68`, fill: segColors[4], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `18,17 18,57 23,52 23,22`, fill: segColors[5], className: "transition-all" }), /* @__PURE__ */ React.createElement("polygon", { points: `20,60 60,60 55,55 25,55 25,65 55,65`, fill: segColors[6], className: "transition-all" }));
}
function LedMatrixSVG({ simState }) {
  const grid = simState?.visual?.grid || Array(8).fill(null).map(() => Array(8).fill(false));
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 120, height: 120, rx: 4, fill: "#1a1a1a", stroke: "#333", strokeWidth: 2 }), grid.map(
    (row, i) => row.map((on, j) => /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: `${i}-${j}`,
        cx: 15 + j * 13,
        cy: 15 + i * 13,
        r: 4,
        fill: on ? "#30d158" : "#1a3a1a",
        className: "transition-all"
      }
    ))
  ));
}
function TempSensorSVG({ component }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 15, y: 10, width: 40, height: 50, rx: 3, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 25, y: 50, width: 20, height: 15, fill: "#86868b" }), /* @__PURE__ */ React.createElement("text", { x: 35, y: 40, textAnchor: "middle", fill: "#fff", style: { fontSize: "8px", fontWeight: "bold" } }, component.props.temperature || 25, "\xB0"));
}
function LightSensorSVG({ component }) {
  const light = component.props.light ?? 0.5;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 15, y: 10, width: 40, height: 50, rx: 3, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 35, cy: 30, r: 12, fill: `rgb(${Math.round(light * 255)}, ${Math.round(light * 255)}, 0)`, stroke: "#86868b", strokeWidth: 1, className: "transition-all" }), /* @__PURE__ */ React.createElement("text", { x: 35, y: 5, textAnchor: "middle", fill: "#86868b", style: { fontSize: "7px" } }, "LDR"));
}
function UltrasonicSVG({ component }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 120, height: 80, rx: 6, fill: "#1a5c9e", stroke: "#0d3d6b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 25, cy: 40, r: 15, fill: "#0d3d6b", stroke: "#fff", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("circle", { cx: 25, cy: 40, r: 8, fill: "#1a5c9e" }), /* @__PURE__ */ React.createElement("circle", { cx: 95, cy: 40, r: 15, fill: "#0d3d6b", stroke: "#fff", strokeWidth: 1 }), /* @__PURE__ */ React.createElement("circle", { cx: 95, cy: 40, r: 8, fill: "#1a5c9e" }), /* @__PURE__ */ React.createElement("text", { x: 60, y: 15, textAnchor: "middle", fill: "#fff", style: { fontSize: "7px", fontWeight: "bold" } }, "HC-SR04"), /* @__PURE__ */ React.createElement("text", { x: 60, y: 70, textAnchor: "middle", fill: "#fff", style: { fontSize: "7px" } }, component.props.distance || 0, "cm"));
}
function PirSVG({ component }) {
  const motion = component.props.motion;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 5, width: 60, height: 60, rx: 6, fill: "#fff", stroke: "#ccc", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 35, cy: 35, r: 18, fill: motion ? "#ff3b30" : "#3a3a3c", stroke: "#86868b", strokeWidth: 2, className: "transition-all" }), /* @__PURE__ */ React.createElement("circle", { cx: 35, cy: 35, r: 10, fill: motion ? "#ff6b6b" : "#555", className: "transition-all" }));
}
function IrSVG({ component }) {
  const detected = component.props.detected;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 5, width: 60, height: 60, rx: 4, fill: "#1a5c9e", stroke: "#0d3d6b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 35, cy: 30, r: 12, fill: detected ? "#ff3b30" : "#0d3d6b", stroke: "#fff", strokeWidth: 1, className: "transition-all" }), /* @__PURE__ */ React.createElement("rect", { x: 15, y: 50, width: 40, height: 10, rx: 2, fill: "#0d3d6b" }));
}
function BatterySVG({ component }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 10, width: 60, height: 40, rx: 4, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 65, y: 20, width: 10, height: 20, rx: 2, fill: "#86868b" }), /* @__PURE__ */ React.createElement("text", { x: 35, y: 35, textAnchor: "middle", fill: "#fff", style: { fontSize: "10px", fontWeight: "bold" } }, component.props.voltage || 9, "V"));
}
function PowerSVG({
  component,
  color
}) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 5, y: 5, width: 50, height: 30, rx: 4, fill: color, stroke: "#fff", strokeWidth: 1, opacity: 0.9 }), /* @__PURE__ */ React.createElement("text", { x: 30, y: 25, textAnchor: "middle", fill: "#fff", style: { fontSize: "10px", fontWeight: "bold" } }, component.props.label || "5V"));
}
function GndSVG() {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 25, y1: 0, x2: 25, y2: 15, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 10, y1: 15, x2: 40, y2: 15, stroke: "#86868b", strokeWidth: 3 }), /* @__PURE__ */ React.createElement("line", { x1: 14, y1: 22, x2: 36, y2: 22, stroke: "#86868b", strokeWidth: 2.5 }), /* @__PURE__ */ React.createElement("line", { x1: 18, y1: 29, x2: 32, y2: 29, stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("line", { x1: 22, y1: 36, x2: 28, y2: 36, stroke: "#86868b", strokeWidth: 1.5 }));
}
function GateSVG({ label, simState }) {
  const outState = simState?.pins["out"]?.digital === "HIGH";
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("path", { d: "M 10,5 L 40,5 Q 70,30 40,55 L 10,55 Z", fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 72, cy: 30, r: 3, fill: outState ? "#ffd60a" : "#555", className: "transition-all" }), /* @__PURE__ */ React.createElement("text", { x: 30, y: 35, textAnchor: "middle", fill: "#fff", style: { fontSize: "9px", fontWeight: "bold" } }, label));
}
function NotGateSVG({ simState }) {
  const outState = simState?.pins["out"]?.digital === "HIGH";
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("polygon", { points: "10,5 55,20 10,35", fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("circle", { cx: 60, cy: 20, r: 3, fill: outState ? "#ffd60a" : "#555", className: "transition-all" }), /* @__PURE__ */ React.createElement("text", { x: 25, y: 25, textAnchor: "middle", fill: "#fff", style: { fontSize: "8px", fontWeight: "bold" } }, "!"));
}
function BreadboardSVG() {
  const holes = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 25; c++) {
      holes.push(/* @__PURE__ */ React.createElement("circle", { key: `t-${r}-${c}`, cx: 20 + c * 11, cy: 20 + r * 8, r: 1.5, fill: "#888" }));
    }
  }
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 25; c++) {
      holes.push(/* @__PURE__ */ React.createElement("circle", { key: `b-${r}-${c}`, cx: 20 + c * 11, cy: 70 + r * 8, r: 1.5, fill: "#888" }));
    }
  }
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 300, height: 120, rx: 4, fill: "#f5f5dc", stroke: "#d4d4aa", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("rect", { x: 0, y: 55, width: 300, height: 10, fill: "#d4d4aa" }), holes);
}
function DefaultSVG({ label }) {
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: 80, height: 40, rx: 4, fill: "#3a3a3c", stroke: "#86868b", strokeWidth: 2 }), /* @__PURE__ */ React.createElement("text", { x: 40, y: 25, textAnchor: "middle", fill: "#fff", style: { fontSize: "9px" } }, label));
}
export {
  ComponentRenderer,
  getPinWorldPosition
};

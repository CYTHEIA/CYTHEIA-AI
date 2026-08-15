import { COMPONENT_MAP } from "./library.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function h(type, props, ...children) {
  const node = document.createElementNS(SVG_NS, type);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === "style" && typeof value === "object") {
        for (const [sk, sv] of Object.entries(value)) node.style[sk] = sv;
      } else {
        node.setAttribute(key, String(value));
      }
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    if (child instanceof Node) node.appendChild(child);
    else node.appendChild(document.createTextNode(String(child)));
  }
  return node;
}

function pinWorld(comp, def, pinId) {
  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: comp.x, y: comp.y };
  const cx = def.width / 2;
  const cy = def.height / 2;
  const rad = (comp.rotation || 0) * Math.PI / 180;
  const dx = pin.x - cx;
  const dy = pin.y - cy;
  return {
    x: comp.x + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: comp.y + dx * Math.sin(rad) + dy * Math.cos(rad)
  };
}

const NEUTRAL = "#6a6e78";
const BODY = "#2c2d33";
const BODY_STROKE = "#4a4d55";

function symbolFor(type, props) {
  const def = COMPONENT_MAP[type];
  const W = def?.width || 80;
  const H = def?.height || 40;
  const cx = W / 2;
  const cy = H / 2;
  const label = props?.label;

  switch (type) {
    case "arduino-uno":
    case "arduino-nano":
    case "arduino-mega":
    case "raspberry-pi-pico":
    case "esp32": {
      const board = type === "raspberry-pi-pico" ? "#1d6fb8" : type === "esp32" ? "#202126" : "#2d7a4a";
      const name = type === "arduino-nano" ? "NANO" : type === "arduino-mega" ? "MEGA" : type === "raspberry-pi-pico" ? "PICO" : type === "esp32" ? "ESP32" : "UNO";
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 6, fill: board, stroke: "#0f1c14", strokeWidth: 1.5, opacity: 0.9 }),
        h("rect", { x: 4, y: 4, width: W - 8, height: H - 8, rx: 3, fill: "none", stroke: "#ffffff", strokeWidth: 0.5, opacity: 0.12 }),
        h("text", { x: cx, y: cy + 3, textAnchor: "middle", fill: "#fff", style: { fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px" } }, name)
      ];
    }
    case "resistor":
      return [
        h("line", { x1: 0, y1: cy, x2: 14, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: W - 14, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("rect", { x: 14, y: cy - 8, width: W - 28, height: 16, rx: 2, fill: "#3d3330", stroke: "#8a7b6a", strokeWidth: 1 }),
        h("rect", { x: 22, y: cy - 8, width: 3, height: 16, fill: "#c0392b" }),
        h("rect", { x: 29, y: cy - 8, width: 3, height: 16, fill: "#e67e22" })
      ];
    case "capacitor":
      return [
        h("line", { x1: 0, y1: cy, x2: cx - 8, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx + 8, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx - 8, y1: cy - 10, x2: cx - 8, y2: cy + 10, stroke: "#8a6a3a", strokeWidth: 2.5 }),
        h("line", { x1: cx + 8, y1: cy - 10, x2: cx + 8, y2: cy + 10, stroke: NEUTRAL, strokeWidth: 2.5 })
      ];
    case "led": {
      const color = props?.color || "#ff3b30";
      return [
        h("line", { x1: 0, y1: cy, x2: cx - 12, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx + 12, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("polygon", { points: `${cx - 8},${cy - 11} ${cx + 8},${cy} ${cx - 8},${cy + 11}`, fill: "transparent", stroke: color, strokeWidth: 1.6 }),
        h("polygon", { points: `${cx - 8},${cy - 11} ${cx + 8},${cy} ${cx - 8},${cy + 11}`, fill: color, opacity: 0.5 }),
        h("line", { x1: cx - 8, y1: cy - 11, x2: cx + 3, y2: cy + 2, stroke: NEUTRAL, strokeWidth: 1.2 }),
        h("line", { x1: cx + 8, y1: cy, x2: cx - 8, y2: cy, stroke: NEUTRAL, strokeWidth: 2 })
      ];
    }
    case "rgb-led":
      return [
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 4, fill: "#22242a", stroke: NEUTRAL, strokeWidth: 1.5 }),
        h("circle", { cx: cx - 5, cy: cy - 5, r: 3.2, fill: "#ff453a" }),
        h("circle", { cx: cx + 5, cy: cy - 5, r: 3.2, fill: "#30d158" }),
        h("circle", { cx, cy: cy + 5, r: 3.2, fill: "#0a84ff" })
      ];
    case "diode":
      return [
        h("line", { x1: 0, y1: cy, x2: cx - 12, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx + 12, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("polygon", { points: `${cx - 12},${cy - 9} ${cx - 12},${cy + 9} ${cx + 6},${cy}`, fill: "#4a4d55" }),
        h("line", { x1: cx + 6, y1: cy - 9, x2: cx + 6, y2: cy + 9, stroke: "#4a4d55", strokeWidth: 2 })
      ];
    case "push-button":
    case "switch":
      return [
        h("line", { x1: 0, y1: cy - 10, x2: cx - 10, y2: cy - 10, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx + 10, y1: cy - 10, x2: W, y2: cy - 10, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: 0, y1: cy + 10, x2: cx - 10, y2: cy + 10, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx + 10, y1: cy + 10, x2: W, y2: cy + 10, stroke: NEUTRAL, strokeWidth: 2 }),
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 6, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx, cy, r: 3, fill: "#9aa0ab" }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "7px" } }, type === "switch" ? "SW" : "BTN")
      ];
    case "potentiometer":
      return [
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 3, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 9, fill: "#24262b" }),
        h("line", { x1: cx, y1: cy, x2: cx, y2: cy - 9, stroke: "#0a84ff", strokeWidth: 2 }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "7px" } }, "POT")
      ];
    case "buzzer":
      return [
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 3, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx, cy, r: 5, fill: "#0a84ff", opacity: 0.85 }),
        h("circle", { cx, cy, r: 9, fill: "none", stroke: "#0a84ff", strokeWidth: 1, opacity: 0.4 })
      ];
    case "dc-motor":
      return [
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 4, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("line", { x1: cx, y1: cy - 8, x2: cx, y2: cy + 8, stroke: "#9aa0ab", strokeWidth: 2 }),
        h("line", { x1: cx - 8, y1: cy, x2: cx + 8, y2: cy, stroke: "#9aa0ab", strokeWidth: 2 }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "7px", fontWeight: "bold" } }, "M")
      ];
    case "servo":
      return [
        h("rect", { x: 4, y: 8, width: W - 8, height: H - 14, rx: 3, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx: W - 16, cy: H / 2, r: 5, fill: "#0a84ff" }),
        h("line", { x1: W - 16, y1: H / 2, x2: W - 16, y2: H / 2 - 9, stroke: "#0a84ff", strokeWidth: 2 }),
        h("text", { x: cx, y: H / 2 + 3, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "7px" } }, "SERVO")
      ];
    case "relay":
      return [
        h("rect", { x: 3, y: 4, width: W - 6, height: H - 8, rx: 3, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("rect", { x: 8, y: 10, width: W * 0.35, height: H * 0.5, rx: 2, fill: "#24262b" }),
        h("circle", { cx: W - 18, cy: H / 2, r: 4, fill: "#ffd60a" }),
        h("text", { x: cx, y: H - 5, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, "RELAY")
      ];
    case "lcd-16x2":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 4, fill: "#173d29", stroke: "#0d4a26", strokeWidth: 1.5 }),
        h("rect", { x: 8, y: 10, width: W - 16, height: H - 20, rx: 2, fill: "#a5e8b5", opacity: 0.92 }),
        h("text", { x: 12, y: H / 2 + 3, fill: "#1a3a1a", style: { fontSize: "8px", fontWeight: "bold", fontFamily: "monospace" } }, "16x2")
      ];
    case "oled":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 4, fill: "#1a1a1c", stroke: "#3a3d44", strokeWidth: 1.5 }),
        h("rect", { x: 8, y: 10, width: W - 16, height: H - 20, rx: 2, fill: "#0a0a0c" }),
        h("text", { x: cx, y: H / 2 + 3, textAnchor: "middle", fill: "#30d158", style: { fontSize: "8px", fontWeight: "bold", fontFamily: "monospace" } }, "OLED")
      ];
    case "seven-segment":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 4, fill: "#1a1a1c", stroke: "#3a3d44", strokeWidth: 1.5 }),
        h("text", { x: cx, y: H / 2 + 5, textAnchor: "middle", fill: "#ff3b30", style: { fontSize: "16px", fontWeight: "bold" } }, "8"),
        h("text", { x: cx, y: H - 3, textAnchor: "middle", fill: "#6a6e78", style: { fontSize: "5px" } }, "7-SEG")
      ];
    case "led-matrix":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 3, fill: "#1a1a1c", stroke: "#3a3d44", strokeWidth: 1.5 }),
        ...Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) =>
            h("circle", { cx: 12 + c * (W - 24) / 3, cy: 12 + r * (H - 24) / 3, r: 2.6, fill: r === c ? "#30d158" : "#1f3a22" })
          )
        )
      ];
    case "temp-sensor":
    case "light-sensor":
    case "pir-sensor":
    case "ir-sensor": {
      const name = type === "temp-sensor" ? "TEMP" : type === "light-sensor" ? "LDR" : type === "pir-sensor" ? "PIR" : "IR";
      const body = type === "pir-sensor" ? "#e8e8ea" : "#31333a";
      const accent = type === "temp-sensor" ? "#ff9f0a" : type === "light-sensor" ? "#ffd60a" : type === "pir-sensor" ? "#ff3b30" : "#0a84ff";
      return [
        h("rect", { x: 3, y: 3, width: W - 6, height: H - 6, rx: 4, fill: body, stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx, cy: cy - 4, r: Math.min(W, H) / 4, fill: accent, opacity: 0.8 }),
        h("text", { x: cx, y: H - 4, textAnchor: "middle", fill: type === "pir-sensor" ? "#555" : "#9aa0ab", style: { fontSize: "6px", fontWeight: "bold" } }, name)
      ];
    }
    case "ultrasonic-sensor":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 5, fill: "#174a80", stroke: "#0d3d6b", strokeWidth: 1.5 }),
        h("circle", { cx: W * 0.27, cy: H / 2, r: Math.min(W, H) / 4, fill: "#0d3d6b", stroke: "#fff", strokeWidth: 0.8 }),
        h("circle", { cx: W * 0.73, cy: H / 2, r: Math.min(W, H) / 4, fill: "#0d3d6b", stroke: "#fff", strokeWidth: 0.8 }),
        h("text", { x: cx, y: H - 3, textAnchor: "middle", fill: "#bcd6ee", style: { fontSize: "6px" } }, "SONIC")
      ];
    case "battery":
      return [
        h("rect", { x: 3, y: 6, width: W - 16, height: H - 12, rx: 3, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("rect", { x: W - 13, y: 14, width: 10, height: H - 28, rx: 2, fill: "#6a6e78" }),
        h("text", { x: cx - 6, y: cy + 3, textAnchor: "middle", fill: "#fff", style: { fontSize: "9px", fontWeight: "bold" } }, props?.voltage || 9)
      ];
    case "power-5v":
    case "power-3v3":
    case "vcc":
      return [
        h("rect", { x: 3, y: 3, width: W - 6, height: H - 6, rx: 4, fill: type === "power-5v" ? "#8a1f18" : type === "power-3v3" ? "#8a5a14" : "#5a2040", stroke: "#6a6e78", strokeWidth: 1 }),
        h("text", { x: cx, y: cy + 3, textAnchor: "middle", fill: "#fff", style: { fontSize: "8px", fontWeight: "bold" } }, type === "power-5v" ? "5V" : type === "power-3v3" ? "3V3" : "VCC")
      ];
    case "gnd":
      return [
        h("line", { x1: cx, y1: 4, x2: cx, y2: H / 2, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: cx - 10, y1: H / 2, x2: cx + 10, y2: H / 2, stroke: NEUTRAL, strokeWidth: 3 }),
        h("line", { x1: cx - 7, y1: H / 2 + 4, x2: cx + 7, y2: H / 2 + 4, stroke: NEUTRAL, strokeWidth: 2.5 }),
        h("line", { x1: cx - 4, y1: H / 2 + 8, x2: cx + 4, y2: H / 2 + 8, stroke: NEUTRAL, strokeWidth: 2 })
      ];
    case "and-gate":
    case "or-gate":
    case "nand-gate":
    case "nor-gate":
    case "xor-gate":
    case "not-gate":
      return [
        h("path", { d: type === "not-gate" ? `M 8 4 L ${W - 16} ${cy} L 8 ${H - 4} Z` : `M 8 4 L ${W * 0.5} 4 Q ${W - 10} ${cy} ${W * 0.5} ${H - 4} L 8 ${H - 4} Z`, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("text", { x: W * 0.4, y: cy + 3, textAnchor: "middle", fill: "#c6c9cf", style: { fontSize: "8px", fontWeight: "bold" } }, type.replace("-gate", "").toUpperCase())
      ];
    case "npn-transistor":
    case "pnp-transistor":
      return [
        h("circle", { cx, cy, r: Math.min(W, H) / 2 - 4, fill: "#31333a", stroke: NEUTRAL, strokeWidth: 1.5 }),
        h("line", { x1: cx, y1: cy - 12, x2: cx, y2: cy + 12, stroke: NEUTRAL, strokeWidth: 2 }),
        h("polygon", { points: `${cx - 6},${cy} ${cx + 6},${cy} ${cx},${cy - 8}`, fill: "#9aa0ab" }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, type === "npn-transistor" ? "NPN" : "PNP")
      ];
    case "n-mosfet":
    case "p-mosfet":
      return [
        h("rect", { x: 4, y: 4, width: W - 8, height: H - 8, rx: 3, fill: "#31333a", stroke: NEUTRAL, strokeWidth: 1.5 }),
        h("line", { x1: cx, y1: cy - 8, x2: cx, y2: cy + 8, stroke: NEUTRAL, strokeWidth: 2 }),
        h("polygon", { points: `${cx - 6},${cy} ${cx + 6},${cy} ${cx},${cy - 8}`, fill: "#9aa0ab" }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, type === "n-mosfet" ? "N-FET" : "P-FET")
      ];
    case "photodiode":
      return [
        h("rect", { x: 4, y: 4, width: W - 8, height: H - 8, rx: 3, fill: "#31333a", stroke: NEUTRAL, strokeWidth: 1.5 }),
        h("circle", { cx, cy, r: Math.min(W, H) / 4, fill: "#0a84ff", opacity: 0.6 }),
        h("text", { x: cx, y: cy + 14, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, "PD")
      ];
    case "inductor":
      return [
        h("line", { x1: 0, y1: cy, x2: 8, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: W - 8, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("path", { d: `M 8,${cy} Q 15,${cy - 6} 22,${cy} Q 29,${cy + 6} 36,${cy} Q 43,${cy - 6} 50,${cy} Q 57,${cy + 6} 64,${cy} Q 71,${cy - 6} ${W - 8},${cy}`, fill: "none", stroke: NEUTRAL, strokeWidth: 2 }),
        h("text", { x: cx, y: cy - 10, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, label || "10mH")
      ];
    case "fuse":
      return [
        h("line", { x1: 0, y1: cy, x2: 12, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("line", { x1: W - 12, y1: cy, x2: W, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("rect", { x: 12, y: cy - 6, width: W - 24, height: 12, rx: 1, fill: "#31333a", stroke: NEUTRAL, strokeWidth: 1.5 }),
        h("rect", { x: 18, y: cy - 6, width: 1.5, height: 12, fill: NEUTRAL }),
        h("rect", { x: cx - 0.75, y: cy - 6, width: 1.5, height: 12, fill: NEUTRAL }),
        h("rect", { x: W - 20, y: cy - 6, width: 1.5, height: 12, fill: NEUTRAL }),
        h("text", { x: cx, y: cy - 10, textAnchor: "middle", fill: "#8a8f99", style: { fontSize: "6px" } }, label || "500mA")
      ];
    case "dht11":
    case "dht22":
      return [
        h("rect", { x: 3, y: 3, width: W - 6, height: H - 6, rx: 4, fill: "#31333a", stroke: "#6a6e78", strokeWidth: 1.5 }),
        h("circle", { cx, cy: cy - 4, r: Math.min(W, H) / 4, fill: "#ff9f0a", opacity: 0.8 }),
        h("text", { x: cx, y: H - 4, textAnchor: "middle", fill: "#9aa0ab", style: { fontSize: "6px", fontWeight: "bold" } }, type === "dht11" ? "DHT11" : "DHT22")
      ];
    case "dc-supply":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 4, fill: "#2a2a2e", stroke: NEUTRAL, strokeWidth: 2 }),
        h("circle", { cx: W * 0.15, cy: cy, r: 6, fill: "#ff453a", stroke: "#fff", strokeWidth: 1 }),
        h("circle", { cx: W * 0.85, cy: cy, r: 6, fill: "#3a3a3c", stroke: NEUTRAL, strokeWidth: 1 }),
        h("line", { x1: W * 0.22, y1: cy, x2: W * 0.78, y2: cy, stroke: NEUTRAL, strokeWidth: 2 }),
        h("text", { x: cx, y: cy + 3, textAnchor: "middle", fill: "#fff", style: { fontSize: "8px", fontWeight: "bold" } }, label || "12V")
      ];
    case "breadboard":
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 3, fill: "#f5f5dc", stroke: "#c9c9a8", strokeWidth: 1.5 }),
        h("line", { x1: 0, y1: H / 2 - 3, x2: W, y2: H / 2 - 3, stroke: "#c9c9a8", strokeWidth: 3 }),
        h("line", { x1: 0, y1: H / 2 + 3, x2: W, y2: H / 2 + 3, stroke: "#c9c9a8", strokeWidth: 3 }),
        ...Array.from({ length: 14 }, (_, c) =>
          [8, 18, H - 18, H - 8].map((y) =>
            h("circle", { cx: 10 + c * (W - 20) / 13, cy: y, r: 1.3, fill: "#b8b896" })
          )
        )
      ];
    default:
      return [
        h("rect", { x: 0, y: 0, width: W, height: H, rx: 4, fill: BODY, stroke: BODY_STROKE, strokeWidth: 1.5 }),
        h("text", { x: cx, y: cy + 3, textAnchor: "middle", fill: "#9aa0ab", style: { fontSize: "7px" } }, label || type)
      ];
  }
}

function wireColor(fromPin, toPin) {
  const isGround = (p) => p?.type === "ground" || p?.name?.toUpperCase().includes("GND");
  const isPower = (p) => p?.type === "power" || /VCC|5V|3V3|VIN/.test((p?.name || "").toUpperCase());
  if (isGround(fromPin) || isGround(toPin)) return "#565a63";
  if (isPower(fromPin) || isPower(toPin)) return "#8a3b35";
  return "#4a4d55";
}

export function renderTemplatePreview(container, data, opts = {}) {
  const { quiet = false } = opts || {};
  container.innerHTML = "";
  const components = data?.components || [];
  const connections = data?.connections || [];
  const svg = h("svg", {
    viewBox: "0 0 320 150",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet",
    className: "ct-preview-svg"
  });
  svg.setAttribute("aria-hidden", "true");

  if (!components.length) {
    container.appendChild(svg);
    return;
  }

  const defs = h("defs", null,
    h("pattern", { id: "ct-preview-grid", width: 12, height: 12, patternUnits: "userSpaceOnUse" },
      h("circle", { cx: 1, cy: 1, r: 0.6, fill: "#3a3d44", opacity: 0.5 })
    )
  );
  svg.appendChild(defs);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const comp of components) {
    const def = COMPONENT_MAP[comp.type];
    if (!def) continue;
    minX = Math.min(minX, comp.x - def.width / 2);
    minY = Math.min(minY, comp.y - def.height / 2);
    maxX = Math.max(maxX, comp.x + def.width / 2);
    maxY = Math.max(maxY, comp.y + def.height / 2);
  }
  if (!isFinite(minX)) { container.appendChild(svg); return; }
  const pad = 18;
  const bw = maxX - minX + pad * 2;
  const bh = maxY - minY + pad * 2;
  svg.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${bw} ${bh}`);

  const bg = h("rect", { x: minX - pad, y: minY - pad, width: bw, height: bh, fill: "url(#ct-preview-grid)" });
  svg.appendChild(bg);

  for (const conn of connections) {
    const a = components.find((c) => c.id === conn.fromComponent);
    const b = components.find((c) => c.id === conn.toComponent);
    if (!a || !b) continue;
    const adef = COMPONENT_MAP[a.type];
    const bdef = COMPONENT_MAP[b.type];
    if (!adef || !bdef) continue;
    const from = pinWorld(a, adef, conn.fromPin);
    const to = pinWorld(b, bdef, conn.toPin);
    const fp = adef.pins.find((p) => p.id === conn.fromPin);
    const tp = bdef.pins.find((p) => p.id === conn.toPin);
    const color = wireColor(fp, tp);
    const midX = (from.x + to.x) / 2;
    svg.appendChild(h("path", {
      d: `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`,
      fill: "none",
      stroke: color,
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));
  }

  for (const comp of components) {
    const def = COMPONENT_MAP[comp.type];
    if (!def) continue;
    const cx = def.width / 2;
    const cy = def.height / 2;
    const group = h("g", {
      transform: `translate(${comp.x - cx}, ${comp.y - cy}) rotate(${comp.rotation || 0}, ${cx}, ${cy})`
    });
    for (const el of symbolFor(comp.type, comp.props)) group.appendChild(el);
    svg.appendChild(group);
  }

  container.appendChild(svg);
}

export function createComponentGlyph(type, size = 22) {
  const def = COMPONENT_MAP[type];
  const W = def?.width || 80;
  const H = def?.height || 40;
  const svg = h("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: size,
    height: size,
    preserveAspectRatio: "xMidYMid meet"
  });
  for (const el of symbolFor(type, def?.defaultProps || {})) svg.appendChild(el);
  return svg;
}

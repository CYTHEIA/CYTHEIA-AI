import { useProjectStore } from "@/store/projectStore";
import { useSimulationStore } from "@/store/simulationStore";
import { COMPONENT_MAP } from "@/components/library";
import { Sliders, Activity, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
function RightSidebar() {
  const open = useUIStore((s) => s.rightSidebarOpen);
  if (!open) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "w-72 bg-[#1a1a1e] border-l border-white/5 flex flex-col h-full overflow-y-auto" }, /* @__PURE__ */ React.createElement(PropertiesPanel, null), /* @__PURE__ */ React.createElement(InspectorPanel, null), /* @__PURE__ */ React.createElement(SimulationPanel, null));
}
import { useUIStore } from "@/store/uiStore";
function PropertiesPanel() {
  const components = useProjectStore((s) => s.components);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const setComponentProperty = useProjectStore((s) => s.setComponentProperty);
  const rotateComponent = useProjectStore((s) => s.rotateComponent);
  const selected = components.find((c) => c.id === selectedIds[0]);
  if (!selected) {
    return /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-400 mb-3" }, /* @__PURE__ */ React.createElement(Sliders, { size: 15 }), " Properties"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600" }, "Select a component to edit its properties"));
  }
  const def = COMPONENT_MAP[selected.type];
  const editableProps = getEditableProps(selected.type);
  return /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-300" }, /* @__PURE__ */ React.createElement(Sliders, { size: 15 }), " Properties"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded" }, def?.label)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-gray-500 mb-1 block" }, "Position"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400" }, selected.x), /* @__PURE__ */ React.createElement("div", { className: "flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400" }, selected.y))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-gray-500 mb-1 block" }, "Rotation"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400" }, selected.rotation, "\xB0"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => rotateComponent(selected.id),
      className: "px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs text-white transition-colors"
    },
    "Rotate"
  ))), editableProps.map((prop) => /* @__PURE__ */ React.createElement("div", { key: prop.key }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-gray-500 mb-1 block" }, prop.label), prop.type === "number" && /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: selected.props[prop.key] ?? prop.default,
      onChange: (e) => setComponentProperty(selected.id, prop.key, parseFloat(e.target.value) || 0),
      className: "w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
    }
  ), prop.type === "text" && /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: selected.props[prop.key] ?? "",
      onChange: (e) => setComponentProperty(selected.id, prop.key, e.target.value),
      className: "w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
    }
  ), prop.type === "color" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "color",
      value: selected.props[prop.key] ?? "#ff3b30",
      onChange: (e) => setComponentProperty(selected.id, prop.key, e.target.value),
      className: "w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400" }, selected.props[prop.key])), prop.type === "slider" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: prop.min ?? 0,
      max: prop.max ?? 1,
      step: prop.step ?? 0.01,
      value: selected.props[prop.key] ?? prop.default,
      onChange: (e) => setComponentProperty(selected.id, prop.key, parseFloat(e.target.value)),
      className: "flex-1 accent-blue-500"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400 w-12 text-right" }, prop.format ? prop.format(selected.props[prop.key] ?? prop.default) : Math.round((selected.props[prop.key] ?? prop.default) * 100))), prop.type === "toggle" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setComponentProperty(selected.id, prop.key, !selected.props[prop.key]),
      className: `px-3 py-1.5 rounded text-sm transition-colors ${selected.props[prop.key] ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400"}`
    },
    selected.props[prop.key] ? "Pressed" : "Released"
  )))));
}
function InspectorPanel() {
  const components = useProjectStore((s) => s.components);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const simState = useSimulationStore((s) => s.state);
  const selected = components.find((c) => c.id === selectedIds[0]);
  if (!selected || !simState) {
    return /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-400 mb-3" }, /* @__PURE__ */ React.createElement(Activity, { size: 15 }), " Inspector"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600" }, "Run simulation to inspect live values"));
  }
  const compState = simState.components[selected.id];
  return /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-300 mb-3" }, /* @__PURE__ */ React.createElement(Activity, { size: 15 }), " Inspector"), compState && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5" }, Object.entries(compState.pins).map(([pinId, state]) => {
    const def = COMPONENT_MAP[selected.type]?.pins.find((p) => p.id === pinId);
    return /* @__PURE__ */ React.createElement("div", { key: pinId, className: "flex items-center justify-between text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, def?.label || def?.name || pinId), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-1.5 py-0.5 rounded font-mono ${state.digital === "HIGH" ? "bg-yellow-500/20 text-yellow-300" : state.digital === "LOW" ? "bg-gray-500/20 text-gray-400" : "bg-gray-700/20 text-gray-500"}` }, state.digital), state.voltage > 0 && /* @__PURE__ */ React.createElement("span", { className: "text-gray-500 font-mono" }, state.voltage.toFixed(1), "V")));
  })));
}
function SimulationPanel() {
  const running = useSimulationStore((s) => s.running);
  const paused = useSimulationStore((s) => s.paused);
  const simState = useSimulationStore((s) => s.state);
  const components = useProjectStore((s) => s.components);
  const connections = useProjectStore((s) => s.connections);
  const [issues, setIssues] = useState([]);
  useEffect(() => {
    setIssues(detectIssues(components, connections, simState));
  }, [components, connections, simState]);
  return /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-300 mb-3" }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 15 }), " Debug"), issues.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-emerald-400" }, /* @__PURE__ */ React.createElement(Info, { size: 12 }), " No issues detected") : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, issues.map((issue, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300" }, issue))), running && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-gray-400 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse" }), paused ? "Paused" : "Running"), simState && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-500" }, "Time: ", (simState.time / 1e3).toFixed(1), "s")));
}
function getEditableProps(type) {
  const props = [];
  switch (type) {
    case "resistor":
      props.push({ key: "resistance", label: "Resistance (\u03A9)", type: "number", default: 220 });
      break;
    case "capacitor":
      props.push({ key: "capacitance", label: "Capacitance (\xB5F)", type: "number", default: 10 });
      break;
    case "led":
      props.push({ key: "color", label: "Color", type: "color", default: "#ff3b30" });
      break;
    case "push-button":
      props.push({ key: "pressed", label: "State", type: "toggle", default: false });
      break;
    case "switch":
      props.push({ key: "closed", label: "State", type: "toggle", default: false });
      break;
    case "potentiometer":
      props.push({ key: "value", label: "Position", type: "slider", default: 0.5, min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` });
      break;
    case "battery":
      props.push({ key: "voltage", label: "Voltage (V)", type: "number", default: 9 });
      break;
    case "temp-sensor":
      props.push({ key: "temperature", label: "Temperature (\xB0C)", type: "number", default: 25 });
      break;
    case "light-sensor":
      props.push({ key: "light", label: "Light Level", type: "slider", default: 0.5, min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` });
      break;
    case "ultrasonic-sensor":
      props.push({ key: "distance", label: "Distance (cm)", type: "number", default: 100 });
      break;
    case "pir-sensor":
      props.push({ key: "motion", label: "Motion Detected", type: "toggle", default: false });
      break;
    case "ir-sensor":
      props.push({ key: "detected", label: "Object Detected", type: "toggle", default: false });
      break;
    case "lcd-16x2":
      props.push({ key: "text", label: "Display Text", type: "text", default: "Hello, World!" });
      break;
    case "oled":
      props.push({ key: "text", label: "Display Text", type: "text", default: "Nextel AI" });
      break;
    case "seven-segment":
      props.push({ key: "value", label: "Digit (0-9)", type: "slider", default: 0, min: 0, max: 9, step: 1, format: (v) => String(Math.round(v)) });
      break;
  }
  props.push({ key: "label", label: "Label", type: "text", default: "" });
  return props;
}
function detectIssues(components, connections, simState) {
  const issues = [];
  const hasArduino = components.some((c) => c.type.startsWith("arduino"));
  const hasGnd = components.some((c) => c.type === "gnd" || c.type === "power-5v" || c.type === "power-3v3");
  if (!hasArduino && components.length > 0) {
    issues.push("No microcontroller in the circuit. Add an Arduino to control components.");
  }
  if (!hasGnd && hasArduino) {
    issues.push("No ground (GND) reference. The circuit needs a GND connection.");
  }
  const leds = components.filter((c) => c.type === "led");
  for (const led of leds) {
    const hasResistor = connections.some((conn) => {
      const otherId = conn.fromComponent === led.id ? conn.toComponent : conn.fromComponent;
      const otherComp = components.find((c) => c.id === otherId);
      return otherComp?.type === "resistor";
    });
    if (!hasResistor && hasArduino) {
      issues.push("LED connected without a current-limiting resistor. Add a 220\u03A9 resistor in series to protect the LED.");
    }
  }
  if (simState?.errors?.length > 0) {
    simState.errors.forEach((e) => issues.push(`Simulation error: ${e}`));
  }
  return issues;
}
export {
  RightSidebar
};

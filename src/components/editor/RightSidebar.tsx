import { useProjectStore } from '@/store/projectStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_MAP } from '@/components/library';
import { Sliders, Activity, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchVersions } from '@/services/persistence';
import type { ProjectVersion } from '@/types';

export function RightSidebar() {
  const open = useUIStore((s) => s.rightSidebarOpen);
  if (!open) return null;

  return (
    <div className="w-72 bg-[#1a1a1e] border-l border-white/5 flex flex-col h-full overflow-y-auto">
      <PropertiesPanel />
      <InspectorPanel />
      <SimulationPanel />
    </div>
  );
}

import { useUIStore } from '@/store/uiStore';

function PropertiesPanel() {
  const components = useProjectStore((s) => s.components);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const setComponentProperty = useProjectStore((s) => s.setComponentProperty);
  const rotateComponent = useProjectStore((s) => s.rotateComponent);

  const selected = components.find((c) => c.id === selectedIds[0]);

  if (!selected) {
    return (
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
          <Sliders size={15} /> Properties
        </div>
        <p className="text-xs text-gray-600">Select a component to edit its properties</p>
      </div>
    );
  }

  const def = COMPONENT_MAP[selected.type];
  const editableProps = getEditableProps(selected.type);

  return (
    <div className="p-4 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Sliders size={15} /> Properties
        </div>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{def?.label}</span>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Position</label>
          <div className="flex gap-2">
            <div className="flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400">{selected.x}</div>
            <div className="flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400">{selected.y}</div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Rotation</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-2 py-1.5 bg-white/5 rounded text-xs text-gray-400">{selected.rotation}°</div>
            <button
              onClick={() => rotateComponent(selected.id)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs text-white transition-colors"
            >
              Rotate
            </button>
          </div>
        </div>

        {editableProps.map((prop) => (
          <div key={prop.key}>
            <label className="text-xs text-gray-500 mb-1 block">{prop.label}</label>
            {prop.type === 'number' && (
              <input
                type="number"
                value={selected.props[prop.key] ?? prop.default}
                onChange={(e) => setComponentProperty(selected.id, prop.key, parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
              />
            )}
            {prop.type === 'text' && (
              <input
                type="text"
                value={selected.props[prop.key] ?? ''}
                onChange={(e) => setComponentProperty(selected.id, prop.key, e.target.value)}
                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
              />
            )}
            {prop.type === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selected.props[prop.key] ?? '#ff3b30'}
                  onChange={(e) => setComponentProperty(selected.id, prop.key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs text-gray-400">{selected.props[prop.key]}</span>
              </div>
            )}
            {prop.type === 'slider' && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={prop.min ?? 0}
                  max={prop.max ?? 1}
                  step={prop.step ?? 0.01}
                  value={selected.props[prop.key] ?? prop.default}
                  onChange={(e) => setComponentProperty(selected.id, prop.key, parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-gray-400 w-12 text-right">
                  {prop.format ? prop.format(selected.props[prop.key] ?? prop.default) : Math.round((selected.props[prop.key] ?? prop.default) * 100)}
                </span>
              </div>
            )}
            {prop.type === 'toggle' && (
              <button
                onClick={() => setComponentProperty(selected.id, prop.key, !selected.props[prop.key])}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selected.props[prop.key] ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
                }`}
              >
                {selected.props[prop.key] ? 'Pressed' : 'Released'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectorPanel() {
  const components = useProjectStore((s) => s.components);
  const connections = useProjectStore((s) => s.connections);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const simState = useSimulationStore((s) => s.state);

  const selected = components.find((c) => c.id === selectedIds[0]);

  if (!selected || !simState) {
    return (
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
          <Activity size={15} /> Inspector
        </div>
        <p className="text-xs text-gray-600">Run simulation to inspect live values</p>
      </div>
    );
  }

  const compState = simState.components[selected.id];

  return (
    <div className="p-4 border-b border-white/5">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
        <Activity size={15} /> Inspector
      </div>
      {compState && (
        <div className="flex flex-col gap-1.5">
          {Object.entries(compState.pins).map(([pinId, state]) => {
            const def = COMPONENT_MAP[selected.type]?.pins.find((p) => p.id === pinId);
            return (
              <div key={pinId} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{def?.label || def?.name || pinId}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded font-mono ${
                    state.digital === 'HIGH' ? 'bg-yellow-500/20 text-yellow-300' :
                    state.digital === 'LOW' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-gray-700/20 text-gray-500'
                  }`}>
                    {state.digital}
                  </span>
                  {state.voltage > 0 && (
                    <span className="text-gray-500 font-mono">{state.voltage.toFixed(1)}V</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SimulationPanel() {
  const running = useSimulationStore((s) => s.running);
  const paused = useSimulationStore((s) => s.paused);
  const simState = useSimulationStore((s) => s.state);
  const components = useProjectStore((s) => s.components);
  const connections = useProjectStore((s) => s.connections);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    setIssues(detectIssues(components, connections, simState));
  }, [components, connections, simState]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
        <AlertCircle size={15} /> Debug
      </div>

      {issues.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <Info size={12} /> No issues detected
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {issues.map((issue, i) => (
            <div key={i} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
              {issue}
            </div>
          ))}
        </div>
      )}

      {running && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {paused ? 'Paused' : 'Running'}
          </div>
          {simState && (
            <div className="text-xs text-gray-500">
              Time: {(simState.time / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getEditableProps(type: string) {
  const props: { key: string; label: string; type: string; default?: any; min?: number; max?: number; step?: number; format?: (v: number) => string }[] = [];

  switch (type) {
    case 'resistor':
      props.push({ key: 'resistance', label: 'Resistance (Ω)', type: 'number', default: 220 });
      break;
    case 'capacitor':
      props.push({ key: 'capacitance', label: 'Capacitance (µF)', type: 'number', default: 10 });
      break;
    case 'led':
      props.push({ key: 'color', label: 'Color', type: 'color', default: '#ff3b30' });
      break;
    case 'push-button':
      props.push({ key: 'pressed', label: 'State', type: 'toggle', default: false });
      break;
    case 'switch':
      props.push({ key: 'closed', label: 'State', type: 'toggle', default: false });
      break;
    case 'potentiometer':
      props.push({ key: 'value', label: 'Position', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` });
      break;
    case 'battery':
      props.push({ key: 'voltage', label: 'Voltage (V)', type: 'number', default: 9 });
      break;
    case 'temp-sensor':
      props.push({ key: 'temperature', label: 'Temperature (°C)', type: 'number', default: 25 });
      break;
    case 'light-sensor':
      props.push({ key: 'light', label: 'Light Level', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` });
      break;
    case 'ultrasonic-sensor':
      props.push({ key: 'distance', label: 'Distance (cm)', type: 'number', default: 100 });
      break;
    case 'pir-sensor':
      props.push({ key: 'motion', label: 'Motion Detected', type: 'toggle', default: false });
      break;
    case 'ir-sensor':
      props.push({ key: 'detected', label: 'Object Detected', type: 'toggle', default: false });
      break;
    case 'lcd-16x2':
      props.push({ key: 'text', label: 'Display Text', type: 'text', default: 'Hello, World!' });
      break;
    case 'oled':
      props.push({ key: 'text', label: 'Display Text', type: 'text', default: 'Nextel AI' });
      break;
    case 'seven-segment':
      props.push({ key: 'value', label: 'Digit (0-9)', type: 'slider', default: 0, min: 0, max: 9, step: 1, format: (v) => String(Math.round(v)) });
      break;
  }

  props.push({ key: 'label', label: 'Label', type: 'text', default: '' });
  return props;
}

function detectIssues(components: any[], connections: any[], simState: any): string[] {
  const issues: string[] = [];

  const hasArduino = components.some((c) => c.type.startsWith('arduino'));
  const hasGnd = components.some((c) => c.type === 'gnd' || c.type === 'power-5v' || c.type === 'power-3v3');

  if (!hasArduino && components.length > 0) {
    issues.push('No microcontroller in the circuit. Add an Arduino to control components.');
  }

  if (!hasGnd && hasArduino) {
    issues.push('No ground (GND) reference. The circuit needs a GND connection.');
  }

  const leds = components.filter((c) => c.type === 'led');
  for (const led of leds) {
    const hasResistor = connections.some((conn) => {
      const otherId = conn.fromComponent === led.id ? conn.toComponent : conn.fromComponent;
      const otherComp = components.find((c) => c.id === otherId);
      return otherComp?.type === 'resistor';
    });
    if (!hasResistor && hasArduino) {
      issues.push('LED connected without a current-limiting resistor. Add a 220Ω resistor in series to protect the LED.');
    }
  }

  if (simState?.errors?.length > 0) {
    simState.errors.forEach((e: string) => issues.push(`Simulation error: ${e}`));
  }

  return issues;
}

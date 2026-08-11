import type { PlacedComponent, SimulationComponentState } from '@/types';
import { COMPONENT_MAP } from './library';

interface RenderProps {
  component: PlacedComponent;
  simState?: SimulationComponentState;
  selected?: boolean;
  hoveredPin?: string | null;
  onPinClick?: (pinId: string, e: React.MouseEvent) => void;
  onComponentClick?: (e: React.MouseEvent) => void;
  showPinLabels?: boolean;
}

export function getPinWorldPosition(component: PlacedComponent, pinId: string): { x: number; y: number } {
  const def = COMPONENT_MAP[component.type];
  if (!def) return { x: component.x, y: component.y };
  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: component.x, y: component.y };

  const cx = def.width / 2;
  const cy = def.height / 2;
  const rad = (component.rotation * Math.PI) / 180;
  const dx = pin.x - cx;
  const dy = pin.y - cy;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return { x: component.x + rx, y: component.y + ry };
}

export function ComponentRenderer({ component, simState, selected, hoveredPin, onPinClick, onComponentClick, showPinLabels }: RenderProps) {
  const def = COMPONENT_MAP[component.type];
  if (!def) return null;

  const cx = def.width / 2;
  const cy = def.height / 2;

  return (
    <g
      transform={`translate(${component.x - cx}, ${component.y - cy}) rotate(${component.rotation}, ${cx}, ${cy})`}
      onClick={onComponentClick}
      className="cursor-pointer"
    >
      <rect
        x={-4}
        y={-4}
        width={def.width + 8}
        height={def.height + 8}
        fill="none"
        stroke={selected ? '#0a84ff' : 'transparent'}
        strokeWidth={2}
        rx={8}
        className="transition-all"
      />
      <ComponentSVG type={component.type} component={component} simState={simState} />
      {def.pins.map((pin) => {
        const pinState = simState?.pins[pin.id];
        const isHigh = pinState?.digital === 'HIGH';
        const isHovered = hoveredPin === pin.id;
        return (
          <g key={pin.id}>
            <circle
              cx={pin.x}
              cy={pin.y}
              r={isHovered ? 6 : 4}
              fill={isHigh ? '#ffd60a' : '#86868b'}
              stroke={isHovered ? '#0a84ff' : '#48484a'}
              strokeWidth={isHovered ? 2 : 1}
              className="transition-all cursor-crosshair"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(pin.id, e);
              }}
            />
            {showPinLabels && (
              <text
                x={pin.x}
                y={pin.y - 8}
                textAnchor="middle"
                className="fill-gray-500 text-[8px] pointer-events-none"
                style={{ fontSize: '8px' }}
              >
                {pin.label || pin.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function ComponentSVG({ type, component, simState }: { type: string; component: PlacedComponent; simState?: SimulationComponentState }) {
  switch (type) {
    case 'arduino-uno':
      return <ArduinoUnoSVG simState={simState} />;
    case 'arduino-nano':
      return <ArduinoNanoSVG simState={simState} />;
    case 'raspberry-pi-pico':
      return <PicoSVG simState={simState} />;
    case 'esp32':
      return <Esp32SVG simState={simState} />;
    case 'resistor':
      return <ResistorSVG component={component} />;
    case 'capacitor':
      return <CapacitorSVG />;
    case 'led':
      return <LedSVG component={component} simState={simState} />;
    case 'rgb-led':
      return <RgbLedSVG simState={simState} />;
    case 'diode':
      return <DiodeSVG />;
    case 'push-button':
      return <PushButtonSVG component={component} />;
    case 'switch':
      return <SwitchSVG component={component} />;
    case 'potentiometer':
      return <PotentiometerSVG component={component} />;
    case 'buzzer':
      return <BuzzerSVG simState={simState} />;
    case 'dc-motor':
      return <DcMotorSVG simState={simState} />;
    case 'servo':
      return <ServoSVG simState={simState} />;
    case 'relay':
      return <RelaySVG simState={simState} />;
    case 'lcd-16x2':
      return <LcdSVG component={component} />;
    case 'oled':
      return <OledSVG component={component} />;
    case 'seven-segment':
      return <SevenSegmentSVG simState={simState} />;
    case 'led-matrix':
      return <LedMatrixSVG simState={simState} />;
    case 'temp-sensor':
      return <TempSensorSVG component={component} />;
    case 'light-sensor':
      return <LightSensorSVG component={component} />;
    case 'ultrasonic-sensor':
      return <UltrasonicSVG component={component} />;
    case 'pir-sensor':
      return <PirSVG component={component} />;
    case 'ir-sensor':
      return <IrSVG component={component} />;
    case 'battery':
      return <BatterySVG component={component} />;
    case 'power-5v':
      return <PowerSVG component={component} color="#ff453a" />;
    case 'power-3v3':
      return <PowerSVG component={component} color="#ff9f0a" />;
    case 'gnd':
      return <GndSVG />;
    case 'and-gate':
      return <GateSVG label="AND" simState={simState} />;
    case 'or-gate':
      return <GateSVG label="OR" simState={simState} />;
    case 'not-gate':
      return <NotGateSVG simState={simState} />;
    case 'nand-gate':
      return <GateSVG label="NAND" simState={simState} />;
    case 'nor-gate':
      return <GateSVG label="NOR" simState={simState} />;
    case 'xor-gate':
      return <GateSVG label="XOR" simState={simState} />;
    case 'breadboard':
      return <BreadboardSVG />;
    default:
      return <DefaultSVG label={component.props.label || type} />;
  }
}

function ArduinoUnoSVG({ simState }: { simState?: SimulationComponentState }) {
  return (
    <g>
      <rect x={0} y={0} width={360} height={200} rx={8} fill="#2d7a4a" stroke="#1a5c33" strokeWidth={1.5} />
      <rect x={8} y={8} width={344} height={184} rx={4} fill="#236b3d" stroke="#1a5c33" strokeWidth={1} />
      {/* USB */}
      <rect x={320} y={60} width={50} height={36} rx={3} fill="#c0c0c0" stroke="#888" strokeWidth={1} />
      <rect x={328} y={66} width={34} height={24} rx={1} fill="#888" />
      {/* Power jack */}
      <rect x={320} y={110} width={45} height={30} rx={3} fill="#1a1a1a" stroke="#333" strokeWidth={1} />
      <circle cx={342} cy={125} r={8} fill="#333" />
      {/* MCU chip */}
      <rect x={140} y={70} width={60} height={60} rx={2} fill="#1a1a1a" stroke="#000" strokeWidth={1} />
      <circle cx={150} cy={80} r={2} fill="#444" />
      <text x={170} y={105} textAnchor="middle" fill="#666" style={{ fontSize: '7px' }}>ATmega328P</text>
      {/* Reset button */}
      <circle cx={310} cy={170} r={8} fill="#333" stroke="#555" strokeWidth={1} />
      <circle cx={310} cy={170} r={4} fill="#666" />
      {/* Headers */}
      <rect x={28} y={-4} width={304} height={8} fill="#c0c0c0" rx={1} />
      <rect x={28} y={196} width={304} height={8} fill="#c0c0c0" rx={1} />
      {/* Pin labels */}
      {simState && (
        <text x={170} y={40} textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold' }}>ARDUINO UNO</text>
      )}
      {!simState && (
        <text x={170} y={40} textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold' }}>ARDUINO UNO</text>
      )}
      {/* LED indicators */}
      <circle cx={290} cy={170} r={3} fill="#30d158" />
      <circle cx={278} cy={170} r={3} fill="#ff9f0a" />
      {/* Pin 13 LED */}
      {(() => {
        const pin13 = simState?.pins['d13'];
        const on = pin13?.digital === 'HIGH';
        return <circle cx={266} cy={170} r={3} fill={on ? '#ffd60a' : '#3a3a3c'} className="transition-all" />;
      })()}
    </g>
  );
}

function ArduinoNanoSVG({ simState }: { simState?: SimulationComponentState }) {
  return (
    <g>
      <rect x={0} y={0} width={160} height={240} rx={6} fill="#2d7a4a" stroke="#1a5c33" strokeWidth={1.5} />
      <rect x={6} y={6} width={148} height={228} rx={3} fill="#236b3d" />
      <rect x={60} y={0} width={40} height={20} fill="#c0c0c0" rx={2} />
      <rect x={64} y={4} width={32} height={12} fill="#888" />
      <rect x={50} y={100} width={60} height={40} rx={2} fill="#1a1a1a" />
      <text x={80} y={125} textAnchor="middle" fill="#666" style={{ fontSize: '6px' }}>ATmega328P</text>
      <text x={80} y={30} textAnchor="middle" fill="#fff" style={{ fontSize: '6px', fontWeight: 'bold' }}>NANO</text>
    </g>
  );
}

function PicoSVG({ simState }: { simState?: SimulationComponentState }) {
  return (
    <g>
      <rect x={0} y={0} width={160} height={200} rx={6} fill="#1d6fb8" stroke="#0d4a87" strokeWidth={1.5} />
      <rect x={6} y={6} width={148} height={188} rx={3} fill="#155a96" />
      <rect x={60} y={0} width={40} height={16} fill="#c0c0c0" rx={2} />
      <rect x={50} y={80} width={60} height={40} rx={2} fill="#1a1a1a" />
      <text x={80} y={105} textAnchor="middle" fill="#666" style={{ fontSize: '6px' }}>RP2040</text>
      <text x={80} y={50} textAnchor="middle" fill="#fff" style={{ fontSize: '6px', fontWeight: 'bold' }}>PICO</text>
    </g>
  );
}

function Esp32SVG({ simState }: { simState?: SimulationComponentState }) {
  return (
    <g>
      <rect x={0} y={0} width={180} height={260} rx={6} fill="#1a1a1a" stroke="#333" strokeWidth={1.5} />
      <rect x={6} y={6} width={168} height={248} rx={3} fill="#0d0d0d" />
      <rect x={50} y={100} width={80} height={60} rx={2} fill="#333" stroke="#555" />
      <text x={90} y={135} textAnchor="middle" fill="#888" style={{ fontSize: '6px' }}>ESP32-WROOM</text>
      <text x={90} y={50} textAnchor="middle" fill="#fff" style={{ fontSize: '6px', fontWeight: 'bold' }}>ESP32</text>
    </g>
  );
}

function ResistorSVG({ component }: { component: PlacedComponent }) {
  const r = component.props.resistance || 220;
  return (
    <g>
      <line x1={0} y1={20} x2={20} y2={20} stroke="#86868b" strokeWidth={2} />
      <line x1={80} y1={20} x2={100} y2={20} stroke="#86868b" strokeWidth={2} />
      <rect x={20} y={10} width={60} height={20} rx={3} fill="#d4a574" stroke="#a07c4a" strokeWidth={1} />
      <rect x={30} y={10} width={4} height={20} fill="#8b4513" />
      <rect x={40} y={10} width={4} height={20} fill="#1a1a1a" />
      <rect x={50} y={10} width={4} height={20} fill="#ff4500" />
      <rect x={60} y={10} width={4} height={20} fill="#ffd700" />
      <text x={50} y={5} textAnchor="middle" fill="#86868b" style={{ fontSize: '8px' }}>{component.props.label || `${r}Ω`}</text>
    </g>
  );
}

function CapacitorSVG() {
  return (
    <g>
      <line x1={0} y1={25} x2={30} y2={25} stroke="#86868b" strokeWidth={2} />
      <line x1={50} y1={25} x2={80} y2={25} stroke="#86868b" strokeWidth={2} />
      <line x1={30} y1={10} x2={30} y2={40} stroke="#86868b" strokeWidth={3} />
      <line x1={50} y1={10} x2={50} y2={40} stroke="#86868b" strokeWidth={3} />
      <text x={40} y={5} textAnchor="middle" fill="#86868b" style={{ fontSize: '8px' }}>10µF</text>
    </g>
  );
}

function LedSVG({ component, simState }: { component: PlacedComponent; simState?: SimulationComponentState }) {
  const color = component.props.color || '#ff3b30';
  const anodeState = simState?.pins['a'];
  const cathodeState = simState?.pins['c'];
  const lit = anodeState?.digital === 'HIGH' && cathodeState?.digital === 'LOW';
  const glow = lit ? 1 : 0;
  return (
    <g>
      <line x1={0} y1={25} x2={15} y2={25} stroke="#86868b" strokeWidth={2} />
      <line x1={45} y1={25} x2={60} y2={25} stroke="#86868b" strokeWidth={2} />
      <circle cx={30} cy={25} r={15} fill={lit ? color : '#2a2a2e'} stroke={color} strokeWidth={2} opacity={lit ? 1 : 0.4} className="transition-all" />
      {lit && <circle cx={30} cy={25} r={22} fill={color} opacity={0.15 * glow} className="transition-all" />}
      <polygon points="22,18 27,25 22,32" fill="#86868b" />
      <line x1={25} y1={18} x2={35} y2={32} stroke="#86868b" strokeWidth={1} />
    </g>
  );
}

function RgbLedSVG({ simState }: { simState?: SimulationComponentState }) {
  const r = simState?.pins['r']?.digital === 'HIGH';
  const g = simState?.pins['g']?.digital === 'HIGH';
  const b = simState?.pins['b']?.digital === 'HIGH';
  const fillColor = `rgb(${r ? 255 : 0}, ${g ? 255 : 0}, ${b ? 255 : 0})`;
  const lit = r || g || b;
  return (
    <g>
      <circle cx={30} cy={30} r={18} fill={lit ? fillColor : '#2a2a2e'} stroke="#86868b" strokeWidth={2} opacity={lit ? 1 : 0.4} className="transition-all" />
      {lit && <circle cx={30} cy={30} r={26} fill={fillColor} opacity={0.15} className="transition-all" />}
    </g>
  );
}

function DiodeSVG() {
  return (
    <g>
      <line x1={0} y1={20} x2={25} y2={20} stroke="#86868b" strokeWidth={2} />
      <line x1={55} y1={20} x2={80} y2={20} stroke="#86868b" strokeWidth={2} />
      <polygon points="25,10 25,30 55,20" fill="#86868b" stroke="#666" strokeWidth={1} />
      <line x1={55} y1={10} x2={55} y2={30} stroke="#86868b" strokeWidth={2} />
    </g>
  );
}

function PushButtonSVG({ component }: { component: PlacedComponent }) {
  const pressed = component.props.pressed;
  return (
    <g>
      <line x1={0} y1={20} x2={15} y2={20} stroke="#86868b" strokeWidth={2} />
      <line x1={45} y1={20} x2={60} y2={20} stroke="#86868b" strokeWidth={2} />
      <line x1={0} y1={40} x2={15} y2={40} stroke="#86868b" strokeWidth={2} />
      <line x1={45} y1={40} x2={60} y2={40} stroke="#86868b" strokeWidth={2} />
      <circle cx={30} cy={30} r={14} fill={pressed ? '#0a84ff' : '#3a3a3c'} stroke="#86868b" strokeWidth={2} className="transition-all" />
      <circle cx={30} cy={30} r={pressed ? 8 : 6} fill={pressed ? '#409cff' : '#555'} className="transition-all" />
    </g>
  );
}

function SwitchSVG({ component }: { component: PlacedComponent }) {
  const closed = component.props.closed;
  return (
    <g>
      <line x1={0} y1={25} x2={15} y2={25} stroke="#86868b" strokeWidth={2} />
      <line x1={55} y1={25} x2={70} y2={25} stroke="#86868b" strokeWidth={2} />
      <circle cx={15} cy={25} r={3} fill="#86868b" />
      <circle cx={55} cy={25} r={3} fill="#86868b" />
      <line
        x1={15}
        y1={25}
        x2={closed ? 55 : 50}
        y2={closed ? 25 : 10}
        stroke={closed ? '#30d158' : '#86868b'}
        strokeWidth={2}
        className="transition-all"
      />
    </g>
  );
}

function PotentiometerSVG({ component }: { component: PlacedComponent }) {
  const val = component.props.value ?? 0.5;
  const angle = -135 + val * 270;
  return (
    <g>
      <circle cx={40} cy={30} r={22} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={40} cy={30} r={16} fill="#2a2a2e" />
      <line
        x1={40}
        y1={30}
        x2={40 + 14 * Math.cos((angle * Math.PI) / 180)}
        y2={30 + 14 * Math.sin((angle * Math.PI) / 180)}
        stroke="#0a84ff"
        strokeWidth={2}
        className="transition-all"
      />
      <text x={40} y={5} textAnchor="middle" fill="#86868b" style={{ fontSize: '7px' }}>{Math.round(val * 100)}%</text>
    </g>
  );
}

function BuzzerSVG({ simState }: { simState?: SimulationComponentState }) {
  const active = simState?.pins['+']?.digital === 'HIGH';
  return (
    <g>
      <circle cx={30} cy={30} r={22} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={30} cy={30} r={16} fill="#2a2a2e" />
      <circle cx={30} cy={30} r={8} fill={active ? '#0a84ff' : '#555'} className="transition-all" />
      {active && (
        <>
          <circle cx={30} cy={30} r={28} fill="none" stroke="#0a84ff" strokeWidth={1} opacity={0.5} />
          <circle cx={30} cy={30} r={34} fill="none" stroke="#0a84ff" strokeWidth={1} opacity={0.3} />
        </>
      )}
    </g>
  );
}

function DcMotorSVG({ simState }: { simState?: SimulationComponentState }) {
  const active = simState?.pins['+']?.digital === 'HIGH';
  const angle = simState?.visual?.angle || 0;
  return (
    <g>
      <circle cx={40} cy={30} r={24} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={40} cy={30} r={18} fill="#2a2a2e" />
      <g transform={`rotate(${angle}, 40, 30)`} className="transition-all">
        <line x1={40} y1={14} x2={40} y2={46} stroke={active ? '#0a84ff' : '#666'} strokeWidth={3} />
        <line x1={24} y1={30} x2={56} y2={30} stroke={active ? '#0a84ff' : '#666'} strokeWidth={3} />
      </g>
      <text x={40} y={5} textAnchor="middle" fill="#86868b" style={{ fontSize: '7px' }}>M</text>
    </g>
  );
}

function ServoSVG({ simState }: { simState?: SimulationComponentState }) {
  const angle = simState?.visual?.angle ?? 90;
  return (
    <g>
      <rect x={5} y={20} width={50} height={40} rx={3} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={30} cy={15} r={12} fill="#2a2a2e" stroke="#86868b" strokeWidth={2} />
      <g transform={`rotate(${angle - 90}, 30, 15)`}>
        <line x1={30} y1={15} x2={30} y2={3} stroke="#0a84ff" strokeWidth={3} />
        <circle cx={30} cy={15} r={3} fill="#0a84ff" />
      </g>
      <text x={30} y={70} textAnchor="middle" fill="#86868b" style={{ fontSize: '7px' }}>{Math.round(angle)}°</text>
    </g>
  );
}

function RelaySVG({ simState }: { simState?: SimulationComponentState }) {
  const active = simState?.pins['sig']?.digital === 'HIGH';
  return (
    <g>
      <rect x={5} y={5} width={70} height={60} rx={4} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <rect x={12} y={12} width={30} height={20} rx={2} fill="#2a2a2e" />
      <circle cx={55} cy={30} r={6} fill={active ? '#ffd60a' : '#555'} className="transition-all" />
      <line x1={55} y1={30} x2={active ? 70 : 65} y2={active ? 15 : 25} stroke="#86868b" strokeWidth={2} className="transition-all" />
    </g>
  );
}

function LcdSVG({ component }: { component: PlacedComponent }) {
  const text = component.props.text || 'Hello, World!';
  const line1 = text.split('\n')[0] || '';
  const line2 = text.split('\n')[1] || '';
  return (
    <g>
      <rect x={0} y={0} width={220} height={100} rx={6} fill="#1a6b3a" stroke="#0d4a26" strokeWidth={2} />
      <rect x={15} y={15} width={190} height={70} rx={2} fill="#a5e8b5" />
      <text x={20} y={40} fill="#1a3a1a" style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>{line1.slice(0, 16)}</text>
      <text x={20} y={65} fill="#1a3a1a" style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>{line2.slice(0, 16)}</text>
    </g>
  );
}

function OledSVG({ component }: { component: PlacedComponent }) {
  return (
    <g>
      <rect x={0} y={0} width={160} height={120} rx={4} fill="#1a1a1a" stroke="#333" strokeWidth={2} />
      <rect x={15} y={15} width={130} height={90} rx={2} fill="#0a0a0a" />
      <text x={80} y={60} textAnchor="middle" fill="#30d158" style={{ fontSize: '10px', fontFamily: 'monospace' }}>{component.props.text || 'Nextel AI'}</text>
    </g>
  );
}

function SevenSegmentSVG({ simState }: { simState?: SimulationComponentState }) {
  const segments = simState?.visual?.segments || [false, false, false, false, false, false, false];
  const segColors = segments.map((s: boolean) => s ? '#ff3b30' : '#3a0a08');
  return (
    <g>
      <rect x={0} y={0} width={80} height={120} rx={4} fill="#1a1a1a" stroke="#333" strokeWidth={2} />
      {/* a */}
      <polygon points={`20,15 60,15 55,20 25,20`} fill={segColors[0]} className="transition-all" />
      {/* b */}
      <polygon points={`62,17 62,57 57,52 57,22`} fill={segColors[1]} className="transition-all" />
      {/* c */}
      <polygon points={`62,63 62,103 57,98 57,68`} fill={segColors[2]} className="transition-all" />
      {/* d */}
      <polygon points={`20,105 60,105 55,100 25,100`} fill={segColors[3]} className="transition-all" />
      {/* e */}
      <polygon points={`18,63 18,103 23,98 23,68`} fill={segColors[4]} className="transition-all" />
      {/* f */}
      <polygon points={`18,17 18,57 23,52 23,22`} fill={segColors[5]} className="transition-all" />
      {/* g */}
      <polygon points={`20,60 60,60 55,55 25,55 25,65 55,65`} fill={segColors[6]} className="transition-all" />
    </g>
  );
}

function LedMatrixSVG({ simState }: { simState?: SimulationComponentState }) {
  const grid = simState?.visual?.grid || Array(8).fill(null).map(() => Array(8).fill(false));
  return (
    <g>
      <rect x={0} y={0} width={120} height={120} rx={4} fill="#1a1a1a" stroke="#333" strokeWidth={2} />
      {grid.map((row: boolean[], i: number) =>
        row.map((on: boolean, j: number) => (
          <circle
            key={`${i}-${j}`}
            cx={15 + j * 13}
            cy={15 + i * 13}
            r={4}
            fill={on ? '#30d158' : '#1a3a1a'}
            className="transition-all"
          />
        ))
      )}
    </g>
  );
}

function TempSensorSVG({ component }: { component: PlacedComponent }) {
  return (
    <g>
      <rect x={15} y={10} width={40} height={50} rx={3} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <rect x={25} y={50} width={20} height={15} fill="#86868b" />
      <text x={35} y={40} textAnchor="middle" fill="#fff" style={{ fontSize: '8px', fontWeight: 'bold' }}>{component.props.temperature || 25}°</text>
    </g>
  );
}

function LightSensorSVG({ component }: { component: PlacedComponent }) {
  const light = component.props.light ?? 0.5;
  return (
    <g>
      <rect x={15} y={10} width={40} height={50} rx={3} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={35} cy={30} r={12} fill={`rgb(${Math.round(light * 255)}, ${Math.round(light * 255)}, 0)`} stroke="#86868b" strokeWidth={1} className="transition-all" />
      <text x={35} y={5} textAnchor="middle" fill="#86868b" style={{ fontSize: '7px' }}>LDR</text>
    </g>
  );
}

function UltrasonicSVG({ component }: { component: PlacedComponent }) {
  return (
    <g>
      <rect x={0} y={0} width={120} height={80} rx={6} fill="#1a5c9e" stroke="#0d3d6b" strokeWidth={2} />
      <circle cx={25} cy={40} r={15} fill="#0d3d6b" stroke="#fff" strokeWidth={1} />
      <circle cx={25} cy={40} r={8} fill="#1a5c9e" />
      <circle cx={95} cy={40} r={15} fill="#0d3d6b" stroke="#fff" strokeWidth={1} />
      <circle cx={95} cy={40} r={8} fill="#1a5c9e" />
      <text x={60} y={15} textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold' }}>HC-SR04</text>
      <text x={60} y={70} textAnchor="middle" fill="#fff" style={{ fontSize: '7px' }}>{component.props.distance || 0}cm</text>
    </g>
  );
}

function PirSVG({ component }: { component: PlacedComponent }) {
  const motion = component.props.motion;
  return (
    <g>
      <rect x={5} y={5} width={60} height={60} rx={6} fill="#fff" stroke="#ccc" strokeWidth={2} />
      <circle cx={35} cy={35} r={18} fill={motion ? '#ff3b30' : '#3a3a3c'} stroke="#86868b" strokeWidth={2} className="transition-all" />
      <circle cx={35} cy={35} r={10} fill={motion ? '#ff6b6b' : '#555'} className="transition-all" />
    </g>
  );
}

function IrSVG({ component }: { component: PlacedComponent }) {
  const detected = component.props.detected;
  return (
    <g>
      <rect x={5} y={5} width={60} height={60} rx={4} fill="#1a5c9e" stroke="#0d3d6b" strokeWidth={2} />
      <circle cx={35} cy={30} r={12} fill={detected ? '#ff3b30' : '#0d3d6b'} stroke="#fff" strokeWidth={1} className="transition-all" />
      <rect x={15} y={50} width={40} height={10} rx={2} fill="#0d3d6b" />
    </g>
  );
}

function BatterySVG({ component }: { component: PlacedComponent }) {
  return (
    <g>
      <rect x={5} y={10} width={60} height={40} rx={4} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <rect x={65} y={20} width={10} height={20} rx={2} fill="#86868b" />
      <text x={35} y={35} textAnchor="middle" fill="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }}>{component.props.voltage || 9}V</text>
    </g>
  );
}

function PowerSVG({
  component,
  color,
}: {
  component: PlacedComponent;
  color: string;
}) {
  return (
    <g>
      <rect x={5} y={5} width={50} height={30} rx={4} fill={color} stroke="#fff" strokeWidth={1} opacity={0.9} />
      <text x={30} y={25} textAnchor="middle" fill="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }}>{component.props.label || '5V'}</text>
    </g>
  );
}

function GndSVG() {
  return (
    <g>
      <line x1={25} y1={0} x2={25} y2={15} stroke="#86868b" strokeWidth={2} />
      <line x1={10} y1={15} x2={40} y2={15} stroke="#86868b" strokeWidth={3} />
      <line x1={14} y1={22} x2={36} y2={22} stroke="#86868b" strokeWidth={2.5} />
      <line x1={18} y1={29} x2={32} y2={29} stroke="#86868b" strokeWidth={2} />
      <line x1={22} y1={36} x2={28} y2={36} stroke="#86868b" strokeWidth={1.5} />
    </g>
  );
}

function GateSVG({ label, simState }: { label: string; simState?: SimulationComponentState }) {
  const outState = simState?.pins['out']?.digital === 'HIGH';
  return (
    <g>
      <path d="M 10,5 L 40,5 Q 70,30 40,55 L 10,55 Z" fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={72} cy={30} r={3} fill={outState ? '#ffd60a' : '#555'} className="transition-all" />
      <text x={30} y={35} textAnchor="middle" fill="#fff" style={{ fontSize: '9px', fontWeight: 'bold' }}>{label}</text>
    </g>
  );
}

function NotGateSVG({ simState }: { simState?: SimulationComponentState }) {
  const outState = simState?.pins['out']?.digital === 'HIGH';
  return (
    <g>
      <polygon points="10,5 55,20 10,35" fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <circle cx={60} cy={20} r={3} fill={outState ? '#ffd60a' : '#555'} className="transition-all" />
      <text x={25} y={25} textAnchor="middle" fill="#fff" style={{ fontSize: '8px', fontWeight: 'bold' }}>!</text>
    </g>
  );
}

function BreadboardSVG() {
  const holes = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 25; c++) {
      holes.push(<circle key={`t-${r}-${c}`} cx={20 + c * 11} cy={20 + r * 8} r={1.5} fill="#888" />);
    }
  }
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 25; c++) {
      holes.push(<circle key={`b-${r}-${c}`} cx={20 + c * 11} cy={70 + r * 8} r={1.5} fill="#888" />);
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={300} height={120} rx={4} fill="#f5f5dc" stroke="#d4d4aa" strokeWidth={2} />
      <rect x={0} y={55} width={300} height={10} fill="#d4d4aa" />
      {holes}
    </g>
  );
}

function DefaultSVG({ label }: { label: string }) {
  return (
    <g>
      <rect x={0} y={0} width={80} height={40} rx={4} fill="#3a3a3c" stroke="#86868b" strokeWidth={2} />
      <text x={40} y={25} textAnchor="middle" fill="#fff" style={{ fontSize: '9px' }}>{label}</text>
    </g>
  );
}

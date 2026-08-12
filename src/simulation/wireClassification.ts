import type { Connection, Pin, PlacedComponent } from '@/types';
import { COMPONENT_MAP } from '@/components/library';

export type WireElectricalType = 'power' | 'ground' | 'digital' | 'pwm' | 'analog' | 'serial-tx' | 'serial-rx' | 'unknown';

export interface WireClassification {
  type: WireElectricalType;
  label: string;
  color: string;
  net: string;
  fromName: string;
  toName: string;
}

const classifications: Record<WireElectricalType, { label: string; color: string }> = {
  power: { label: 'Power', color: '#ff453a' },
  ground: { label: 'Ground', color: '#111113' },
  digital: { label: 'Digital Signal', color: '#0a84ff' },
  pwm: { label: 'PWM', color: '#bf5af2' },
  analog: { label: 'Analog Signal', color: '#ff9f0a' },
  'serial-tx': { label: 'Serial TX', color: '#ffd60a' },
  'serial-rx': { label: 'Serial RX', color: '#30d158' },
  unknown: { label: 'Floating / Unknown', color: '#86868b' },
};

function pinFor(component: PlacedComponent | undefined, pinId: string): Pin | undefined {
  return component ? COMPONENT_MAP[component.type]?.pins.find((pin) => pin.id === pinId) : undefined;
}

function classifyPin(component: PlacedComponent | undefined, pin: Pin | undefined): WireElectricalType {
  if (!component || !pin) return 'unknown';
  if (pin.type === 'ground' || pin.id === '-' || pin.id.startsWith('gnd')) return 'ground';
  if (pin.type === 'power' || ['5v', '3v3', 'vin', '+'].includes(pin.id)) return 'power';
  if (pin.type === 'pwm') return 'pwm';
  if (pin.type === 'analog' || pin.id.startsWith('a')) return 'analog';
  if (pin.type === 'serial' || pin.id === 'tx' || pin.id === 'rx') {
    return pin.name.toLowerCase().includes('tx') || pin.label?.toLowerCase() === 'tx' ? 'serial-tx' : 'serial-rx';
  }
  if (pin.type === 'digital' || pin.id.startsWith('d') || pin.id === 'out' || pin.id === 'sig') return 'digital';
  return 'unknown';
}

export function classifyConnection(connection: Connection, components: PlacedComponent[]): WireClassification {
  const fromComponent = components.find((component) => component.id === connection.fromComponent);
  const toComponent = components.find((component) => component.id === connection.toComponent);
  const fromPin = pinFor(fromComponent, connection.fromPin);
  const toPin = pinFor(toComponent, connection.toPin);
  const types = [classifyPin(fromComponent, fromPin), classifyPin(toComponent, toPin)];
  const type = types.find((candidate) => candidate !== 'unknown') ?? 'unknown';
  const display = classifications[type];
  const fromName = `${fromComponent ? COMPONENT_MAP[fromComponent.type]?.label || fromComponent.type : 'Unknown'} ${fromPin?.label || fromPin?.name || connection.fromPin}`;
  const toName = `${toComponent ? COMPONENT_MAP[toComponent.type]?.label || toComponent.type : 'Unknown'} ${toPin?.label || toPin?.name || connection.toPin}`;
  return { ...display, type, net: `${fromPin?.name || connection.fromPin} -> ${toPin?.name || connection.toPin}`, label: display.label, fromName, toName };
}
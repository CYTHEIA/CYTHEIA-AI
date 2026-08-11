import type { Connection, Pin, PlacedComponent, SimulationPinState } from '@/types';
import { COMPONENT_MAP } from '@/components/library';

export interface NetworkPin {
  componentId: string;
  pinId: string;
}

export interface NetworkContext {
  components: PlacedComponent[];
  connections: Connection[];
  readArduinoPin: (pin: number) => number;
}

const conductiveTypes = new Set(['resistor', 'capacitor', 'diode']);

function key(pin: NetworkPin): string {
  return `${pin.componentId}:${pin.pinId}`;
}

function parsePinNumber(pinId: string, prefix: string): number | null {
  const match = pinId.match(new RegExp(`^${prefix}(\\d+)$`));
  return match ? Number(match[1]) : null;
}

export function getNetworkPins(start: NetworkPin, context: NetworkContext): NetworkPin[] {
  const visited = new Set<string>();
  const queue = [start];
  const result: NetworkPin[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = key(current);
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    result.push(current);

    for (const connection of context.connections) {
      let next: NetworkPin | null = null;
      if (connection.fromComponent === current.componentId && connection.fromPin === current.pinId) {
        next = { componentId: connection.toComponent, pinId: connection.toPin };
      } else if (connection.toComponent === current.componentId && connection.toPin === current.pinId) {
        next = { componentId: connection.fromComponent, pinId: connection.fromPin };
      }
      if (next) queue.push(next);
    }

    const component = context.components.find((item) => item.id === current.componentId);
    if (!component || !conductiveTypes.has(component.type)) continue;
    const definition = COMPONENT_MAP[component.type];
    for (const pin of definition?.pins ?? []) {
      if (pin.id !== current.pinId) queue.push({ componentId: component.id, pinId: pin.id });
    }
  }

  return result;
}

export function resolveNetworkState(start: NetworkPin, context: NetworkContext): SimulationPinState {
  let highestAnalog = 0;
  let digital: SimulationPinState['digital'] = 'FLOATING';
  let voltage = 0;

  for (const pin of getNetworkPins(start, context)) {
    const component = context.components.find((item) => item.id === pin.componentId);
    if (!component) continue;

    const digitalPin = parsePinNumber(pin.pinId, 'd');
    if (component.type.startsWith('arduino') && digitalPin !== null) {
      const value = context.readArduinoPin(digitalPin);
      if (value > 0) {
        voltage = 5;
        digital = 'HIGH';
        highestAnalog = Math.max(highestAnalog, value > 1 ? value : 1023);
      }
    }
    if (component.type.startsWith('arduino') && pin.pinId === '5v') {
      voltage = Math.max(voltage, 5);
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 1023);
    }
    if (component.type.startsWith('arduino') && pin.pinId === '3v3') {
      voltage = Math.max(voltage, 3.3);
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 674);
    }
    if (component.type === 'power-5v' || (component.type === 'battery' && Number(component.props.voltage ?? 0) > 0)) {
      voltage = Math.max(voltage, component.type === 'power-5v' ? 5 : Number(component.props.voltage ?? 0));
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, Math.round((voltage / 5) * 1023));
    }
    if (component.type === 'power-3v3') {
      voltage = Math.max(voltage, 3.3);
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 674);
    }
    if (component.type === 'gnd' || pin.pinId.startsWith('gnd') || pin.pinId === '-' || pin.pinId === 'c' && component.type === 'rgb-led') {
      if (voltage === 0) digital = 'LOW';
    }
    if (component.type === 'push-button' && component.props.pressed) {
      voltage = 5;
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 1023);
    }
    if (component.type === 'switch' && component.props.closed) {
      voltage = 5;
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 1023);
    }
    if ((component.type === 'pir-sensor' && component.props.motion) ||
      (component.type === 'ir-sensor' && component.props.detected) ||
      (component.type === 'ultrasonic-sensor' && pin.pinId === 'echo' && Number(component.props.distance ?? 100) < 400)) {
      voltage = 5;
      digital = 'HIGH';
      highestAnalog = Math.max(highestAnalog, 1023);
    }
    if (component.type === 'potentiometer' && pin.pinId === 'w') {
      highestAnalog = Math.max(highestAnalog, Math.round(Number(component.props.value ?? 0.5) * 1023));
      voltage = (highestAnalog / 1023) * 5;
      digital = highestAnalog > 0 ? 'HIGH' : 'LOW';
    }
    if (component.type === 'temp-sensor' && pin.pinId === 'out') {
      highestAnalog = Math.max(highestAnalog, Math.round(Number(component.props.temperature ?? 25) * 20.48));
      voltage = (highestAnalog / 1023) * 5;
      digital = highestAnalog > 0 ? 'HIGH' : 'LOW';
    }
    if (component.type === 'light-sensor' && pin.pinId === 'out') {
      highestAnalog = Math.max(highestAnalog, Math.round(Number(component.props.light ?? 0.5) * 1023));
      voltage = (highestAnalog / 1023) * 5;
      digital = highestAnalog > 0 ? 'HIGH' : 'LOW';
    }
  }

  return { voltage, digital, analog: highestAnalog };
}

export function findPin(component: PlacedComponent, pinId: string): Pin | undefined {
  return COMPONENT_MAP[component.type]?.pins.find((pin) => pin.id === pinId);
}
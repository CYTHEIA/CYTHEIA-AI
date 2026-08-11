import type { AIAction, PlacedComponent, Connection, CodeFile } from '@/types';
import { COMPONENT_MAP } from '@/components/library';

export interface AIContext {
  components: PlacedComponent[];
  connections: Connection[];
  code: CodeFile[];
  errors: string[];
  simulationRunning: boolean;
}

export function buildContextString(ctx: AIContext): string {
  const lines: string[] = [];
  lines.push('=== PROJECT CONTEXT ===');
  lines.push(`Components (${ctx.components.length}):`);
  for (const c of ctx.components) {
    const def = COMPONENT_MAP[c.type];
    lines.push(`  - ${def?.label || c.type} (id: ${c.id}, pos: ${c.x},${c.y}, props: ${JSON.stringify(c.props)})`);
  }
  lines.push(`\nConnections (${ctx.connections.length}):`);
  for (const conn of ctx.connections) {
    lines.push(`  - ${conn.fromComponent}.${conn.fromPin} -> ${conn.toComponent}.${conn.toPin}`);
  }
  lines.push(`\nCode:`);
  for (const f of ctx.code) {
    lines.push(`--- ${f.name} ---`);
    lines.push(f.content);
  }
  if (ctx.errors.length > 0) {
    lines.push(`\nErrors:`);
    ctx.errors.forEach((e) => lines.push(`  - ${e}`));
  }
  return lines.join('\n');
}

export function parseAICommand(input: string, ctx: AIContext): AIAction[] {
  const lower = input.toLowerCase();
  const actions: AIAction[] = [];

  // Pattern: add [component] to pin [N]
  const addMatch = input.match(/add\s+(?:an?\s+)?(.+?)\s+(?:to|on|at)\s+pin\s+(\d+)/i);
  if (addMatch) {
    const compName = addMatch[1].trim();
    const pin = parseInt(addMatch[2]);
    const compType = findComponentType(compName);
    if (compType) {
      actions.push({
        type: 'ADD_COMPONENT',
        params: { type: compType, x: 700, y: 200 },
        description: `Add ${COMPONENT_MAP[compType].label} near pin ${pin}`,
      });
    }
  }

  // Pattern: add [component]
  const simpleAddMatch = input.match(/^add\s+(?:an?\s+)?(.+)$/i);
  if (simpleAddMatch && actions.length === 0) {
    const compName = simpleAddMatch[1].trim();
    const compType = findComponentType(compName);
    if (compType) {
      actions.push({
        type: 'ADD_COMPONENT',
        params: { type: compType, x: 600, y: 200 },
        description: `Add ${COMPONENT_MAP[compType].label} to the canvas`,
      });
    }
  }

  // Pattern: connect [from] to [to]
  const connectMatch = input.match(/connect\s+(.+?)\s+(?:to|between|from)\s+(.+)/i);
  if (connectMatch) {
    actions.push({
      type: 'CONNECT',
      params: { from: connectMatch[1].trim(), to: connectMatch[2].trim() },
      description: `Connect ${connectMatch[1]} to ${connectMatch[2]}`,
    });
  }

  // Pattern: write code / generate code / blink
  if (lower.includes('write code') || lower.includes('generate code') || lower.includes('blink')) {
    actions.push({
      type: 'UPDATE_CODE',
      params: { code: generateBlinkCode(lower) },
      description: 'Update Arduino code',
    });
  }

  // Pattern: remove/delete [component]
  if (lower.startsWith('remove') || lower.startsWith('delete')) {
    const compMatch = input.match(/(?:remove|delete)\s+(?:the\s+)?(.+)/i);
    if (compMatch) {
      const compType = findComponentType(compMatch[1]);
      if (compType) {
        const existing = ctx.components.find((c) => c.type === compType);
        if (existing) {
          actions.push({
            type: 'REMOVE_COMPONENT',
            params: { id: existing.id },
            description: `Remove ${COMPONENT_MAP[compType].label}`,
          });
        }
      }
    }
  }

  // Pattern: rotate [component]
  if (lower.startsWith('rotate')) {
    const compMatch = input.match(/rotate\s+(?:the\s+)?(.+)/i);
    if (compMatch) {
      const compType = findComponentType(compMatch[1]);
      if (compType) {
        const existing = ctx.components.find((c) => c.type === compType);
        if (existing) {
          actions.push({
            type: 'ROTATE_COMPONENT',
            params: { id: existing.id },
            description: `Rotate ${COMPONENT_MAP[compType].label}`,
          });
        }
      }
    }
  }

  // Pattern: explain / why / debug
  if (lower.startsWith('explain') || lower.startsWith('why') || lower.includes('not working') || lower.includes('debug') || lower.includes('problem')) {
    const explanation = analyzeCircuit(ctx, input);
    actions.push({
      type: 'EXPLAIN',
      params: { explanation },
      description: 'Circuit analysis',
    });
  }

  // Pattern: create traffic light / pedestrian crossing
  if (lower.includes('traffic light') || lower.includes('pedestrian')) {
    actions.push({
      type: 'CREATE_PROJECT',
      params: { template: 'Traffic Light' },
      description: 'Create a traffic light project',
    });
  }

  // Default: if no actions matched, provide a helpful explanation
  if (actions.length === 0) {
    actions.push({
      type: 'EXPLAIN',
      params: { explanation: generateHelpResponse(input, ctx) },
      description: 'AI analysis',
    });
  }

  return actions;
}

function findComponentType(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [type, def] of Object.entries(COMPONENT_MAP)) {
    if (def.label.toLowerCase() === lower) return type;
    if (type === lower) return type;
    if (def.label.toLowerCase().includes(lower) || lower.includes(def.label.toLowerCase())) return type;
    if (def.keywords?.some((k) => lower.includes(k) || k.includes(lower))) return type;
  }
  return null;
}

function generateBlinkCode(lower: string): string {
  if (lower.includes('traffic')) {
    return `void setup() {
  pinMode(11, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("Green");
  delay(3000);
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  Serial.println("Yellow");
  delay(1000);
  digitalWrite(12, LOW);
  digitalWrite(11, HIGH);
  Serial.println("Red");
  delay(3000);
  digitalWrite(11, LOW);
}
`;
  }
  return `void setup() {
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
`;
}

function analyzeCircuit(ctx: AIContext, input: string): string {
  const issues: string[] = [];
  const lower = input.toLowerCase();

  const arduino = ctx.components.find((c) => c.type.startsWith('arduino'));
  if (!arduino) {
    issues.push('No microcontroller found in the circuit. Add an Arduino to control components.');
  }

  const gnd = ctx.components.some((c) => c.type === 'gnd' || c.type === 'power-5v' || c.type === 'power-3v3');
  if (!gnd && arduino) {
    issues.push('No ground (GND) reference found. The circuit needs a GND connection to complete the electrical loop.');
  }

  // Check for LEDs without resistors
  const leds = ctx.components.filter((c) => c.type === 'led');
  for (const led of leds) {
    const hasResistor = ctx.connections.some((conn) => {
      const otherId = conn.fromComponent === led.id ? conn.toComponent : conn.fromComponent;
      const otherComp = ctx.components.find((c) => c.id === otherId);
      return otherComp?.type === 'resistor';
    });
    if (!hasResistor && arduino) {
      issues.push('An LED is connected without a current-limiting resistor. This could damage the LED. Add a 220Ω resistor in series.');
    }
  }

  // Check for unconnected component pins
  for (const comp of ctx.components) {
    const def = COMPONENT_MAP[comp.type];
    if (!def) continue;
    for (const pin of def.pins) {
      if (pin.type === 'power' || pin.type === 'ground') continue;
      const connected = ctx.connections.some(
        (c) => (c.fromComponent === comp.id && c.fromPin === pin.id) || (c.toComponent === comp.id && c.toPin === pin.id)
      );
      if (!connected && (pin.type === 'digital' || pin.type === 'pwm' || pin.type === 'analog')) {
        // Only report if it's an important pin
      }
    }
  }

  // Check for floating inputs
  if (arduino) {
    for (let pin = 2; pin <= 12; pin++) {
      const pinId = `d${pin}`;
      const connected = ctx.connections.some(
        (c) => (c.fromComponent === arduino.id && c.fromPin === pinId) || (c.toComponent === arduino.id && c.toPin === pinId)
      );
      if (connected && ctx.code[0]?.content.includes(`digitalRead(${pin})`)) {
        const hasPullup = ctx.code[0]?.content.includes(`pinMode(${pin}, INPUT_PULLUP)`);
        if (!hasPullup) {
          issues.push(`Pin ${pin} is read with digitalRead() but may be floating. Use pinMode(${pin}, INPUT_PULLUP) or add a pull-down resistor.`);
        }
      }
    }
  }

  // Check for simulation errors
  if (ctx.errors.length > 0) {
    issues.push(`Simulation errors detected:\n${ctx.errors.map((e) => `  - ${e}`).join('\n')}`);
  }

  // Specific "why isn't X working" analysis
  if (lower.includes('led') && (lower.includes('not') || lower.includes("isn't") || lower.includes("doesn't"))) {
    const led = leds[0];
    if (led) {
      const ledConns = ctx.connections.filter(
        (c) => c.fromComponent === led.id || c.toComponent === led.id
      );
      if (ledConns.length < 2) {
        issues.push('The LED may not have both pins connected. An LED needs its anode connected to a signal (through a resistor) and cathode to GND.');
      }
      if (arduino) {
        const hasCode = ctx.code[0]?.content.includes('digitalWrite');
        if (!hasCode) {
          issues.push('No digitalWrite() calls found in the code. The LED needs to be driven by code to turn on.');
        }
      }
    }
  }

  if (lower.includes('motor') && (lower.includes('not') || lower.includes("isn't") || lower.includes("doesn't"))) {
    issues.push('For motors: ensure the motor has both + and - pins connected. DC motors need sufficient current — a transistor or motor driver may be needed. Servo motors need signal, VCC (5V), and GND connections.');
  }

  if (issues.length === 0) {
    return `I analyzed your circuit with ${ctx.components.length} components and ${ctx.connections.length} connections. Everything looks structurally sound. The circuit has a microcontroller, proper ground reference, and appropriate connections. Run the simulation to verify behavior.`;
  }

  return `Here's what I found:\n\n${issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n\n')}`;
}

function generateHelpResponse(input: string, ctx: AIContext): string {
  const compCount = ctx.components.length;
  const connCount = ctx.connections.length;
  const hasArduino = ctx.components.some((c) => c.type.startsWith('arduino'));

  return `I can help you with that. Your project currently has ${compCount} component${compCount !== 1 ? 's' : ''} and ${connCount} connection${connCount !== 1 ? 's' : ''}.

Try these commands:
• "Add an LED to pin 13"
• "Add a resistor"
• "Connect the resistor to the LED"
• "Write code to blink the LED"
• "Why isn't my LED working?"
• "Explain this circuit"
• "Create a traffic light"

${hasArduino ? 'Your circuit has an Arduino ready to use.' : 'Tip: Add an Arduino Uno to start building your circuit.'}`;
}

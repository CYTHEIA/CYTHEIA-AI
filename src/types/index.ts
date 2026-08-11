export type ID = string;

export type PinType = 'digital' | 'analog' | 'power' | 'ground' | 'pwm' | 'serial' | 'generic';

export interface Pin {
  id: string;
  name: string;
  type: PinType;
  x: number;
  y: number;
  label?: string;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  category: string;
  description: string;
  width: number;
  height: number;
  pins: Pin[];
  defaultProps: Record<string, any>;
  keywords?: string[];
}

export interface PlacedComponent {
  id: ID;
  type: string;
  x: number;
  y: number;
  rotation: number;
  props: Record<string, any>;
}

export interface Connection {
  id: ID;
  fromComponent: ID;
  fromPin: string;
  toComponent: ID;
  toPin: string;
  path?: { x: number; y: number }[];
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface ProjectData {
  components: PlacedComponent[];
  connections: Connection[];
  code: CodeFile[];
  simulation: {
    running: boolean;
    speed: number;
  };
}

export interface Project {
  id: ID;
  name: string;
  description?: string;
  data: ProjectData;
  isTemplate: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: ID;
  projectId: ID;
  name: string;
  data: ProjectData;
  createdAt: string;
}

export interface SimulationPinState {
  voltage: number;
  digital: 'HIGH' | 'LOW' | 'FLOATING';
  analog: number;
  pwm?: { duty: number; frequency: number };
}

export interface SimulationComponentState {
  componentId: ID;
  pins: Record<string, SimulationPinState>;
  visual: Record<string, any>;
}

export interface SimulationState {
  time: number;
  components: Record<ID, SimulationComponentState>;
  serialOutput: string[];
  errors: string[];
  arduinoPins: Record<number, SimulationPinState>;
}

export type AIActionType =
  | 'ADD_COMPONENT'
  | 'REMOVE_COMPONENT'
  | 'CONNECT'
  | 'DISCONNECT'
  | 'SET_PROPERTY'
  | 'MOVE_COMPONENT'
  | 'ROTATE_COMPONENT'
  | 'UPDATE_CODE'
  | 'CREATE_PROJECT'
  | 'EXPLAIN';

export interface AIAction {
  type: AIActionType;
  params: Record<string, any>;
  description: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AIAction[];
  pending?: boolean;
}

export type View = 'landing' | 'dashboard' | 'editor' | 'plans';

export type PlanType = 'basic' | 'premium' | 'postpaid';

export interface PlanInfo {
  id: PlanType;
  name: string;
  tagline: string;
  price: string;
  period: string;
  recommended: boolean;
  description: string;
  features: string[];
  accentColor: string;
}

export interface PlanLimits {
  aiDebugging: 'limited' | 'unlimited';
  aiGuidance: boolean;
  aiCodeGeneration: boolean;
  aiWiringSuggestions: boolean;
  projects: number | 'limited' | 'unlimited';
  storage: string;
  advancedCodeGen: boolean;
  bestModels: boolean;
  usageBased: boolean;
}

export interface UsageStats {
  aiQueriesUsed: number;
  aiQueriesLimit: number | null;
  projectsUsed: number;
  projectsLimit: number | null;
  storageUsedMB: number;
  storageLimitMB: number | null;
}

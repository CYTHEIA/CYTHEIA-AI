import { COMPONENT_MAP } from "./library.js";
import { uid } from "./utils_uid.js";
import { SimulationEngine } from "./simulation/engine.js";

function defaultCode() {
  return [
    {
      name: "main.ino",
      language: "cpp",
      content: `// CYTHEIA AI — Arduino Sketch
// LED Blink on Pin 13

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("CYTHEIA AI - Ready");
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
    }
  ];
}

export const state = {
  ui: {
    view: "landing",
    leftSidebarTab: "components",
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    bottomPanelOpen: true,
    bottomPanelTab: "code",
    showGrid: true,
    snapToGrid: true,
    zoom: 1,
    pan: { x: 0, y: 0 },
    commandPaletteOpen: false,
    plansModalOpen: false,
    toasts: [],
    theme: "dark",
    draggingComponent: null,
    leftSidebarWidth: 256,
    rightSidebarWidth: 320,
    bottomPanelHeight: 320
  },

  project: {
    projectId: null,
    projectName: "Untitled Project",
    projectDescription: "",
    components: [],
    connections: [],
    code: defaultCode(),
    selectedIds: [],
    saveStatus: "saved",
    undoStack: [],
    redoStack: [],
    versions: []
  },

  simulation: {
    engine: null,
    running: false,
    paused: false,
    speed: 1,
    state: null,
    tickInterval: null,
    serialOutput: []
  }
};

const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) listener(state);
}

function update(section, changes) {
  Object.assign(state[section], changes);
  notify();
}

/* ---------------- UI ---------------- */

export function setView(view) { update("ui", { view }); }
export function toggleLeftSidebar() { update("ui", { leftSidebarOpen: !state.ui.leftSidebarOpen }); }
export function setLeftSidebarTab(tab) { update("ui", { leftSidebarTab: tab }); }
export function toggleRightSidebar() { update("ui", { rightSidebarOpen: !state.ui.rightSidebarOpen }); }
export function setBottomPanelTab(tab) { update("ui", { bottomPanelTab: tab, bottomPanelOpen: true }); }
export function toggleBottomPanel() { update("ui", { bottomPanelOpen: !state.ui.bottomPanelOpen }); }
export function toggleCommandPalette() { update("ui", { commandPaletteOpen: !state.ui.commandPaletteOpen }); }
export function setCommandPaletteOpen(open) { update("ui", { commandPaletteOpen: open }); }
export function setPlansModalOpen(open) { update("ui", { plansModalOpen: open }); }
export function togglePlansModal() { update("ui", { plansModalOpen: !state.ui.plansModalOpen }); }
export function toggleGrid() { update("ui", { showGrid: !state.ui.showGrid }); }
export function toggleSnap() { update("ui", { snapToGrid: !state.ui.snapToGrid }); }
export function setZoom(zoom) { update("ui", { zoom: Math.max(0.2, Math.min(3, zoom)) }); }
export function setPan(pan) { update("ui", { pan: { x: pan.x, y: pan.y } }); }
export function setDraggingComponent(type) { update("ui", { draggingComponent: type }); }
export function setPanelSizes(changes) { update("ui", changes); }

export function addToast(message, type = "info") {
  const id = `${Date.now()}-${Math.random()}`;
  state.ui.toasts.push({ id, message, type });
  notify();
  setTimeout(() => removeToast(id), 3500);
}

export function removeToast(id) {
  state.ui.toasts = state.ui.toasts.filter((toast) => toast.id !== id);
  notify();
}

/* ---------------- PROJECT ---------------- */

export function setProjectName(name) { update("project", { projectName: name, saveStatus: "unsaved" }); }
export function setSaveStatus(status) { update("project", { saveStatus: status }); }

export function getProjectData() {
  const { components, connections, code } = state.project;
  return { components, connections, code, simulation: { running: false, speed: 1 } };
}

export function newProject(name) {
  state.project = {
    projectId: null,
    projectName: name || "Untitled Project",
    projectDescription: "",
    components: [],
    connections: [],
    code: defaultCode(),
    selectedIds: [],
    saveStatus: "saved",
    undoStack: [],
    redoStack: [],
    versions: []
  };
  stopSimulation();
  notify();
}

export function loadProject(project) {
  state.project = {
    projectId: project.id || null,
    projectName: project.name || "Untitled Project",
    projectDescription: project.description || "",
    components: project.data.components || [],
    connections: project.data.connections || [],
    code: project.data.code || defaultCode(),
    selectedIds: [],
    saveStatus: "saved",
    undoStack: [],
    redoStack: [],
    versions: []
  };
  stopSimulation();
  notify();
}

export function addComponent(type, x, y) {
  const def = COMPONENT_MAP[type];
  if (!def) return null;
  const id = uid();
  const component = {
    id,
    type,
    x,
    y,
    rotation: 0,
    props: { ...def.defaultProps }
  };
  pushHistory("Add component");
  state.project.components.push(component);
  state.project.selectedIds = [id];
  state.project.saveStatus = "unsaved";
  notify();
  return id;
}

export function removeComponent(id) {
  removeComponents([id]);
}

export function removeComponents(ids) {
  if (!ids?.length) return;
  pushHistory(ids.length > 1 ? "Remove components" : "Remove component");
  const set = new Set(ids);
  state.project.components = state.project.components.filter((component) => !set.has(component.id));
  state.project.connections = state.project.connections.filter((connection) => !set.has(connection.fromComponent) && !set.has(connection.toComponent));
  state.project.selectedIds = state.project.selectedIds.filter((id) => !set.has(id));
  state.project.saveStatus = "unsaved";
  notify();
}

export function moveComponent(id, x, y) {
  state.project.components = state.project.components.map((component) => component.id === id ? { ...component, x, y } : component);
  state.project.saveStatus = "unsaved";
  notify();
}

export function rotateComponent(id) {
  pushHistory("Rotate component");
  state.project.components = state.project.components.map((component) => component.id === id ? { ...component, rotation: (component.rotation + 90) % 360 } : component);
  state.project.saveStatus = "unsaved";
  notify();
}

export function duplicateComponent(id) {
  const component = state.project.components.find((c) => c.id === id);
  if (!component) return null;
  const newId = uid();
  pushHistory("Duplicate component");
  state.project.components.push({ ...component, id: newId, x: component.x + 40, y: component.y + 40, props: { ...component.props } });
  state.project.selectedIds = [newId];
  state.project.saveStatus = "unsaved";
  notify();
  return newId;
}

export function setComponentProperty(id, key, value) {
  state.project.components = state.project.components.map((component) => component.id === id ? { ...component, props: { ...component.props, [key]: value } } : component);
  state.project.saveStatus = "unsaved";
  notify();
}

export function addConnection(from, to) {
  if (!from || !to || (from.component === to.component && from.pin === to.pin)) return;
  const exists = state.project.connections.some((c) =>
    (c.fromComponent === from.component && c.fromPin === from.pin && c.toComponent === to.component && c.toPin === to.pin) ||
    (c.fromComponent === to.component && c.fromPin === to.pin && c.toComponent === from.component && c.toPin === from.pin)
  );
  if (exists) return;
  pushHistory("Add connection");
  state.project.connections.push({ id: uid(), fromComponent: from.component, fromPin: from.pin, toComponent: to.component, toPin: to.pin });
  state.project.saveStatus = "unsaved";
  notify();
}

export function removeConnection(id) {
  pushHistory("Remove connection");
  state.project.connections = state.project.connections.filter((connection) => connection.id !== id);
  state.project.saveStatus = "unsaved";
  notify();
}

export function selectComponent(id) {
  state.project.selectedIds = id ? [id] : [];
  notify();
}

export function toggleSelect(id) {
  const ids = state.project.selectedIds;
  state.project.selectedIds = ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
  notify();
}

export function clearSelection() { state.project.selectedIds = []; notify(); }

export function updateCode(index, content) {
  state.project.code = state.project.code.map((file, i) => i === index ? { ...file, content } : file);
  state.project.saveStatus = "unsaved";
  notify();
}

export function pushHistory(label) {
  const { components, connections, code } = state.project;
  state.project.undoStack = [
    ...state.project.undoStack.slice(-49),
    {
      components: components.map((c) => ({ ...c, props: { ...c.props } })),
      connections: connections.map((c) => ({ ...c })),
      code: code.map((f) => ({ ...f })),
      label,
      timestamp: Date.now()
    }
  ];
  state.project.redoStack = [];
}

export function undo() {
  const stack = state.project.undoStack;
  if (!stack.length) return;
  const entry = stack[stack.length - 1];
  state.project.undoStack = stack.slice(0, -1);
  state.project.redoStack.push({
    components: state.project.components.map((c) => ({ ...c, props: { ...c.props } })),
    connections: state.project.connections.map((c) => ({ ...c })),
    code: state.project.code.map((f) => ({ ...f })),
    label: entry.label,
    timestamp: Date.now()
  });
  state.project.components = entry.components;
  state.project.connections = entry.connections;
  state.project.code = entry.code;
  state.project.saveStatus = "unsaved";
  notify();
}

export function redo() {
  const stack = state.project.redoStack;
  if (!stack.length) return;
  const entry = stack[stack.length - 1];
  state.project.redoStack = stack.slice(0, -1);
  state.project.undoStack.push({
    components: state.project.components.map((c) => ({ ...c, props: { ...c.props } })),
    connections: state.project.connections.map((c) => ({ ...c })),
    code: state.project.code.map((f) => ({ ...f })),
    label: entry.label,
    timestamp: Date.now()
  });
  state.project.components = entry.components;
  state.project.connections = entry.connections;
  state.project.code = entry.code;
  state.project.saveStatus = "unsaved";
  notify();
}

/* ---------------- SIMULATION ---------------- */

let lastSerialLength = 0;

export function initEngine() {
  if (state.simulation.engine) return;
  const engine = new SimulationEngine();
  engine.setOnStateUpdate((simulationState) => {
    state.simulation.state = simulationState;
    const entries = simulationState.serialOutput || [];
    if (entries.length > lastSerialLength) {
      const newEntries = entries.slice(lastSerialLength);
      for (const entry of newEntries) {
        const text = typeof entry === 'string' ? entry : (entry?.text || '');
        state.simulation.serialOutput = [...state.simulation.serialOutput.slice(-499), text];
      }
      lastSerialLength = entries.length;
    }
    notify();
  });
  state.simulation.engine = engine;
  notify();
}

export function startSimulation() {
  const { engine } = state.simulation;
  if (!engine) return;
  if (state.simulation.tickInterval) clearInterval(state.simulation.tickInterval);
  const code = state.project.code[0]?.content || "";
  engine.load(state.project.components, state.project.connections, code, state.simulation.speed);
  const ok = engine.start();
  if (!ok) return;
  state.simulation.running = true;
  state.simulation.paused = false;
  state.simulation.serialOutput = [];
  lastSerialLength = 0;
  state.simulation.tickInterval = setInterval(() => state.simulation.engine?.tick(), 16);
  notify();
}

export function pauseSimulation() { state.simulation.engine?.pause(); state.simulation.paused = true; notify(); }
export function resumeSimulation() { state.simulation.engine?.resume(); state.simulation.paused = false; notify(); }

export function stopSimulation() {
  state.simulation.engine?.stop();
  if (state.simulation.tickInterval) clearInterval(state.simulation.tickInterval);
  state.simulation.running = false;
  state.simulation.paused = false;
  state.simulation.tickInterval = null;
  state.simulation.serialOutput = [];
  lastSerialLength = 0;
  notify();
}

export function setSimulationSpeed(speed) {
  state.simulation.engine?.setSpeed(speed);
  state.simulation.speed = speed;
  notify();
}

/* ---------------- SUBSCRIPTION / PLANS ---------------- */

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 'FREE',
    period: '',
    description: 'For normal use and limited AI debugging.',
    features: [
      'Circuit editor',
      'Circuit simulation',
      'Standard projects',
      'Limited AI debugging',
      'Standard AI assistance'
    ],
    cta: 'Current Plan',
    recommended: false,
    ctaVariant: 'ghost'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: '$15',
    period: '/ month',
    description: 'For users who want AI guidance while building circuits.',
    features: [
      'Everything in Basic',
      'AI guidance for circuit building',
      'Unlimited AI debugging',
      'Advanced circuit assistance',
      'AI code generation',
      'Limited projects'
    ],
    cta: 'Upgrade to Premium',
    recommended: true,
    ctaVariant: 'primary'
  },
  postpaid: {
    id: 'postpaid',
    name: 'Postpaid',
    price: 'Usage based',
    period: '',
    description: 'For heavy projects, prototypes and development.',
    features: [
      'Everything in Premium',
      'Heavy project workloads',
      'Prototype storage',
      'Development workflows',
      'Unlimited AI debugging',
      'Best available AI models for assistance',
      'AI code generation',
      'Usage-based billing'
    ],
    cta: 'Use Postpaid',
    recommended: false,
    ctaVariant: 'secondary',
    usageNote: 'Charged according to actual usage.'
  }
};

export const DEFAULT_PLAN = 'basic';

let subscriptionState = {
  plan: DEFAULT_PLAN,
  status: 'active',
  billingProvider: null,
  billingCustomerId: null,
  billingSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  usage: {
    aiDebuggingRequests: 0,
    aiCodeGenerations: 0,
    projectsCreated: 0,
    storageUsed: 0
  }
};

function loadSubscriptionState() {
  try {
    const stored = localStorage.getItem('cytheia-subscription');
    if (stored) {
      const parsed = JSON.parse(stored);
      subscriptionState = { ...subscriptionState, ...parsed };
    }
  } catch {}
}

function saveSubscriptionState() {
  try {
    localStorage.setItem('cytheia-subscription', JSON.stringify(subscriptionState));
  } catch {}
}

loadSubscriptionState();

export function getCurrentPlan() {
  return PLANS[subscriptionState.plan] || PLANS.basic;
}

export function getPlanId() {
  return subscriptionState.plan;
}

export function getSubscriptionState() {
  return { ...subscriptionState };
}

export function getUsage() {
  return { ...subscriptionState.usage };
}

export function setPlan(planId) {
  if (!PLANS[planId]) return false;
  subscriptionState.plan = planId;
  subscriptionState.status = 'active';
  saveSubscriptionState();
  notify();
  return true;
}

export function upgradeToPremium() {
  return setPlan('premium');
}

export function selectPostpaid() {
  return setPlan('postpaid');
}

export function downgradeToBasic() {
  return setPlan('basic');
}

export function cancelSubscription() {
  subscriptionState.status = 'canceled';
  subscriptionState.cancelAtPeriodEnd = true;
  saveSubscriptionState();
  notify();
}

export function incrementUsage(key, amount = 1) {
  if (subscriptionState.usage[key] !== undefined) {
    subscriptionState.usage[key] += amount;
    saveSubscriptionState();
    notify();
  }
}

export function resetUsage() {
  subscriptionState.usage = {
    aiDebuggingRequests: 0,
    aiCodeGenerations: 0,
    projectsCreated: 0,
    storageUsed: 0
  };
  saveSubscriptionState();
  notify();
}

export function isFeatureEnabled(feature) {
  const plan = getCurrentPlan();
  const basicFeatures = ['circuit-editor', 'circuit-simulation', 'standard-projects', 'limited-ai-debugging', 'standard-ai-assistance'];
  const premiumFeatures = [...basicFeatures, 'ai-guidance', 'unlimited-ai-debugging', 'advanced-circuit-assistance', 'ai-code-generation', 'limited-projects'];
  const postpaidFeatures = [...premiumFeatures, 'heavy-projects', 'prototype-storage', 'development-workflows', 'best-ai-models', 'usage-based-billing'];
  
  switch (plan.id) {
    case 'basic':
      return basicFeatures.includes(feature);
    case 'premium':
      return premiumFeatures.includes(feature);
    case 'postpaid':
      return postpaidFeatures.includes(feature);
    default:
      return basicFeatures.includes(feature);
  }
}

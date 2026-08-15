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
    toasts: [],
    theme: "dark",
    draggingComponent: null
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

  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  for (const listener of listeners) {
    listener(state);
  }
}

function update(section, changes) {
  Object.assign(state[section], changes);
  notify();
}

/* ---------------- UI ---------------- */

export function setView(view) {
  update("ui", { view });
}

export function toggleLeftSidebar() {
  update("ui", {
    leftSidebarOpen: !state.ui.leftSidebarOpen
  });
}

export function setLeftSidebarTab(tab) {
  update("ui", {
    leftSidebarTab: tab
  });
}

export function toggleRightSidebar() {
  update("ui", {
    rightSidebarOpen: !state.ui.rightSidebarOpen
  });
}

export function toggleBottomPanel() {
  update("ui", {
    bottomPanelOpen: !state.ui.bottomPanelOpen
  });
}

export function toggleCommandPalette() {
  update("ui", {
    commandPaletteOpen: !state.ui.commandPaletteOpen
  });
}

export function setCommandPaletteOpen(open) {
  update("ui", {
    commandPaletteOpen: open
  });
}

export function toggleGrid() {
  update("ui", {
    showGrid: !state.ui.showGrid
  });
}

export function toggleSnap() {
  update("ui", {
    snapToGrid: !state.ui.snapToGrid
  });
}

export function addToast(message, type = "info") {
  const id = `${Date.now()}-${Math.random()}`;

  state.ui.toasts.push({
    id,
    message,
    type
  });

  notify();

  setTimeout(() => {
    removeToast(id);
  }, 3500);
}

export function removeToast(id) {
  state.ui.toasts = state.ui.toasts.filter(
    (toast) => toast.id !== id
  );

  notify();
}

/* ---------------- PROJECT ---------------- */

export function setProjectName(name) {
  update("project", {
    projectName: name,
    saveStatus: "unsaved"
  });
}

export function setSaveStatus(status) {
  update("project", {
    saveStatus: status
  });
}

export function getProjectData() {
  const {
    components,
    connections,
    code
  } = state.project;

  return {
    components,
    connections,
    code,
    simulation: {
      running: false,
      speed: 1
    }
  };
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

  notify();
}

export function loadProject(project) {
  state.project = {
    projectId: project.id,
    projectName: project.name,
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
    props: {
      ...def.defaultProps
    }
  };

  pushHistory("Add component");

  state.project.components.push(component);
  state.project.selectedIds = [id];
  state.project.saveStatus = "unsaved";

  notify();

  return id;
}

export function removeComponent(id) {
  pushHistory("Remove component");

  state.project.components =
    state.project.components.filter(
      (component) => component.id !== id
    );

  state.project.connections =
    state.project.connections.filter(
      (connection) =>
        connection.fromComponent !== id &&
        connection.toComponent !== id
    );

  state.project.selectedIds =
    state.project.selectedIds.filter(
      (selectedId) => selectedId !== id
    );

  state.project.saveStatus = "unsaved";

  notify();
}

export function moveComponent(id, x, y) {
  state.project.components =
    state.project.components.map((component) =>
      component.id === id
        ? { ...component, x, y }
        : component
    );

  state.project.saveStatus = "unsaved";

  notify();
}

export function rotateComponent(id) {
  pushHistory("Rotate component");

  state.project.components =
    state.project.components.map((component) =>
      component.id === id
        ? {
            ...component,
            rotation: (component.rotation + 90) % 360
          }
        : component
    );

  state.project.saveStatus = "unsaved";

  notify();
}

export function selectComponent(id) {
  state.project.selectedIds = id ? [id] : [];
  notify();
}

export function clearSelection() {
  state.project.selectedIds = [];
  notify();
}

export function updateCode(index, content) {
  state.project.code =
    state.project.code.map((file, i) =>
      i === index
        ? { ...file, content }
        : file
    );

  state.project.saveStatus = "unsaved";

  notify();
}

function pushHistory(label) {
  const {
    components,
    connections,
    code
  } = state.project;

  state.project.undoStack = [
    ...state.project.undoStack.slice(-49),
    {
      components: [...components],
      connections: [...connections],
      code: [...code],
      label,
      timestamp: Date.now()
    }
  ];

  state.project.redoStack = [];
}

export function undo() {
  const stack = state.project.undoStack;

  if (stack.length === 0) return;

  const entry = stack[stack.length - 1];

  state.project.undoStack = stack.slice(0, -1);

  state.project.redoStack.push({
    components: [...state.project.components],
    connections: [...state.project.connections],
    code: [...state.project.code],
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

  if (stack.length === 0) return;

  const entry = stack[stack.length - 1];

  state.project.redoStack = stack.slice(0, -1);

  state.project.undoStack.push({
    components: [...state.project.components],
    connections: [...state.project.connections],
    code: [...state.project.code],
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

export function initEngine() {
  if (state.simulation.engine) return;
  const engine = new SimulationEngine();

  engine.setOnStateUpdate((simulationState) => {
    state.simulation.state = simulationState;

    if (simulationState.serialOutput.length > 0) {
      const last =
        simulationState.serialOutput[
          simulationState.serialOutput.length - 1
        ];

      if (last) {
        state.simulation.serialOutput = [
          ...state.simulation.serialOutput.slice(-499),
          last
        ];
      }
    }

    notify();
  });

  state.simulation.engine = engine;

  notify();
}

export function startSimulation() {
  const { engine } = state.simulation;

  if (!engine) return;

  const code =
    state.project.code[0]?.content || "";

  engine.load(
    state.project.components,
    state.project.connections,
    code,
    state.simulation.speed
  );

  const ok = engine.start();

  if (!ok) return;

  state.simulation.running = true;
  state.simulation.paused = false;
  state.simulation.serialOutput = [];

  state.simulation.tickInterval =
    setInterval(() => {
      state.simulation.engine?.tick();
    }, 16);

  notify();
}

export function pauseSimulation() {
  state.simulation.engine?.pause();

  state.simulation.paused = true;

  notify();
}

export function resumeSimulation() {
  state.simulation.engine?.resume();

  state.simulation.paused = false;

  notify();
}

export function stopSimulation() {
  state.simulation.engine?.stop();

  if (state.simulation.tickInterval) {
    clearInterval(state.simulation.tickInterval);
  }

  state.simulation.running = false;
  state.simulation.paused = false;
  state.simulation.tickInterval = null;
  state.simulation.serialOutput = [];

  notify();
}

export function setSimulationSpeed(speed) {
  state.simulation.engine?.setSpeed(speed);

  state.simulation.speed = speed;

  notify();
}
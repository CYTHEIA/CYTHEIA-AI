import { create } from "zustand";
import { COMPONENT_MAP } from "@/components/library";
import { uid } from "@/utils/uid";
function defaultCode() {
  return [
    {
      name: "main.ino",
      language: "cpp",
      content: `// Nextel AI \u2014 Arduino Sketch
// LED Blink on Pin 13

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("Nextel AI - Ready");
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
const useProjectStore = create((set, get) => ({
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
  versions: [],
  newProject: (name) => {
    set({
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
    });
  },
  loadProject: (project) => {
    set({
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
    });
  },
  setProjectName: (name) => set({ projectName: name, saveStatus: "unsaved" }),
  setProjectDescription: (desc) => set({ projectDescription: desc, saveStatus: "unsaved" }),
  addComponent: (type, x, y) => {
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
    get().pushHistory("Add component");
    set((s) => ({ components: [...s.components, component], selectedIds: [id], saveStatus: "unsaved" }));
    return id;
  },
  removeComponent: (id) => {
    get().pushHistory("Remove component");
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      connections: s.connections.filter((conn) => conn.fromComponent !== id && conn.toComponent !== id),
      selectedIds: s.selectedIds.filter((sid) => sid !== id),
      saveStatus: "unsaved"
    }));
  },
  removeComponents: (ids) => {
    get().pushHistory("Remove components");
    set((s) => ({
      components: s.components.filter((c) => !ids.includes(c.id)),
      connections: s.connections.filter((conn) => !ids.includes(conn.fromComponent) && !ids.includes(conn.toComponent)),
      selectedIds: [],
      saveStatus: "unsaved"
    }));
  },
  moveComponent: (id, x, y) => {
    set((s) => ({
      components: s.components.map((c) => c.id === id ? { ...c, x, y } : c),
      saveStatus: "unsaved"
    }));
  },
  rotateComponent: (id) => {
    get().pushHistory("Rotate component");
    set((s) => ({
      components: s.components.map((c) => c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c),
      saveStatus: "unsaved"
    }));
  },
  duplicateComponent: (id) => {
    const comp = get().components.find((c) => c.id === id);
    if (!comp) return null;
    const newId = uid();
    const dup = { ...comp, id: newId, x: comp.x + 40, y: comp.y + 40, props: { ...comp.props } };
    get().pushHistory("Duplicate component");
    set((s) => ({ components: [...s.components, dup], selectedIds: [newId], saveStatus: "unsaved" }));
    return newId;
  },
  setComponentProperty: (id, key, value) => {
    set((s) => ({
      components: s.components.map((c) => c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c),
      saveStatus: "unsaved"
    }));
  },
  addConnection: (from, to) => {
    if (from.component === to.component && from.pin === to.pin) return;
    const exists = get().connections.some(
      (c) => c.fromComponent === from.component && c.fromPin === from.pin && c.toComponent === to.component && c.toPin === to.pin || c.fromComponent === to.component && c.fromPin === to.pin && c.toComponent === from.component && c.toPin === from.pin
    );
    if (exists) return;
    get().pushHistory("Add connection");
    const conn = {
      id: uid(),
      fromComponent: from.component,
      fromPin: from.pin,
      toComponent: to.component,
      toPin: to.pin
    };
    set((s) => ({ connections: [...s.connections, conn], saveStatus: "unsaved" }));
  },
  removeConnection: (id) => {
    get().pushHistory("Remove connection");
    set((s) => ({
      connections: s.connections.filter((c) => c.id !== id),
      saveStatus: "unsaved"
    }));
  },
  selectComponent: (id) => set({ selectedIds: id ? [id] : [] }),
  toggleSelect: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((sid) => sid !== id) : [...s.selectedIds, id]
  })),
  selectMany: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  updateCode: (index, content) => {
    set((s) => ({
      code: s.code.map((f, i) => i === index ? { ...f, content } : f),
      saveStatus: "unsaved"
    }));
  },
  addCodeFile: (name) => {
    set((s) => ({ code: [...s.code, { name, language: "cpp", content: "" }], saveStatus: "unsaved" }));
  },
  pushHistory: (label) => {
    const { components, connections, code } = get();
    set((s) => ({
      undoStack: [...s.undoStack.slice(-49), { components: [...components], connections: [...connections], code: [...code], label, timestamp: Date.now() }],
      redoStack: []
    }));
  },
  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    const { components, connections, code } = get();
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, { components: [...components], connections: [...connections], code: [...code], label: entry.label, timestamp: Date.now() }],
      components: entry.components,
      connections: entry.connections,
      code: entry.code,
      saveStatus: "unsaved"
    }));
  },
  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    const { components, connections, code } = get();
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, { components: [...components], connections: [...connections], code: [...code], label: entry.label, timestamp: Date.now() }],
      components: entry.components,
      connections: entry.connections,
      code: entry.code,
      saveStatus: "unsaved"
    }));
  },
  saveVersion: (name) => {
    const { components, connections, code, versions } = get();
    const version = {
      id: uid(),
      projectId: get().projectId || "local",
      name,
      data: { components, connections, code, simulation: { running: false, speed: 1 } },
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    set({ versions: [...versions, version] });
  },
  restoreVersion: (versionId) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (!version) return;
    get().pushHistory("Restore version");
    set({
      components: version.data.components,
      connections: version.data.connections,
      code: version.data.code,
      saveStatus: "unsaved"
    });
  },
  setSaveStatus: (status) => set({ saveStatus: status }),
  getProjectData: () => {
    const { components, connections, code } = get();
    return { components, connections, code, simulation: { running: false, speed: 1 } };
  },
  setProjectData: (data) => {
    set({
      components: data.components || [],
      connections: data.connections || [],
      code: data.code || defaultCode(),
      saveStatus: "unsaved"
    });
  }
}));
export {
  useProjectStore
};

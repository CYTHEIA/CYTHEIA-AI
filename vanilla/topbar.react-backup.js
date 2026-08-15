import {
  Undo2,
  Redo2,
  Play,
  Pause,
  Square,
  Save,
  Share,
  Settings,
  PanelLeft,
  PanelRight,
  PanelBottom,
  ChevronDown,
  Check,
  Loader,
  Circle
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { useSimulationStore } from "@/store/simulationStore";
import { updateProject, createProject } from "@/services/persistence";
import { useEffect, useRef, useState } from "react";
import { NextelLogo } from "@/pages/LandingPage";
function TopBar() {
  const setView = useUIStore((s) => s.setView);
  const toggleLeft = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRight = useUIStore((s) => s.toggleRightSidebar);
  const toggleBottom = useUIStore((s) => s.toggleBottomPanel);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const addToast = useUIStore((s) => s.addToast);
  const projectName = useProjectStore((s) => s.projectName);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const saveStatus = useProjectStore((s) => s.saveStatus);
  const setSaveStatus = useProjectStore((s) => s.setSaveStatus);
  const getProjectData = useProjectStore((s) => s.getProjectData);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const undoStack = useProjectStore((s) => s.undoStack);
  const redoStack = useProjectStore((s) => s.redoStack);
  const projectId = useProjectStore((s) => s.projectId);
  const simRunning = useSimulationStore((s) => s.running);
  const simPaused = useSimulationStore((s) => s.paused);
  const simStart = useSimulationStore((s) => s.start);
  const simPause = useSimulationStore((s) => s.pause);
  const simResume = useSimulationStore((s) => s.resume);
  const simStop = useSimulationStore((s) => s.stop);
  const initEngine = useSimulationStore((s) => s.initEngine);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);
  const [showSettings, setShowSettings] = useState(false);
  const saveTimerRef = useRef(null);
  useEffect(() => {
    initEngine();
  }, [initEngine]);
  useEffect(() => {
    setNameInput(projectName);
  }, [projectName]);
  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const data = getProjectData();
        if (projectId) {
          await updateProject(projectId, { name: projectName, data });
        } else {
          const p = await createProject(projectName, "", data);
          useProjectStore.setState({ projectId: p.id });
        }
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
        addToast("Failed to save", "error");
      }
    }, 2e3);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [saveStatus]);
  async function handleSaveNow() {
    setSaveStatus("saving");
    try {
      const data = getProjectData();
      if (projectId) {
        await updateProject(projectId, { name: projectName, data });
      } else {
        const p = await createProject(projectName, "", data);
        useProjectStore.setState({ projectId: p.id });
      }
      setSaveStatus("saved");
      addToast("Project saved", "success");
    } catch {
      setSaveStatus("unsaved");
      addToast("Failed to save", "error");
    }
  }
  function handleShare() {
    const data = getProjectData();
    const json = JSON.stringify({ format: "nextel-ai-project", version: "1.0", project: { name: projectName }, data }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      addToast("Project JSON copied to clipboard", "success");
    }).catch(() => {
      addToast("Could not copy to clipboard", "error");
    });
  }
  return /* @__PURE__ */ React.createElement("div", { className: "h-14 bg-[#1a1a1e] border-b border-white/5 flex items-center justify-between px-3 gap-2 flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("landing"),
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors",
      title: "Home"
    },
    /* @__PURE__ */ React.createElement(NextelLogo, { size: 22 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggleLeft,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Toggle left panel"
    },
    /* @__PURE__ */ React.createElement(PanelLeft, { size: 16 })
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 ml-2" }, editingName ? /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: nameInput,
      onChange: (e) => setNameInput(e.target.value),
      onBlur: () => {
        setProjectName(nameInput || "Untitled");
        setEditingName(false);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          setProjectName(nameInput || "Untitled");
          setEditingName(false);
        }
      },
      autoFocus: true,
      className: "px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
    }
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditingName(true),
      className: "px-2 py-1 hover:bg-white/5 rounded text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
    },
    projectName,
    /* @__PURE__ */ React.createElement(ChevronDown, { size: 12, className: "text-gray-500" })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 text-xs text-gray-500 ml-1" }, saveStatus === "saved" && /* @__PURE__ */ React.createElement(Check, { size: 12, className: "text-emerald-400" }), saveStatus === "saving" && /* @__PURE__ */ React.createElement(Loader, { size: 12, className: "animate-spin" }), saveStatus === "unsaved" && /* @__PURE__ */ React.createElement(Circle, { size: 8, className: "fill-amber-400 text-amber-400" }), /* @__PURE__ */ React.createElement("span", null, saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: undo,
      disabled: undoStack.length === 0,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed",
      title: "Undo (Ctrl+Z)"
    },
    /* @__PURE__ */ React.createElement(Undo2, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: redo,
      disabled: redoStack.length === 0,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed",
      title: "Redo (Ctrl+Shift+Z)"
    },
    /* @__PURE__ */ React.createElement(Redo2, { size: 16 })
  ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-white/10 mx-1" }), !simRunning ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: simStart,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors",
      title: "Run simulation"
    },
    /* @__PURE__ */ React.createElement(Play, { size: 14, fill: "currentColor" }),
    " Run"
  ) : /* @__PURE__ */ React.createElement(React.Fragment, null, simPaused ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: simResume,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors",
      title: "Resume"
    },
    /* @__PURE__ */ React.createElement(Play, { size: 14, fill: "currentColor" }),
    " Resume"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: simPause,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors",
      title: "Pause"
    },
    /* @__PURE__ */ React.createElement(Pause, { size: 14, fill: "currentColor" }),
    " Pause"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: simStop,
      className: "flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors",
      title: "Stop"
    },
    /* @__PURE__ */ React.createElement(Square, { size: 14, fill: "currentColor" }),
    " Stop"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveNow,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Save (Ctrl+S)"
    },
    /* @__PURE__ */ React.createElement(Save, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleShare,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Share"
    },
    /* @__PURE__ */ React.createElement(Share, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowSettings(!showSettings),
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Settings"
    },
    /* @__PURE__ */ React.createElement(Settings, { size: 16 })
  ), /* @__PURE__ */ React.createElement("div", { className: "w-px h-6 bg-white/10 mx-1" }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggleCommandPalette,
      className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors",
      title: "Command palette (Ctrl+K)"
    },
    /* @__PURE__ */ React.createElement("span", null, "Search"),
    /* @__PURE__ */ React.createElement("kbd", { className: "px-1.5 py-0.5 bg-white/10 rounded text-[10px]" }, "\u2318K")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggleRight,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Toggle right panel"
    },
    /* @__PURE__ */ React.createElement(PanelRight, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggleBottom,
      className: "p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white",
      title: "Toggle bottom panel"
    },
    /* @__PURE__ */ React.createElement(PanelBottom, { size: 16 })
  )), showSettings && /* @__PURE__ */ React.createElement("div", { className: "absolute top-12 right-3 w-64 bg-[#2a2a2e] border border-white/10 rounded-xl shadow-2xl p-3 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-medium text-white mb-3" }, "Settings"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(SettingToggle, { label: "Show grid", store: "showGrid" }), /* @__PURE__ */ React.createElement(SettingToggle, { label: "Snap to grid", store: "snapToGrid" }), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-white/5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-gray-500 block mb-1" }, "Simulation speed"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0.25",
      max: "4",
      step: "0.25",
      value: useSimulationStore.getState().speed,
      onChange: (e) => useSimulationStore.getState().setSpeed(parseFloat(e.target.value)),
      className: "w-full accent-blue-500"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400" }, useSimulationStore.getState().speed, "x")))));
}
function SettingToggle({ label, store }) {
  const value = useUIStore((s) => s[store]);
  const toggle = useUIStore((s) => store === "showGrid" ? s.toggleGrid : s.toggleSnap);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggle,
      className: "flex items-center justify-between text-sm text-gray-300 hover:text-white transition-colors"
    },
    label,
    /* @__PURE__ */ React.createElement("div", { className: `w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-500" : "bg-white/10"}` }, /* @__PURE__ */ React.createElement("div", { className: `w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${value ? "translate-x-4" : ""}` }))
  );
}
export {
  TopBar
};

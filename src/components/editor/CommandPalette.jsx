import { useState, useEffect, useRef } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { useSimulationStore } from "@/store/simulationStore";
import { COMPONENT_LIBRARY } from "@/components/library";
function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setView = useUIStore((s) => s.setView);
  const setBottomTab = useUIStore((s) => s.setBottomPanelTab);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const addToast = useUIStore((s) => s.addToast);
  const addComponent = useProjectStore((s) => s.addComponent);
  const newProject = useProjectStore((s) => s.newProject);
  const simStart = useSimulationStore((s) => s.start);
  const simStop = useSimulationStore((s) => s.stop);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  if (!open) return null;
  const commands = [
    ...COMPONENT_LIBRARY.slice(0, 12).map((comp) => ({
      id: `add-${comp.type}`,
      label: `Add ${comp.label}`,
      category: "Components",
      keywords: comp.keywords,
      action: () => {
        addComponent(comp.type, 400, 300);
        addToast(`Added ${comp.label}`, "success");
        setOpen(false);
      }
    })),
    {
      id: "new-project",
      label: "New Project",
      category: "Project",
      action: () => {
        newProject("Untitled Project");
        setView("editor");
        setOpen(false);
      }
    },
    {
      id: "open-dashboard",
      label: "Open Dashboard",
      category: "Project",
      action: () => {
        setView("dashboard");
        setOpen(false);
      }
    },
    {
      id: "run-sim",
      label: "Run Simulation",
      category: "Simulation",
      action: () => {
        simStart();
        setOpen(false);
      }
    },
    {
      id: "stop-sim",
      label: "Stop Simulation",
      category: "Simulation",
      action: () => {
        simStop();
        setOpen(false);
      }
    },
    {
      id: "open-serial",
      label: "Open Serial Monitor",
      category: "View",
      action: () => {
        setBottomTab("serial");
        setOpen(false);
      }
    },
    {
      id: "open-code",
      label: "Open Code Editor",
      category: "View",
      action: () => {
        setBottomTab("code");
        setOpen(false);
      }
    },
    {
      id: "open-ai",
      label: "Open Nextel AI Assistant",
      category: "View",
      action: () => {
        setBottomTab("ai");
        setOpen(false);
      }
    },
    {
      id: "open-console",
      label: "Open Console",
      category: "View",
      action: () => {
        setBottomTab("console");
        setOpen(false);
      }
    },
    {
      id: "toggle-grid",
      label: "Toggle Grid",
      category: "Canvas",
      action: () => {
        toggleGrid();
        setOpen(false);
      }
    }
  ];
  const filtered = commands.filter((cmd) => {
    const q = search.toLowerCase();
    return cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q) || cmd.keywords?.some((k) => k.includes(q));
  });
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});
  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }
  let flatIndex = 0;
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4", onClick: () => setOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm" }), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full max-w-xl bg-[#2a2a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden",
      onClick: (e) => e.stopPropagation()
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-white/5" }, /* @__PURE__ */ React.createElement(Search, { size: 18, className: "text-gray-500" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        type: "text",
        value: search,
        onChange: (e) => {
          setSearch(e.target.value);
          setSelectedIndex(0);
        },
        onKeyDown: handleKeyDown,
        placeholder: "Search commands...",
        className: "flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
      }
    ), /* @__PURE__ */ React.createElement("kbd", { className: "px-1.5 py-0.5 bg-white/10 rounded text-xs text-gray-400" }, "Esc")),
    /* @__PURE__ */ React.createElement("div", { className: "max-h-[50vh] overflow-y-auto p-2" }, Object.entries(grouped).map(([category, cmds]) => /* @__PURE__ */ React.createElement("div", { key: category, className: "mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-500 font-medium uppercase tracking-wide px-2 py-1" }, category), cmds.map((cmd) => {
      const idx = flatIndex++;
      const selected = idx === selectedIndex;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: cmd.id,
          onClick: cmd.action,
          onMouseEnter: () => setSelectedIndex(idx),
          className: `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selected ? "bg-blue-500/20 text-white" : "text-gray-300 hover:bg-white/5"}`
        },
        cmd.label,
        selected && /* @__PURE__ */ React.createElement(CornerDownLeft, { size: 14, className: "text-blue-400" })
      );
    }))), filtered.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-center py-8 text-sm text-gray-500" }, "No commands found"))
  ));
}
export {
  CommandPalette
};

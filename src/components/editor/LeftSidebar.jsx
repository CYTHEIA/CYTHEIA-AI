import React from "react";
import { useState, useEffect } from "react";
import {
  Folder,
  Clock,
  Cpu,
  Layout,
  Star,
  History,
  Search,
  ChevronRight,
  CreditCard
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { CATEGORIES, searchComponents } from "@/components/library";
import { fetchProjects, fetchTemplates, fetchVersions, createProject } from "@/services/persistence";
const TABS = [
  { id: "projects", label: "Projects", icon: Folder },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "components", label: "Components", icon: Cpu },
  { id: "templates", label: "Templates", icon: Layout },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "history", label: "History", icon: History },
  { id: "plans", label: "Plans", icon: CreditCard }
];
function LeftSidebar() {
  const tab = useUIStore((s) => s.leftSidebarTab);
  const setTab = useUIStore((s) => s.setLeftSidebarTab);
  const open = useUIStore((s) => s.leftSidebarOpen);
  if (!open) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "w-64 bg-[#1a1a1e] border-r border-white/5 flex flex-col h-full" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-0.5 p-2 border-b border-white/5" }, TABS.map((t) => {
    const Icon = t.icon;
    const active = tab === t.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id,
        onClick: () => setTab(t.id),
        className: `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${active ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 15 }),
      t.label
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto" }, tab === "components" && /* @__PURE__ */ React.createElement(ComponentsTab, null), tab === "projects" && /* @__PURE__ */ React.createElement(ProjectsTab, null), tab === "recent" && /* @__PURE__ */ React.createElement(RecentTab, null), tab === "templates" && /* @__PURE__ */ React.createElement(TemplatesTab, null), tab === "favorites" && /* @__PURE__ */ React.createElement(FavoritesTab, null), tab === "history" && /* @__PURE__ */ React.createElement(HistoryTab, null), tab === "plans" && /* @__PURE__ */ React.createElement(PlansSidebarTab, null), "      "));
}
function ComponentsTab() {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState(/* @__PURE__ */ new Set(["Microcontrollers", "Basic"]));
  const setDraggingComponent = useUIStore((s) => s.setDraggingComponent);
  const results = searchComponents(search);
  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    items: results.filter((c) => c.category === cat)
  })).filter((c) => c.items.length > 0);
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col h-full" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search components...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-2" }, byCategory.map(({ category, items }) => {
    const expanded = expandedCats.has(category);
    return /* @__PURE__ */ React.createElement("div", { key: category, className: "mb-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const next = new Set(expandedCats);
          if (expanded) next.delete(category);
          else next.add(category);
          setExpandedCats(next);
        },
        className: "w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      },
      /* @__PURE__ */ React.createElement("span", { className: "font-medium uppercase tracking-wide" }, category),
      /* @__PURE__ */ React.createElement(ChevronRight, { size: 12, className: `transition-transform ${expanded ? "rotate-90" : ""}` })
    ), expanded && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-0.5 mt-0.5" }, items.map((comp) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: comp.type,
        draggable: true,
        onDragStart: (e) => {
          e.dataTransfer.setData("component-type", comp.type);
          e.dataTransfer.effectAllowed = "copy";
        },
        onClick: () => {
          setDraggingComponent(comp.type);
        },
        className: "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-grab active:cursor-grabbing transition-all group"
      },
      /* @__PURE__ */ React.createElement(ComponentMiniIcon, { type: comp.type }),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "truncate" }, comp.label), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-600 truncate" }, comp.description.slice(0, 40)))
    ))));
  })));
}
function ComponentMiniIcon({ type }) {
  const colors = {
    "arduino-uno": "#2d7a4a",
    "arduino-nano": "#2d7a4a",
    "raspberry-pi-pico": "#1d6fb8",
    esp32: "#1a1a1a",
    led: "#ff3b30",
    "rgb-led": "#0a84ff",
    resistor: "#d4a574",
    capacitor: "#86868b",
    "push-button": "#0a84ff",
    switch: "#30d158",
    potentiometer: "#86868b",
    buzzer: "#86868b",
    "dc-motor": "#86868b",
    servo: "#86868b",
    relay: "#86868b",
    "lcd-16x2": "#1a6b3a",
    oled: "#0a0a0a",
    "seven-segment": "#ff3b30",
    "led-matrix": "#30d158",
    "temp-sensor": "#86868b",
    "light-sensor": "#ffd60a",
    "ultrasonic-sensor": "#1a5c9e",
    "pir-sensor": "#ff3b30",
    "ir-sensor": "#1a5c9e",
    battery: "#86868b",
    "power-5v": "#ff453a",
    "power-3v3": "#ff9f0a",
    gnd: "#86868b"
  };
  const color = colors[type] || "#3a3a3c";
  return /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", style: { background: `${color}20` } }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 rounded-sm", style: { background: color } }));
}
function ProjectsTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const newProject = useProjectStore((s) => s.newProject);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "p-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        newProject("Untitled Project");
        setView("editor");
      },
      className: "w-full px-3 py-2 mb-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors"
    },
    "+ New Project"
  ), loading ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 text-center py-4" }, "Loading...") : projects.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 text-center py-4" }, "No projects yet") : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1" }, projects.map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.id,
      onClick: () => {
        loadProject(p);
        setView("editor");
      },
      className: "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
    },
    /* @__PURE__ */ React.createElement(Folder, { size: 14, className: "flex-shrink-0 text-gray-500" }),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "truncate" }, p.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-600" }, new Date(p.updatedAt).toLocaleDateString()))
  ))));
}
function RecentTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {
    });
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mb-2 uppercase tracking-wide" }, "Recently opened"), projects.slice(0, 10).map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.id,
      onClick: () => {
        loadProject(p);
        setView("editor");
      },
      className: "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
    },
    /* @__PURE__ */ React.createElement(Clock, { size: 14, className: "flex-shrink-0 text-gray-500" }),
    /* @__PURE__ */ React.createElement("span", { className: "truncate" }, p.name)
  )));
}
function TemplatesTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const addToast = useUIStore((s) => s.addToast);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "p-3" }, loading ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 text-center py-4" }, "Loading...") : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1" }, templates.map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t.id,
      onClick: async () => {
        try {
          const p = await createProject(t.name, t.description ?? "", t.data);
          loadProject(p);
          setView("editor");
          addToast(`Created "${p.name}" from template`, "success");
        } catch {
          addToast("Failed to create from template", "error");
        }
      },
      className: "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
    },
    /* @__PURE__ */ React.createElement(Layout, { size: 14, className: "flex-shrink-0 text-gray-500" }),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "truncate" }, t.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-600 truncate" }, t.description))
  ))));
}
function FavoritesTab() {
  return /* @__PURE__ */ React.createElement("div", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React.createElement(Star, { size: 28, className: "text-gray-700 mx-auto mb-2" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500" }, "No favorites yet"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, "Star components to find them quickly")));
}
function HistoryTab() {
  const projectId = useProjectStore((s) => s.projectId);
  const restoreVersion = useProjectStore((s) => s.restoreVersion);
  const saveVersion = useProjectStore((s) => s.saveVersion);
  const versions = useProjectStore((s) => s.versions);
  const [dbVersions, setDbVersions] = useState([]);
  useEffect(() => {
    if (projectId) {
      fetchVersions(projectId).then(setDbVersions).catch(() => {
      });
    }
  }, [projectId]);
  const allVersions = [...dbVersions, ...versions];
  return /* @__PURE__ */ React.createElement("div", { className: "p-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => saveVersion(`Version ${allVersions.length + 1}`),
      className: "w-full px-3 py-2 mb-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors"
    },
    "Save Version"
  ), allVersions.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 text-center py-4" }, "No saved versions") : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1" }, allVersions.map((v) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: v.id,
      onClick: () => restoreVersion(v.id),
      className: "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
    },
    /* @__PURE__ */ React.createElement(History, { size: 14, className: "flex-shrink-0 text-gray-500" }),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "truncate" }, v.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-600" }, new Date(v.createdAt).toLocaleString()))
  ))));
}
function PlansSidebarTab() {
  const setView = useUIStore((s) => s.setView);
  return /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400 mb-3" }, "Manage your CYTHEIA plan and features."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("plans"),
      className: "w-full px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
    },
    "View Plans"
  ));
}
export {
  LeftSidebar
};

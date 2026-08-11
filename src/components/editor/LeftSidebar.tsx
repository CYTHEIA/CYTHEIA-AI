import { useState, useEffect } from 'react';
import {
  Folder, Clock, Cpu, Layout, Star, History, Search, ChevronRight, CreditCard,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { COMPONENT_LIBRARY, CATEGORIES, searchComponents } from '@/components/library';
import { fetchProjects, fetchTemplates, fetchVersions, createProject } from '@/services/persistence';
import type { Project, ProjectVersion } from '@/types';

const TABS = [
  { id: 'projects' as const, label: 'Projects', icon: Folder },
  { id: 'recent' as const, label: 'Recent', icon: Clock },
  { id: 'components' as const, label: 'Components', icon: Cpu },
  { id: 'templates' as const, label: 'Templates', icon: Layout },
  { id: 'favorites' as const, label: 'Favorites', icon: Star },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'plans' as const, label: 'Plans', icon: CreditCard },
];

export function LeftSidebar() {
  const tab = useUIStore((s) => s.leftSidebarTab);
  const setTab = useUIStore((s) => s.setLeftSidebarTab);
  const setView = useUIStore((s) => s.setView);
  const open = useUIStore((s) => s.leftSidebarOpen);

  if (!open) return null;

  return (
    <div className="w-64 bg-[#1a1a1e] border-r border-white/5 flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex flex-col gap-0.5 p-2 border-b border-white/5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === 'plans') {
                  setView('plans');
                  return;
                }
                setTab(t.id);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'components' && <ComponentsTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'recent' && <RecentTab />}
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}

function ComponentsTab() {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['Microcontrollers', 'Basic']));
  const setDraggingComponent = useUIStore((s) => s.setDraggingComponent);
  const addToast = useUIStore((s) => s.addToast);

  const results = searchComponents(search);
  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    items: results.filter((c) => c.category === cat),
  })).filter((c) => c.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {byCategory.map(({ category, items }) => {
          const expanded = expandedCats.has(category);
          return (
            <div key={category} className="mb-1">
              <button
                onClick={() => {
                  const next = new Set(expandedCats);
                  if (expanded) next.delete(category);
                  else next.add(category);
                  setExpandedCats(next);
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="font-medium uppercase tracking-wide">{category}</span>
                <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
              {expanded && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {items.map((comp) => (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('component-type', comp.type);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => {
                        setDraggingComponent(comp.type);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-grab active:cursor-grabbing transition-all group"
                    >
                      <ComponentMiniIcon type={comp.type} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{comp.label}</div>
                        <div className="text-xs text-gray-600 truncate">{comp.description.slice(0, 40)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComponentMiniIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'arduino-uno': '#2d7a4a',
    'arduino-nano': '#2d7a4a',
    'raspberry-pi-pico': '#1d6fb8',
    esp32: '#1a1a1a',
    led: '#ff3b30',
    'rgb-led': '#0a84ff',
    resistor: '#d4a574',
    capacitor: '#86868b',
    'push-button': '#0a84ff',
    switch: '#30d158',
    potentiometer: '#86868b',
    buzzer: '#86868b',
    'dc-motor': '#86868b',
    servo: '#86868b',
    relay: '#86868b',
    'lcd-16x2': '#1a6b3a',
    oled: '#0a0a0a',
    'seven-segment': '#ff3b30',
    'led-matrix': '#30d158',
    'temp-sensor': '#86868b',
    'light-sensor': '#ffd60a',
    'ultrasonic-sensor': '#1a5c9e',
    'pir-sensor': '#ff3b30',
    'ir-sensor': '#1a5c9e',
    battery: '#86868b',
    'power-5v': '#ff453a',
    'power-3v3': '#ff9f0a',
    gnd: '#86868b',
  };
  const color = colors[type] || '#3a3a3c';
  return (
    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
      <div className="w-4 h-4 rounded-sm" style={{ background: color }} />
    </div>
  );
}

function ProjectsTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const newProject = useProjectStore((s) => s.newProject);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-3">
      <button
        onClick={() => {
          newProject('Untitled Project');
          setView('editor');
        }}
        className="w-full px-3 py-2 mb-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors"
      >
        + New Project
      </button>
      {loading ? (
        <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">No projects yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                loadProject(p);
                setView('editor');
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
            >
              <Folder size={14} className="flex-shrink-0 text-gray-500" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{p.name}</div>
                <div className="text-xs text-gray-600">{new Date(p.updatedAt).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
  }, []);

  return (
    <div className="p-3">
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Recently opened</p>
      {projects.slice(0, 10).map((p) => (
        <button
          key={p.id}
          onClick={() => {
            loadProject(p);
            setView('editor');
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
        >
          <Clock size={14} className="flex-shrink-0 text-gray-500" />
          <span className="truncate">{p.name}</span>
        </button>
      ))}
    </div>
  );
}

function TemplatesTab() {
  const setView = useUIStore((s) => s.setView);
  const loadProject = useProjectStore((s) => s.loadProject);
  const addToast = useUIStore((s) => s.addToast);
  const [templates, setTemplates] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-3">
      {loading ? (
        <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
      ) : (
        <div className="flex flex-col gap-1">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={async () => {
                try {
                  const p = await createProject(t.name, t.description || '', t.data);
                  loadProject(p);
                  setView('editor');
                  addToast(`Created "${p.name}" from template`, 'success');
                } catch {
                  addToast('Failed to create from template', 'error');
                }
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
            >
              <Layout size={14} className="flex-shrink-0 text-gray-500" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{t.name}</div>
                <div className="text-xs text-gray-600 truncate">{t.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FavoritesTab() {
  return (
    <div className="p-3">
      <div className="text-center py-8">
        <Star size={28} className="text-gray-700 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No favorites yet</p>
        <p className="text-xs text-gray-600 mt-1">Star components to find them quickly</p>
      </div>
    </div>
  );
}

function HistoryTab() {
  const projectId = useProjectStore((s) => s.projectId);
  const restoreVersion = useProjectStore((s) => s.restoreVersion);
  const saveVersion = useProjectStore((s) => s.saveVersion);
  const versions = useProjectStore((s) => s.versions);
  const [dbVersions, setDbVersions] = useState<ProjectVersion[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchVersions(projectId).then(setDbVersions).catch(() => {});
    }
  }, [projectId]);

  const allVersions = [...dbVersions, ...versions];

  return (
    <div className="p-3">
      <button
        onClick={() => saveVersion(`Version ${allVersions.length + 1}`)}
        className="w-full px-3 py-2 mb-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors"
      >
        Save Version
      </button>
      {allVersions.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">No saved versions</p>
      ) : (
        <div className="flex flex-col gap-1">
          {allVersions.map((v) => (
            <button
              key={v.id}
              onClick={() => restoreVersion(v.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left"
            >
              <History size={14} className="flex-shrink-0 text-gray-500" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{v.name}</div>
                <div className="text-xs text-gray-600">{new Date(v.createdAt).toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

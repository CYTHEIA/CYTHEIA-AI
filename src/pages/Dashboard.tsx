import { useEffect, useState } from 'react';
import { Plus, Search, Clock, Trash2, Copy, Download, Upload, Cpu, ArrowLeft, Folder } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { fetchProjects, fetchTemplates, createProject, deleteProject, duplicateProject, ensureTemplates } from '@/services/persistence';
import { importProject, exportProject } from '@/services/persistence';
import type { Project } from '@/types';
import { NextelLogo } from './LandingPage';

export function Dashboard() {
  const setView = useUIStore((s) => s.setView);
  const addToast = useUIStore((s) => s.addToast);
  const newProject = useProjectStore((s) => s.newProject);
  const loadProject = useProjectStore((s) => s.loadProject);

  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'projects' | 'templates'>('projects');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      await ensureTemplates();
      const [p, t] = await Promise.all([fetchProjects(), fetchTemplates()]);
      setProjects(p);
      setTemplates(t);
    } catch (e) {
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleNewProject() {
    newProject('Untitled Project');
    setView('editor');
  }

  async function handleOpenProject(project: Project) {
    loadProject(project);
    setView('editor');
  }

  async function handleNewFromTemplate(template: Project) {
    try {
const p = await createProject(template.name, template.description ?? '', template.data);      loadProject(p);
      setView('editor');
      addToast(`Created "${p.name}"`, 'success');
    } catch {
      addToast('Failed to create project from template', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      setProjects((p) => p.filter((proj) => proj.id !== id));
      addToast('Project deleted', 'success');
    } catch {
      addToast('Failed to delete project', 'error');
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const dup = await duplicateProject(id);
      if (dup) {
        await load();
        addToast('Project duplicated', 'success');
      }
    } catch {
      addToast('Failed to duplicate project', 'error');
    }
  }

  function handleExport(project: Project) {
    const json = exportProject(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.nextel.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = importProject(text);
    if (!parsed) {
      addToast('Invalid project file', 'error');
      return;
    }
    try {
      const p = await createProject(parsed.name, parsed.description, parsed.data);
      await load();
      addToast(`Imported "${p.name}"`, 'success');
    } catch {
      addToast('Failed to import project', 'error');
    }
  }

  const filtered = (tab === 'projects' ? projects : templates).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('landing')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <NextelLogo size={28} />
          <span className="text-lg font-semibold tracking-tight">Nextel AI</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2">
            <Upload size={15} /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'projects' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Folder size={15} /> My Projects
          </button>
          <button
            onClick={() => setTab('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'templates' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Cpu size={15} /> Templates
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {tab === 'projects' ? <Folder size={28} className="text-gray-600" /> : <Cpu size={28} className="text-gray-600" />}
            </div>
            <p className="text-gray-400 mb-2">{tab === 'projects' ? 'No projects yet' : 'No templates found'}</p>
            <p className="text-sm text-gray-500">
              {tab === 'projects' ? 'Create a new project or start from a template.' : 'Templates will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tab === 'projects' && (
              <button
                onClick={handleNewProject}
                className="aspect-video bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/[0.05] hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">Blank project</span>
              </button>
            )}
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isTemplate={project.isTemplate}
                onOpen={() => (project.isTemplate ? handleNewFromTemplate(project) : handleOpenProject(project))}
                onDelete={() => handleDelete(project.id)}
                onDuplicate={() => handleDuplicate(project.id)}
                onExport={() => handleExport(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  isTemplate,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
}: {
  project: Project;
  isTemplate: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
}) {
  const compCount = project.data.components?.length || 0;
  const connCount = project.data.connections?.length || 0;

  return (
    <div className="group bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
      {/* Preview */}
      <button onClick={onOpen} className="w-full aspect-video bg-gradient-to-br from-blue-500/5 to-emerald-500/5 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <rect width="200" height="120" fill="none" />
            {project.data.components?.slice(0, 5).map((c, i) => (
              <rect key={c.id} x={20 + i * 30} y={30 + (i % 2) * 40} width="20" height="20" rx="3" fill="rgba(255,255,255,0.15)" />
            ))}
            {project.data.connections?.slice(0, 4).map((c, i) => (
              <line key={c.id} x1={40 + i * 30} y1={40 + (i % 2) * 40} x2={50 + i * 30} y2={70 + (i % 2) * 40} stroke="rgba(255,214,10,0.3)" strokeWidth="1" />
            ))}
          </svg>
        </div>
        <div className="relative z-10 text-center">
          {isTemplate ? (
            <Cpu size={32} className="text-blue-400/50" />
          ) : (
            <Folder size={32} className="text-gray-600" />
          )}
        </div>
      </button>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 truncate">{project.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{project.description || 'No description'}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Cpu size={12} /> {compCount}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          {!isTemplate && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onDuplicate} className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Duplicate">
                <Copy size={14} className="text-gray-400" />
              </button>
              <button onClick={onExport} className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Export">
                <Download size={14} className="text-gray-400" />
              </button>
              <button onClick={onDelete} className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors" title="Delete">
                <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

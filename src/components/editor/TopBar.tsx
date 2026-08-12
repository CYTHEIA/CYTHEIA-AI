import Undo2 from 'lucide-react/dist/esm/icons/undo-2.js';
import Redo2 from 'lucide-react/dist/esm/icons/redo-2.js';
import Play from 'lucide-react/dist/esm/icons/play.js';
import Pause from 'lucide-react/dist/esm/icons/pause.js';
import Square from 'lucide-react/dist/esm/icons/square.js';
import Save from 'lucide-react/dist/esm/icons/save.js';
import Share from 'lucide-react/dist/esm/icons/share.js';
import Settings from 'lucide-react/dist/esm/icons/settings.js';
import PanelLeft from 'lucide-react/dist/esm/icons/panel-left.js';
import PanelRight from 'lucide-react/dist/esm/icons/panel-right.js';
import PanelBottom from 'lucide-react/dist/esm/icons/panel-bottom.js';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.js';
import Check from 'lucide-react/dist/esm/icons/check.js';
import Loader from 'lucide-react/dist/esm/icons/loader.js';
import Circle from 'lucide-react/dist/esm/icons/circle.js';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useSubscriptionStore, PLANS, PLAN_LIMITS } from '@/store/subscriptionStore';
import { updateProject, createProject } from '@/services/persistence';
import { useEffect, useRef, useState } from 'react';
import { NextelLogo } from '@/pages/LandingPage';

export function TopBar() {
  const setView = useUIStore((s) => s.setView);
  const toggleLeft = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRight = useUIStore((s) => s.toggleRightSidebar);
  const toggleBottom = useUIStore((s) => s.toggleBottomPanel);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const addToast = useUIStore((s) => s.addToast);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const usage = useSubscriptionStore((s) => s.usage);

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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plan = PLANS.find((item) => item.id === currentPlan) ?? PLANS[0];
  const limits = PLAN_LIMITS[currentPlan];

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  useEffect(() => {
    setNameInput(projectName);
  }, [projectName]);

  // Autosave
  useEffect(() => {
    if (saveStatus !== 'unsaved') return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const data = getProjectData();
        if (projectId) {
          await updateProject(projectId, { name: projectName, data });
        } else {
          const p = await createProject(projectName, '', data);
          useProjectStore.setState({ projectId: p.id });
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
        addToast('Failed to save', 'error');
      }
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [saveStatus]);

  async function handleSaveNow() {
    setSaveStatus('saving');
    try {
      const data = getProjectData();
      if (projectId) {
        await updateProject(projectId, { name: projectName, data });
      } else {
        const p = await createProject(projectName, '', data);
        useProjectStore.setState({ projectId: p.id });
      }
      setSaveStatus('saved');
      addToast('Project saved', 'success');
    } catch {
      setSaveStatus('unsaved');
      addToast('Failed to save', 'error');
    }
  }

  function handleShare() {
    const data = getProjectData();
    const json = JSON.stringify({ format: 'nextel-ai-project', version: '1.0', project: { name: projectName }, data }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      addToast('Project JSON copied to clipboard', 'success');
    }).catch(() => {
      addToast('Could not copy to clipboard', 'error');
    });
  }

  return (
    <div className="h-14 bg-[#1a1a1e] border-b border-white/5 flex items-center justify-between px-3 gap-2 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('landing')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Home"
        >
          <NextelLogo size={22} />
        </button>
        <button
          onClick={toggleLeft}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Toggle left panel"
        >
          <PanelLeft size={16} />
        </button>

        {/* Project name */}
        <div className="flex items-center gap-2 ml-2">
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => {
                setProjectName(nameInput || 'Untitled');
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setProjectName(nameInput || 'Untitled');
                  setEditingName(false);
                }
              }}
              autoFocus
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="px-2 py-1 hover:bg-white/5 rounded text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            >
              {projectName}
              <ChevronDown size={12} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
          {saveStatus === 'saved' && <Check size={12} className="text-emerald-400" />}
          {saveStatus === 'saving' && <Loader size={12} className="animate-spin" />}
          {saveStatus === 'unsaved' && <Circle size={8} className="fill-amber-400 text-amber-400" />}
          <span>{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}</span>
        </div>
      </div>

      {/* Center: simulation controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {!simRunning ? (
          <button
            onClick={simStart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors"
            title="Run simulation"
          >
            <Play size={14} fill="currentColor" /> Run
          </button>
        ) : (
          <>
            {simPaused ? (
              <button
                onClick={simResume}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
                title="Resume"
              >
                <Play size={14} fill="currentColor" /> Resume
              </button>
            ) : (
              <button
                onClick={simPause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors"
                title="Pause"
              >
                <Pause size={14} fill="currentColor" /> Pause
              </button>
            )}
            <button
              onClick={simStop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
              title="Stop"
            >
              <Square size={14} fill="currentColor" /> Stop
            </button>
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSaveNow}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Save (Ctrl+S)"
        >
          <Save size={16} />
        </button>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Share"
        >
          <Share size={16} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          onClick={toggleCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
          title="Command palette (Ctrl+K)"
        >
          <span>Search</span>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={toggleRight}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Toggle right panel"
        >
          <PanelRight size={16} />
        </button>
        <button
          onClick={toggleBottom}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Toggle bottom panel"
        >
          <PanelBottom size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-12 right-3 w-72 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#2a2a2e] border border-white/10 rounded-xl shadow-2xl p-3 z-50">
          <div className="text-sm font-medium text-white mb-3">Settings</div>
          <div className="flex flex-col gap-2">
            <SettingToggle label="Show grid" store="showGrid" />
            <SettingToggle label="Snap to grid" store="snapToGrid" />
            <div className="pt-2 border-t border-white/5">
              <label className="text-xs text-gray-500 block mb-1">Simulation speed</label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={useSimulationStore.getState().speed}
                onChange={(e) => useSimulationStore.getState().setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-xs text-gray-400">{useSimulationStore.getState().speed}x</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Current plan</div>
                <div className="text-sm font-semibold text-white mt-1">{plan.name}</div>
                <div className="text-xs text-gray-400 mt-1">{plan.description}</div>
              </div>
              <button
                onClick={() => setView('plans')}
                className="flex-shrink-0 px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-lg text-xs transition-colors"
              >
                View plans
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500">AI usage</div>
                <div className="text-gray-200 mt-1">{usage.aiQueriesUsed} / {usage.aiQueriesLimit ?? 'Unlimited'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500">Projects</div>
                <div className="text-gray-200 mt-1">{usage.projectsUsed} / {usage.projectsLimit ?? 'Unlimited'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500">Storage</div>
                <div className="text-gray-200 mt-1">{usage.storageUsedMB} / {usage.storageLimitMB ?? 'Unlimited'} MB</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500">Features</div>
                <div className="text-gray-200 mt-1">{limits.aiDebugging} debugging</div>
              </div>
              <div className="col-span-2 bg-white/5 rounded-lg p-2">
                <div className="text-gray-500">Available features</div>
                <div className="text-gray-300 mt-1 leading-relaxed">{plan.features.slice(0, 3).join(' · ')}</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">Usage shown is local demo data. Billing is not connected.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingToggle({ label, store }: { label: string; store: 'showGrid' | 'snapToGrid' }) {
  const value = useUIStore((s) => s[store]);
  const toggle = useUIStore((s) => (store === 'showGrid' ? s.toggleGrid : s.toggleSnap));
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between text-sm text-gray-300 hover:text-white transition-colors"
    >
      {label}
      <div className={`w-9 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${value ? 'translate-x-4' : ''}`} />
      </div>
    </button>
  );
}

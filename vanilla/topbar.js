import { 
  getState, 
  setProjectName, 
  undo, 
  redo,
  toggleLeftSidebar,
  toggleRightSidebar,
  toggleBottomPanel,
  toggleCommandPalette,
  setSaveStatus,
  getProjectData,
  startSimulation,
  stopSimulation,
  pauseSimulation,
  resumeSimulation,
  setView,
  addToast,
  toggleGrid,
  toggleSnap,
  setSimulationSpeed
} from './store.js';
import { updateProject, createProject } from './services/persistence.js';

export function createTopBar() {
  const container = document.createElement('div');
  container.className = 'h-14 bg-[#1a1a1e] border-b border-white/5 flex items-center justify-between px-3 gap-2 flex-shrink-0';
  
  // Left section
  const left = document.createElement('div');
  left.className = 'flex items-center gap-2';
  
  const homeBtn = document.createElement('button');
  homeBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors';
  homeBtn.textContent = '⌂';
  homeBtn.addEventListener('click', () => setView('landing'));
  left.appendChild(homeBtn);
  
  const toggleLeftBtn = document.createElement('button');
  toggleLeftBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  toggleLeftBtn.textContent = '⊢';
  toggleLeftBtn.addEventListener('click', toggleLeftSidebar);
  left.appendChild(toggleLeftBtn);
  
  // Project name
  const nameSection = document.createElement('div');
  nameSection.className = 'flex items-center gap-2 ml-2';
  
  const projectNameSpan = document.createElement('span');
  projectNameSpan.className = 'px-2 py-1 hover:bg-white/5 rounded text-sm text-gray-300 hover:text-white transition-colors cursor-pointer';
  projectNameSpan.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20';
    input.value = getState().project.projectName;
    input.addEventListener('blur', () => {
      setProjectName(input.value || 'Untitled');
      renderTopBar(container);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        setProjectName(input.value || 'Untitled');
        renderTopBar(container);
      }
    });
    nameSection.replaceChild(input, projectNameSpan);
    input.focus();
  });
  nameSection.appendChild(projectNameSpan);
  
  const saveStatusSpan = document.createElement('div');
  saveStatusSpan.className = 'flex items-center gap-1.5 text-xs text-gray-500';
  nameSection.appendChild(saveStatusSpan);
  
  left.appendChild(nameSection);
  container.appendChild(left);
  
  // Middle section - Controls
  const middle = document.createElement('div');
  middle.className = 'flex items-center gap-1';
  
  const undoBtn = document.createElement('button');
  undoBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  undoBtn.textContent = '↶';
  undoBtn.addEventListener('click', undo);
  middle.appendChild(undoBtn);
  
  const redoBtn = document.createElement('button');
  redoBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  redoBtn.textContent = '↷';
  redoBtn.addEventListener('click', redo);
  middle.appendChild(redoBtn);
  
  const sep1 = document.createElement('div');
  sep1.className = 'w-px h-6 bg-white/10 mx-1';
  middle.appendChild(sep1);
  
  const runBtn = document.createElement('button');
  runBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors';
  runBtn.textContent = '▶ Run';
  runBtn.addEventListener('click', startSimulation);
  middle.appendChild(runBtn);
  
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors';
  pauseBtn.textContent = '⏸ Pause';
  pauseBtn.addEventListener('click', pauseSimulation);
  middle.appendChild(pauseBtn);
  
  const stopBtn = document.createElement('button');
  stopBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors';
  stopBtn.textContent = '■ Stop';
  stopBtn.addEventListener('click', stopSimulation);
  middle.appendChild(stopBtn);
  
  container.appendChild(middle);
  
  // Right section
  const right = document.createElement('div');
  right.className = 'flex items-center gap-1 ml-auto';
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  saveBtn.textContent = '💾';
  saveBtn.addEventListener('click', async () => {
    setSaveStatus('saving');
    try {
      const state = getState();
      const data = getProjectData();
      if (state.project.projectId) {
        await updateProject(state.project.projectId, { name: state.project.projectName, data });
      } else {
        const p = await createProject(state.project.projectName, '', data);
        state.project.projectId = p.id;
      }
      setSaveStatus('saved');
      addToast('Project saved', 'success');
    } catch (e) {
      setSaveStatus('unsaved');
      addToast('Failed to save', 'error');
    }
  });
  right.appendChild(saveBtn);
  
  const sep2 = document.createElement('div');
  sep2.className = 'w-px h-6 bg-white/10 mx-1';
  right.appendChild(sep2);
  
  const cmdBtn = document.createElement('button');
  cmdBtn.className = 'flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors';
  cmdBtn.textContent = '⌘K';
  cmdBtn.addEventListener('click', toggleCommandPalette);
  right.appendChild(cmdBtn);
  
  const toggleRightBtn = document.createElement('button');
  toggleRightBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  toggleRightBtn.textContent = '⊣';
  toggleRightBtn.addEventListener('click', toggleRightSidebar);
  right.appendChild(toggleRightBtn);
  
  const toggleBottomBtn = document.createElement('button');
  toggleBottomBtn.className = 'p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white';
  toggleBottomBtn.textContent = '⊤';
  toggleBottomBtn.addEventListener('click', toggleBottomPanel);
  right.appendChild(toggleBottomBtn);
  
  container.appendChild(right);
  
  container.updateUI = () => {
    const state = getState();
    projectNameSpan.textContent = state.project.projectName;
    saveStatusSpan.textContent = state.project.saveStatus === 'saved' ? '✓ Saved' : state.project.saveStatus === 'saving' ? '⟳ Saving...' : '● Unsaved';
  };
  
  return container;
}

export function renderTopBar(container) {
  if (container.updateUI) {
    container.updateUI();
  }
}

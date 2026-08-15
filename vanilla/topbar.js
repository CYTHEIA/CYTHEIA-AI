import { 
  getState, 
  setProjectName, 
  undo, 
  redo,
  toggleLeftSidebar,
  toggleRightSidebar,
  toggleBottomPanel,
  toggleCommandPalette,
  togglePlansModal,
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
  setSimulationSpeed,
  getCurrentPlan
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
  
  // Account / Plans menu
  const accountMenu = createAccountMenu();
  right.appendChild(accountMenu);
  
  container.appendChild(right);
  
  container.updateUI = () => {
    const state = getState();
    projectNameSpan.textContent = state.project.projectName;
    saveStatusSpan.textContent = state.project.saveStatus === 'saved' ? '✓ Saved' : state.project.saveStatus === 'saving' ? '⟳ Saving...' : '● Unsaved';
    
    // Update account menu
    if (accountMenu.updateUI) {
      accountMenu.updateUI();
    }
  };
  
  function createAccountMenu() {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    
    const trigger = document.createElement('button');
    trigger.className = 'flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors';
    
    const currentPlan = getCurrentPlan();
    const planBadge = document.createElement('span');
    planBadge.className = 'ct-chip ct-chip-accent text-[10px]';
    planBadge.textContent = currentPlan.name;
    trigger.appendChild(planBadge);
    
    const chevron = document.createElement('span');
    chevron.textContent = '▾';
    chevron.className = 'text-[10px]';
    trigger.appendChild(chevron);
    
    let menu = null;
    
    const closeMenu = () => {
      if (menu) {
        menu.remove();
        menu = null;
      }
    };
    
    const openMenu = () => {
      closeMenu();
      
      menu = document.createElement('div');
      menu.className = 'ct-menu animate-in fade-in';
      menu.style.minWidth = '200px';
      
      const planId = getCurrentPlan().id;
      
      const items = [
        { 
          label: 'Plans', 
          icon: 'layers',
          onClick: () => {
            togglePlansModal();
            closeMenu();
          }
        },
        { type: 'divider' },
        { 
          label: planId === 'basic' ? 'Upgrade to Premium' : planId === 'premium' ? 'Switch to Postpaid' : 'Downgrade to Basic', 
          icon: 'arrow-up',
          onClick: () => {
            if (planId === 'basic') {
              import('./store.js').then(({ upgradeToPremium }) => { upgradeToPremium(); });
            } else if (planId === 'premium') {
              import('./store.js').then(({ selectPostpaid }) => { selectPostpaid(); });
            } else {
              import('./store.js').then(({ downgradeToBasic }) => { downgradeToBasic(); });
            }
            closeMenu();
          }
        },
        { 
          label: 'Usage', 
          icon: 'bar-chart',
          onClick: () => {
            togglePlansModal();
            closeMenu();
          }
        },
        { type: 'divider' },
        { 
          label: 'Settings', 
          icon: 'settings',
          onClick: () => {
            closeMenu();
            // TODO: open settings
          }
        }
      ];
      
      for (const item of items) {
        if (item.type === 'divider') {
          const divider = document.createElement('div');
          divider.className = 'h-px bg-[var(--ct-border)] my-1';
          menu.appendChild(divider);
          continue;
        }
        
        const btn = document.createElement('button');
        btn.className = 'ct-menu-item';
        btn.innerHTML = `<span>${item.label}</span>`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.onClick();
        });
        menu.appendChild(btn);
      }
      
      wrapper.appendChild(menu);
      
      // Close on outside click
      const closeHandler = (e) => {
        if (!wrapper.contains(e.target)) {
          closeMenu();
          document.removeEventListener('mousedown', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('mousedown', closeHandler), 0);
    };
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenu();
    });
    
    wrapper.appendChild(trigger);
    
    wrapper.updateUI = () => {
      const plan = getCurrentPlan();
      planBadge.textContent = plan.name;
      // Update trigger style based on plan
      trigger.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
        plan.id === 'basic' 
          ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' 
          : plan.id === 'premium' 
            ? 'bg-[var(--ct-accent)]/15 hover:bg-[var(--ct-accent)]/25 text-[var(--ct-accent)] border border-[var(--ct-accent)]/30' 
            : 'bg-[var(--ct-warn)]/15 hover:bg-[var(--ct-warn)]/25 text-[var(--ct-warn)] border border-[var(--ct-warn)]/30'
      }`;
    };
    
    return wrapper;
  }
  
  return container;
}

export function renderTopBar(container) {
  if (container.updateUI) {
    container.updateUI();
  }
}

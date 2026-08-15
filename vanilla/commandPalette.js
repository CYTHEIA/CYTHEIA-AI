import { 
  getState, 
  setCommandPaletteOpen, 
  togglePlansModal,
  undo, 
  redo,
  setSaveStatus,
  getProjectData,
  getCurrentPlan
} from './store.js';
import { updateProject, createProject } from './services/persistence.js';

export function createCommandPalette() {
  const container = document.createElement('div');
  container.className = 'hidden fixed inset-0 z-40';
  container.id = 'command-palette-overlay';
  
  const backdrop = document.createElement('div');
  backdrop.className = 'absolute inset-0 bg-black/50 backdrop-blur-sm';
  backdrop.addEventListener('click', () => setCommandPaletteOpen(false));
  
  const dialog = document.createElement('div');
  dialog.className = 'absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-[#1a1a1c] border border-white/10 rounded-lg shadow-2xl overflow-hidden';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'w-full px-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-gray-500 focus:outline-none';
  input.placeholder = 'Type a command...';
  
  const commands = document.createElement('div');
  commands.className = 'max-h-96 overflow-y-auto';
  
  const updateCommands = () => {
    const query = input.value.toLowerCase();
    commands.innerHTML = '';
    
    const allCommands = [
      { name: 'Save', desc: 'Save project', action: async () => {
        const state = getState();
        setSaveStatus('saving');
        try {
          const data = getProjectData();
          if (state.project.projectId) {
            await updateProject(state.project.projectId, { name: state.project.projectName, data });
          } else {
            const p = await createProject(state.project.projectName, '', data);
            state.project.projectId = p.id;
          }
          setSaveStatus('saved');
        } catch (e) {
          setSaveStatus('unsaved');
        }
        setCommandPaletteOpen(false);
      }},
      { name: 'Undo', desc: 'Undo last action', action: () => { undo(); setCommandPaletteOpen(false); }},
      { name: 'Redo', desc: 'Redo last action', action: () => { redo(); setCommandPaletteOpen(false); }},
      { type: 'divider' },
      { name: 'Plans', desc: 'View and change subscription plan', action: () => { togglePlansModal(); setCommandPaletteOpen(false); }},
      { name: 'Upgrade to Premium', desc: 'Upgrade to Premium plan', action: () => { 
        import('./store.js').then(({ upgradeToPremium }) => { upgradeToPremium(); setCommandPaletteOpen(false); });
      }},
      { name: 'Switch to Postpaid', desc: 'Switch to usage-based Postpaid plan', action: () => { 
        import('./store.js').then(({ selectPostpaid }) => { selectPostpaid(); setCommandPaletteOpen(false); });
      }},
      { name: 'Downgrade to Basic', desc: 'Downgrade to free Basic plan', action: () => { 
        import('./store.js').then(({ downgradeToBasic }) => { downgradeToBasic(); setCommandPaletteOpen(false); });
      }},
    ];
    
    const filtered = allCommands.filter(cmd => 
      cmd.name.toLowerCase().includes(query) || 
      cmd.desc.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
      commands.innerHTML = '<div class="px-4 py-8 text-center text-gray-500">No commands found</div>';
      return;
    }
    
    filtered.forEach(cmd => {
      const el = document.createElement('button');
      el.className = 'w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0';
      el.innerHTML = `<div class="font-medium text-white">${cmd.name}</div><div class="text-sm text-gray-400">${cmd.desc}</div>`;
      el.addEventListener('click', cmd.action);
      commands.appendChild(el);
    });
  };
  
  input.addEventListener('input', updateCommands);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  });
  
  dialog.appendChild(input);
  dialog.appendChild(commands);
  container.appendChild(backdrop);
  container.appendChild(dialog);
  
  return container;
}

export function renderCommandPalette(container) {
  const state = getState();
  if (state.ui.commandPaletteOpen) {
    container.classList.remove('hidden');
    const input = container.querySelector('input');
    if (input) {
      input.value = '';
      input.focus();
    }
  } else {
    container.classList.add('hidden');
  }
}

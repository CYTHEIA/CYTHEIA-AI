import { setView, newProject, loadProject, addToast } from '../store.js';
import { 
  fetchProjects, 
  fetchTemplates, 
  createProject, 
  deleteProject, 
  duplicateProject,
  ensureTemplates,
  exportProject,
  importProject
} from '../services/persistence.js';

function createElement(tag, className = '', content = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content) el.textContent = content;
  return el;
}

function createButton(label, onClick, className = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = `px-4 py-2 rounded-lg font-medium transition-all ${className}`;
  btn.addEventListener('click', onClick);
  return btn;
}

function createProjectCard(project, onOpen, onDelete, onDuplicate, onExport) {
  const card = createElement('div', 'p-4 bg-white/[0.03] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-all group cursor-pointer');
  
  const header = createElement('div', 'flex items-start justify-between mb-3');
  const title = createElement('h3', 'font-semibold text-lg text-white group-hover:text-blue-400 transition-colors', project.name);
  const menu = createElement('button', 'opacity-0 group-hover:opacity-100 transition-opacity');
  menu.textContent = '⋮';
  menu.className = 'text-gray-400 hover:text-white';
  
  const actions = createElement('div', 'absolute right-2 top-12 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-lg hidden group-hover:block z-10');
  const actionOpen = createButton('Open', onOpen, 'w-full text-left px-4 py-2 hover:bg-white/10');
  const actionDup = createButton('Duplicate', onDuplicate, 'w-full text-left px-4 py-2 hover:bg-white/10');
  const actionExp = createButton('Export', onExport, 'w-full text-left px-4 py-2 hover:bg-white/10');
  const actionDel = createButton('Delete', onDelete, 'w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400');
  
  actions.appendChild(actionOpen);
  actions.appendChild(actionDup);
  actions.appendChild(actionExp);
  actions.appendChild(actionDel);
  
  header.appendChild(title);
  header.appendChild(menu);
  
  const desc = createElement('p', 'text-sm text-gray-400 mb-3', project.description || 'No description');
  const meta = createElement('div', 'text-xs text-gray-500', `Updated ${new Date(project.updated_at).toLocaleDateString()}`);
  
  card.appendChild(header);
  card.appendChild(desc);
  card.appendChild(meta);
  card.appendChild(actions);
  
  return card;
}

export async function renderDashboard(container) {
  container.innerHTML = '';
  
  const main = createElement('div', 'min-h-screen bg-[#0a0a0c] text-white');
  
  // Header
  const header = createElement('div', 'border-b border-white/5 px-8 py-6');
  const headerTop = createElement('div', 'flex items-center justify-between mb-4');
  const backBtn = createButton('← Back', () => setView('landing'), 'text-gray-400 hover:text-white');
  const newBtn = createButton('+ New Project', () => {
    newProject('Untitled Project');
    setView('editor');
  }, 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white');
  headerTop.appendChild(backBtn);
  headerTop.appendChild(newBtn);
  header.appendChild(headerTop);
  
  const title = createElement('h1', 'text-3xl font-bold', 'Dashboard');
  header.appendChild(title);
  main.appendChild(header);
  
  // Tabs
  const tabsDiv = createElement('div', 'border-b border-white/5 px-8 sticky top-0 bg-[#0a0a0c]/95 backdrop-blur z-10');
  const projectsTab = createButton('Projects', () => showProjects(), 'px-4 py-3 border-b-2 border-blue-500 text-white');
  const templatesTab = createButton('Templates', () => showTemplates(), 'px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-white');
  tabsDiv.appendChild(projectsTab);
  tabsDiv.appendChild(templatesTab);
  main.appendChild(tabsDiv);
  
  // Content area
  const content = createElement('div', 'p-8');
  
  async function showProjects() {
    content.innerHTML = '<p class="text-gray-400">Loading projects...</p>';
    try {
      const projects = await fetchProjects();
      content.innerHTML = '';
      
      if (projects.length === 0) {
        content.innerHTML = '<p class="text-gray-400 text-center py-16">No projects yet. Create your first one!</p>';
      } else {
        const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
        for (const proj of projects) {
          const card = createProjectCard(
            proj,
            () => {
              loadProject(proj);
              setView('editor');
            },
            async () => {
              if (confirm(`Delete "${proj.name}"?`)) {
                try {
                  await deleteProject(proj.id);
                  showProjects();
                  addToast('Project deleted', 'success');
                } catch (e) {
                  addToast('Failed to delete', 'error');
                }
              }
            },
            async () => {
              try {
                const dup = await duplicateProject(proj.id);
                showProjects();
                addToast(`Duplicated "${dup.name}"`, 'success');
              } catch (e) {
                addToast('Failed to duplicate', 'error');
              }
            },
            () => {
              const json = exportProject(proj);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${proj.name.replace(/\s+/g, '_')}.nextel.json`;
              a.click();
            }
          );
          grid.appendChild(card);
        }
        content.appendChild(grid);
      }
    } catch (e) {
      content.innerHTML = '<p class="text-red-400">Failed to load projects</p>';
    }
  }
  
  async function showTemplates() {
    content.innerHTML = '<p class="text-gray-400">Loading templates...</p>';
    try {
      await ensureTemplates();
      const templates = await fetchTemplates();
      content.innerHTML = '';
      
      if (templates.length === 0) {
        content.innerHTML = '<p class="text-gray-400 text-center py-16">No templates available</p>';
      } else {
        const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
        for (const tmpl of templates) {
          const card = createElement('div', 'p-4 bg-white/[0.03] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer group');
          const tmplTitle = createElement('h3', 'font-semibold text-lg mb-2', tmpl.name);
          const tmplDesc = createElement('p', 'text-sm text-gray-400 mb-4', tmpl.description || 'No description');
          const useBtn = createButton('Use Template', async () => {
            try {
              const proj = await createProject(tmpl.name, tmpl.description || '', tmpl.data);
              loadProject(proj);
              setView('editor');
              addToast(`Created "${proj.name}"`, 'success');
            } catch (e) {
              addToast('Failed to create from template', 'error');
            }
          }, 'w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded');
          
          card.appendChild(tmplTitle);
          card.appendChild(tmplDesc);
          card.appendChild(useBtn);
          grid.appendChild(card);
        }
        content.appendChild(grid);
      }
    } catch (e) {
      content.innerHTML = '<p class="text-red-400">Failed to load templates</p>';
    }
  }
  
  main.appendChild(content);
  container.appendChild(main);
  
  // Load projects by default
  showProjects();
}

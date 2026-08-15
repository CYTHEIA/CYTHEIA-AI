import { getState, addComponent, setLeftSidebarTab } from './store.js';
import { COMPONENT_MAP } from './library.js';

export function createLeftSidebar() {
  const container = document.createElement('div');
  container.className = 'w-64 bg-[#1a1a1c] border-r border-white/5 overflow-y-auto flex-shrink-0 flex flex-col';
  
  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-white/5';
  
  const tabs = document.createElement('div');
  tabs.className = 'flex gap-2';
  
  const compTab = document.createElement('button');
  compTab.textContent = 'Components';
  compTab.className = 'px-3 py-1 text-xs text-gray-300 hover:text-white border-b-2 border-blue-500';
  
  const propsTab = document.createElement('button');
  propsTab.textContent = 'Properties';
  propsTab.className = 'px-3 py-1 text-xs text-gray-500 hover:text-gray-300';
  propsTab.addEventListener('click', () => setLeftSidebarTab('properties'));
  
  tabs.appendChild(compTab);
  tabs.appendChild(propsTab);
  header.appendChild(tabs);
  container.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'flex-1 p-3 overflow-y-auto';
  
  // Group components by category
  const categories = {};
  for (const [type, def] of Object.entries(COMPONENT_MAP)) {
    const cat = def.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ type, def });
  }
  
  for (const [category, components] of Object.entries(categories)) {
    const catDiv = document.createElement('div');
    catDiv.className = 'mb-4';
    
    const catTitle = document.createElement('div');
    catTitle.className = 'text-xs font-semibold text-gray-400 mb-2 px-2';
    catTitle.textContent = category;
    catDiv.appendChild(catTitle);
    
    const compList = document.createElement('div');
    compList.className = 'space-y-1';
    
    for (const { type, def } of components) {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors';
      btn.textContent = def.label;
      btn.title = def.description;
      
      btn.addEventListener('click', () => {
        addComponent(type, 400, 300);
      });
      
      compList.appendChild(btn);
    }
    
    catDiv.appendChild(compList);
    content.appendChild(catDiv);
  }
  
  container.appendChild(content);
  container.tabElement = compTab;
  
  return container;
}


import { getState, addComponent, setLeftSidebarTab, setDraggingComponent } from './store.js';
import { COMPONENT_MAP } from './library.js';

export function createLeftSidebar() {
  const container = document.createElement('div');
  container.className = 'bg-[#1a1a1c] border-r border-white/5 flex-shrink-0 flex flex-col h-full';
  container.style.width = `${getState().ui.leftSidebarWidth}px`;
  container.style.minWidth = '220px';
  container.style.maxWidth = '420px';
  container.style.position = 'relative';

  const header = document.createElement('div');
  header.className = 'px-3 py-3 border-b border-white/5 flex items-center';
  const tabs = document.createElement('div');
  tabs.className = 'flex gap-4';

  const compTab = document.createElement('button');
  compTab.textContent = 'Components';
  compTab.className = 'pb-2 text-sm text-white border-b-2 border-blue-500';
  compTab.onclick = () => setLeftSidebarTab('components');

  const propsTab = document.createElement('button');
  propsTab.textContent = 'Properties';
  propsTab.className = 'pb-2 text-sm text-gray-500 hover:text-white';
  propsTab.onclick = () => setLeftSidebarTab('properties');
  tabs.append(compTab, propsTab);
  header.appendChild(tabs);
  container.appendChild(header);

  const search = document.createElement('input');
  search.placeholder = 'Search components...';
  search.className = 'mx-3 mt-3 mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500/50';
  container.appendChild(search);

  const content = document.createElement('div');
  content.className = 'flex-1 p-2 overflow-y-auto';
  container.appendChild(content);

  const categories = {};
  for (const [type, def] of Object.entries(COMPONENT_MAP)) {
    const category = def.category || 'Other';
    (categories[category] ||= []).push({ type, def });
  }

  function addAtCenter(type) {
    const state = getState();
    const canvas = document.getElementById('circuit-canvas');
    const rect = canvas?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 600;
    const cy = rect ? rect.height / 2 : 350;
    const x = Math.round((cx - state.ui.pan.x) / state.ui.zoom / 20) * 20;
    const y = Math.round((cy - state.ui.pan.y) / state.ui.zoom / 20) * 20;
    addComponent(type, x, y);
  }

  function renderList() {
    content.innerHTML = '';
    const query = search.value.trim().toLowerCase();
    for (const [category, items] of Object.entries(categories)) {
      const visible = items.filter(({ type, def }) => !query || `${def.label} ${def.description} ${type}`.toLowerCase().includes(query));
      if (!visible.length) continue;
      const title = document.createElement('div');
      title.className = 'px-2 pt-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-gray-500';
      title.textContent = category;
      content.appendChild(title);

      for (const { type, def } of visible) {
        const item = document.createElement('div');
        item.draggable = true;
        item.className = 'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing';
        item.title = `${def.description || def.label} • Drag to canvas`;

        const icon = document.createElement('div');
        icon.className = 'w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold';
        icon.textContent = def.label.slice(0, 2).toUpperCase();
        item.appendChild(icon);

        const text = document.createElement('div');
        text.className = 'min-w-0 flex-1';
        const name = document.createElement('div');
        name.className = 'truncate';
        name.textContent = def.label;
        const desc = document.createElement('div');
        desc.className = 'text-[10px] text-gray-600 truncate';
        desc.textContent = def.description || type;
        text.append(name, desc);
        item.appendChild(text);

        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('component-type', type);
          e.dataTransfer.effectAllowed = 'copy';
          setDraggingComponent(type);
        });
        item.addEventListener('dragend', () => setDraggingComponent(null));
        item.addEventListener('click', () => addAtCenter(type));
        content.appendChild(item);
      }
    }
  }

  search.addEventListener('input', renderList);
  renderList();

  // Resizable right edge
  const resizer = document.createElement('div');
  resizer.style.cssText = 'position:absolute;right:-3px;top:0;width:6px;height:100%;cursor:col-resize;z-index:30;';
  let resizing = false;
  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    const startX = e.clientX;
    const startWidth = getState().ui.leftSidebarWidth;
    const move = (ev) => {
      if (!resizing) return;
      const width = Math.max(220, Math.min(420, startWidth + ev.clientX - startX));
      container.style.width = `${width}px`;
      getState().ui.leftSidebarWidth = width;
    };
    const up = () => {
      resizing = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
  container.appendChild(resizer);

  container.tabElement = compTab;
  return container;
}

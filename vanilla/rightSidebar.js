import { getState, setComponentProperty } from './store.js';
import { COMPONENT_MAP } from './library.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

export function createRightSidebar() {
  const container = document.createElement('div');
  container.className = 'w-80 bg-[#1a1a1c] border-l border-white/5 overflow-y-auto flex-shrink-0 relative h-full';
  container.style.width = `${getState().ui.rightSidebarWidth}px`;
  container.style.minWidth = '260px';
  container.style.maxWidth = '460px';

  const header = document.createElement('div');
  header.className = 'px-4 py-4 border-b border-white/5';
  header.innerHTML = '<h2 class="text-xl font-semibold text-white">Properties</h2>';
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'p-4';
  container.appendChild(content);
  container.contentDiv = content;

  container.updateContent = () => {
    const state = getState();
    const id = state.project.selectedIds[0];
    if (!id) {
      content.innerHTML = '<div class="text-gray-500 text-sm">Select a component</div>';
      return;
    }
    const component = state.project.components.find(c => c.id === id);
    const def = component && COMPONENT_MAP[component.type];
    if (!component || !def) {
      content.innerHTML = '<div class="text-gray-500 text-sm">Component not found</div>';
      return;
    }

    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'mb-5';
    title.innerHTML = `<div class="text-xs text-gray-500 uppercase tracking-wider">Type</div><div class="text-base text-white mt-1">${esc(def.label)}</div>`;
    content.appendChild(title);

    const position = document.createElement('div');
    position.className = 'grid grid-cols-2 gap-2 mb-5';
    position.innerHTML = `<div class="bg-white/5 rounded-lg p-3"><div class="text-[10px] text-gray-500">X</div><div class="text-sm text-white mt-1">${Math.round(component.x)}</div></div><div class="bg-white/5 rounded-lg p-3"><div class="text-[10px] text-gray-500">Y</div><div class="text-sm text-white mt-1">${Math.round(component.y)}</div></div>`;
    content.appendChild(position);

    const rotation = document.createElement('div');
    rotation.className = 'mb-5 text-sm text-gray-400';
    rotation.textContent = `Rotation: ${component.rotation}°`;
    content.appendChild(rotation);

    const props = def.defaultProps || {};
    const propKeys = Object.keys(props);
    for (const key of propKeys) {
      const row = document.createElement('label');
      row.className = 'block mb-3';
      const label = document.createElement('span');
      label.className = 'block text-xs text-gray-500 mb-1';
      label.textContent = key;
      const input = document.createElement('input');
      input.className = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500/60';
      input.value = component.props?.[key] ?? props[key] ?? '';
      input.addEventListener('change', () => {
        let value = input.value;
        if (typeof props[key] === 'number') value = Number(value);
        setComponentProperty(component.id, key, value);
      });
      row.append(label, input);
      content.appendChild(row);
    }

    const pinsTitle = document.createElement('div');
    pinsTitle.className = 'mt-6 mb-2 text-xs text-gray-500 uppercase tracking-wider';
    pinsTitle.textContent = `Pins (${def.pins.length})`;
    content.appendChild(pinsTitle);
    const pins = document.createElement('div');
    pins.className = 'space-y-1';
    for (const pin of def.pins) {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between px-2 py-1.5 rounded bg-white/[.03] text-xs';
      const left = document.createElement('span');
      left.className = 'text-gray-300';
      left.textContent = pin.label || pin.name || pin.id;
      const right = document.createElement('span');
      right.className = 'text-gray-600';
      right.textContent = pin.type || 'digital';
      row.append(left, right);
      pins.appendChild(row);
    }
    content.appendChild(pins);
  };

  const resizer = document.createElement('div');
  resizer.style.cssText = 'position:absolute;left:-3px;top:0;width:6px;height:100%;cursor:col-resize;z-index:30;';
  let resizing = false;
  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    const startX = e.clientX;
    const startWidth = getState().ui.rightSidebarWidth;
    const move = (ev) => {
      if (!resizing) return;
      const width = Math.max(260, Math.min(460, startWidth - (ev.clientX - startX)));
      container.style.width = `${width}px`;
      getState().ui.rightSidebarWidth = width;
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

  return container;
}

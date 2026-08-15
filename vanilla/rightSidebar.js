import { getState } from './store.js';
import { COMPONENT_MAP } from './library.js';

export function createRightSidebar() {
  const container = document.createElement('div');
  container.className = 'w-80 bg-[#1a1a1c] border-l border-white/5 overflow-y-auto flex-shrink-0';
  
  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-white/5';
  header.innerHTML = '<h3 class="font-semibold text-white">Properties</h3>';
  container.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'p-4';
  container.contentDiv = content;
  container.appendChild(content);
  
  container.updateContent = () => {
    const state = getState();
    const selectedId = state.project.selectedIds[0];
    
    if (!selectedId) {
      content.innerHTML = '<p class="text-gray-500 text-sm">Select a component</p>';
      return;
    }
    
    const component = state.project.components.find(c => c.id === selectedId);
    if (!component) {
      content.innerHTML = '<p class="text-gray-500 text-sm">Component not found</p>';
      return;
    }
    
    const def = COMPONENT_MAP[component.type];
    if (!def) {
      content.innerHTML = '<p class="text-gray-500 text-sm">Unknown component type</p>';
      return;
    }
    
    let html = `<div class="space-y-3">`;
    html += `<div>`;
    html += `  <label class="text-xs text-gray-400">Type</label>`;
    html += `  <p class="text-sm text-white">${def.label}</p>`;
    html += `</div>`;
    html += `<div>`;
    html += `  <label class="text-xs text-gray-400">Position</label>`;
    html += `  <p class="text-sm text-white">X: ${Math.round(component.x)}, Y: ${Math.round(component.y)}</p>`;
    html += `</div>`;
    html += `<div>`;
    html += `  <label class="text-xs text-gray-400">Rotation</label>`;
    html += `  <p class="text-sm text-white">${component.rotation}°</p>`;
    html += `</div>`;
    if (def.pins && def.pins.length > 0) {
      html += `<div>`;
      html += `  <label class="text-xs text-gray-400 block mb-1">Pins (${def.pins.length})</label>`;
      html += `  <div class="text-xs text-gray-400 space-y-1">`;
      def.pins.slice(0, 5).forEach(pin => {
        html += `<div>${pin.name} (${pin.type})</div>`;
      });
      if (def.pins.length > 5) {
        html += `<div>+ ${def.pins.length - 5} more</div>`;
      }
      html += `  </div>`;
      html += `</div>`;
    }
    html += `</div>`;
    
    content.innerHTML = html;
  };
  
  return container;
}

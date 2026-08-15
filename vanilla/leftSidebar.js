import { getState, addComponent, setLeftSidebarTab, setDraggingComponent } from './store.js';
import { COMPONENT_MAP, searchComponents } from './library.js';

export function createLeftSidebar() {
  const container = document.createElement('div');
  container.className = 'bg-[var(--ct-surface)] border-r border-[var(--ct-border)] flex-shrink-0 flex flex-col h-full';
  container.style.width = `${getState().ui.leftSidebarWidth}px`;
  container.style.minWidth = '260px';
  container.style.maxWidth = '400px';
  container.style.position = 'relative';

  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-[var(--ct-border)] flex items-center flex-shrink-0';
  const tabs = document.createElement('div');
  tabs.className = 'flex gap-1';

  const compTab = document.createElement('button');
  compTab.textContent = 'Components';
  compTab.className = 'ct-tab ct-tab-active';
  compTab.setAttribute('role', 'tab');
  compTab.setAttribute('aria-selected', 'true');
  compTab.onclick = () => setLeftSidebarTab('components');

  const propsTab = document.createElement('button');
  propsTab.textContent = 'Properties';
  propsTab.className = 'ct-tab';
  propsTab.setAttribute('role', 'tab');
  propsTab.setAttribute('aria-selected', 'false');
  propsTab.onclick = () => setLeftSidebarTab('properties');
  tabs.append(compTab, propsTab);
  header.appendChild(tabs);
  container.appendChild(header);

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'flex-shrink-0 px-4 pb-3';

  const search = document.createElement('input');
  search.placeholder = 'Search components…';
  search.className = 'ct-input ct-search';
  search.setAttribute('aria-label', 'Search components');
  search.setAttribute('type', 'search');
  const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  searchIcon.setAttribute('class', 'ct-search-icon');
  searchIcon.setAttribute('width', '16');
  searchIcon.setAttribute('height', '16');
  searchIcon.setAttribute('viewBox', '0 0 24 24');
  searchIcon.setAttribute('fill', 'none');
  searchIcon.setAttribute('stroke', 'currentColor');
  searchIcon.setAttribute('stroke-width', '1.8');
  searchIcon.setAttribute('stroke-linecap', 'round');
  searchIcon.setAttribute('stroke-linejoin', 'round');
  searchIcon.innerHTML = '<circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path>';
  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(search);
  container.appendChild(searchWrapper);

  const content = document.createElement('div');
  content.className = 'flex-1 min-h-0 p-2 overflow-y-auto ct-scroll';
  content.setAttribute('role', 'listbox');
  content.setAttribute('aria-label', 'Component library');
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

  function getCategoryIcon(category) {
    const icons = {
      'Microcontrollers': '🖥️',
      'Basic': '🔧',
      'Semiconductors': '⚡',
      'Inputs': '🎮',
      'Outputs': '🔊',
      'Displays': '🖥️',
      'Sensors': '📡',
      'Power': '🔋',
      'Logic': '🔀',
      'Prototyping': '🛠️',
      'Other': '📦'
    };
    return icons[category] || '📦';
  }

  function createComponentIcon(type, def) {
    const icon = document.createElement('div');
    icon.className = 'w-9 h-9 rounded-lg bg-[var(--ct-surface-2)] border border-[var(--ct-border)] flex items-center justify-center text-xs font-medium shrink-0';
    
    const iconMap = {
      'arduino-uno': 'UNO',
      'arduino-nano': 'NANO',
      'arduino-mega': 'MEGA',
      'raspberry-pi-pico': 'PICO',
      'esp32': 'ESP',
      'resistor': 'R',
      'capacitor': 'C',
      'led': 'LED',
      'rgb-led': 'RGB',
      'diode': 'D',
      'npn-transistor': 'NPN',
      'pnp-transistor': 'PNP',
      'n-mosfet': 'N-FET',
      'p-mosfet': 'P-FET',
      'photodiode': 'PD',
      'inductor': 'L',
      'fuse': 'F',
      'push-button': 'BTN',
      'switch': 'SW',
      'potentiometer': 'POT',
      'buzzer': 'BZ',
      'dc-motor': 'M',
      'servo': 'SVO',
      'relay': 'RLY',
      'lcd-16x2': 'LCD',
      'oled': 'OLED',
      'seven-segment': '7S',
      'led-matrix': 'MAT',
      'temp-sensor': '°C',
      'light-sensor': '☀',
      'ultrasonic-sensor': 'US',
      'pir-sensor': 'PIR',
      'ir-sensor': 'IR',
      'dht11': 'DHT',
      'dht22': 'DHT',
      'battery': '9V',
      'power-5v': '5V',
      'power-3v3': '3V3',
      'gnd': 'GND',
      'vcc': 'VCC',
      'dc-supply': 'DC',
      'and-gate': 'AND',
      'or-gate': 'OR',
      'not-gate': 'NOT',
      'nand-gate': 'NAND',
      'nor-gate': 'NOR',
      'xor-gate': 'XOR',
      'breadboard': 'BB'
    };
    
    icon.textContent = iconMap[type] || def.label.slice(0, 2).toUpperCase();
    return icon;
  }

  function renderList() {
    content.innerHTML = '';
    const query = search.value.trim().toLowerCase();
    
    const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
      const order = ['Microcontrollers', 'Basic', 'Semiconductors', 'Inputs', 'Outputs', 'Displays', 'Sensors', 'Power', 'Logic', 'Prototyping', 'Other'];
      return (order.indexOf(a) - order.indexOf(b));
    });

    let hasResults = false;
    
    for (const [category, items] of sortedCategories) {
      const visible = items.filter(({ type, def }) => {
        if (!query) return true;
        const searchText = `${def.label} ${def.description} ${type} ${def.category}`.toLowerCase();
        if (def.keywords) {
          return searchText.includes(query) || def.keywords.some(k => k.includes(query));
        }
        return searchText.includes(query);
      });
      if (!visible.length) continue;
      hasResults = true;
      
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'flex items-center gap-2 px-2 pt-3 pb-1';
      categoryHeader.innerHTML = `
        <span class="text-[11px] font-medium text-[var(--ct-accent)]" aria-hidden="true">${getCategoryIcon(category)}</span>
        <span class="text-[11px] uppercase tracking-wider font-semibold text-[var(--ct-text-dim)]">${category}</span>
        <span class="text-[10px] text-[var(--ct-text-faint)] ml-auto bg-[var(--ct-surface-2)] px-2 py-0.5 rounded">${visible.length}</span>
      `;
      content.appendChild(categoryHeader);

      for (const { type, def } of visible) {
        const item = document.createElement('div');
        item.draggable = true;
        item.className = 'ct-card ct-card-hover flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-grab active:cursor-grabbing group';
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `${def.label} • ${def.description || type} • ${def.pins.length} pins • Drag to add or click to place at center`);
        item.title = `${def.description || def.label} • Drag to canvas or click to add at center`;

        const icon = createComponentIcon(type, def);
        item.appendChild(icon);

        const text = document.createElement('div');
        text.className = 'min-w-0 flex-1';
        const name = document.createElement('div');
        name.className = 'truncate font-medium text-[var(--ct-text)]';
        name.textContent = def.label;
        const desc = document.createElement('div');
        desc.className = 'text-[10px] text-[var(--ct-text-faint)] truncate';
        desc.textContent = def.description || type;
        text.append(name, desc);
        item.appendChild(text);

        const pinCount = document.createElement('span');
        pinCount.className = 'text-[10px] text-[var(--ct-text-faint)] px-2 py-0.5 bg-[var(--ct-surface-2)] rounded shrink-0';
        pinCount.textContent = `${def.pins.length} pins`;
        item.appendChild(pinCount);

        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('component-type', type);
          e.dataTransfer.effectAllowed = 'copy';
          setDraggingComponent(type);
        });
        item.addEventListener('dragend', () => setDraggingComponent(null));
        item.addEventListener('click', () => addAtCenter(type));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            addAtCenter(type);
          }
        });
        content.appendChild(item);
      }
    }

    if (!hasResults && query) {
      const emptyState = document.createElement('div');
      emptyState.className = 'flex flex-col items-center justify-center py-12 text-center px-4';
      emptyState.innerHTML = `
        <div class="text-[var(--ct-text-faint)] text-4xl mb-2" aria-hidden="true">🔍</div>
        <div class="text-sm text-[var(--ct-text-dim)]">No components match "${esc(query)}"</div>
        <div class="text-[11px] text-[var(--ct-text-faint)] mt-1">Try a different search term</div>
      `;
      content.appendChild(emptyState);
    } else if (!hasResults && !query) {
      const emptyState = document.createElement('div');
      emptyState.className = 'flex flex-col items-center justify-center py-12 text-center px-4';
      emptyState.innerHTML = `
        <div class="text-[var(--ct-text-faint)] text-4xl mb-2" aria-hidden="true">📦</div>
        <div class="text-sm text-[var(--ct-text-dim)]">No components available</div>
      `;
      content.appendChild(emptyState);
    }
  }

  function esc(value) {
    const map = { '&': '&', '<': '<', '>': '>', '"': '"', "'": "'" };
    return String(value ?? '').replace(/[&<>"']/g, c => map[c]);
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
      const width = Math.max(260, Math.min(400, startWidth + ev.clientX - startX));
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

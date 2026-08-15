import { getState, setComponentProperty, selectComponent } from './store.js';
import { COMPONENT_MAP } from './library.js';

function esc(value) {
  const map = { '&': '&', '<': '<', '>': '>', '"': '"', "'": "'" };
  return String(value ?? '').replace(/[&<>"']/g, c => map[c]);
}

function createInputRow(label, value, onChange, type = 'text', step) {
  const row = document.createElement('div');
  row.className = 'mb-4';
  
  const labelEl = document.createElement('label');
  labelEl.className = 'block text-[11px] font-medium text-[var(--ct-text-dim)] mb-1.5';
  labelEl.textContent = label;
  
  const input = document.createElement('input');
  input.type = type;
  if (step) input.step = step;
  input.className = 'ct-input w-full';
  input.value = value ?? '';
  input.addEventListener('change', () => onChange(input.value));
  input.addEventListener('input', () => onChange(input.value));
  
  row.append(labelEl, input);
  return row;
}

function createSelectRow(label, value, options, onChange) {
  const row = document.createElement('div');
  row.className = 'mb-4';
  
  const labelEl = document.createElement('label');
  labelEl.className = 'block text-[11px] font-medium text-[var(--ct-text-dim)] mb-1.5';
  labelEl.textContent = label;
  
  const select = document.createElement('select');
  select.className = 'ct-input w-full';
  for (const opt of options) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    option.selected = opt.value === value;
    select.appendChild(option);
  }
  select.addEventListener('change', () => onChange(select.value));
  
  row.append(labelEl, select);
  return row;
}

function createInfoRow(label, value) {
  const row = document.createElement('div');
  row.className = 'mb-3';
  
  const labelEl = document.createElement('div');
  labelEl.className = 'text-[11px] font-medium text-[var(--ct-text-dim)] mb-1';
  labelEl.textContent = label;
  
  const valueEl = document.createElement('div');
  valueEl.className = 'text-sm text-[var(--ct-text)] font-mono bg-[var(--ct-surface-2)] px-2 py-1.5 rounded';
  valueEl.textContent = value;
  
  row.append(labelEl, valueEl);
  return row;
}

function createSectionTitle(title) {
  const el = document.createElement('div');
  el.className = 'text-[11px] font-semibold uppercase tracking-wider text-[var(--ct-text-dim)] mb-3 mt-6 pt-3 border-t border-[var(--ct-border)]';
  el.textContent = title;
  return el;
}

export function createRightSidebar() {
  const container = document.createElement('div');
  container.className = 'bg-[var(--ct-surface)] border-l border-[var(--ct-border)] flex-shrink-0 flex flex-col h-full overflow-y-auto';
  container.style.width = `${getState().ui.rightSidebarWidth}px`;
  container.style.minWidth = '280px';
  container.style.maxWidth = '420px';

  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-[var(--ct-border)] flex-shrink-0';
  header.innerHTML = '<h2 class="text-base font-semibold text-[var(--ct-text)]">Properties</h2>';
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flex-1 min-h-0 p-4 overflow-y-auto ct-scroll';
  container.appendChild(content);
  container.contentDiv = content;

  container.updateContent = () => {
    const state = getState();
    const id = state.project.selectedIds[0];
    
    if (!id) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-6">
          <div class="text-[var(--ct-text-faint)] text-4xl mb-3" aria-hidden="true">🎯</div>
          <h3 class="text-base font-medium text-[var(--ct-text-dim)] mb-1">Select a component</h3>
          <p class="text-sm text-[var(--ct-text-faint)]">Choose a component on the canvas to view and edit its properties.</p>
        </div>
      `;
      return;
    }
    
    const component = state.project.components.find(c => c.id === id);
    const def = component && COMPONENT_MAP[component.type];
    
    if (!component || !def) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-6">
          <div class="text-[var(--ct-text-faint)] text-4xl mb-3" aria-hidden="true">⚠️</div>
          <h3 class="text-base font-medium text-[var(--ct-text-dim)] mb-1">Component not found</h3>
          <p class="text-sm text-[var(--ct-text-faint)]">The selected component no longer exists.</p>
        </div>
      `;
      return;
    }

    content.innerHTML = '';

    // Component type header
    const typeHeader = document.createElement('div');
    typeHeader.className = 'mb-4 flex items-center gap-3';
    
    const icon = document.createElement('div');
    icon.className = 'w-10 h-10 rounded-lg bg-[var(--ct-surface-2)] border border-[var(--ct-border)] flex items-center justify-center text-xs font-medium text-[var(--ct-text-dim)] shrink-0';
    
    const iconMap = {
      'arduino-uno': 'UNO', 'arduino-nano': 'NANO', 'arduino-mega': 'MEGA',
      'raspberry-pi-pico': 'PICO', 'esp32': 'ESP', 'resistor': 'R',
      'capacitor': 'C', 'led': 'LED', 'rgb-led': 'RGB', 'diode': 'D',
      'npn-transistor': 'NPN', 'pnp-transistor': 'PNP', 'n-mosfet': 'N-FET',
      'p-mosfet': 'P-FET', 'photodiode': 'PD', 'inductor': 'L', 'fuse': 'F',
      'push-button': 'BTN', 'switch': 'SW', 'potentiometer': 'POT',
      'buzzer': 'BZ', 'dc-motor': 'M', 'servo': 'SVO', 'relay': 'RLY',
      'lcd-16x2': 'LCD', 'oled': 'OLED', 'seven-segment': '7S', 'led-matrix': 'MAT',
      'temp-sensor': '°C', 'light-sensor': '☀', 'ultrasonic-sensor': 'US',
      'pir-sensor': 'PIR', 'ir-sensor': 'IR', 'dht11': 'DHT', 'dht22': 'DHT',
      'battery': '9V', 'power-5v': '5V', 'power-3v3': '3V3', 'gnd': 'GND',
      'vcc': 'VCC', 'dc-supply': 'DC', 'and-gate': 'AND', 'or-gate': 'OR',
      'not-gate': 'NOT', 'nand-gate': 'NAND', 'nor-gate': 'NOR', 'xor-gate': 'XOR',
      'breadboard': 'BB'
    };
    icon.textContent = iconMap[component.type] || def.label.slice(0, 2).toUpperCase();
    
    const typeInfo = document.createElement('div');
    typeInfo.className = 'flex-1 min-w-0';
    const typeName = document.createElement('div');
    typeName.className = 'font-medium text-[var(--ct-text)] truncate';
    typeName.textContent = def.label;
    const typeCategory = document.createElement('div');
    typeCategory.className = 'text-[11px] text-[var(--ct-text-faint)]';
    typeCategory.textContent = def.category;
    typeInfo.append(typeName, typeCategory);
    
    typeHeader.append(icon, typeInfo);
    content.appendChild(typeHeader);

    // Position & Rotation (read-only info)
    const posSection = createSectionTitle('Transform');
    content.appendChild(posSection);
    
    const posGrid = document.createElement('div');
    posGrid.className = 'grid grid-cols-3 gap-2 mb-2';
    
    const xRow = createInfoRow('X', Math.round(component.x));
    xRow.style.gridColumn = 'span 1';
    const yRow = createInfoRow('Y', Math.round(component.y));
    yRow.style.gridColumn = 'span 1';
    const rotRow = createInfoRow('Rotation', `${component.rotation}°`);
    rotRow.style.gridColumn = 'span 1';
    
    posGrid.append(xRow, yRow, rotRow);
    content.appendChild(posGrid);

    // Editable properties based on component type
    const props = def.defaultProps || {};
    const propKeys = Object.keys(props);
    
    if (propKeys.length > 0) {
      const propsSection = createSectionTitle('Properties');
      content.appendChild(propsSection);
      
      for (const key of propKeys) {
        const value = component.props?.[key] ?? props[key];
        const propDef = def.defaultProps[key];
        
        if (typeof propDef === 'number') {
          content.appendChild(createInputRow(key, value, (v) => {
            setComponentProperty(component.id, key, Number(v));
          }, 'number', 'any'));
        } else if (typeof propDef === 'boolean') {
          const row = document.createElement('div');
          row.className = 'mb-4 flex items-center gap-2';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = value;
          checkbox.className = 'w-4 h-4 accent-[var(--ct-accent)]';
          checkbox.addEventListener('change', () => setComponentProperty(component.id, key, checkbox.checked));
          const label = document.createElement('label');
          label.className = 'text-sm text-[var(--ct-text)] cursor-pointer';
          label.textContent = key;
          row.append(checkbox, label);
          content.appendChild(row);
        } else {
          content.appendChild(createInputRow(key, value, (v) => {
            setComponentProperty(component.id, key, v);
          }));
        }
      }
    }

    // Pins section
    const pinsSection = createSectionTitle(`Pins (${def.pins.length})`);
    content.appendChild(pinsSection);
    
    const pinsList = document.createElement('div');
    pinsList.className = 'space-y-1.5 max-h-48 overflow-y-auto ct-scroll pr-1';
    
    for (const pin of def.pins) {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between px-3 py-2 rounded bg-[var(--ct-surface-2)] border border-[var(--ct-border)] text-xs';
      
      const left = document.createElement('div');
      left.className = 'flex items-center gap-2';
      const pinLabel = document.createElement('span');
      pinLabel.className = 'font-medium text-[var(--ct-text)]';
      pinLabel.textContent = pin.label || pin.name || pin.id;
      const pinType = document.createElement('span');
      pinType.className = 'ct-chip text-[10px]';
      pinType.textContent = pin.type || 'digital';
      left.append(pinLabel, pinType);
      
      const right = document.createElement('span');
      right.className = 'text-[var(--ct-text-faint)] font-mono';
      right.textContent = `x${pin.x}, y${pin.y}`;
      
      row.append(left, right);
      pinsList.appendChild(row);
    }
    
    content.appendChild(pinsList);

    // Actions
    const actionsSection = createSectionTitle('Actions');
    content.appendChild(actionsSection);
    
    const actions = document.createElement('div');
    actions.className = 'flex flex-col gap-2';
    
    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'ct-btn ct-btn-secondary justify-center';
    duplicateBtn.textContent = 'Duplicate';
    duplicateBtn.addEventListener('click', () => {
      const state = getState();
      const comp = state.project.components.find(c => c.id === id);
      if (comp) {
        const newComp = { ...comp, id: crypto.randomUUID(), x: comp.x + 40, y: comp.y + 40 };
        state.project.components.push(newComp);
        selectComponent(newComp.id);
      }
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ct-btn ct-btn-danger justify-center';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete ${def.label}?`)) {
        const state = getState();
        state.project.components = state.project.components.filter(c => c.id !== id);
        state.project.connections = state.project.connections.filter(c => c.fromComponent !== id && c.toComponent !== id);
        state.project.selectedIds = [];
        state.project.saveStatus = 'unsaved';
      }
    });
    
    actions.append(duplicateBtn, deleteBtn);
    content.appendChild(actions);
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
      const width = Math.max(280, Math.min(420, startWidth - (ev.clientX - startX)));
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
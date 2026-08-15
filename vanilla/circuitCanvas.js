import { getState, addComponent, selectComponent, moveComponent, removeComponent, rotateComponent } from './store.js';
import { COMPONENT_MAP } from './library.js';
import { ComponentRenderer } from './componentRenderer.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function createCircuitCanvas() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex-1 bg-[#0a0a0c] overflow-hidden relative';
  container.style.background = `linear-gradient(0deg, rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)`;
  container.style.backgroundSize = '20px 20px';
  
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'w-full h-full absolute top-0 left-0');
  svg.setAttribute('style', 'background: none');
  svg.setAttribute('id', 'circuit-canvas');
  
  container.svg = svg;
  container.appendChild(svg);
  
  // Add keyboard shortcuts
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const state = getState();
      if (state.project.selectedIds.length > 0) {
        state.project.selectedIds.forEach(id => removeComponent(id));
      }
    }
  });
  
  return container;
}

export function renderCircuitCanvas(container) {
  const state = getState();
  const svg = container.svg;
  if (!svg) return;
  
  svg.innerHTML = '';
  
  // Create viewBox for pan/zoom
  const zoom = state.ui.zoom || 1;
  const pan = state.ui.pan || { x: 0, y: 0 };
  
  svg.setAttribute('viewBox', `${-pan.x} ${-pan.y} ${1200 / zoom} ${800 / zoom}`);
  
  // Draw grid if enabled
  if (state.ui.showGrid) {
    const gridSize = 20;
    const gridPattern = document.createElementNS(SVG_NS, 'defs');
    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', gridSize);
    pattern.setAttribute('height', gridSize);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const line1 = document.createElementNS(SVG_NS, 'line');
    line1.setAttribute('x1', gridSize);
    line1.setAttribute('y1', '0');
    line1.setAttribute('x2', gridSize);
    line1.setAttribute('y2', gridSize);
    line1.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    
    const line2 = document.createElementNS(SVG_NS, 'line');
    line2.setAttribute('x1', '0');
    line2.setAttribute('y1', gridSize);
    line2.setAttribute('x2', gridSize);
    line2.setAttribute('y2', gridSize);
    line2.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    
    pattern.appendChild(line1);
    pattern.appendChild(line2);
    gridPattern.appendChild(pattern);
    svg.appendChild(gridPattern);
    
    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('width', '10000');
    bg.setAttribute('height', '10000');
    bg.setAttribute('fill', 'url(#grid)');
    svg.appendChild(bg);
  }
  
  // Draw wires/connections first (so they appear behind components)
  const connectionsGroup = document.createElementNS(SVG_NS, 'g');
  connectionsGroup.setAttribute('id', 'wires');
  svg.appendChild(connectionsGroup);
  
  for (const conn of state.project.connections) {
    const fromComp = state.project.components.find(c => c.id === conn.fromComponent);
    const toComp = state.project.components.find(c => c.id === conn.toComponent);
    
    if (!fromComp || !toComp) continue;
    
    const fromDef = COMPONENT_MAP[fromComp.type];
    const toDef = COMPONENT_MAP[toComp.type];
    if (!fromDef || !toDef) continue;
    
    const fromPin = fromDef.pins.find(p => p.id === conn.fromPin);
    const toPin = toDef.pins.find(p => p.id === conn.toPin);
    if (!fromPin || !toPin) continue;
    
    const x1 = fromComp.x + fromPin.x;
    const y1 = fromComp.y + fromPin.y;
    const x2 = toComp.x + toPin.x;
    const y2 = toComp.y + toPin.y;
    
    // Determine wire color based on pin type
    let wireColor = "#888888"; const pins = [fromPin, toPin]; if (pins.some(p => p.type === "ground" || p.name?.includes("GND"))) wireColor = "#000000"; else if (pins.some(p => p.type === "power" || p.name?.includes("VCC") || p.name?.includes("5V"))) wireColor = "#ff0000";
    
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', wireColor);
    line.setAttribute('stroke-width', '2');
    connectionsGroup.appendChild(line);
  }
  
  // Draw components
  const componentsGroup = document.createElementNS(SVG_NS, 'g');
  componentsGroup.setAttribute('id', 'components');
  svg.appendChild(componentsGroup);
  
  for (const component of state.project.components) {
    const def = COMPONENT_MAP[component.type];
    if (!def) continue;
    
    const isSelected = state.project.selectedIds.includes(component.id);
    
    // Render actual component SVG
    const sim = state.simulation?.state?.components?.[component.id];
    const g = ComponentRenderer({component,simState:sim,selected:isSelected,hoveredPin:null,showPinLabels:false,onPinClick:()=>{},onComponentClick:e=>{e.stopPropagation();selectComponent(component.id)}});
    g.setAttribute("id",`comp-${component.id}`);
    g.setAttribute("data-component-id",component.id);
    g.style.cursor="move";

    // Click to select
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectComponent(component.id);
    });
    
    // Drag to move
    let isDragging = false;
    let startX, startY;
    
    g.addEventListener('mousedown', (e) => {
      if (e.target.hasAttribute('data-pin-id')) return;
      isDragging = true;
      startX = e.clientX - component.x;
      startY = e.clientY - component.y;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let x = e.clientX - startX;
      let y = e.clientY - startY;
      
      if (state.ui.snapToGrid) {
        x = Math.round(x / 20) * 20;
        y = Math.round(y / 20) * 20;
      }
      
      moveComponent(component.id, x, y);
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Right-click to rotate
    g.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      rotateComponent(component.id);
    });
    
    componentsGroup.appendChild(g);
  }
  
  // Click on canvas to deselect
  svg.addEventListener('click', (e) => {
    if (e.target === svg) {
      selectComponent(null);
    }
  });
}


import {
  getState,
  addComponent,
  selectComponent,
  moveComponent,
  removeComponents,
  rotateComponent,
  addConnection,
  removeConnection,
  setZoom,
  setPan,
  pushHistory,
  addToast
} from './store.js';
import { COMPONENT_MAP } from './library.js';
import { ComponentRenderer, getPinWorldPosition } from './componentRenderer.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const GRID = 20;

function worldFromScreen(svg, clientX, clientY, state) {
  const rect = svg.getBoundingClientRect();
  return {
    x: (clientX - rect.left - state.ui.pan.x) / state.ui.zoom,
    y: (clientY - rect.top - state.ui.pan.y) / state.ui.zoom
  };
}

function snap(v) {
  const state = getState();
  return state.ui.snapToGrid ? Math.round(v / GRID) * GRID : v;
}

export function createCircuitCanvas() {
  const container = document.createElement('div');
  container.className = 'relative flex-1 min-w-0 min-h-0 overflow-hidden bg-[#0a0a0c] select-none';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = 'circuit-canvas';
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.display = 'block';
  svg.style.touchAction = 'none';
  svg.style.cursor = 'default';
  container.svg = svg;
  container.appendChild(svg);

  container._drag = null;
  container._panDrag = null;
  container._wirePending = null;
  container._moved = false;

  const stopDrag = () => {
    if (container._drag) {
      if (container._moved) pushHistory('Move component');
      container._drag = null;
    }
    if (container._panDrag) container._panDrag = null;
    svg.style.cursor = 'default';
  };

  svg.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.code === 'Space') {
      e.preventDefault();
      const state = getState();
      container._panDrag = { x: e.clientX, y: e.clientY, panX: state.ui.pan.x, panY: state.ui.pan.y };
      svg.style.cursor = 'grabbing';
      return;
    }
  });

  svg.addEventListener('mousemove', (e) => {
    const state = getState();
    if (container._panDrag) {
      setPan({
        x: container._panDrag.panX + e.clientX - container._panDrag.x,
        y: container._panDrag.panY + e.clientY - container._panDrag.y
      });
      return;
    }
    if (container._drag) {
      const p = worldFromScreen(svg, e.clientX, e.clientY, state);
      moveComponent(container._drag.id, snap(p.x - container._drag.offsetX), snap(p.y - container._drag.offsetY));
      container._moved = true;
    }
    if (container._wirePending) {
      const p = worldFromScreen(svg, e.clientX, e.clientY, state);
      container._wirePending.mouseX = p.x;
      container._wirePending.mouseY = p.y;
      renderCircuitCanvas(container);
    }
  });

  svg.addEventListener('mouseup', stopDrag);
  svg.addEventListener('mouseleave', () => {
    if (container._panDrag) container._panDrag = null;
  });

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const state = getState();
    const rect = svg.getBoundingClientRect();
    const oldZoom = state.ui.zoom;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.max(0.2, Math.min(3, oldZoom * factor));
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - state.ui.pan.x) / oldZoom;
    const worldY = (mouseY - state.ui.pan.y) / oldZoom;
    setZoom(nextZoom);
    setPan({
      x: mouseX - worldX * nextZoom,
      y: mouseY - worldY * nextZoom
    });
  }, { passive: false });

  svg.addEventListener('click', (e) => {
    if (e.target === svg) {
      selectComponent(null);
      container._wirePending = null;
      renderCircuitCanvas(container);
    }
  });

  svg.addEventListener('dragover', (e) => e.preventDefault());
  svg.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer?.getData('component-type');
    if (!type || !COMPONENT_MAP[type]) return;
    const p = worldFromScreen(svg, e.clientX, e.clientY, getState());
    addComponent(type, snap(p.x), snap(p.y));
    addToast(`${COMPONENT_MAP[type].label} added`, 'success');
  });

  svg.addEventListener('contextmenu', (e) => e.preventDefault());

  container.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    const state = getState();
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.project.selectedIds.length) {
      removeComponents(state.project.selectedIds);
    }
    if (e.key.toLowerCase() === 'r' && state.project.selectedIds.length === 1) {
      rotateComponent(state.project.selectedIds[0]);
    }
    if (e.key === 'Escape') {
      container._wirePending = null;
      selectComponent(null);
      renderCircuitCanvas(container);
    }
  });
  container.tabIndex = 0;

  container._interaction = {
    beginComponentDrag(id, e) {
      const state = getState();
      const comp = state.project.components.find(c => c.id === id);
      if (!comp || container._wirePending) return;
      const p = worldFromScreen(svg, e.clientX, e.clientY, state);
      container._drag = { id, offsetX: p.x - comp.x, offsetY: p.y - comp.y };
      container._moved = false;
      selectComponent(id);
      container.focus();
    },
    beginWire(componentId, pinId, e) {
      const state = getState();
      const comp = state.project.components.find(c => c.id === componentId);
      if (!comp) return;
      const p = getPinWorldPosition(comp, pinId);
      container._wirePending = { componentId, pinId, x: p.x, y: p.y, mouseX: p.x, mouseY: p.y };
      e.stopPropagation();
      renderCircuitCanvas(container);
    },
    finishWire(componentId, pinId, e) {
      if (!container._wirePending) return;
      e.stopPropagation();
      if (container._wirePending.componentId !== componentId || container._wirePending.pinId !== pinId) {
        addConnection(
          { component: container._wirePending.componentId, pin: container._wirePending.pinId },
          { component: componentId, pin: pinId }
        );
        addToast('Connection added', 'success');
      }
      container._wirePending = null;
      renderCircuitCanvas(container);
    }
  };

  document.addEventListener('mouseup', stopDrag);
  return container;
}

export function renderCircuitCanvas(container) {
  const state = getState();
  const svg = container.svg;
  if (!svg) return;

  svg.innerHTML = '';
  const zoom = state.ui.zoom;
  const pan = state.ui.pan;

  const defs = document.createElementNS(SVG_NS, 'defs');
  const pattern = document.createElementNS(SVG_NS, 'pattern');
  pattern.id = 'circuit-grid';
  pattern.setAttribute('width', GRID);
  pattern.setAttribute('height', GRID);
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  const dot = document.createElementNS(SVG_NS, 'circle');
  dot.setAttribute('cx', GRID / 2);
  dot.setAttribute('cy', GRID / 2);
  dot.setAttribute('r', '0.9');
  dot.setAttribute('fill', 'rgba(255,255,255,.10)');
  pattern.appendChild(dot);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const world = document.createElementNS(SVG_NS, 'g');
  world.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${zoom})`);
  svg.appendChild(world);

  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', '-3000');
  bg.setAttribute('y', '-3000');
  bg.setAttribute('width', '6000');
  bg.setAttribute('height', '6000');
  bg.setAttribute('fill', '#0a0a0c');
  bg.setAttribute('data-grid', 'true');
  world.appendChild(bg);

  if (state.ui.showGrid) {
    const grid = bg.cloneNode(false);
    grid.setAttribute('fill', 'url(#circuit-grid)');
    grid.setAttribute('pointer-events', 'none');
    world.appendChild(grid);
  }

  const wires = document.createElementNS(SVG_NS, 'g');
  wires.id = 'wires';
  world.appendChild(wires);

  for (const conn of state.project.connections) {
    const a = state.project.components.find(c => c.id === conn.fromComponent);
    const b = state.project.components.find(c => c.id === conn.toComponent);
    if (!a || !b) continue;
    const from = getPinWorldPosition(a, conn.fromPin);
    const to = getPinWorldPosition(b, conn.toPin);
    const sa = state.simulation.state?.components?.[a.id]?.pins?.[conn.fromPin];
    const sb = state.simulation.state?.components?.[b.id]?.pins?.[conn.toPin];
    const active = sa?.digital === 'HIGH' || sb?.digital === 'HIGH';
    const fromDef = COMPONENT_MAP[a.type];
    const toDef = COMPONENT_MAP[b.type];
    const fromPin = fromDef?.pins.find(p => p.id === conn.fromPin);
    const toPin = toDef?.pins.find(p => p.id === conn.toPin);
    let color = '#62646b';
    if ([fromPin, toPin].some(p => p?.type === 'ground' || p?.name?.toUpperCase().includes('GND'))) color = '#666';
    else if ([fromPin, toPin].some(p => p?.type === 'power' || /VCC|5V|3V3|VIN/.test((p?.name || '').toUpperCase()))) color = '#ff453a';
    if (active) color = '#ffd60a';
    const midX = (from.x + to.x) / 2;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', active ? '3' : '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.style.filter = active ? 'drop-shadow(0 0 5px rgba(255,214,10,.45))' : 'none';
    path.style.cursor = 'pointer';
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      removeConnection(conn.id);
      addToast('Connection removed', 'info');
    });
    wires.appendChild(path);
  }

  const components = document.createElementNS(SVG_NS, 'g');
  components.id = 'components';
  world.appendChild(components);

  for (const component of state.project.components) {
    const sim = state.simulation.state?.components?.[component.id];
    const selected = state.project.selectedIds.includes(component.id);
    const g = ComponentRenderer({
      component,
      simState: sim,
      selected,
      hoveredPin: null,
      showPinLabels: true,
      onPinClick: (pinId, e) => {
        const interaction = container._interaction;
        if (!interaction) return;
        if (container._wirePending) {
          interaction.finishWire(component.id, pinId, e);
        } else {
          interaction.beginWire(component.id, pinId, e);
        }
      },
      onComponentClick: (e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }
    });
    if (!g) continue;
    g.setAttribute('data-component-id', component.id);
    g.style.cursor = 'grab';

    g.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target?.closest?.('circle')) return;
      e.stopPropagation();
      container._interaction.beginComponentDrag(component.id, e);
    });

    g.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      rotateComponent(component.id);
    });
    components.appendChild(g);
  }

  if (container._wirePending) {
    const p = container._wirePending;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M ${p.x} ${p.y} L ${p.mouseX} ${p.mouseY}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0a84ff');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-dasharray', '7 5');
    world.appendChild(path);
  }
}

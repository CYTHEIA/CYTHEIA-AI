import { useRef, useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { useSimulationStore } from '@/store/simulationStore';
import { ComponentRenderer, getPinWorldPosition } from '@/components/ComponentRenderer';
import { COMPONENT_MAP } from '@/components/library';
import type { EnvironmentObject, EnvironmentObjectType, ID } from '@/types';
import { classifyConnection } from '@/simulation/wireClassification';

const GRID_SIZE = 20;

export function CircuitCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const components = useProjectStore((s) => s.components);
  const connections = useProjectStore((s) => s.connections);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const addComponent = useProjectStore((s) => s.addComponent);
  const moveComponent = useProjectStore((s) => s.moveComponent);
  const rotateComponent = useProjectStore((s) => s.rotateComponent);
  const removeComponents = useProjectStore((s) => s.removeComponents);
  const duplicateComponent = useProjectStore((s) => s.duplicateComponent);
  const selectComponent = useProjectStore((s) => s.selectComponent);
  const clearSelection = useProjectStore((s) => s.clearSelection);
  const addConnection = useProjectStore((s) => s.addConnection);
  const removeConnection = useProjectStore((s) => s.removeConnection);
  const pushHistory = useProjectStore((s) => s.pushHistory);
  const environment = useProjectStore((s) => s.environment);
  const addEnvironmentObject = useProjectStore((s) => s.addEnvironmentObject);
  const moveEnvironmentObject = useProjectStore((s) => s.moveEnvironmentObject);
  const removeEnvironmentObject = useProjectStore((s) => s.removeEnvironmentObject);

  const showGrid = useUIStore((s) => s.showGrid);
  const snapToGrid = useUIStore((s) => s.snapToGrid);
  const zoom = useUIStore((s) => s.zoom);
  const pan = useUIStore((s) => s.pan);
  const setZoom = useUIStore((s) => s.setZoom);
  const setPan = useUIStore((s) => s.setPan);
  const draggingComponent = useUIStore((s) => s.draggingComponent);
  const setDraggingComponent = useUIStore((s) => s.setDraggingComponent);
  const addToast = useUIStore((s) => s.addToast);

  const simState = useSimulationStore((s) => s.state);

  const [dragging, setDragging] = useState<{ id: ID; offsetX: number; offsetY: number } | null>(null);
  const [wireStart, setWireStart] = useState<{ component: ID; pin: string; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<ID | null>(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<ID | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<ID | null>(null);
  const [draggingEnvironment, setDraggingEnvironment] = useState<{ id: ID; offsetX: number; offsetY: number } | null>(null);

  const snap = useCallback(
    (v: number) => (snapToGrid ? Math.round(v / GRID_SIZE) * GRID_SIZE : v),
    [snapToGrid]
  );

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as Element).tagName === 'rect' && (e.target as Element).getAttribute('data-grid') === 'true') {
        clearSelection();
        setSelectedConnectionId(null);
        setSelectedEnvironmentId(null);
        setWireStart(null);
      }
    },
    [clearSelection]
  );

  const handlePinClick = useCallback(
    (componentId: ID, pinId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const comp = components.find((c) => c.id === componentId);
      if (!comp) return;
      const pinPos = getPinWorldPosition(comp, pinId);

      if (wireStart) {
        if (wireStart.component !== componentId || wireStart.pin !== pinId) {
          addConnection(
            { component: wireStart.component, pin: wireStart.pin },
            { component: componentId, pin: pinId }
          );
          addToast('Connection added', 'success');
        }
        setWireStart(null);
      } else {
        setWireStart({ component: componentId, pin: pinId, x: pinPos.x, y: pinPos.y });
      }
    },
    [components, wireStart, addConnection, addToast]
  );

  const handleComponentClick = useCallback(
    (e: React.MouseEvent, id: ID) => {
      e.stopPropagation();
      if (wireStart) return;
      if (e.ctrlKey || e.metaKey) {
        useProjectStore.getState().toggleSelect(id);
      } else {
        selectComponent(id);
      }
    },
    [selectComponent, wireStart]
  );

  const handleComponentMouseDown = useCallback(
    (e: React.MouseEvent, id: ID) => {
      if (wireStart) return;
      e.stopPropagation();
      const comp = components.find((c) => c.id === id);
      if (!comp) return;
      const world = screenToWorld(e.clientX, e.clientY);
      if (e.ctrlKey || e.metaKey) {
        useProjectStore.getState().toggleSelect(id);
      } else if (!selectedIds.includes(id)) {
        selectComponent(id);
      }
      pushHistory('Move component');
      setDragging({ id, offsetX: world.x - comp.x, offsetY: world.y - comp.y });
    },
    [components, screenToWorld, selectComponent, selectedIds, pushHistory, wireStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      setMousePos(world);

      if (dragging) {
        const newX = snap(world.x - dragging.offsetX);
        const newY = snap(world.y - dragging.offsetY);
        moveComponent(dragging.id, newX, newY);
      }
      if (draggingEnvironment) {
        moveEnvironmentObject(draggingEnvironment.id, snap(world.x - draggingEnvironment.offsetX), snap(world.y - draggingEnvironment.offsetY));
      }

      if (panning && panStart) {
        setPan({
          x: panStart.panX + (e.clientX - panStart.x),
          y: panStart.panY + (e.clientY - panStart.y),
        });
      }
    },
    [screenToWorld, dragging, draggingEnvironment, snap, moveComponent, moveEnvironmentObject, panning, panStart, setPan]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setDraggingEnvironment(null);
    setPanning(false);
    setPanStart(null);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || e.button === 2 || e.target === svgRef.current) {
        if (e.button === 1 || e.button === 2) {
          e.preventDefault();
          setPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
        }
      }
    },
    [pan]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.2, Math.min(3, zoom * delta));
        setZoom(newZoom);
      }
    },
    [zoom, setZoom]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('component-type');
      const environmentType = e.dataTransfer.getData('environment-type');
      const world = screenToWorld(e.clientX, e.clientY);
      if (environmentType) {
        addEnvironmentObject(environmentType as EnvironmentObjectType, snap(world.x), snap(world.y));
        addToast(`Added ${environmentType.replace(/-/g, ' ')}`, 'success');
        return;
      }
      if (type && COMPONENT_MAP[type]) {
        addComponent(type, snap(world.x), snap(world.y));
        addToast(`Added ${COMPONENT_MAP[type].label}`, 'success');
      }
    },
    [screenToWorld, snap, addComponent, addToast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Keyboard shortcuts for canvas
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const isTextEditor =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable ||
    !!target.closest('.monaco-editor');

  if (isTextEditor) return;
      if (e.key === 'r' || e.key === 'R') {
        if (selectedIds.length === 1) rotateComponent(selectedIds[0]);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnectionId) {
          removeConnection(selectedConnectionId);
          setSelectedConnectionId(null);
        } else if (selectedIds.length > 0) removeComponents(selectedIds);
        if (selectedEnvironmentId) {
          removeEnvironmentObject(selectedEnvironmentId);
          setSelectedEnvironmentId(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length === 1) duplicateComponent(selectedIds[0]);
      }
      if (e.key === 'Escape') {
        setWireStart(null);
        clearSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selected = useProjectStore.getState().components.filter((component) => selectedIds.includes(component.id));
        if (selected.length > 0) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('nexel-copy-components', { detail: selected }));
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('nexel-paste-components'));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds, selectedConnectionId, selectedEnvironmentId, rotateComponent, removeComponents, removeConnection, removeEnvironmentObject, duplicateComponent, clearSelection]);

  useEffect(() => {
    let clipboard: typeof components = [];
    const onCopy = (event: Event) => {
      clipboard = (event as CustomEvent<typeof components>).detail.map((component) => ({
        ...component,
        props: { ...component.props },
      }));
    };
    const onPaste = () => {
      const pastedIds = clipboard.map((component) => {
        const id = addComponent(component.type, component.x + GRID_SIZE, component.y + GRID_SIZE);
        return id;
      }).filter((id): id is ID => Boolean(id));
      if (pastedIds.length > 0) {
        useProjectStore.getState().selectMany(pastedIds);
      }
    };
    window.addEventListener('nexel-copy-components', onCopy);
    window.addEventListener('nexel-paste-components', onPaste);
    return () => {
      window.removeEventListener('nexel-copy-components', onCopy);
      window.removeEventListener('nexel-paste-components', onPaste);
    };
  }, [addComponent, components]);

  // Auto-place dragging component from library
  useEffect(() => {
    if (!draggingComponent) return;
    const world = mousePos || { x: 400, y: 300 };
    addComponent(draggingComponent, snap(world.x), snap(world.y));
    addToast(`Added ${COMPONENT_MAP[draggingComponent]?.label}`, 'success');
    setDraggingComponent(null);
  }, [draggingComponent]);

  const gridWidth = 4000;
  const gridHeight = 4000;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a1a1e]">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab"
        style={{ cursor: panning ? 'grabbing' : 'default' }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={(e) => e.preventDefault()}
      >
        <defs>
          <pattern id="circuit-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="0.8" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {showGrid && (
            <rect
              data-grid="true"
              x={-gridWidth / 2}
              y={-gridHeight / 2}
              width={gridWidth}
              height={gridHeight}
              fill="url(#circuit-grid)"
            />
          )}

          {/* Connections */}
          {connections.map((conn) => {
            const fromComp = components.find((c) => c.id === conn.fromComponent);
            const toComp = components.find((c) => c.id === conn.toComponent);
            if (!fromComp || !toComp) return null;
            const from = getPinWorldPosition(fromComp, conn.fromPin);
            const to = getPinWorldPosition(toComp, conn.toPin);

            const fromState = simState?.components[conn.fromComponent]?.pins[conn.fromPin];
            const toState = simState?.components[conn.toComponent]?.pins[conn.toPin];
            const isActive = fromState?.digital === 'HIGH' || toState?.digital === 'HIGH';
            const wire = classifyConnection(conn, components);

            const midX = (from.x + to.x) / 2;
            const path = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;

            return (
              <g key={conn.id} className="group">
                <path
                  d={path}
                  fill="none"
                  stroke={selectedConnectionId === conn.id ? '#ffffff' : wire.color}
                  strokeWidth={selectedConnectionId === conn.id || hoveredConnectionId === conn.id ? 3 : isActive ? 2.5 : 2}
                  className="transition-all"
                  style={{ filter: isActive ? `drop-shadow(0 0 4px ${wire.color})` : hoveredConnectionId === conn.id ? `drop-shadow(0 0 3px ${wire.color})` : 'none' }}
                />
                <circle cx={from.x} cy={from.y} r={3.5} fill={wire.color} stroke="#1a1a1e" strokeWidth={1} />
                <circle cx={to.x} cy={to.y} r={3.5} fill={wire.color} stroke="#1a1a1e" strokeWidth={1} />
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(conn.id);
                  }}
                  onMouseEnter={() => setHoveredConnectionId(conn.id)}
                  onMouseLeave={() => setHoveredConnectionId(null)}
                />
              </g>
            );
          })}

          {/* Wire being drawn */}
          {wireStart && mousePos && (
            <path
              d={`M ${wireStart.x} ${wireStart.y} L ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#0a84ff"
              strokeWidth={2}
              strokeDasharray="5,3"
            />
          )}

          {environment.map((object) => (
            <EnvironmentRenderer
              key={object.id}
              object={object}
              selected={selectedEnvironmentId === object.id}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedEnvironmentId(object.id);
                clearSelection();
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
                const world = screenToWorld(event.clientX, event.clientY);
                setSelectedEnvironmentId(object.id);
                setDraggingEnvironment({ id: object.id, offsetX: world.x - object.x, offsetY: world.y - object.y });
              }}
            />
          ))}

          {/* Components */}
          {components.map((comp) => (
            <ComponentRenderer
              key={comp.id}
              component={comp}
              simState={simState?.components[comp.id]}
              selected={selectedIds.includes(comp.id)}
              hoveredPin={hoveredPin}
              onPinClick={(pinId, e) => handlePinClick(comp.id, pinId, e)}
              onComponentClick={(e) => handleComponentClick(e, comp.id)}
              onComponentMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
              showPinLabels={true}
            />
          ))}
        </g>
      </svg>

      {/* Wire drawing indicator */}
      {wireStart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 backdrop-blur-sm">
          Click a pin to connect, or press Esc to cancel
        </div>
      )}

      {selectedConnectionId && (() => {
        const connection = connections.find((item) => item.id === selectedConnectionId);
        if (!connection) return null;
        const wire = classifyConnection(connection, components) as ReturnType<typeof classifyConnection> & { fromName?: string; toName?: string };
        return (
          <div className="absolute top-4 right-4 w-56 px-3 py-2 bg-[#2a2a2e] border border-white/10 rounded-lg shadow-xl text-xs">
            <div className="font-medium text-white mb-1">Wire</div>
            <div className="text-gray-400">Type: <span style={{ color: wire.color }}>{wire.label}</span></div>
            <div className="text-gray-500 mt-1 truncate">Net: {wire.net}</div>
            <div className="text-gray-500 truncate">From: {wire.fromName}</div>
            <div className="text-gray-500 truncate">To: {wire.toName}</div>
          </div>
        );
      })()}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-[#2a2a2e] border border-white/10 rounded-lg p-1">
        <button
          onClick={() => setZoom(Math.min(3, zoom * 1.2))}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(0.2, zoom * 0.8))}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-xs"
        >
          ⌖
        </button>
      </div>

      {/* Empty state */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Drag components from the left panel to start building</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EnvironmentRenderer({ object, selected, onClick, onMouseDown }: { object: EnvironmentObject; selected: boolean; onClick: (event: React.MouseEvent) => void; onMouseDown: (event: React.MouseEvent) => void }) {
  const fill = object.type === 'line-track' ? '#111113' : object.type === 'reflective-surface' ? '#c7d2fe' : object.type === 'light-source' ? '#ffd60a' : object.type === 'dark-area' ? '#09090b' : object.type === 'ground-platform' ? '#3a3a3c' : '#8b5e3c';
  return (
    <g transform={`translate(${object.x} ${object.y}) rotate(${object.rotation})`} onClick={onClick} onMouseDown={onMouseDown} className="cursor-pointer">
      <rect x={-object.width / 2} y={-object.height / 2} width={object.width} height={object.height} rx={6} fill={fill} fillOpacity={0.8} stroke={selected ? '#0a84ff' : '#ffffff22'} strokeWidth={selected ? 2 : 1} />
      <text textAnchor="middle" y={4} fill="#ffffffaa" style={{ fontSize: 9, pointerEvents: 'none' }}>{object.type.replace(/-/g, ' ')}</text>
    </g>
  );
}

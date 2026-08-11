import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code2, Terminal, Bug, Brain, Send, Trash2, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { useSimulationStore } from '@/store/simulationStore';
import { parseAICommand, buildContextString } from '@/services/aiAssistant';
import type { AIMessage, AIAction } from '@/types';
import { uid } from '@/utils/uid';

export function BottomPanel() {
  const open = useUIStore((s) => s.bottomPanelOpen);
  const toggle = useUIStore((s) => s.toggleBottomPanel);
  const tab = useUIStore((s) => s.bottomPanelTab);
  const setTab = useUIStore((s) => s.setBottomPanelTab);
  const [height, setHeight] = useState(280);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (resizing) {
      const onMove = (e: MouseEvent) => {
        const newHeight = window.innerHeight - e.clientY;
        setHeight(Math.max(120, Math.min(600, newHeight)));
      };
      const onUp = () => setResizing(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [resizing]);

  if (!open) {
    return (
      <div className="h-10 bg-[#1a1a1e] border-t border-white/5 flex items-center justify-center">
        <button onClick={toggle} className="p-2 text-gray-400 hover:text-white">
          <ChevronUp size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#1a1a1e] border-t border-white/5" style={{ height }}>
      {/* Resize handle */}
      <div
        className="h-1 cursor-row-resize hover:bg-blue-500/30 transition-colors flex-shrink-0"
        onMouseDown={() => setResizing(true)}
      />

      {/* Tab bar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <TabButton icon={Code2} label="Code" active={tab === 'code'} onClick={() => setTab('code')} />
          <TabButton icon={Terminal} label="Serial Monitor" active={tab === 'serial'} onClick={() => setTab('serial')} />
          <TabButton icon={Bug} label="Console" active={tab === 'console'} onClick={() => setTab('console')} />
          <TabButton icon={Brain} label="NEXEL AI" active={tab === 'ai'} onClick={() => setTab('ai')} />
        </div>
        <button onClick={toggle} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors">
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'code' && <CodeEditor />}
        {tab === 'serial' && <SerialMonitor />}
        {tab === 'console' && <Console />}
        {tab === 'ai' && <AIAssistant />}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function CodeEditor() {
  const code = useProjectStore((s) => s.code);
  const updateCode = useProjectStore((s) => s.updateCode);
  const [activeFile, setActiveFile] = useState(0);

  return (
    <div className="flex h-full">
      {/* File tabs */}
      <div className="w-32 border-r border-white/5 p-2 flex flex-col gap-1">
        {code.map((file, i) => (
          <button
            key={i}
            onClick={() => setActiveFile(i)}
            className={`px-2 py-1.5 rounded text-xs text-left transition-colors ${
              activeFile === i ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          language="cpp"
          value={code[activeFile]?.content || ''}
          onChange={(value) => updateCode(activeFile, value || '')}
          options={{
            fontSize: 13,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

function SerialMonitor() {
  const serialOutput = useSimulationStore((s) => s.serialOutput);
  const clearSerial = useSimulationStore((s) => s.clearSerial);
  const running = useSimulationStore((s) => s.running);
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [serialOutput, autoScroll]);

  const filtered = serialOutput.filter((line) => line.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <input
          type="text"
          placeholder="Search serial output..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-2 py-1 rounded text-xs transition-colors ${autoScroll ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-400'}`}
        >
          Auto-scroll
        </button>
        <button
          onClick={clearSerial}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          title="Clear"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            {running ? 'Waiting for serial output...' : 'Run the simulation to see serial output'}
          </div>
        ) : (
          filtered.map((line) => (
            <div key={line.id} className="flex gap-2 text-gray-300 hover:bg-white/5 px-1 rounded">
              <span className="text-gray-600 flex-shrink-0">
                {new Date(line.timestamp).toLocaleTimeString()}
              </span>
              <span className="whitespace-pre-wrap">{line.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Console() {
  const simState = useSimulationStore((s) => s.state);
  const running = useSimulationStore((s) => s.running);
  const errors = simState?.errors || [];

  return (
    <div className="flex flex-col h-full p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        <span className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
        {running ? 'Simulation running' : 'Simulation stopped'}
        {simState && <span className="ml-auto">Time: {(simState.time / 1000).toFixed(2)}s</span>}
      </div>

      {errors.length === 0 ? (
        <div className="text-gray-600 text-sm">No errors. Simulation is running smoothly.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {errors.map((err, i) => (
            <div key={i} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
              {err}
            </div>
          ))}
        </div>
      )}

      {simState && running && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Arduino Pin Monitor</div>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(simState.arduinoPins).map(([pin, state]: [string, any]) => (
              <div key={pin} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs">
                <span className="text-gray-500">D{pin}</span>
                <span className={state.digital === 'HIGH' ? 'text-yellow-300' : 'text-gray-600'}>
                  {state.digital}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content: 'Hi! I\'m NEXEL AI. I can help you build circuits, write code, and debug your projects. Try asking me to "Add an LED to pin 13" or "Write code to blink an LED".',
    },
  ]);
  const [input, setInput] = useState('');
  const [pendingActions, setPendingActions] = useState<AIAction[] | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const components = useProjectStore((s) => s.components);
  const connections = useProjectStore((s) => s.connections);
  const code = useProjectStore((s) => s.code);
  const addComponent = useProjectStore((s) => s.addComponent);
  const removeComponent = useProjectStore((s) => s.removeComponent);
  const rotateComponent = useProjectStore((s) => s.rotateComponent);
  const addConnection = useProjectStore((s) => s.addConnection);
  const updateCode = useProjectStore((s) => s.updateCode);
  const pushHistory = useProjectStore((s) => s.pushHistory);
  const simState = useSimulationStore((s) => s.state);
  const simRunning = useSimulationStore((s) => s.running);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingActions]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: AIMessage = { id: uid(), role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    const query = input;
    setInput('');

    const ctx = {
      components,
      connections,
      code,
      errors: simState?.errors || [],
      simulationRunning: simRunning,
    };

    const actions = parseAICommand(query, ctx);

    // Find explanation actions
    const explainAction = actions.find((a) => a.type === 'EXPLAIN');
    if (explainAction) {
      const assistantMsg: AIMessage = {
        id: uid(),
        role: 'assistant',
        content: explainAction.params.explanation,
        actions: actions.filter((a) => a.type !== 'EXPLAIN'),
      };
      setMessages((m) => [...m, assistantMsg]);
      setPendingActions(actions.filter((a) => a.type !== 'EXPLAIN' && a.type !== 'CREATE_PROJECT'));
    } else {
      const assistantMsg: AIMessage = {
        id: uid(),
        role: 'assistant',
        content: `I'll make ${actions.length} change${actions.length !== 1 ? 's' : ''} to your project. Review the actions below and click "Apply" to execute them.`,
        actions,
      };
      setMessages((m) => [...m, assistantMsg]);
      setPendingActions(actions);
    }
  }

  function applyActions(actions: AIAction[]) {
    pushHistory('AI modifications');
    for (const action of actions) {
      switch (action.type) {
        case 'ADD_COMPONENT':
          addComponent(action.params.type, action.params.x, action.params.y);
          break;
        case 'REMOVE_COMPONENT':
          removeComponent(action.params.id);
          break;
        case 'ROTATE_COMPONENT':
          rotateComponent(action.params.id);
          break;
        case 'UPDATE_CODE':
          updateCode(0, action.params.code);
          break;
        case 'CONNECT':
          // Find components by type or pin reference
          const fromParts = action.params.from.match(/pin\s*(\d+)/i);
          const toParts = action.params.to.match(/pin\s*(\d+)/i);
          if (fromParts && toParts) {
            const arduino = components.find((c) => c.type.startsWith('arduino'));
            if (arduino) {
              addConnection(
                { component: arduino.id, pin: `d${fromParts[1]}` },
                { component: arduino.id, pin: `d${toParts[1]}` }
              );
            }
          }
          break;
      }
    }
    setPendingActions(null);
    addToast('AI changes applied', 'success');
  }

  function dismissActions() {
    setPendingActions(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white/5 text-gray-200 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
                  {msg.actions.map((a, i) => (
                    <div key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono">{a.type}</span>
                      {a.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pending actions preview */}
      {pendingActions && pendingActions.length > 0 && (
        <div className="p-3 border-t border-white/5 bg-blue-500/5">
          <div className="text-xs text-blue-300 mb-2 font-medium">Preview changes:</div>
          <div className="flex flex-col gap-1 mb-2">
            {pendingActions.map((a, i) => (
              <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-500/20 rounded font-mono text-blue-300">{a.type}</span>
                {a.description}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => applyActions(pendingActions)}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Apply Changes
            </button>
            <button
              onClick={dismissActions}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask NEXEL AI... (e.g. 'Add an LED to pin 13')"
            rows={1}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
          />
          <button
            onClick={handleSend}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { create } from 'zustand';
import type { SimulationState } from '@/types';
import { SimulationEngine } from '@/simulation/engine';
import { useProjectStore } from './projectStore';

interface SimulationStore {
  engine: SimulationEngine | null;
  running: boolean;
  paused: boolean;
  speed: number;
  state: SimulationState | null;
  tickInterval: ReturnType<typeof setInterval> | null;
  serialOutput: { id: string; text: string; timestamp: number }[];

  initEngine: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  tick: () => void;
  clearSerial: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  engine: null,
  running: false,
  paused: false,
  speed: 1,
  state: null,
  tickInterval: null,
  serialOutput: [],

  initEngine: () => {
    const engine = new SimulationEngine();
    engine.setOnStateUpdate((state) => {
      set({ state });
      if (state.serialOutput.length > 0) {
        const last = state.serialOutput[state.serialOutput.length - 1];
        if (last) {
          set((s) => ({
            serialOutput: [...s.serialOutput.slice(-499), last as any],
          }));
        }
      }
    });
    set({ engine });
  },

  start: () => {
    const { engine } = get();
    if (!engine) return;

    const project = useProjectStore.getState();
    const code = project.code[0]?.content || '';
    engine.load(project.components, project.connections, code, get().speed);
    const ok = engine.start();
    if (ok) {
      set({ running: true, paused: false, serialOutput: [] });
      const interval = setInterval(() => {
        get().tick();
      }, 16);
      set({ tickInterval: interval });
    }
  },

  pause: () => {
    const { engine } = get();
    engine?.pause();
    set({ paused: true });
  },

  resume: () => {
    const { engine } = get();
    engine?.resume();
    set({ paused: false });
  },

  stop: () => {
    const { engine, tickInterval } = get();
    engine?.stop();
    if (tickInterval) clearInterval(tickInterval);
    set({ running: false, paused: false, tickInterval: null, serialOutput: [] });
  },

  setSpeed: (speed) => {
    const { engine } = get();
    engine?.setSpeed(speed);
    set({ speed });
  },

  tick: () => {
    const { engine } = get();
    engine?.tick();
  },

  clearSerial: () => set({ serialOutput: [] }),
}));

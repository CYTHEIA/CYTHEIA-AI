import { create } from 'zustand';
import type { View } from '@/types';

interface UIStore {
  view: View;
  setView: (view: View) => void;

  // Left sidebar
  leftSidebarTab: 'projects' | 'recent' | 'components' | 'templates' | 'favorites' | 'history' | 'plans';
  setLeftSidebarTab: (tab: UIStore['leftSidebarTab']) => void;
  leftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;

  // Right sidebar
  rightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  // Bottom panel
  bottomPanelOpen: boolean;
  bottomPanelTab: 'code' | 'serial' | 'console' | 'ai';
  setBottomPanelTab: (tab: UIStore['bottomPanelTab']) => void;
  toggleBottomPanel: () => void;

  // Canvas
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  pan: { x: number; y: number };
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Toasts
  toasts: { id: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }[];
  addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Dragging state for component from library
  draggingComponent: string | null;
  setDraggingComponent: (type: string | null) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  view: 'landing',
  setView: (view) => set({ view }),

  leftSidebarTab: 'components',
  setLeftSidebarTab: (tab) => set({ leftSidebarTab: tab }),
  leftSidebarOpen: true,
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),

  rightSidebarOpen: true,
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),

  bottomPanelOpen: true,
  bottomPanelTab: 'code',
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab, bottomPanelOpen: true }),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),

  showGrid: true,
  snapToGrid: true,
  zoom: 1,
  pan: { x: 0, y: 0 },
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  theme: 'dark',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  draggingComponent: null,
  setDraggingComponent: (type) => set({ draggingComponent: type }),
}));

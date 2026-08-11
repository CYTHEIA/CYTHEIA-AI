import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { Editor } from '@/components/editor/Editor';
import { PlansPage } from '@/pages/PlansPage';

export default function App() {
  const view = useUIStore((s) => s.view);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;

      // Command palette (Ctrl/Cmd + K) — works everywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (isInput) return;

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Save (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // The autosave logic in TopBar handles this, but we trigger a toast
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCommandPalette, undo, redo]);

  if (view === 'landing') return <LandingPage />;
  if (view === 'dashboard') return <Dashboard />;
  if (view === 'plans') return <PlansPage />;
  return <Editor />;
}

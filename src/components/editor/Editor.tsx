import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { CircuitCanvas } from './CircuitCanvas';
import { BottomPanel } from './BottomPanel';
import { CommandPalette } from './CommandPalette';
import { Toasts } from './Toasts';

export function Editor() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0c] text-white overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CircuitCanvas />
          </div>
          <BottomPanel />
        </div>
        <RightSidebar />
      </div>
      <CommandPalette />
      <Toasts />
    </div>
  );
}

import { getState, subscribe, updateCode, setBottomPanelTab, toggleBottomPanel } from './store.js';

export function createBottomPanel() {
  const container = document.createElement('div');
  container.className = 'bg-[#1a1a1c] border-t border-white/5 flex-shrink-0 flex flex-col relative';
  container.style.height = `${getState().ui.bottomPanelHeight}px`;
  container.style.minHeight = '120px';
  container.style.maxHeight = '70vh';

  const grip = document.createElement('div');
  grip.style.cssText = 'position:absolute;left:0;right:0;top:-3px;height:6px;cursor:row-resize;z-index:20;';
  let resizing = false;
  let startY = 0;
  let startHeight = 0;
  grip.addEventListener('mousedown', (e) => {
    e.preventDefault();
    resizing = true;
    startY = e.clientY;
    startHeight = getState().ui.bottomPanelHeight;
    const move = (ev) => {
      if (!resizing) return;
      const height = Math.max(120, Math.min(Math.round(window.innerHeight * 0.7), startHeight - (ev.clientY - startY)));
      container.style.height = `${height}px`;
      getState().ui.bottomPanelHeight = height;
    };
    const up = () => {
      resizing = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
  container.appendChild(grip);

  const header = document.createElement('div');
  header.className = 'h-12 px-4 border-b border-white/5 flex items-center gap-2 flex-shrink-0';

  const codeTab = document.createElement('button');
  const serialTab = document.createElement('button');
  const close = document.createElement('button');
  close.className = 'ml-auto text-gray-500 hover:text-white px-2';
  close.textContent = '×';
  close.title = 'Close panel';
  close.onclick = toggleBottomPanel;

  function styleTabs() {
    const active = getState().ui.bottomPanelTab;
    codeTab.className = active === 'code' ? 'px-3 py-1.5 text-sm text-white border-b-2 border-blue-500' : 'px-3 py-1.5 text-sm text-gray-500 hover:text-white';
    serialTab.className = active === 'serial' ? 'px-3 py-1.5 text-sm text-white border-b-2 border-blue-500' : 'px-3 py-1.5 text-sm text-gray-500 hover:text-white';
  }
  codeTab.textContent = '< Code';
  serialTab.textContent = '▣ Serial';
  codeTab.onclick = () => { setBottomPanelTab('code'); render(); };
  serialTab.onclick = () => { setBottomPanelTab('serial'); render(); };
  header.append(codeTab, serialTab, close);
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flex-1 min-h-0 overflow-hidden';
  container.appendChild(content);

  function render() {
    styleTabs();
    const state = getState();
    content.innerHTML = '';
    if (state.ui.bottomPanelTab === 'serial') {
      const output = document.createElement('pre');
      output.className = 'm-0 w-full h-full overflow-auto bg-[#0f0f11] text-emerald-300 p-4 font-mono text-sm leading-6 whitespace-pre-wrap';
      const lines = state.simulation.serialOutput || [];
      output.textContent = lines.length ? lines.join('\n') : 'Serial monitor ready. Run the simulation to see Serial output.';
      content.appendChild(output);
      output.scrollTop = output.scrollHeight;
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.className = 'w-full h-full bg-[#0f0f11] text-gray-200 p-4 outline-none resize-none font-mono text-sm leading-6 border-0';
    textarea.spellcheck = false;
    textarea.value = state.project.code[0]?.content || '';
    textarea.addEventListener('input', () => updateCode(0, textarea.value));
    content.appendChild(textarea);
  }

  subscribe(() => {
    if (getState().ui.bottomPanelTab === 'serial') render();
  });
  render();
  return container;
}

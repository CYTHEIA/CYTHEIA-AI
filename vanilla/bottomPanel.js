export function createBottomPanel() {
  const container = document.createElement('div');
  container.className = 'h-64 bg-[#1a1a1c] border-t border-white/5 overflow-y-auto flex-shrink-0';
  
  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-white/5 flex items-center gap-2';
  
  const codeTab = document.createElement('button');
  codeTab.className = 'px-3 py-1 text-sm text-gray-300 hover:text-white';
  codeTab.textContent = '< Code';
  
  const serialTab = document.createElement('button');
  serialTab.className = 'px-3 py-1 text-sm text-gray-400';
  serialTab.textContent = '📟 Serial';
  
  header.appendChild(codeTab);
  header.appendChild(serialTab);
  container.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'p-4 text-gray-500 text-sm h-full overflow-y-auto';
  content.innerHTML = '<p>Code editor will appear here</p>';
  container.appendChild(content);
  
  return container;
}

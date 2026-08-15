import { getState } from './store.js';

export function createToasts() {
  const container = document.createElement('div');
  container.className = 'fixed bottom-4 right-4 z-50 space-y-2 max-w-sm';
  
  return container;
}

export function renderToasts(container) {
  const state = getState();
  container.innerHTML = '';
  container.className = 'fixed bottom-4 right-4 z-50 space-y-2 max-w-sm';
  
  state.ui.toasts.forEach(toast => {
    const el = document.createElement('div');
    const bgColor = toast.type === 'error' ? 'bg-red-500/90' : toast.type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90';
    el.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right`;
    el.textContent = toast.message;
    container.appendChild(el);
  });
}

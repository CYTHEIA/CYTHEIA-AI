import './style.css';
import { getState, subscribe } from './store.js';
import { renderApp } from './app.js';

const root = document.getElementById('root');
let currentView = null;

function mount() {
  const view = getState().ui.view;
  if (view !== currentView) {
    currentView = view;
    renderApp(root);
  }
}

mount();

subscribe(() => {
  mount();
});

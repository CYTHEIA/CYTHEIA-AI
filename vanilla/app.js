import { getState } from './store.js';
import { renderLandingPage } from './pages/landing.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderEditor } from './editor.js';

export function renderApp(container) {
  const state = getState();
  const view = state.ui.view;

  container.innerHTML = '';

  if (view === 'landing') {
    renderLandingPage(container);
  } else if (view === 'dashboard') {
    renderDashboard(container);
  } else if (view === 'editor') {
    renderEditor(container);
  }
}

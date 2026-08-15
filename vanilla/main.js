import './style.css';
import { getState, subscribe, setView } from './store.js';
import { renderApp } from './app.js';

// Mount the application
const root = document.getElementById('root');
renderApp(root);

// Subscribe to state changes and re-render
subscribe((state) => {
  renderApp(root);
});

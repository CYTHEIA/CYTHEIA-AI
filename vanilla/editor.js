import { createTopBar, renderTopBar } from "./topbar.js";
import { createLeftSidebar } from "./leftSidebar.js";
import { createRightSidebar } from "./rightSidebar.js";
import { createCircuitCanvas, renderCircuitCanvas } from "./circuitCanvas.js";
import { createBottomPanel } from "./bottomPanel.js";
import { createCommandPalette, renderCommandPalette } from "./commandPalette.js";
import { createToasts, renderToasts } from "./toasts.js";
import { getState, subscribe } from "./store.js";

function createElement(tag, className = "") {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  return element;
}

let editorElements = {};

export function renderEditor(container) {
  container.innerHTML = "";
  
  const root = createElement("div", "h-screen w-screen flex flex-col bg-[#0a0a0c] text-white overflow-hidden");

  const topBar = createTopBar();
  root.appendChild(topBar);
  editorElements.topBar = topBar;

  const main = createElement("div", "flex-1 flex overflow-hidden");

  const leftSidebar = createLeftSidebar();
  main.appendChild(leftSidebar);
  editorElements.leftSidebar = leftSidebar;

  const center = createElement("div", "flex-1 flex flex-col overflow-hidden");

  const canvasWrapper = createElement("div", "flex-1 overflow-hidden");
  const circuitCanvas = createCircuitCanvas();
  canvasWrapper.appendChild(circuitCanvas);
  center.appendChild(canvasWrapper);
  editorElements.canvas = circuitCanvas;

  const bottomPanel = createBottomPanel();
  center.appendChild(bottomPanel);
  editorElements.bottomPanel = bottomPanel;

  main.appendChild(center);

  const rightSidebar = createRightSidebar();
  main.appendChild(rightSidebar);
  editorElements.rightSidebar = rightSidebar;

  root.appendChild(main);

  const commandPalette = createCommandPalette();
  root.appendChild(commandPalette);
  editorElements.commandPalette = commandPalette;

  const toasts = createToasts();
  root.appendChild(toasts);
  editorElements.toasts = toasts;

  container.appendChild(root);

  // Subscribe to state changes
  subscribe(() => {
    updateEditor();
  });

  updateEditor();
  return root;
}

function updateEditor() {
  const state = getState();
  
  if (editorElements.topBar && editorElements.topBar.updateUI) {
    renderTopBar(editorElements.topBar);
  }
  
  if (editorElements.canvas) {
    renderCircuitCanvas(editorElements.canvas);
  }
  
  if (editorElements.commandPalette) {
    renderCommandPalette(editorElements.commandPalette);
  }
  
  if (editorElements.toasts) {
    renderToasts(editorElements.toasts);
  }
  
  if (editorElements.rightSidebar && editorElements.rightSidebar.updateContent) {
    editorElements.rightSidebar.updateContent();
  }
  
  // Update sidebar visibility
  const leftVisible = state.ui.leftSidebarOpen;
  const rightVisible = state.ui.rightSidebarOpen;
  const bottomVisible = state.ui.bottomPanelOpen;
  
  if (editorElements.leftSidebar) {
    editorElements.leftSidebar.style.display = leftVisible ? 'block' : 'none';
  }
  if (editorElements.rightSidebar) {
    editorElements.rightSidebar.style.display = rightVisible ? 'block' : 'none';
  }
  if (editorElements.bottomPanel) {
    editorElements.bottomPanel.style.display = bottomVisible ? 'block' : 'none';
  }
}
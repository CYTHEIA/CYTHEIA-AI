import { createTopBar, renderTopBar } from "./topbar.js";
import { createLeftSidebar } from "./leftSidebar.js";
import { createRightSidebar } from "./rightSidebar.js";
import { createCircuitCanvas, renderCircuitCanvas } from "./circuitCanvas.js";
import { createBottomPanel } from "./bottomPanel.js";
import { createCommandPalette, renderCommandPalette } from "./commandPalette.js";
import { createToasts, renderToasts } from "./toasts.js";
import { createPlansModal } from "./plansModal.js";
import { getState, subscribe, initEngine, setPlansModalOpen } from "./store.js";

function createElement(tag, className = "") {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  return element;
}

let editorElements = {};
let editorSubscribed = false;

export function renderEditor(container) {
  initEngine();
  container.innerHTML = "";

  const root = createElement("div", "h-screen w-screen flex flex-col bg-[var(--ct-bg)] text-[var(--ct-text)] overflow-hidden");

  const topBar = createTopBar();
  root.appendChild(topBar);
  editorElements.topBar = topBar;

  const main = createElement("div", "flex-1 flex overflow-hidden");

  const leftSidebar = createLeftSidebar();
  main.appendChild(leftSidebar);
  editorElements.leftSidebar = leftSidebar;

  const center = createElement("div", "flex-1 flex flex-col overflow-hidden relative");

  const canvasWrapper = createElement("div", "flex-1 overflow-hidden relative");
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

  const plansModal = createPlansModal();
  root.appendChild(plansModal.element);
  editorElements.plansModal = plansModal;

  container.appendChild(root);

  if (!editorSubscribed) {
    editorSubscribed = true;
    subscribe(() => {
      updateEditor();
    });
  }

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

  if (editorElements.plansModal) {
    if (state.ui.plansModalOpen) {
      editorElements.plansModal.open();
    } else {
      editorElements.plansModal.close();
    }
  }

  if (editorElements.rightSidebar && editorElements.rightSidebar.updateContent) {
    editorElements.rightSidebar.updateContent();
  }

  const leftVisible = state.ui.leftSidebarOpen;
  const rightVisible = state.ui.rightSidebarOpen;
  const bottomVisible = state.ui.bottomPanelOpen;

  if (editorElements.leftSidebar) {
    editorElements.leftSidebar.style.display = leftVisible ? 'flex' : 'none';
  }
  if (editorElements.rightSidebar) {
    editorElements.rightSidebar.style.display = rightVisible ? 'flex' : 'none';
  }
  if (editorElements.bottomPanel) {
    editorElements.bottomPanel.style.display = bottomVisible ? 'flex' : 'none';
  }
}

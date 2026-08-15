import { TEMPLATES } from "../templates.js";
import { COMPONENT_MAP } from "../library.js";
import { setView, newProject, loadProject, addToast } from '../store.js';
import {
  fetchProjects,
  createProject,
  deleteProject,
  duplicateProject,
  exportProject
} from '../services/persistence.js';
import { renderTemplatePreview } from '../templatePreview.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className = '', content = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== '') node.textContent = content;
  return node;
}

function icon(name, size = 14) {
  const paths = {
    back: 'M15 18l-6-6 6-6',
    plus: 'M12 5v14M5 12h14',
    dots: 'M5 12h.01M12 12h.01M19 12h.01',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    open: 'M22 12s-4-6-10-6-10 6-10 6 4 6 10 6 10-6 10-6Z',
    copy: 'M8 8h12v12H8zM4 16V4h12',
    download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 21h16',
    trash: 'M3 6h18M8 6V4h8v2m1 0v14H7V6h10Z',
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    circuit: 'M8 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z'
  };
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', paths[name] || paths.open);
  svg.appendChild(p);
  return svg;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(value) {
  const d = new Date(value || Date.now());
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const today = now.getTime() - d.getTime() < 24 * 3600 * 1000 && sameDay;
  if (today) return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function openMenu(trigger, items) {
  const menu = el('div', 'ct-menu animate-in fade-in');
  for (const item of items) {
    const btn = el('button', `ct-menu-item ${item.danger ? 'ct-menu-item-danger' : ''}`);
    if (item.icon) btn.appendChild(icon(item.icon, 14));
    btn.appendChild(el('span', '', item.label));
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.remove();
      item.onClick();
    });
    menu.appendChild(btn);
  }
  trigger.parentElement.appendChild(menu);
  const close = (e) => {
    if (!menu.contains(e.target) && e.target !== trigger) {
      menu.remove();
      document.removeEventListener('mousedown', close);
    }
  };
  document.addEventListener('mousedown', close);
}

function closeMenu() {
  document.querySelectorAll('.ct-menu').forEach((m) => m.remove());
}

function createProjectCard(project, onOpen, onDelete, onDuplicate, onExport) {
  const data = project.data || {};
  const compCount = data.components?.length || 0;
  const wireCount = data.connections?.length || 0;

  const card = el('div', 'ct-card ct-card-hover group relative flex flex-col cursor-pointer');
  card.addEventListener('click', onOpen);

  const preview = el('div', 'ct-preview', '');
  preview.style.height = '112px';
  if (compCount > 0) {
    renderTemplatePreview(preview, data);
  } else {
    preview.appendChild(el('div', 'text-[11px] text-[#4c4c53]', 'Empty project'));
  }
  card.appendChild(preview);

  const body = el('div', 'flex-1 p-3 flex flex-col gap-2');
  const top = el('div', 'flex items-start justify-between gap-2');
  const title = el('h3', 'text-[13px] font-semibold text-[#f5f5f7] leading-snug truncate', project.name);
  const menuWrap = el('div', 'relative flex-shrink-0');
  const menuBtn = el('button', 'ct-icon-btn opacity-0 group-hover:opacity-100 focus:opacity-100', '');
  menuBtn.appendChild(icon('dots', 16));
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
    openMenu(menuBtn, [
      { label: 'Open', icon: 'open', onClick: onOpen },
      { label: 'Duplicate', icon: 'copy', onClick: onDuplicate },
      { label: 'Export', icon: 'download', onClick: onExport },
      { label: 'Delete', icon: 'trash', danger: true, onClick: onDelete }
    ]);
  });
  menuWrap.appendChild(menuBtn);
  top.appendChild(title);
  top.appendChild(menuWrap);
  body.appendChild(top);

  const desc = el('p', 'text-[12px] leading-relaxed text-[#8a8a92] line-clamp-2 min-h-[30px]', project.description || 'No description');
  body.appendChild(desc);

  const meta = el('div', 'flex items-center justify-between pt-1 border-t border-[#ffffff]/[0.05]');
  const stats = el('div', 'flex items-center gap-3 text-[11px] text-[#6d6d75]');
  if (compCount > 0) {
    stats.appendChild(el('span', 'flex items-center gap-1', ''));
    stats.lastChild.appendChild(icon('circuit', 12));
    stats.lastChild.appendChild(document.createTextNode(`${compCount} comp${compCount === 1 ? '' : 's'}`));
    if (wireCount > 0) {
      stats.appendChild(el('span', '', `· ${wireCount} wire${wireCount === 1 ? '' : 's'}`));
    }
  } else {
    stats.appendChild(el('span', 'text-[#4c4c53]', 'Empty'));
  }
  const modified = el('span', 'flex items-center gap-1', '');
  modified.appendChild(icon('clock', 12));
  modified.appendChild(document.createTextNode(formatDate(project.updatedAt || project.updated_at)));
  meta.appendChild(stats);
  meta.appendChild(modified);
  body.appendChild(meta);

  card.appendChild(body);
  return card;
}

function difficultyBadge(difficulty) {
  const map = {
    Beginner: 'ct-chip-ok',
    Intermediate: 'ct-chip-warn',
    Advanced: 'ct-chip-danger'
  };
  const badge = el('span', `ct-chip ${map[difficulty] || 'ct-chip-ok'}`);
  badge.appendChild(el('span', '', difficulty || 'Beginner'));
  return badge;
}

function componentChips(data) {
  const wrap = el('div', 'flex flex-wrap items-center gap-1.5 min-w-0');
  const seen = new Set();
  for (const comp of data?.components || []) {
    if (seen.has(comp.type)) continue;
    seen.add(comp.type);
    const def = COMPONENT_MAP[comp.type];
    if (!def) continue;
    const chip = el('span', 'ct-chip', def.label);
    chip.title = def.description || def.label;
    wrap.appendChild(chip);
  }
  if (!wrap.childElementCount) wrap.appendChild(el('span', 'text-[11px] text-[#4c4c53]', 'No components'));
  return wrap;
}

function createTemplateCard(tmpl, onUse) {
  const card = el('div', 'ct-card ct-card-hover group relative flex flex-col cursor-pointer');
  card.addEventListener('click', onUse);

  const preview = el('div', 'ct-preview', '');
  preview.style.height = '128px';
  renderTemplatePreview(preview, tmpl.data);
  card.appendChild(preview);

  const body = el('div', 'flex-1 p-3 flex flex-col gap-2');
  const head = el('div', 'flex items-start justify-between gap-2');
  head.appendChild(el('h3', 'text-[13px] font-semibold text-[#f5f5f7] leading-snug', tmpl.name));
  head.appendChild(difficultyBadge(tmpl.difficulty));
  body.appendChild(head);

  body.appendChild(el('p', 'text-[12px] leading-relaxed text-[#8a8a92] line-clamp-2 min-h-[30px]', tmpl.description));

  const chips = componentChips(tmpl.data);
  body.appendChild(chips);

  const footer = el('div', 'pt-2 border-t border-[#ffffff]/[0.05]');
  const btn = el('button', 'ct-btn ct-btn-secondary w-full justify-center group-hover:ct-btn-primary', '');
  btn.appendChild(el('span', '', 'Use Template'));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onUse();
  });
  footer.appendChild(btn);
  body.appendChild(footer);

  card.appendChild(body);
  return card;
}

export async function renderDashboard(container) {
  container.innerHTML = '';

  const main = el('div', 'min-h-screen bg-[var(--ct-bg)] text-[var(--ct-text)] flex flex-col');

  // ---------- Header ----------
  const header = el('header', 'border-b border-[var(--ct-border)]');
  const headerInner = el('div', 'max-w-[1200px] mx-auto w-full px-6 md:px-8');

  const headerTop = el('div', 'flex items-center justify-between gap-4 pt-5 pb-4');
  const backBtn = el('button', 'ct-btn ct-btn-ghost', '');
  backBtn.appendChild(icon('back', 14));
  backBtn.appendChild(el('span', '', 'Back'));
  backBtn.addEventListener('click', () => setView('landing'));

  const headerRight = el('div', 'flex items-center gap-3');
  const projectCount = el('span', 'ct-badge', '');
  projectCount.dataset.label = 'count';
  const newBtn = el('button', 'ct-btn ct-btn-primary', '');
  newBtn.appendChild(icon('plus', 14));
  newBtn.appendChild(el('span', '', 'New Project'));
  newBtn.addEventListener('click', () => {
    newProject('Untitled Project');
    setView('editor');
  });
  headerRight.appendChild(projectCount);
  headerRight.appendChild(newBtn);

  headerTop.appendChild(backBtn);
  headerTop.appendChild(headerRight);
  headerInner.appendChild(headerTop);

  const titleBlock = el('div', 'pb-5');
  titleBlock.appendChild(el('h1', 'text-[22px] font-semibold tracking-tight text-[var(--ct-text)]', 'Dashboard'));
  titleBlock.appendChild(el('p', 'mt-0.5 text-[13px] text-[var(--ct-text-dim)]', 'Your electronics workspace'));
  headerInner.appendChild(titleBlock);
  header.appendChild(headerInner);
  main.appendChild(header);

  // ---------- Tabs ----------
  const tabsBar = el('div', 'sticky top-0 z-20 bg-[var(--ct-bg)]/95 backdrop-blur border-b border-[var(--ct-border)]');
  const tabsInner = el('div', 'max-w-[1200px] mx-auto w-full px-6 md:px-8 flex items-center gap-1');
  const projectsTab = el('button', 'ct-tab ct-tab-active', 'Projects');
  const templatesTab = el('button', 'ct-tab', 'Templates');
  tabsInner.appendChild(projectsTab);
  tabsInner.appendChild(templatesTab);
  tabsBar.appendChild(tabsInner);
  main.appendChild(tabsBar);

  // ---------- Content ----------
  const content = el('main', 'flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-8 py-6');

  function setActiveTab(active) {
    projectsTab.className = `ct-tab ${active === 'projects' ? 'ct-tab-active' : ''}`;
    templatesTab.className = `ct-tab ${active === 'templates' ? 'ct-tab-active' : ''}`;
  }

  // ---------- Projects ----------
  async function showProjects() {
    setActiveTab('projects');
    content.innerHTML = '<div class="py-16 text-center text-[13px] text-[var(--ct-text-faint)]">Loading projects…</div>';
    let projects = [];
    try {
      projects = await fetchProjects();
    } catch {
      projects = [];
    }
    content.innerHTML = '';

    const countBadge = projectCount;
    countBadge.textContent = '';
    countBadge.appendChild(el('span', '', `${projects.length} project${projects.length === 1 ? '' : 's'}`));

    if (projects.length === 0) {
      const empty = el('div', 'py-20 flex flex-col items-center text-center');
      const iconBox = el('div', 'w-11 h-11 rounded-lg border border-[var(--ct-border)] bg-[var(--ct-surface)] flex items-center justify-center text-[var(--ct-text-faint)] mb-4');
      iconBox.appendChild(icon('circuit', 20));
      empty.appendChild(iconBox);
      empty.appendChild(el('h3', 'text-[15px] font-semibold', 'No projects yet'));
      empty.appendChild(el('p', 'mt-1 text-[13px] text-[var(--ct-text-dim)]', 'Start a new circuit or explore the template library.'));
      const cta = el('button', 'ct-btn ct-btn-primary mt-5', '');
      cta.appendChild(icon('plus', 14));
      cta.appendChild(el('span', '', 'New Project'));
      cta.addEventListener('click', () => { newProject('Untitled Project'); setView('editor'); });
      const toTemplates = el('button', 'ct-btn ct-btn-ghost mt-2', 'Browse templates →');
      toTemplates.addEventListener('click', () => showTemplates());
      empty.appendChild(cta);
      empty.appendChild(toTemplates);
      content.appendChild(empty);
      return;
    }

    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4');
    for (const proj of projects) {
      grid.appendChild(createProjectCard(
        proj,
        () => {
          closeMenu();
          loadProject(proj);
          setView('editor');
        },
        async () => {
          if (confirm(`Delete "${proj.name}"?`)) {
            try {
              await deleteProject(proj.id);
              showProjects();
              addToast('Project deleted', 'success');
            } catch (e) {
              addToast('Failed to delete', 'error');
            }
          }
        },
        async () => {
          try {
            const dup = await duplicateProject(proj.id);
            showProjects();
            addToast(`Duplicated "${dup.name}"`, 'success');
          } catch (e) {
            addToast('Failed to duplicate', 'error');
          }
        },
        () => {
          const json = exportProject(proj);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${proj.name.replace(/\s+/g, '_')}.cytheia.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      ));
    }
    content.appendChild(grid);
  }

  // ---------- Templates ----------
  const CATEGORY_ORDER = ['Arduino', 'LED & Lighting', 'Sensors', 'Motors', 'Displays', 'Input & Controls', 'Communication'];
  const DIFFICULTY_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

  async function showTemplates() {
    setActiveTab('templates');
    content.innerHTML = '';

    const templates = TEMPLATES;

    const intro = el('div', 'mb-5');
    intro.appendChild(el('h2', 'text-[15px] font-semibold text-[var(--ct-text)]', 'Template Library'));
    intro.appendChild(el('p', 'mt-0.5 text-[13px] text-[var(--ct-text-dim)]', 'Start from a working circuit instead of starting from zero.'));

    const controls = el('div', 'flex flex-col gap-3 mb-4');
    const searchWrap = el('div', 'ct-search max-w-[420px]');
    searchWrap.appendChild(el('span', 'ct-search-icon'));
    searchWrap.lastChild.appendChild(icon('search', 14));
    const search = el('input', 'ct-input');
    search.type = 'text';
    search.placeholder = 'Search templates…';
    search.spellcheck = false;
    searchWrap.appendChild(search);
    controls.appendChild(searchWrap);

    const categories = [...new Set(templates.map((t) => t.category))].filter((c) => CATEGORY_ORDER.includes(c));
    categories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

    const chips = el('div', 'flex flex-wrap items-center gap-1.5');
    let activeCat = 'All';
    let activeDiff = null;
    const chipButtons = [];

    function makeChip(label, opts = {}) {
      const btn = el('button', 'ct-chip cursor-pointer transition-colors', label);
      btn.addEventListener('click', () => {
        if (opts.cat) activeCat = opts.cat;
        if (opts.diff) activeDiff = opts.diff;
        refresh();
      });
      return btn;
    }

    function paintChips() {
      for (const [btn, cat, diff] of chipButtons) {
        const active = (cat && activeCat === cat) || (diff && activeDiff === diff);
        btn.className = `ct-chip cursor-pointer transition-colors ${active ? 'ct-chip-accent' : ''}`;
      }
    }

    const allBtn = makeChip('All', { cat: 'All' });
    chipButtons.push([allBtn, 'All', null]);
    chips.appendChild(allBtn);
    for (const cat of categories) {
      const btn = makeChip(cat, { cat });
      chipButtons.push([btn, cat, null]);
      chips.appendChild(btn);
    }
    const sep = el('span', 'w-px h-4 bg-[var(--ct-border-strong)] mx-1');
    chips.appendChild(sep);
    for (const diff of DIFFICULTY_ORDER.filter((d) => templates.some((t) => t.difficulty === d))) {
      const btn = makeChip(diff, { diff });
      chipButtons.push([btn, null, diff]);
      chips.appendChild(btn);
    }
    controls.appendChild(chips);

    const refresh = () => {
      paintChips();
      const q = search.value.trim().toLowerCase();
      const query = templates.filter((t) => {
        const catOk = activeCat === 'All' || t.category === activeCat;
        const diffOk = !activeDiff || t.difficulty === activeDiff;
        if (!catOk || !diffOk) return false;
        if (!q) return true;
        const compLabels = (t.data?.components || []).map((c) => COMPONENT_MAP[c.type]?.label || c.type).join(' ');
        return `${t.name} ${t.description} ${t.category} ${t.difficulty} ${compLabels}`.toLowerCase().includes(q);
      });
      grid.innerHTML = '';
      if (query.length === 0) {
        grid.appendChild(el('div', 'py-16 text-center text-[13px] text-[var(--ct-text-faint)]', 'No templates match your search.'));
        return;
      }
      for (const tmpl of query) {
        grid.appendChild(createTemplateCard(tmpl, async () => {
          try {
            const proj = await createProject(tmpl.name, tmpl.description || '', tmpl.data);
            loadProject(proj);
            setView('editor');
            addToast(`Created "${proj.name}"`, 'success');
          } catch (e) {
            loadProject({ name: tmpl.name, description: tmpl.description || '', data: tmpl.data });
            setView('editor');
            addToast(`Loaded "${tmpl.name}" locally`, 'success');
          }
        }));
      }
    };

    search.addEventListener('input', refresh);
    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4');

    content.appendChild(intro);
    content.appendChild(controls);
    content.appendChild(grid);

    refresh();
    paintChips();
  }

  projectsTab.addEventListener('click', showProjects);
  templatesTab.addEventListener('click', showTemplates);

  main.appendChild(content);
  container.appendChild(main);

  showProjects();
}

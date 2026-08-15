import { setView, addToast } from '../store.js';

// SVG logo component
function createNextelLogo(size = 32) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('fill', 'none');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'nextel-grad');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '32');
  grad.setAttribute('y2', '32');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('stopColor', '#0a84ff');
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '1');
  stop2.setAttribute('stopColor', '#30d158');

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '2');
  rect.setAttribute('y', '2');
  rect.setAttribute('width', '28');
  rect.setAttribute('height', '28');
  rect.setAttribute('rx', '7');
  rect.setAttribute('fill', 'url(#nextel-grad)');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M10 22V10h2.5l7 8.5V10H22v12h-2.5l-7-8.5V22H10z');
  path.setAttribute('fill', 'white');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '16');
  circle.setAttribute('cy', '16');
  circle.setAttribute('r', '13');
  circle.setAttribute('stroke', 'url(#nextel-grad)');
  circle.setAttribute('stroke-width', '0.5');
  circle.setAttribute('opacity', '0.3');

  svg.appendChild(defs);
  svg.appendChild(rect);
  svg.appendChild(path);
  svg.appendChild(circle);

  return svg;
}

function createElement(tag, className = '', content = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content) el.textContent = content;
  return el;
}

function createButton(label, onClick, className = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = `px-4 py-2 rounded-lg font-medium transition-all ${className}`;
  btn.addEventListener('click', onClick);
  return btn;
}

function createFeatureCard(icon, title, desc) {
  const div = createElement('div', 'p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group');
  
  const iconDiv = createElement('div', 'w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors');
  iconDiv.innerHTML = icon; // Assume icon is SVG string or HTML
  
  const titleEl = createElement('h3', 'text-lg font-semibold mb-2', title);
  const descEl = createElement('p', 'text-sm text-gray-400 leading-relaxed', desc);
  
  div.appendChild(iconDiv);
  div.appendChild(titleEl);
  div.appendChild(descEl);
  
  return div;
}

export function renderLandingPage(container) {
  container.innerHTML = '';
  
  // Main wrapper
  const main = createElement('div', 'min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden flex flex-col');
  
  // Background blur elements
  const bgBlur = createElement('div', 'fixed inset-0 pointer-events-none');
  const blur1 = createElement('div', 'absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]');
  const blur2 = createElement('div', 'absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]');
  bgBlur.appendChild(blur1);
  bgBlur.appendChild(blur2);
  main.appendChild(bgBlur);
  
  // Nav bar
  const nav = createElement('nav', 'relative z-10 flex items-center justify-between px-8 py-5');
  
  const logoSection = createElement('div', 'flex items-center gap-2.5');
  logoSection.appendChild(createNextelLogo(32));
  const logoText = createElement('span', 'text-lg font-semibold tracking-tight', 'Nextel AI');
  logoSection.appendChild(logoText);
  
  const navLinks = createElement('div', 'flex items-center gap-8 text-sm text-gray-400');
  const featureLink = document.createElement('a');
  featureLink.href = '#features';
  featureLink.textContent = 'Features';
  featureLink.className = 'hover:text-white transition-colors';
  const howLink = document.createElement('a');
  howLink.href = '#how';
  howLink.textContent = 'How it works';
  howLink.className = 'hover:text-white transition-colors';
  const templatesLink = document.createElement('a');
  templatesLink.href = '#templates';
  templatesLink.textContent = 'Templates';
  templatesLink.className = 'hover:text-white transition-colors';
  
  const studioBtn = createButton('Open Studio', () => setView('dashboard'), 'px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200');
  
  navLinks.appendChild(featureLink);
  navLinks.appendChild(howLink);
  navLinks.appendChild(templatesLink);
  navLinks.appendChild(studioBtn);
  
  nav.appendChild(logoSection);
  nav.appendChild(navLinks);
  main.appendChild(nav);
  
  // Hero section
  const hero = createElement('section', 'relative z-10 flex flex-col items-center text-center px-8 pt-20 pb-16');
  
  const heroContent = createElement('div', 'transition-all duration-700 opacity-100 translate-y-0');
  
  const badge = createElement('div', 'inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400');
  const badgeDot = createElement('span', 'w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse');
  const badgeText = document.createTextNode('Browser-based electronics design platform');
  badge.appendChild(badgeDot);
  badge.appendChild(badgeText);
  
  const title = createElement('h1', 'text-6xl md:text-7xl font-bold tracking-tight mb-6');
  title.textContent = 'Design. Code. ';
  const br = document.createElement('br');
  title.appendChild(br);
  const gradient = createElement('span', 'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent', 'Simulate.');
  title.appendChild(gradient);
  
  const subtitle = createElement('p', 'text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed', 'Build electronics projects in your browser. Connect real components, write code, simulate your ideas, and understand how everything works.');
  
  const ctaBtns = createElement('div', 'flex items-center gap-4');
  const btn1 = createButton('Start Building →', () => setView('dashboard'), 'px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105');
  const btn2 = createButton('Explore Projects', () => setView('dashboard'), 'px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10');
  ctaBtns.appendChild(btn1);
  ctaBtns.appendChild(btn2);
  
  heroContent.appendChild(badge);
  heroContent.appendChild(title);
  heroContent.appendChild(subtitle);
  heroContent.appendChild(ctaBtns);
  
  hero.appendChild(heroContent);
  main.appendChild(hero);
  
  // Features section
  const features = createElement('section', 'relative z-10 px-8 py-24 max-w-6xl mx-auto w-full');
  
  const featuresTitle = createElement('h2', 'text-4xl font-bold text-center mb-4', 'Everything in one workspace');
  const featuresDesc = createElement('p', 'text-gray-400 text-center mb-16 max-w-xl mx-auto', 'From idea to working circuit — design, code, simulate, and debug without leaving your browser.');
  
  const featuresGrid = createElement('div', 'grid grid-cols-1 md:grid-cols-3 gap-6');
  
  const features_data = [
    { icon: '⚙️', title: 'Build circuits', desc: 'Drag real components onto an infinite canvas. Wire them together with intelligent routing. Arduino, LEDs, sensors, motors, and more.' },
    { icon: '💻', title: 'Write code', desc: 'Professional Monaco code editor with Arduino C++ syntax highlighting. Write setup() and loop() — your code drives the simulation.' },
    { icon: '▶️', title: 'Simulate', desc: 'Run your circuit and watch LEDs illuminate, motors rotate, displays update. The simulator executes your real Arduino code.' },
    { icon: '🐛', title: 'Debug', desc: 'Intelligent debugging detects floating inputs, missing grounds, short circuits, and code errors — with clear explanations.' },
    { icon: '🧠', title: 'Learn with AI', desc: 'Ask Nextel AI to add components, generate code, explain circuits, or find wiring problems. Every change is previewable and undoable.' },
    { icon: '📜', title: 'Templates', desc: 'Start from real Arduino examples. LED blinker, traffic lights, button controls, sensors — learn by modifying working projects.' },
  ];
  
  features_data.forEach(feat => {
    const card = createFeatureCard(feat.icon, feat.title, feat.desc);
    featuresGrid.appendChild(card);
  });
  
  features.appendChild(featuresTitle);
  features.appendChild(featuresDesc);
  features.appendChild(featuresGrid);
  main.appendChild(features);
  
  // CTA Footer
  const footer = createElement('footer', 'relative z-10 px-8 py-8 text-center');
  const footerBtn = createButton('Launch Nextel AI Studio', () => setView('dashboard'), 'px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 text-lg');
  footer.appendChild(footerBtn);
  const footerText = createElement('p', 'text-gray-500 text-sm mt-8', 'Nextel AI — Electronics design, simulation, and learning platform');
  footer.appendChild(footerText);
  main.appendChild(footer);
  
  container.appendChild(main);
}

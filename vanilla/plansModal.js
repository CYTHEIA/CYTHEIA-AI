import { 
  getState, 
  setCommandPaletteOpen,
  setPlansModalOpen,
  getCurrentPlan,
  getSubscriptionState,
  getUsage,
  upgradeToPremium,
  selectPostpaid,
  downgradeToBasic,
  PLANS,
  isFeatureEnabled
} from './store.js';

export function createPlansModal() {
  const container = document.createElement('div');
  container.className = 'cytheia-plans-overlay hidden';
  
  const backdrop = document.createElement('div');
  backdrop.className = 'cytheia-plans-backdrop';
  backdrop.addEventListener('click', () => closePlansModal());
  
  const modal = document.createElement('div');
  modal.className = 'cytheia-plans-modal';
  
  const header = document.createElement('div');
  header.className = 'cytheia-plans-header';
  
  const titleWrap = document.createElement('div');
  
  const title = document.createElement('h2');
  title.className = 'cytheia-plans-title';
  title.textContent = 'Plans';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'cytheia-plans-subtitle';
  subtitle.textContent = 'Choose the plan that fits how you build with CYTHEIA.';
  
  titleWrap.appendChild(title);
  titleWrap.appendChild(subtitle);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'cytheia-plans-close';
  closeBtn.setAttribute('aria-label', 'Close plans');
  closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  closeBtn.addEventListener('click', closePlansModal);
  
  header.appendChild(titleWrap);
  header.appendChild(closeBtn);
  modal.appendChild(header);
  
  const body = document.createElement('div');
  body.className = 'cytheia-plans-body';
  modal.appendChild(body);
  
  container.appendChild(backdrop);
  container.appendChild(modal);
  
  function closePlansModal() {
    container.classList.add('hidden');
    const state = getState();
    if (state.ui.plansModalOpen) {
      setPlansModalOpen(false);
    }
  }
  
  function renderContent() {
    const currentPlan = getCurrentPlan();
    const subState = getSubscriptionState();
    const usage = getUsage();
    
    body.innerHTML = '';
    
    // Current plan status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'cytheia-plans-status';
    statusBar.innerHTML = `
      <div class="cytheia-plans-status-main">
        <div class="cytheia-plans-status-icon">
          <span>${currentPlan.name.slice(0, 2).toUpperCase()}</span>
        </div>
        <div class="cytheia-plans-status-info">
          <div class="cytheia-plans-status-label">Current plan</div>
          <div class="cytheia-plans-status-name">${currentPlan.name}</div>
          <div class="cytheia-plans-status-desc">${currentPlan.description}</div>
        </div>
      </div>
      <div class="cytheia-plans-status-meta">
        <div class="cytheia-plans-status-item">
          <div class="cytheia-plans-status-item-label">Status</div>
          <div class="cytheia-plans-status-item-value">${subState.status.charAt(0).toUpperCase() + subState.status.slice(1)}</div>
        </div>
      </div>
    `;
    body.appendChild(statusBar);
    
    // Usage section
    if (currentPlan.id !== 'basic' || Object.values(usage).some(v => v > 0)) {
      const usageSection = document.createElement('div');
      usageSection.className = 'cytheia-plans-usage';
      usageSection.innerHTML = `
        <div class="cytheia-plans-usage-title">Usage this period</div>
        <div class="cytheia-usage-grid">
          <div class="cytheia-usage-item">
            <div class="cytheia-usage-value">${usage.aiDebuggingRequests}</div>
            <div class="cytheia-usage-label">AI Debugging</div>
          </div>
          <div class="cytheia-usage-item">
            <div class="cytheia-usage-value">${usage.aiCodeGenerations}</div>
            <div class="cytheia-usage-label">AI Code Gen</div>
          </div>
          <div class="cytheia-usage-item">
            <div class="cytheia-usage-value">${usage.projectsCreated}</div>
            <div class="cytheia-usage-label">Projects</div>
          </div>
          <div class="cytheia-usage-item">
            <div class="cytheia-usage-value">${formatBytes(usage.storageUsed)}</div>
            <div class="cytheia-usage-label">Storage</div>
          </div>
        </div>
        ${currentPlan.id === 'postpaid' ? `
          <div class="cytheia-plans-usage-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            ${PLANS.postpaid.usageNote}
          </div>
        ` : ''}
      `;
      body.appendChild(usageSection);
    }
    
    // Plans grid
    const plansGrid = document.createElement('div');
    plansGrid.className = 'cytheia-plan-grid';
    
    Object.values(PLANS).forEach(plan => {
      const isCurrent = plan.id === currentPlan.id;
      const isRecommended = plan.recommended;
      
      const card = document.createElement('div');
      card.className = `cytheia-plan-card ${isRecommended ? 'cytheia-plan-card--premium' : ''} ${isCurrent ? 'cytheia-plan-card--current' : ''}`;
      
      if (isRecommended) {
        const badge = document.createElement('div');
        badge.className = 'cytheia-plan-badge';
        badge.textContent = 'MOST POPULAR';
        card.appendChild(badge);
      }
      
      if (isCurrent) {
        const currentBadge = document.createElement('div');
        currentBadge.className = 'cytheia-plan-current-badge';
        currentBadge.textContent = 'Current';
        card.appendChild(currentBadge);
      }
      
      card.innerHTML += `
        <div class="cytheia-plan-card-content">
          <div class="cytheia-plan-header">
            <div class="cytheia-plan-name">${plan.name}</div>
            <div class="cytheia-plan-desc">${plan.description}</div>
          </div>
          
          <div class="cytheia-plan-price">
            <span class="cytheia-plan-price-amount">${plan.price}</span>
            <span class="cytheia-plan-price-period">${plan.period}</span>
          </div>
          
          <ul class="cytheia-plan-features">
            ${plan.features.map(feature => `
              <li class="cytheia-plan-feature">
                <svg class="cytheia-plan-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${feature}</span>
              </li>
            `).join('')}
          </ul>
          
          <button class="cytheia-plan-btn ${getButtonClass(plan.ctaVariant)} ${isCurrent ? 'cytheia-plan-btn--disabled' : ''}" data-plan="${plan.id}" ${isCurrent ? 'disabled' : ''}>
            ${plan.cta}
          </button>
        </div>
      `;
      
      const btn = card.querySelector('.cytheia-plan-btn');
      if (btn && !isCurrent) {
        btn.addEventListener('click', () => handlePlanAction(plan.id));
      }
      
      plansGrid.appendChild(card);
    });
    
    body.appendChild(plansGrid);
    
    // Feature comparison table
    const comparison = document.createElement('div');
    comparison.className = 'cytheia-plans-comparison';
    comparison.innerHTML = `
      <div class="cytheia-plans-comparison-title">Feature comparison</div>
      <div class="cytheia-plans-comparison-table-wrap">
        <table class="cytheia-plans-comparison-table">
          <thead>
            <tr>
              <th class="cytheia-plans-comparison-th">Feature</th>
              <th class="cytheia-plans-comparison-th">Basic</th>
              <th class="cytheia-plans-comparison-th">Premium</th>
              <th class="cytheia-plans-comparison-th">Postpaid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="cytheia-plans-comparison-td">Circuit editor</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Circuit simulation</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Standard projects</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">AI debugging</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-limited">Limited</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">Unlimited</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">Unlimited</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">AI assistance</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-limited">Standard</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">Advanced</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">Best models</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">AI code generation</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Heavy project workloads</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Prototype storage</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Development workflows</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-no">✗</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-yes">✓</td>
            </tr>
            <tr>
              <td class="cytheia-plans-comparison-td">Billing model</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-plan">Free</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-plan">$15/mo</td>
              <td class="cytheia-plans-comparison-td cytheia-plans-comparison-plan">Usage-based</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    body.appendChild(comparison);
  }
  
  function handlePlanAction(planId) {
    let success = false;
    switch (planId) {
      case 'premium':
        success = upgradeToPremium();
        break;
      case 'postpaid':
        success = selectPostpaid();
        break;
      case 'basic':
        success = downgradeToBasic();
        break;
    }
    
    if (success) {
      renderContent();
    }
  }
  
  function getButtonClass(variant) {
    switch (variant) {
      case 'primary': return 'cytheia-plan-btn--primary';
      case 'secondary': return 'cytheia-plan-btn--secondary';
      case 'ghost': return 'cytheia-plan-btn--ghost';
      default: return 'cytheia-plan-btn--secondary';
    }
  }
  
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  const unsubscribe = getState.subscribe ? getState.subscribe(renderContent) : null;
  
  return {
    element: container,
    open: () => {
      container.classList.remove('hidden');
      renderContent();
      document.body.style.overflow = 'hidden';
      // Focus trap
      const closeBtn = container.querySelector('.cytheia-plans-close');
      if (closeBtn) closeBtn.focus();
    },
    close: () => {
      container.classList.add('hidden');
      document.body.style.overflow = '';
    },
    destroy: () => {
      if (unsubscribe) unsubscribe();
      container.remove();
      document.body.style.overflow = '';
    }
  };
}

export function renderPlansModal(modal) {
  const state = getState();
  if (state.ui.plansModalOpen) {
    modal.element.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    modal.element.classList.add('hidden');
    document.body.style.overflow = '';
  }
}
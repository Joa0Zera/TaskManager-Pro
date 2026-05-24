const UI = {
  toastContainer: null,

  init() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      this.toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.toastContainer);
    }
  },

  toast(message, type = 'info', duration = 3500) {
    this.init();
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '!' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${Utils.escapeHtml(message)}</span>
      <button type="button" class="toast-close" aria-label="Fechar">×</button>
    `;

    this.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));

    const remove = () => {
      el.classList.remove('show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    };

    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, duration);
  },

  success(msg) { this.toast(msg, 'success'); },
  error(msg) { this.toast(msg, 'error'); },
  info(msg) { this.toast(msg, 'info'); },

  skeletonCards(count = 3) {
    return Array.from({ length: count }, () => `
      <div class="skeleton-card glass">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    `).join('');
  },

  skeletonStats() {
    return Array.from({ length: 4 }, () => `
      <div class="stat-card glass skeleton-stat">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton skeleton-value"></div>
        <div class="skeleton skeleton-label"></div>
      </div>
    `).join('');
  },

  loadingSpinner() {
    return '<div class="loading-container"><div class="loading-spinner premium"></div></div>';
  },

  confirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active confirm-overlay';
      overlay.innerHTML = `
        <div class="modal glass confirm-modal">
          <div class="modal-header">
            <h2>${Utils.escapeHtml(title)}</h2>
          </div>
          <div class="modal-body"><p>${Utils.escapeHtml(message)}</p></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button type="button" class="btn btn-danger" data-action="ok">Confirmar</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      const close = (result) => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve(result);
      };

      overlay.querySelector('[data-action="cancel"]').onclick = () => close(false);
      overlay.querySelector('[data-action="ok"]').onclick = () => close(true);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
    });
  },
};

window.UI = UI;

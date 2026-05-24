const ThemeManager = {
  STORAGE_KEY: 'taskmanager-theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'dark';
    this.setTheme(saved, false);

    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggle());
    document.getElementById('settingsThemeToggle')?.addEventListener('click', () => this.toggle());
  },

  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  },

  setTheme(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);

    if (animate) {
      document.documentElement.classList.add('theme-transition');
      setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400);
    }

    this.updateToggleUI(theme);

    if (window.ChartManager) {
      ChartManager.refreshTheme();
    }
  },

  toggle() {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    UI.info(`Tema ${next === 'dark' ? 'escuro' : 'claro'} ativado`);
  },

  updateToggleUI(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
    btn.innerHTML = `
      <span class="theme-icon theme-icon-sun ${isDark ? '' : 'active'}">☀️</span>
      <span class="theme-icon theme-icon-moon ${isDark ? 'active' : ''}">🌙</span>
    `;

    const settingsLabel = document.getElementById('settingsThemeLabel');
    if (settingsLabel) {
      settingsLabel.textContent = isDark ? 'Tema escuro' : 'Tema claro';
    }
  },
};

(function applyThemeEarly() {
  const theme = localStorage.getItem('taskmanager-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

window.ThemeManager = ThemeManager;

/**
 * Navegação SPA + header premium (relógio, notificações, tema)
 */
const DashboardNav = {
  currentSection: 'dashboard-section',
  clockInterval: null,

  sections: {
    'dashboard-section': {
      subtitle: 'Aqui está o resumo das suas tarefas hoje.',
      showSearch: false,
      showNewTask: true,
    },
    'tasks-section': {
      subtitle: 'Gerencie, filtre e organize todas as suas tarefas.',
      showSearch: true,
      showNewTask: true,
    },
    'kanban-section': {
      subtitle: 'Arraste cards entre colunas para atualizar o status.',
      showSearch: false,
      showNewTask: true,
    },
    'calendar-section': {
      subtitle: 'Visualize tarefas por data no calendário.',
      showSearch: false,
      showNewTask: true,
    },
    'categories-section': {
      subtitle: 'Distribuição das suas tarefas por categoria.',
      showSearch: false,
      showNewTask: true,
    },
    'settings-section': {
      subtitle: 'Gerencie sua conta e preferências.',
      showSearch: false,
      showNewTask: false,
    },
  },

  init() {
    UI.init();
    ThemeManager.init();
    CalendarManager.init();
    this.bindNavigation();
    this.startClock();
    this.bindNotifications();
    this.navigate('dashboard-section', false);
  },

  bindNavigation() {
    document.querySelectorAll('[data-section]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = el.dataset.section;
        if (sectionId) this.navigate(sectionId);
      });
    });

    document.querySelectorAll('[data-navigate]').forEach((el) => {
      el.addEventListener('click', () => this.navigate(el.dataset.navigate));
    });

    document.getElementById('btnNewTaskDashboard')?.addEventListener('click', () => {
      TaskManager.openModal();
    });
  },

  navigate(sectionId, closeSidebar = true) {
    if (!this.sections[sectionId]) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    document.querySelectorAll('.app-section').forEach((section) => {
      section.classList.add('hidden');
      section.classList.remove('is-active');
    });

    target.classList.remove('hidden');
    requestAnimationFrame(() => target.classList.add('is-active'));

    document.querySelectorAll('.sidebar-nav-item[data-section]').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });

    this.currentSection = sectionId;
    this.updateHeader(sectionId);

    if (sectionId === 'categories-section') TaskManager.renderCategories();
    if (sectionId === 'kanban-section') KanbanManager.render(TaskManager.tasks);
    if (sectionId === 'calendar-section') CalendarManager.render(TaskManager.tasks);
    if (sectionId === 'settings-section') this.renderSettings();

    if (closeSidebar && window.innerWidth <= 768) {
      TaskManager.toggleSidebar(false);
    }
  },

  updateHeader(sectionId) {
    const config = this.sections[sectionId];
    const subtitle = document.getElementById('userSubtitle');
    const headerTools = document.getElementById('headerTools');
    const searchBox = document.getElementById('searchBox');
    const btnNewTask = document.getElementById('btnNewTask');

    if (subtitle) subtitle.textContent = config.subtitle;

    if (headerTools) {
      headerTools.classList.toggle('header-tools-hidden', !config.showSearch && !config.showNewTask);
    }
    if (searchBox) searchBox.classList.toggle('hidden', !config.showSearch);
    if (btnNewTask) btnNewTask.classList.toggle('hidden', !config.showNewTask);
  },

  startClock() {
    const el = document.getElementById('headerClock');
    if (!el) return;

    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    tick();
    this.clockInterval = setInterval(tick, 1000);
  },

  bindNotifications() {
    const wrap = document.getElementById('notificationsWrap');
    const btn = document.getElementById('notificationsBtn');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap?.classList.toggle('open');
    });

    document.addEventListener('click', () => wrap?.classList.remove('open'));
    wrap?.addEventListener('click', (e) => e.stopPropagation());
  },

  updateNotifications(tasks) {
    const pending = tasks.filter((t) => t.status === 'pendente' || t.status === 'em_andamento');
    const badge = document.getElementById('notificationsBadge');
    const dropdown = document.getElementById('notificationsDropdown');

    if (badge) {
      badge.textContent = pending.length;
      badge.classList.toggle('hidden', pending.length === 0);
    }

    if (!dropdown) return;

    if (pending.length === 0) {
      dropdown.innerHTML = '<div class="notification-item">Nenhuma tarefa pendente 🎉</div>';
      return;
    }

    dropdown.innerHTML = pending.slice(0, 6).map((t) => {
      const p = Utils.PRIORITY_META[t.prioridade];
      return `
        <div class="notification-item">
          <strong>${Utils.escapeHtml(t.titulo)}</strong><br>
          <span class="priority-badge ${p.class} glow-sm">${p.icon} ${p.label}</span>
        </div>
      `;
    }).join('');
  },

  renderSettings() {
    const container = document.getElementById('settingsContainer');
    const user = API.getUser();
    if (!container) return;

    if (!user) {
      container.innerHTML = '<p class="settings-empty">Não foi possível carregar os dados do usuário.</p>';
      return;
    }

    const createdAt = user.created_at
      ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—';

    const isDark = ThemeManager.getTheme() === 'dark';

    container.innerHTML = `
      <div class="settings-card glass">
        <div class="settings-avatar">${user.nome.charAt(0).toUpperCase()}</div>
        <div class="settings-info">
          <h3>${Utils.escapeHtml(user.nome)}</h3>
          <p>${Utils.escapeHtml(user.email)}</p>
          <span class="settings-meta">Membro desde ${createdAt}</span>
        </div>
      </div>
      <div class="settings-group glass">
        <h4>Aparência</h4>
        <div class="settings-row">
          <span id="settingsThemeLabel">${isDark ? 'Tema escuro' : 'Tema claro'}</span>
          <button type="button" class="btn btn-outline btn-sm" id="settingsThemeToggle">Alternar tema</button>
        </div>
      </div>
      <div class="settings-group glass">
        <h4>Conta</h4>
        <div class="settings-row"><span>Nome</span><strong>${Utils.escapeHtml(user.nome)}</strong></div>
        <div class="settings-row"><span>Email</span><strong>${Utils.escapeHtml(user.email)}</strong></div>
      </div>
      <div class="settings-group glass">
        <h4>Ações</h4>
        <button type="button" class="btn btn-danger settings-logout" id="settingsLogout">Sair da conta</button>
      </div>
    `;

    document.getElementById('settingsLogout')?.addEventListener('click', logout);
    document.getElementById('settingsThemeToggle')?.addEventListener('click', () => ThemeManager.toggle());
  },
};

document.addEventListener('DOMContentLoaded', () => {
  DashboardNav.init();
  TaskManager.init();
});

window.DashboardNav = DashboardNav;

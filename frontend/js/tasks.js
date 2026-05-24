const TaskManager = {
  tasks: [],
  stats: {},
  editingId: null,
  filters: {
    prioridade: '',
    categoria: '',
    status: '',
    search: '',
  },

  init() {
    if (!API.getToken()) {
      window.location.href = 'login.html';
      return;
    }

    this.bindEvents();
    this.loadUser();
    this.loadTasks();
  },

  bindEvents() {
    document.getElementById('btnNewTask')?.addEventListener('click', () => this.openModal());
    document.getElementById('btnCloseModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btnCancelModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('taskForm')?.addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('btnLogout')?.addEventListener('click', logout);
    document.getElementById('menuToggle')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => this.toggleSidebar(false));

    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });

    document.getElementById('searchInput')?.addEventListener('input', debounce((e) => {
      this.filters.search = e.target.value.trim();
      this.loadTasks();
    }, 400));

    ['filterPrioridade', 'filterCategoria', 'filterStatus'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = id.replace('filter', '').toLowerCase();
        const map = { prioridade: 'prioridade', categoria: 'categoria', status: 'status' };
        this.filters[map[key]] = e.target.value;
        this.loadTasks();
      });
    });

    document.getElementById('btnClearFilters')?.addEventListener('click', () => this.clearFilters());
  },

  loadUser() {
    const user = API.getUser();
    if (!user) return;

    const firstName = user.nome.split(' ')[0];
    const greeting = document.getElementById('userGreeting');
    const avatar = document.getElementById('headerAvatar');

    if (greeting) {
      greeting.textContent = `${Utils.getGreeting()}, ${firstName}! 👋`;
    }
    if (avatar) {
      avatar.textContent = user.nome.charAt(0).toUpperCase();
    }
  },

  async loadTasks() {
    const container = document.getElementById('tasksContainer');
    const statsGrid = document.getElementById('statsGrid');

    if (container) {
      container.innerHTML = `<div class="tasks-grid">${UI.skeletonCards(3)}</div>`;
    }
    if (statsGrid && DashboardNav.currentSection === 'dashboard-section') {
      statsGrid.innerHTML = UI.skeletonStats();
    }

    try {
      const data = await API.tasks.getAll(this.filters);
      this.tasks = data.tasks;
      this.stats = data.stats;

      this.renderStats();
      this.renderTasks();
      this.renderCategories();
      ChartManager.render(this.tasks, this.stats);
      KanbanManager.render(this.tasks);
      CalendarManager.render(this.tasks);
      DashboardNav.updateNotifications(this.tasks);
    } catch (error) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>Erro ao carregar tarefas</h3>
            <p>${Utils.escapeHtml(error.message)}</p>
          </div>`;
      }
      UI.error(error.message);
    }
  },

  renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    statsGrid.innerHTML = `
      <div class="stat-card glass total fade-in">
        <div class="stat-card-header"><div class="stat-card-icon">📋</div></div>
        <div class="stat-card-value" id="statTotal">${this.stats.total}</div>
        <div class="stat-card-label">Total de Tarefas</div>
      </div>
      <div class="stat-card glass pending fade-in">
        <div class="stat-card-header"><div class="stat-card-icon">⏳</div></div>
        <div class="stat-card-value" id="statPendentes">${this.stats.pendentes}</div>
        <div class="stat-card-label">Pendentes</div>
      </div>
      <div class="stat-card glass completed fade-in">
        <div class="stat-card-header"><div class="stat-card-icon">✅</div></div>
        <div class="stat-card-value" id="statConcluidas">${this.stats.concluidas}</div>
        <div class="stat-card-label">Concluídas</div>
      </div>
      <div class="stat-card glass productivity fade-in">
        <div class="stat-card-header"><div class="stat-card-icon">📈</div></div>
        <div class="stat-card-value" id="statProdutividade">${this.stats.produtividade}%</div>
        <div class="stat-card-label">Produtividade</div>
      </div>
    `;
  },

  renderTasks() {
    const container = document.getElementById('tasksContainer');
    const countEl = document.getElementById('taskCount');
    if (!container) return;

    if (countEl) countEl.textContent = `${this.tasks.length} tarefa(s)`;

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>Nenhuma tarefa encontrada</h3>
          <p>Crie sua primeira tarefa ou ajuste os filtros.</p>
          <button class="btn btn-primary" type="button" id="emptyNewTask">+ Nova Tarefa</button>
        </div>`;
      document.getElementById('emptyNewTask')?.addEventListener('click', () => this.openModal());
      return;
    }

    container.innerHTML = `<div class="tasks-grid">${this.tasks.map((t) => this.taskCardHTML(t)).join('')}</div>`;
    this.bindTaskActions();
  },

  taskCardHTML(task) {
    const date = Utils.formatDate(task.created_at, { day: '2-digit', month: 'short', year: 'numeric' });
    const p = Utils.PRIORITY_META[task.prioridade] || Utils.PRIORITY_META.media;
    const statusLabel = Utils.STATUS_META[task.status]?.label || task.status;
    const cat = Utils.CATEGORY_META[task.categoria] || { label: task.categoria, icon: '📌' };

    return `
      <div class="task-card glass ${task.status === 'concluida' ? 'completed' : ''}" data-id="${task.id}" style="animation-delay: ${Math.random() * 0.15}s">
        <div class="task-card-header">
          <h3 class="task-card-title">${Utils.escapeHtml(task.titulo)}</h3>
          <span class="priority-badge ${p.class} glow">${p.icon} ${p.label}</span>
        </div>
        ${task.descricao ? `<p class="task-card-desc">${Utils.escapeHtml(task.descricao)}</p>` : ''}
        <div class="task-card-meta">
          <span class="badge badge-categoria">${cat.icon} ${cat.label}</span>
          <span class="badge badge-status-${task.status}">${statusLabel}</span>
        </div>
        <div class="task-card-footer">
          <span class="task-card-date">${date}</span>
          <div class="task-card-actions">
            ${task.status !== 'concluida' ? `<button class="btn-complete" title="Concluir" data-action="complete" data-id="${task.id}">✓</button>` : ''}
            <button class="btn-edit" title="Editar" data-action="edit" data-id="${task.id}">✎</button>
            <button class="btn-delete" title="Excluir" data-action="delete" data-id="${task.id}">✕</button>
          </div>
        </div>
      </div>`;
  },

  bindTaskActions() {
    document.querySelectorAll('#tasksContainer [data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { action, id } = btn.dataset;
        if (action === 'edit') this.editTask(id);
        if (action === 'delete') this.deleteTask(id);
        if (action === 'complete') this.completeTask(id);
      });
    });
  },

  openModal(task = null) {
    this.editingId = task ? task.id : null;
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');

    title.textContent = task ? 'Editar Tarefa' : 'Nova Tarefa';
    form.titulo.value = task?.titulo || '';
    form.descricao.value = task?.descricao || '';
    form.prioridade.value = task?.prioridade || 'media';
    form.categoria.value = task?.categoria || 'pessoal';
    form.status.value = task?.status || 'pendente';

    overlay.classList.add('active');
    form.titulo.focus();
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('taskForm').reset();
    this.editingId = null;
  },

  editTask(id) {
    const task = this.tasks.find((t) => t.id == id);
    if (task) this.openModal(task);
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    const taskData = {
      titulo: form.titulo.value.trim(),
      descricao: form.descricao.value.trim(),
      prioridade: form.prioridade.value,
      categoria: form.categoria.value,
      status: form.status.value,
    };

    if (!taskData.titulo) return;

    btn.disabled = true;

    try {
      if (this.editingId) {
        await API.tasks.update(this.editingId, taskData);
        UI.success('Tarefa atualizada com sucesso!');
      } else {
        await API.tasks.create(taskData);
        UI.success('Tarefa criada com sucesso!');
      }
      this.closeModal();
      await this.loadTasks();
    } catch (error) {
      UI.error(error.message);
    } finally {
      btn.disabled = false;
    }
  },

  async deleteTask(id) {
    const ok = await UI.confirm('Deseja excluir esta tarefa?', 'Excluir tarefa');
    if (!ok) return;

    try {
      await API.tasks.delete(id);
      UI.success('Tarefa excluída.');
      await this.loadTasks();
    } catch (error) {
      UI.error(error.message);
    }
  },

  async completeTask(id) {
    const task = this.tasks.find((t) => t.id == id);
    if (!task) return;

    try {
      await API.tasks.update(id, {
        titulo: task.titulo,
        descricao: task.descricao,
        prioridade: task.prioridade,
        categoria: task.categoria,
        status: 'concluida',
      });
      UI.success('Tarefa concluída! 🎉');
      await this.loadTasks();
    } catch (error) {
      UI.error(error.message);
    }
  },

  renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    const meta = {
      trabalho: { label: 'Trabalho', icon: '💼', color: '#3B82F6' },
      estudos: { label: 'Estudos', icon: '📚', color: '#8B5CF6' },
      pessoal: { label: 'Pessoal', icon: '🏠', color: '#22C55E' },
    };

    const counts = { trabalho: 0, estudos: 0, pessoal: 0 };
    const completed = { trabalho: 0, estudos: 0, pessoal: 0 };

    this.tasks.forEach((task) => {
      if (counts[task.categoria] !== undefined) {
        counts[task.categoria]++;
        if (task.status === 'concluida') completed[task.categoria]++;
      }
    });

    container.innerHTML = Object.keys(meta).map((key) => {
      const total = counts[key];
      const done = completed[key];
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      const { label, icon, color } = meta[key];

      return `
        <article class="category-card glass" style="--category-color: ${color}">
          <div class="category-card-icon">${icon}</div>
          <h3>${label}</h3>
          <p class="category-card-count">${total} tarefa(s)</p>
          <div class="category-progress">
            <div class="category-progress-bar" style="width: ${percent}%"></div>
          </div>
          <span class="category-card-meta">${done} concluída(s) · ${percent}%</span>
          <button type="button" class="btn btn-outline btn-sm category-filter-btn" data-category="${key}">
            Ver tarefas
          </button>
        </article>
      `;
    }).join('');

    container.querySelectorAll('.category-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filters = { ...this.filters, categoria: btn.dataset.category };
        const select = document.getElementById('filterCategoria');
        if (select) select.value = btn.dataset.category;
        DashboardNav.navigate('tasks-section');
        this.loadTasks();
      });
    });
  },

  clearFilters() {
    this.filters = { prioridade: '', categoria: '', status: '', search: '' };
    document.getElementById('filterPrioridade').value = '';
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchInput').value = '';
    this.loadTasks();
    UI.info('Filtros limpos');
  },

  toggleSidebar(force) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('menuToggle');
    const isOpen = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');

    sidebar.classList.toggle('open', isOpen);
    overlay.classList.toggle('active', isOpen);
    toggle?.classList.toggle('is-active', isOpen);
  },
};

window.TaskManager = TaskManager;

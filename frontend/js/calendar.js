const CalendarManager = {
  currentDate: new Date(),
  selectedDate: new Date(),

  init() {
    document.getElementById('calPrev')?.addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('calNext')?.addEventListener('click', () => this.changeMonth(1));
    document.getElementById('calToday')?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.selectedDate = new Date();
      this.render(TaskManager.tasks || []);
    });
  },

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.render(TaskManager.tasks || []);
  },

  render(tasks) {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    const list = document.getElementById('calendarDayTasks');
    if (!grid || !title) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    title.textContent = this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date();

    const tasksByDay = {};
    tasks.forEach((t) => {
      const d = new Date(t.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!tasksByDay[key]) tasksByDay[key] = [];
      tasksByDay[key].push(t);
    });

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = weekdays.map((d) => `<div class="cal-weekday">${d}</div>`).join('');

    for (let i = 0; i < startPad; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const key = `${year}-${month}-${day}`;
      const dayTasks = tasksByDay[key] || [];
      const isToday = Utils.isSameDay(date, today);
      const isSelected = Utils.isSameDay(date, this.selectedDate);
      const hasHigh = dayTasks.some((t) => t.prioridade === 'alta');
      const hasTasks = dayTasks.length > 0;

      html += `
        <button type="button" class="cal-day ${isToday ? 'cal-today' : ''} ${isSelected ? 'cal-selected' : ''} ${hasTasks ? 'cal-has-tasks' : ''} ${hasHigh ? 'cal-deadline' : ''}"
          data-day="${day}" data-month="${month}" data-year="${year}">
          <span class="cal-day-num">${day}</span>
          ${hasTasks ? `<span class="cal-dots">${dayTasks.length > 3 ? '3+' : '•'.repeat(Math.min(dayTasks.length, 3))}</span>` : ''}
        </button>
      `;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.cal-day:not(.cal-day-empty)').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedDate = new Date(
          parseInt(btn.dataset.year, 10),
          parseInt(btn.dataset.month, 10),
          parseInt(btn.dataset.day, 10)
        );
        this.renderDayTasks(tasks, list);
        grid.querySelectorAll('.cal-day').forEach((d) => d.classList.remove('cal-selected'));
        btn.classList.add('cal-selected');
      });
    });

    this.renderDayTasks(tasks, list);
    this.renderMiniCalendar(tasks);
  },

  renderDayTasks(tasks, container) {
    if (!container) return;

    const filtered = tasks.filter((t) => {
      const d = new Date(t.created_at);
      return Utils.isSameDay(d, this.selectedDate);
    });

    const dateLabel = this.selectedDate.toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state compact">
          <p>Nenhuma tarefa em <strong>${dateLabel}</strong></p>
          <button type="button" class="btn btn-primary btn-sm" onclick="TaskManager.openModal()">+ Nova tarefa</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <h3 class="cal-list-title">Tarefas de ${dateLabel}</h3>
      <div class="cal-task-list">
        ${filtered.map((t) => {
          const p = Utils.PRIORITY_META[t.prioridade];
          return `
            <div class="cal-task-item glass">
              <span class="priority-badge ${p.class} glow-sm">${p.icon} ${p.label}</span>
              <div>
                <strong>${Utils.escapeHtml(t.titulo)}</strong>
                <span class="badge badge-status-${t.status}">${Utils.STATUS_META[t.status]?.label || t.status}</span>
              </div>
              <button type="button" class="btn-icon" data-action="edit" data-id="${t.id}">✎</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => TaskManager.editTask(btn.dataset.id));
    });
  },

  renderMiniCalendar(tasks) {
    const mini = document.getElementById('miniCalendar');
    if (!mini) return;

    const today = new Date();
    const pending = tasks.filter((t) => t.status !== 'concluida').length;
    const done = tasks.filter((t) => t.status === 'concluida').length;

    mini.innerHTML = `
      <div class="mini-cal-stat glass">
        <span class="mini-cal-value">${pending}</span>
        <span class="mini-cal-label">Pendentes hoje</span>
      </div>
      <div class="mini-cal-stat glass">
        <span class="mini-cal-value">${done}</span>
        <span class="mini-cal-label">Concluídas</span>
      </div>
      <div class="mini-cal-stat glass accent">
        <span class="mini-cal-value">${today.getDate()}</span>
        <span class="mini-cal-label">${today.toLocaleDateString('pt-BR', { month: 'short' })}</span>
      </div>
    `;
  },
};

window.CalendarManager = CalendarManager;

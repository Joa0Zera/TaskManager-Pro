const KanbanManager = {
  columns: [
    { id: 'pendente', title: 'Pendente', icon: '⏳' },
    { id: 'em_andamento', title: 'Em andamento', icon: '🔄' },
    { id: 'concluida', title: 'Concluído', icon: '✅' },
  ],

  draggedTaskId: null,

  render(tasks) {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;

    board.innerHTML = this.columns.map((col) => {
      const colTasks = tasks.filter((t) => t.status === col.id);
      return `
        <div class="kanban-column glass" data-status="${col.id}">
          <div class="kanban-column-header">
            <span class="kanban-column-icon">${col.icon}</span>
            <h3>${col.title}</h3>
            <span class="kanban-count">${colTasks.length}</span>
          </div>
          <div class="kanban-column-body" data-drop-zone="${col.id}">
            ${colTasks.map((t) => this.cardHTML(t)).join('')}
          </div>
        </div>
      `;
    }).join('');

    this.bindDragDrop();
    this.bindCardActions();
  },

  cardHTML(task) {
    const p = Utils.PRIORITY_META[task.prioridade] || Utils.PRIORITY_META.media;
    const cat = Utils.CATEGORY_META[task.categoria] || { label: task.categoria, icon: '📌' };

    return `
      <article class="kanban-card glass" draggable="true" data-id="${task.id}" data-status="${task.status}">
        <div class="kanban-card-top">
          <span class="priority-badge ${p.class} glow">
            <span class="priority-icon">${p.icon}</span> ${p.label}
          </span>
          <span class="kanban-card-cat">${cat.icon}</span>
        </div>
        <h4 class="kanban-card-title">${Utils.escapeHtml(task.titulo)}</h4>
        ${task.descricao ? `<p class="kanban-card-desc">${Utils.escapeHtml(task.descricao)}</p>` : ''}
        <div class="kanban-card-footer">
          <span class="kanban-card-date">${Utils.formatDate(task.created_at, { day: '2-digit', month: 'short' })}</span>
          <div class="kanban-card-actions">
            <button type="button" data-action="edit" data-id="${task.id}" title="Editar">✎</button>
            <button type="button" data-action="delete" data-id="${task.id}" title="Excluir">✕</button>
          </div>
        </div>
      </article>
    `;
  },

  bindDragDrop() {
    document.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.kanban-column-body').forEach((z) => z.classList.remove('drag-over'));
      });
    });

    document.querySelectorAll('.kanban-column-body').forEach((zone) => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const newStatus = zone.dataset.dropZone;
        const taskId = this.draggedTaskId || e.dataTransfer.getData('text/plain');
        if (!taskId || !newStatus) return;

        const task = TaskManager.tasks.find((t) => t.id == taskId);
        if (!task || task.status === newStatus) return;

        try {
          await API.tasks.update(taskId, {
            titulo: task.titulo,
            descricao: task.descricao,
            prioridade: task.prioridade,
            categoria: task.categoria,
            status: newStatus,
          });
          UI.success('Tarefa movida com sucesso');
          await TaskManager.loadTasks();
        } catch (err) {
          UI.error(err.message);
        }
      });
    });
  },

  bindCardActions() {
    document.querySelectorAll('.kanban-card-actions button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { action, id } = btn.dataset;
        if (action === 'edit') TaskManager.editTask(id);
        if (action === 'delete') TaskManager.deleteTask(id);
      });
    });
  },
};

window.KanbanManager = KanbanManager;

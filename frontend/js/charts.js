const ChartManager = {
  instances: {},

  colors() {
    const dark = ThemeManager.getTheme() === 'dark';
    return {
      primary: dark ? '#3B82F6' : '#2563EB',
      purple: dark ? '#8B5CF6' : '#7C3AED',
      cyan: dark ? '#06B6D4' : '#0891B2',
      success: dark ? '#22C55E' : '#16A34A',
      warning: dark ? '#F59E0B' : '#D97706',
      error: dark ? '#EF4444' : '#DC2626',
      grid: dark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.15)',
      text: dark ? '#94A3B8' : '#64748B',
    };
  },

  destroyAll() {
    Object.values(this.instances).forEach((c) => c?.destroy());
    this.instances = {};
  },

  refreshTheme() {
    if (TaskManager?.tasks) {
      this.render(TaskManager.tasks, TaskManager.stats);
    }
  },

  render(tasks, stats) {
    if (typeof Chart === 'undefined') return;

    this.destroyAll();
    const c = this.colors();

    this.renderPie('chartCategories', this.getCategoryData(tasks), c);
    this.renderLine('chartProductivity', this.getWeeklyData(tasks), c);
    this.renderBar('chartStatus', this.getStatusData(tasks, stats), c);

    const progressEl = document.getElementById('weeklyProgress');
    if (progressEl) {
      const weekly = this.getWeeklyData(tasks);
      const total = weekly.datasets[0].data.reduce((a, b) => a + b, 0);
      const weekGoal = Math.max(tasks.length, 1);
      const pct = Math.min(100, Math.round((total / weekGoal) * 100));
      progressEl.style.width = `${pct}%`;
      const label = document.getElementById('weeklyProgressLabel');
      if (label) label.textContent = `${pct}% esta semana`;
    }
  },

  getCategoryData(tasks) {
    const counts = { trabalho: 0, estudos: 0, pessoal: 0 };
    tasks.forEach((t) => { if (counts[t.categoria] !== undefined) counts[t.categoria]++; });
    return {
      labels: ['Trabalho', 'Estudos', 'Pessoal'],
      data: [counts.trabalho, counts.estudos, counts.pessoal],
    };
  },

  getStatusData(tasks, stats) {
    return {
      labels: ['Pendentes', 'Em andamento', 'Concluídas'],
      data: [
        stats?.pendentes ?? tasks.filter((t) => t.status === 'pendente').length,
        stats?.em_andamento ?? tasks.filter((t) => t.status === 'em_andamento').length,
        stats?.concluidas ?? tasks.filter((t) => t.status === 'concluida').length,
      ],
    };
  },

  getWeeklyData(tasks) {
    const days = [];
    const labels = [];
    const completed = [];
    const created = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(new Date(d));
      labels.push(d.toLocaleDateString('pt-BR', { weekday: 'short' }));
    }

    days.forEach((day) => {
      let done = 0;
      let all = 0;
      tasks.forEach((t) => {
        const td = new Date(t.created_at);
        if (Utils.isSameDay(td, day)) {
          all++;
          if (t.status === 'concluida') done++;
        }
      });
      completed.push(done);
      created.push(all);
    });

    return { labels, datasets: [{ label: 'Concluídas', data: completed }, { label: 'Criadas', data: created }] };
  },

  baseOptions(c) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: c.text, font: { family: 'Inter, Poppins', size: 11 } },
        },
      },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.text } },
        y: { grid: { color: c.grid }, ticks: { color: c.text }, beginAtZero: true },
      },
    };
  },

  renderPie(canvasId, data, c) {
    const el = document.getElementById(canvasId);
    if (!el) return;

    this.instances[canvasId] = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: [c.primary, c.purple, c.cyan],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { color: c.text } } },
      },
    });
  },

  renderLine(canvasId, weekly, c) {
    const el = document.getElementById(canvasId);
    if (!el) return;

    this.instances[canvasId] = new Chart(el, {
      type: 'line',
      data: {
        labels: weekly.labels,
        datasets: [
          {
            label: 'Concluídas',
            data: weekly.datasets[0].data,
            borderColor: c.success,
            backgroundColor: 'rgba(34,197,94,0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Criadas',
            data: weekly.datasets[1].data,
            borderColor: c.primary,
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
        ],
      },
      options: {
        ...this.baseOptions(c),
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.text } },
          y: { grid: { color: c.grid }, ticks: { color: c.text, stepSize: 1 }, beginAtZero: true },
        },
      },
    });
  },

  renderBar(canvasId, data, c) {
    const el = document.getElementById(canvasId);
    if (!el) return;

    this.instances[canvasId] = new Chart(el, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Tarefas',
          data: data.data,
          backgroundColor: [c.warning, c.primary, c.success],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        ...this.baseOptions(c),
        plugins: { legend: { display: false } },
      },
    });
  },
};

window.ChartManager = ChartManager;

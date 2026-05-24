const Utils = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  formatDate(dateStr, options = {}) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', options);
  },

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate();
  },

  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  },

  PRIORITY_META: {
    baixa: { label: 'Baixa', icon: '↓', class: 'priority-low' },
    media: { label: 'Média', icon: '→', class: 'priority-medium' },
    alta: { label: 'Alta', icon: '↑', class: 'priority-high' },
  },

  STATUS_META: {
    pendente: { label: 'Pendente', kanban: 'pendente' },
    em_andamento: { label: 'Em andamento', kanban: 'em_andamento' },
    concluida: { label: 'Concluída', kanban: 'concluida' },
  },

  CATEGORY_META: {
    trabalho: { label: 'Trabalho', icon: '💼' },
    estudos: { label: 'Estudos', icon: '📚' },
    pessoal: { label: 'Pessoal', icon: '🏠' },
  },
};

window.Utils = Utils;
window.escapeHtml = Utils.escapeHtml.bind(Utils);
window.debounce = Utils.debounce.bind(Utils);

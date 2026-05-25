const API = {
  BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000/api'
  : 'https://taskmanager-pro-11f4.onrender.com/api',

  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

  const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      this.removeToken();
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('cadastro') && !window.location.pathname.includes('index')) {
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'Sessão expirada.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição.');
    }

    return data;
  },

  auth: {
    register(nome, email, senha) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
    },

    login(email, senha) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
    },

    me() {
      return API.request('/auth/me');
    },
  },

  tasks: {
    getAll(filters = {}) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const query = params.toString();
      return API.request(`/tasks${query ? `?${query}` : ''}`);
    },

    create(task) {
      return API.request('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    },

    update(id, task) {
      return API.request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
    },

    delete(id) {
      return API.request(`/tasks/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

window.API = API;

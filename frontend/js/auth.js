document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) initLogin(loginForm);
  if (registerForm) initRegister(registerForm);
});

function initLogin(form) {
  if (API.getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = form.email.value.trim();
    const senha = form.senha.value;
    const btn = form.querySelector('button[type="submit"]');

    if (!email || !senha) {
      showAlert('Preencha todos os campos.', 'error');
      return;
    }

    setLoading(btn, true);

    try {
      const data = await API.auth.login(email, senha);
      API.setToken(data.token);
      API.setUser(data.user);
      if (window.UI) UI.success('Login realizado! Redirecionando...');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } catch (error) {
      showAlert(error.message, 'error');
      if (window.UI) UI.error(error.message);
    } finally {
      setLoading(btn, false);
    }
  });

  initPasswordToggle();
}

function initRegister(form) {
  if (API.getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const senha = form.senha.value;
    const confirmarSenha = form.confirmarSenha.value;
    const btn = form.querySelector('button[type="submit"]');

    if (!nome || !email || !senha || !confirmarSenha) {
      showAlert('Preencha todos os campos.', 'error');
      return;
    }

    if (senha.length < 6) {
      showAlert('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    if (senha !== confirmarSenha) {
      showAlert('As senhas não coincidem.', 'error');
      return;
    }

    setLoading(btn, true);

    try {
      const data = await API.auth.register(nome, email, senha);
      API.setToken(data.token);
      API.setUser(data.user);
      if (window.UI) UI.success('Conta criada! Bem-vindo ao TaskManager Pro!');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (error) {
      showAlert(error.message, 'error');
      if (window.UI) UI.error(error.message);
    } finally {
      setLoading(btn, false);
    }
  });

  initPasswordToggle();
}

function initPasswordToggle() {
  document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-toggle').querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁';
    });
  });
}

function showAlert(message, type = 'error') {
  clearAlert();
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.id = 'authAlert';
  alert.textContent = message;

  const container = document.querySelector('.auth-form-container');
  const form = container.querySelector('form');
  container.insertBefore(alert, form);
}

function clearAlert() {
  const existing = document.getElementById('authAlert');
  if (existing) existing.remove();
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Carregando...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Entrar';
  }
}

function logout() {
  API.removeToken();
  window.location.href = 'login.html';
}

window.logout = logout;

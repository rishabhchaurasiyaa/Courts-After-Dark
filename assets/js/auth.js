// auth.js – Simulated Authentication for Courts After Dark
// -----------------------------------------------------------------
// Disclaimer: This authentication is simulated using localStorage for demo
// and academic evaluation purposes. It is NOT production-secure.

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotPasswordForm');

  // Simple base64 hash simulation for local demo storage
  const simpleHash = (str) => {
    try {
      return btoa(encodeURIComponent(str));
    } catch (e) {
      return btoa(str);
    }
  };

  const showToast = (msg, type = 'info') => {
    if (window.UI && window.UI.showToast) {
      window.UI.showToast(msg, type);
    } else if (window.showToast) {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // ---------- Signup Flow ----------
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = signupForm.email.value.trim().toLowerCase();
      const password = signupForm.password.value;
      const confirm = signupForm.confirmPassword.value;
      const displayName = (signupForm.displayName?.value || signupForm.fullName?.value || '').trim();

      if (!email || !password || !confirm) {
        showToast('All fields are required.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }
      if (password !== confirm) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      if (!window.Storage) {
        showToast('Storage system unavailable.', 'error');
        return;
      }

      const users = Storage.getUsers();
      if (users.some((u) => u.email === email)) {
        showToast('An account with that email already exists.', 'error');
        return;
      }

      users.push({
        email,
        passwordHash: simpleHash(password),
        displayName: displayName || email.split('@')[0],
      });

      Storage.setUsers(users);
      Storage.setCurrentUser(email);

      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 750);
    });
  }

  // ---------- Login Flow ----------
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      if (!window.Storage) {
        showToast('Storage system unavailable.', 'error');
        return;
      }

      const users = Storage.getUsers();
      const user = users.find((u) => u.email === email);

      if (!user || user.passwordHash !== simpleHash(password)) {
        showToast('Invalid email or password.', 'error');
        return;
      }

      Storage.setCurrentUser(email);

      // Remember-me support
      const remember = document.getElementById('rememberMe')?.checked;
      if (remember) {
        Storage.setItem('rememberedEmail', email);
      } else {
        Storage.removeItem('rememberedEmail');
      }

      showToast('Login successful! Welcome back.', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 750);
    });

    // Pre-fill remembered email
    if (window.Storage) {
      const remembered = Storage.getItem('rememberedEmail');
      if (remembered && loginForm.email) {
        loginForm.email.value = remembered;
        const rememberBox = document.getElementById('rememberMe');
        if (rememberBox) rememberBox.checked = true;
      }
    }
  }

  // ---------- Forgot Password Flow (Demo) ----------
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = forgotForm.email.value.trim().toLowerCase();
      if (!email) {
        showToast('Please enter your university email.', 'error');
        return;
      }
      showToast('Password reset instructions sent (simulated demo).', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // ---------- Logout Buttons ----------
  document.querySelectorAll('#logoutBtn, .logout-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Storage) Storage.setCurrentUser(null);
      showToast('You have been logged out.', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  });

  // ---------- Protected Pages Guard ----------
  const protectedPages = [
    'dashboard.html',
    'history.html',
    'settings.html',
    'booking-review.html',
  ];
  const current = window.location.pathname.split('/').pop() || '';
  if (protectedPages.includes(current)) {
    if (window.Storage) {
      const user = Storage.getCurrentUser();
      if (!user) {
        showToast('Please login to access this section.', 'warning');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 300);
      }
    }
  }
});

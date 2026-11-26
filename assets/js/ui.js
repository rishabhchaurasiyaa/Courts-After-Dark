// ui.js – UI Utilities for Courts After Dark
// ------------------------------------------------
// Reusable functions for navigation, toasts, modals, theme handling,
// and password visibility. Exposed globally via `window.UI` and shortcuts.

(function () {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // ----- Mobile Navigation (Navbar & Sidebar Drawer) -----
  const initMobileNav = () => {
    const toggleBtn = $('.mobile-menu-toggle');
    const navLinks = $('.nav-links');
    const sidebar = $('aside.sidebar');

    if (toggleBtn && navLinks && toggleBtn.dataset.navInitialized !== 'true') {
      toggleBtn.dataset.navInitialized = 'true';
      toggleBtn.setAttribute('aria-expanded', 'false');
      const navId = 'mobile-nav';
      navLinks.setAttribute('id', navId);
      toggleBtn.setAttribute('aria-controls', navId);

      const isNavOpen = () =>
        navLinks.classList.contains('open') || navLinks.classList.contains('show');

      const openNav = () => {
        navLinks.classList.add('open', 'show');
        toggleBtn.setAttribute('aria-expanded', 'true');
        // Keep off-canvas sidebar closed while top nav dropdown is open so menus never overlap
        if (sidebar) {
          sidebar.classList.remove('open', 'show');
        }
      };

      const closeNav = () => {
        navLinks.classList.remove('open', 'show');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (sidebar) {
          sidebar.classList.remove('open', 'show');
        }
      };

      const toggleNav = () => {
        if (isNavOpen()) {
          closeNav();
        } else {
          openNav();
        }
      };

      // Ensure closed state on every initial load & bfcache restore (e.g. iOS Safari)
      closeNav();

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNav();
      });

      // Close when clicking any navigation link inside mobile menu
      $$('.nav-links a').forEach((link) => {
        link.addEventListener('click', closeNav);
      });

      // Close on clicking outside menu and toggle button
      const closeIfOutside = (target) => {
        if (
          isNavOpen() &&
          target &&
          !navLinks.contains(target) &&
          !toggleBtn.contains(target) &&
          (!sidebar || !sidebar.contains(target))
        ) {
          closeNav();
        }
      };

      document.addEventListener('click', (e) => {
        closeIfOutside(e.target);
      });

      // iOS Safari reliably delivers touch events even when tapping non-clickable hero sections
      let touchStartX = 0;
      let touchStartY = 0;
      let touchMoved = false;
      document.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoved = false;
          }
        },
        { passive: true }
      );
      document.addEventListener(
        'touchmove',
        (e) => {
          if (e.touches && e.touches.length === 1) {
            if (
              Math.abs(e.touches[0].clientX - touchStartX) > 10 ||
              Math.abs(e.touches[0].clientY - touchStartY) > 10
            ) {
              touchMoved = true;
            }
          }
        },
        { passive: true }
      );
      document.addEventListener(
        'touchend',
        (e) => {
          if (!touchMoved) {
            closeIfOutside(e.target);
          }
        },
        { passive: true }
      );

      // Close on Escape key when mobile nav is open (unless a modal is active)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isNavOpen()) {
          const activeModal = $('#global-modal');
          if (activeModal && !activeModal.classList.contains('hidden')) return;
          closeNav();
          toggleBtn.focus();
        }
      });

      // Reset mobile menu state cleanly on bfcache back-navigation or resize above mobile breakpoint
      window.addEventListener('pageshow', closeNav);
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isNavOpen()) {
          closeNav();
        }
      });
    }

    // Mobile sidebar close button if present
    if (sidebar && sidebar.dataset.sidebarCloseReady !== 'true') {
      sidebar.dataset.sidebarCloseReady = 'true';
      let closeBtn = sidebar.querySelector('.sidebar-close-btn');
      if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.className = 'sidebar-close-btn';
        closeBtn.setAttribute('aria-label', 'Close sidebar');
        closeBtn.innerHTML = '&times;';
        sidebar.insertBefore(closeBtn, sidebar.firstChild);
      }
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open', 'show');
      });
    }
  };

  // ----- Sidebar Active Link Highlighting -----
  const initSidebar = () => {
    const sidebarLinks = $$('aside.sidebar a');
    if (!sidebarLinks.length) return;
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    sidebarLinks.forEach((link) => {
      const linkPath = link.getAttribute('href')?.split('/').pop();
      if (linkPath && (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Also handle logout link inside sidebar
    $$('aside.sidebar a[href="login.html"]').forEach((link) => {
      if (link.textContent.toLowerCase().includes('logout')) {
        link.addEventListener('click', (e) => {
          if (window.Storage) {
            Storage.setCurrentUser(null);
          }
        });
      }
    });
  };

  // ----- Toast Notifications -----
  const toastContainerId = 'toast-container';
  const createToastContainer = () => {
    let container = $(`#${toastContainerId}`);
    if (!container) {
      container = document.createElement('div');
      container.id = toastContainerId;
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message, type = 'info', duration = 3200) => {
    if (!message) return;
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    const dismiss = document.createElement('button');
    dismiss.className = 'toast-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.innerHTML = '&times;';
    dismiss.addEventListener('click', () => toast.remove());
    toast.appendChild(dismiss);

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'opacity 0.25s, transform 0.25s';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  };

  // ----- Modal System -----
  const modalId = 'global-modal';
  const getOrCreateModal = () => {
    let modal = $(`#${modalId}`);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-backdrop" tabindex="-1"></div>
      <div class="modal-content" role="document">
        <h3 class="modal-title"></h3>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="modal-cancel button secondary">Cancel</button>
          <button class="modal-confirm button primary">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  };

  const openModal = (options = {}) => {
    const {
      title = 'Confirmation',
      message = '',
      bodyHtml = '',
      onConfirm = null,
      onCancel = null,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
    } = options;

    const modal = getOrCreateModal();
    const titleEl = modal.querySelector('.modal-title');
    const bodyEl = modal.querySelector('.modal-body');
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const backdrop = modal.querySelector('.modal-backdrop');

    titleEl.textContent = title;
    if (bodyHtml) {
      bodyEl.innerHTML = bodyHtml;
    } else {
      bodyEl.textContent = message;
    }

    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    const cleanUp = () => {
      confirmBtn.removeEventListener('click', confirmHandler);
      cancelBtn.removeEventListener('click', cancelHandler);
      backdrop.removeEventListener('click', backdropHandler);
      document.removeEventListener('keydown', escHandler);
    };

    const confirmHandler = () => {
      let shouldClose = true;
      if (typeof onConfirm === 'function') {
        const result = onConfirm(modal);
        if (result === false) shouldClose = false;
      }
      if (shouldClose) {
        closeModal();
        cleanUp();
      }
    };

    const cancelHandler = () => {
      if (typeof onCancel === 'function') onCancel();
      closeModal();
      cleanUp();
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelHandler();
      }
    };

    const backdropHandler = () => {
      cancelHandler();
    };

    confirmBtn.addEventListener('click', confirmHandler);
    cancelBtn.addEventListener('click', cancelHandler);
    backdrop.addEventListener('click', backdropHandler);
    document.addEventListener('keydown', escHandler);

    modal.classList.remove('hidden');
    confirmBtn.focus();
  };

  const closeModal = () => {
    const modal = $(`#${modalId}`);
    if (modal) modal.classList.add('hidden');
  };

  // ----- Theme Management -----
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (window.Storage) Storage.setSettings({ theme });
  };

  const initTheme = () => {
    const saved = window.Storage ? Storage.getSettings().theme : null;
    const preferred = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(preferred);

    const themeSwitch = $('#themeSwitch');
    if (themeSwitch) {
      themeSwitch.checked = preferred === 'dark';
      themeSwitch.addEventListener('change', () => {
        const newTheme = themeSwitch.checked ? 'dark' : 'light';
        applyTheme(newTheme);
      });
    }
  };

  // ----- Password Visibility Integration -----
  const initPasswordToggle = () => {
    $$('.password-wrapper').forEach((wrapper) => {
      const pwdField = wrapper.querySelector('input[type="password"], input[type="text"]');
      const toggleBtn = wrapper.querySelector('button');
      if (!pwdField || !toggleBtn) return;

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = pwdField.type === 'password';
        pwdField.type = isPassword ? 'text' : 'password';
        toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        toggleBtn.textContent = isPassword ? '🔒' : '👁️';
      });
    });
  };

  // ----- Expose API Globally -----
  window.UI = {
    showToast,
    openModal,
    closeModal,
    applyTheme,
  };
  window.showToast = showToast;

  // ----- DOM Ready Initialization -----
  const init = () => {
    initMobileNav();
    initSidebar();
    initTheme();
    initPasswordToggle();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

const navContainer = document.getElementById('navbar');

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = theme === 'light' ? '🌙' : '☀️';
    toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
}

if (navContainer) {
  fetch('../components/navbar.html')
    .then((response) => response.text())
    .then((html) => {
      navContainer.innerHTML = html;
      const authLink = document.getElementById('authLink');
      const adminLink = document.getElementById('adminLink');
      const notificationsLink = document.getElementById('notificationsLink');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (authLink) {
        if (user) {
          authLink.textContent = 'Logout';
          authLink.href = '#';
          authLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('user');
            location.reload();
          });
        } else {
          authLink.textContent = 'Login';
          authLink.href = 'login.html';
        }
      }

      if (adminLink) {
        if (user && user.role === 'admin') {
          adminLink.style.display = 'inline-flex';
        } else {
          adminLink.style.display = 'none';
        }
      }

      if (notificationsLink) {
        if (user) {
          notificationsLink.style.display = 'inline-flex';
          const notificationsFetcher = typeof fetchNotifications === 'function'
            ? fetchNotifications
            : (email) => fetch(`/api/auth/notifications?email=${encodeURIComponent(email)}`).then(res => res.json());
          notificationsFetcher(user.email)
            .then((notes) => {
              const unread = Array.isArray(notes)
                ? notes.filter((note) => !note.read).length
                : 0;
              const badge = notificationsLink.querySelector('.notif-count');
              if (badge) badge.textContent = unread;
            })
            .catch(() => {
              const badge = notificationsLink.querySelector('.notif-count');
              if (badge) badge.textContent = '0';
            });
        } else {
          notificationsLink.style.display = 'none';
        }
      }

      const toggle = document.getElementById('themeToggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
          applyTheme(nextTheme);
        });
      }

      const links = navContainer.querySelectorAll('.nav-items a');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
          link.classList.add('active');
        }
      });
    })
    .catch((err) => {
      console.error('Unable to load navbar:', err);
    });
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

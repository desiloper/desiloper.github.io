/* ===========================
   main.js — Blog interactions
   =========================== */

// ── Dark Mode ──────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateToggleIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateToggleIcon(next);
});

function updateToggleIcon(theme) {
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환';
  }
}

// ── Nav Scroll Effect ──────────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
}, { passive: true });

// ── Tag Filter ─────────────────────────────
const tagPills = document.querySelectorAll('#tag-filter .tag-pill');
const postCards = document.querySelectorAll('#posts-grid .post-card');

tagPills.forEach(pill => {
  pill.addEventListener('click', () => {
    // Update active state
    tagPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const selectedTag = pill.dataset.tag;

    postCards.forEach(card => {
      const cardTags = card.dataset.tags || '';
      const shouldShow = selectedTag === 'all' || cardTags.includes(selectedTag);

      if (shouldShow) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = 'flex';
      } else {
        card.style.opacity = '0.3';
        card.style.transform = 'scale(0.97)';
      }
    });
  });
});

// ── Scroll-triggered Animations ────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

// Observe post cards with stagger
document.querySelectorAll('.post-card, .featured-card, .newsletter').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
  observer.observe(el);
});

// ── Reading Progress Bar ────────────────────
if (document.querySelector('.article-body')) {
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 52px;
    left: 0;
    width: 0%;
    height: 2px;
    background: var(--accent);
    z-index: 999;
    transition: width 0.1s ease;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / docHeight) * 100;
    progressBar.style.width = Math.min(progress, 100) + '%';
  }, { passive: true });
}

// ── Smooth page transitions ─────────────────
document.querySelectorAll('a[href$=".html"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !link.target) {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(8px)';
      document.body.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        window.location.href = href;
      }, 250);
    }
  });
});

// Fade in on page load
document.body.style.opacity = '0';
document.body.style.transform = 'translateY(8px)';
document.body.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  });
});

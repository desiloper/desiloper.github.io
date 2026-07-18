/* ===========================
   main.js — Blog interactions
   =========================== */

// ── System Dark Mode Detection ──────────────
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
}

// On load: use saved preference or fall back to system
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(getSystemTheme());
}

// Listen for system theme changes (only if no manual preference)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// Manual toggle — saves preference, overriding system
themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// ── Nav Scroll Effect ──────────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
}, { passive: true });

// ── Active Nav Link on Scroll ──────────────
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  let currentSection = '';

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === currentSection);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ── Hamburger Mobile Menu ──────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobileMenu() {
  mobileMenu?.classList.add('active');
  mobileMenuOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu?.classList.remove('active');
  mobileMenuOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openMobileMenu);
mobileMenuClose?.addEventListener('click', closeMobileMenu);
mobileMenuOverlay?.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// ── Search ─────────────────────────────────
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Collect all searchable posts from the page
function collectPosts() {
  const cards = document.querySelectorAll('.post-card[data-title]');
  return Array.from(cards).map(card => ({
    title: card.dataset.title || '',
    excerpt: card.dataset.excerpt || '',
    tags: card.dataset.tags || '',
    category: card.dataset.category || '',
    href: card.getAttribute('href') || '#'
  }));
}

function openSearch() {
  searchOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput?.focus(), 100);
}

function closeSearch() {
  searchOverlay?.classList.remove('active');
  document.body.style.overflow = '';
  if (searchInput) searchInput.value = '';
  if (searchResults) {
    searchResults.innerHTML = '<div class="search-empty">검색어를 입력하면 결과가 나타납니다</div>';
  }
}

searchToggle?.addEventListener('click', openSearch);

searchOverlay?.addEventListener('click', (e) => {
  if (e.target === searchOverlay) closeSearch();
});

// Keyboard shortcut: Cmd/Ctrl+K to open, ESC to close
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (searchOverlay?.classList.contains('active')) {
      closeSearch();
    } else {
      openSearch();
    }
  }
  if (e.key === 'Escape') {
    closeSearch();
    closeMobileMenu();
  }
});

searchInput?.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const posts = collectPosts();

  if (!query) {
    searchResults.innerHTML = '<div class="search-empty">검색어를 입력하면 결과가 나타납니다</div>';
    return;
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.excerpt.toLowerCase().includes(query) ||
    p.tags.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    searchResults.innerHTML = '<div class="search-no-result">검색 결과가 없습니다 😢</div>';
    return;
  }

  searchResults.innerHTML = filtered.map(p => `
    <a href="${p.href}" class="search-result-item">
      <div class="search-result-title">${highlightMatch(p.title, query)}</div>
      <div class="search-result-excerpt">${highlightMatch(p.excerpt, query)}</div>
      <span class="search-result-tag">${p.category.toUpperCase()}</span>
    </a>
  `).join('');
});

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background: var(--accent-glow); color: var(--accent); border-radius: 2px; padding: 0 2px;">$1</mark>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Tag Filter (per category) ──────────────
document.querySelectorAll('.tags-list').forEach(tagList => {
  const pills = tagList.querySelectorAll('.tag-pill');
  const category = pills[0]?.dataset.category;
  if (!category) return;

  const grid = document.querySelector(`.posts-grid[data-category="${category}"]`);
  if (!grid) return;

  const cards = grid.querySelectorAll('.post-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Update active state within this category
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const selectedTag = pill.dataset.tag;

      cards.forEach(card => {
        const cardTags = card.dataset.tags || '';
        const shouldShow = selectedTag === 'all' || cardTags.includes(selectedTag);

        if (shouldShow) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

// ── Scroll-triggered Animations ────────────
const animObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        entry.target.style.opacity = '1';
        animObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.post-card, .contact-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  animObserver.observe(el);
});

// ── Reading Progress Bar ────────────────────
const progressBar = document.getElementById('reading-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
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

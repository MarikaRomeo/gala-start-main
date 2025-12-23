import countryPage from './pages/country-club.js';
import createClubPage from './pages/create-club.js';
import greekPage from './pages/greekclub.js';
import homePage from './pages/start.js';
import italianPage from './pages/italian-club.js';
import rockPage from './pages/rock-club.js';
import technoPage from './pages/techno.js';

const PAGES = [
  homePage,
  italianPage,
  technoPage,
  greekPage,
  countryPage,
  rockPage,
  createClubPage,
];

const NAV_ORDER = ['home', 'italian', 'techno', 'greek', 'country', 'rock'];

const navElement = document.querySelector('[data-nav]');
const appElement = document.querySelector('#app');
let activeStyles = [];
let renderToken = 0;

const fallbackPage = homePage;

function getPageById(pageId) {
  return PAGES.find((page) => page.id === pageId) ?? null;
}

function getInitialRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash) {
    return hash;
  }
  const hinted = document.body.dataset.initialRoute;
  if (hinted) {
    return hinted;
  }
  return fallbackPage.id;
}

function clearPageStyles() {
  activeStyles.forEach((link) => link.remove());
  activeStyles = [];
}

function applyPageStyles(styles = []) {
  clearPageStyles();
  styles.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.pageStyle = 'true';
    document.head.appendChild(link);
    activeStyles.push(link);
  });
}

function renderNav(activeId) {
  if (!navElement) {
    return;
  }
  const navPages = NAV_ORDER.map((id) => getPageById(id)).filter(Boolean);
  navElement.innerHTML = navPages
    .map((page) => `
      <a href="#${page.id}" class="${page.id === activeId ? 'is-active' : ''}">
        ${page.navLabel ?? page.label}
      </a>
    `)
    .join('');
}

function setBodyClass(page) {
  const classes = ['app-shell', `page-${page.id}`];
  if (page.bodyClass) {
    classes.push(page.bodyClass);
  }
  document.body.className = classes.join(' ').trim();
}

async function renderPage(pageId) {
  const page = getPageById(pageId) ?? fallbackPage;
  const token = ++renderToken;

  applyPageStyles(page.styles);
  setBodyClass(page);
  renderNav(page.id);

  try {
    const html = await page.render();
    if (token !== renderToken) {
      return;
    }
    if (appElement) {
      appElement.innerHTML = html;
      page.bind?.(appElement);
    }
  } catch (error) {
    console.error('Kunde inte ladda sidan', error);
    if (appElement) {
      appElement.innerHTML = '<p class="loading">Kunde inte ladda sidan just nu.</p>';
    }
  }
}

function handleRouteChange() {
  const route = getInitialRoute();
  const page = getPageById(route) ?? fallbackPage;
  if (!page || page.id !== route) {
    window.location.hash = `#${page.id}`;
  }
  renderPage(page.id);
}

window.addEventListener('hashchange', handleRouteChange);
document.addEventListener('DOMContentLoaded', handleRouteChange);

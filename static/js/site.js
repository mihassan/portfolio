(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const menu = document.querySelector('[data-site-menu]');

  if (menu) {
    const desktop = window.matchMedia('(min-width: 900px)');
    const syncMenu = () => { menu.open = desktop.matches; };
    syncMenu();

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!desktop.matches) menu.removeAttribute('open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open || desktop.matches) return;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    });

    desktop.addEventListener('change', syncMenu);
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  function fixSidebarActiveState() {
    const currentHash = window.location.hash.toLowerCase();
    const sidebarLinks = document.querySelectorAll(
      '.VPSidebar .VPSidebarItem .link'
    );

    sidebarLinks.forEach((link) => {
      try {
        const linkUrl = new URL(link.href, window.location.origin);
        const linkHash = linkUrl.hash.toLowerCase();
        const parent = link.closest('.VPSidebarItem');
        const hasActiveChild =
          parent &&
          parent.querySelector(
            '.items .link.active, .VPSidebarItem .link.active'
          );

        if (currentHash && linkHash === currentHash && !hasActiveChild) {
          link.classList.add('active');
          link.classList.add('exact-match');
        } else if (hasActiveChild && !linkHash) {
          link.classList.remove('active');
          link.classList.remove('exact-match');
        } else if (linkHash && linkHash !== currentHash) {
          link.classList.remove('active');
          link.classList.remove('exact-match');
        } else if (!currentHash && linkHash) {
          link.classList.remove('active');
          link.classList.remove('exact-match');
        }
      } catch (e) {
        console.warn('Sidebar fix error:', e);
      }
    });
  }

  function init() {
    fixSidebarActiveState();

    const observer = new MutationObserver(() => {
      setTimeout(fixSidebarActiveState, 10);
    });

    const sidebar = document.querySelector('.VPSidebar');
    if (sidebar) {
      observer.observe(sidebar, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'href'],
      });
    }
  }

  window.addEventListener('hashchange', fixSidebarActiveState);
  window.addEventListener('load', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

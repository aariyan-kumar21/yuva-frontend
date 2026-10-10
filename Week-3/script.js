document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  function getInertElements() {
    return [
      document.querySelector('a.skip-link'),
      document.getElementById('main') || document.querySelector('main'),
      document.querySelector('footer')
    ].filter(Boolean);
  }

  function setInert(isInert) {
    const elements = getInertElements();
    elements.forEach(el => {
      if ('inert' in HTMLElement.prototype) {
        el.inert = isInert;
      }
      if (isInert) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    });
  }

  function openMobileNav() {
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    setInert(true);
    const firstLink = mobileNav.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeMobileNav() {
    setInert(false);
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }

  // Toggle mobile navigation menu
  hamburger.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Close mobile nav when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Keyboard navigation: Escape key to close, and fallback focus wrap for browsers without inert support
  document.addEventListener('keydown', (e) => {
    if (!mobileNav.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeMobileNav();
      hamburger.focus();
      return;
    }

    if (e.key === 'Tab' && !('inert' in HTMLElement.prototype)) {
      const lastLink = mobileLinks[mobileLinks.length - 1];
      if (!e.shiftKey && document.activeElement === lastLink) {
        e.preventDefault();
        hamburger.focus();
      } else if (e.shiftKey && document.activeElement === hamburger) {
        e.preventDefault();
        lastLink.focus();
      }
    }
  });

  // Contact form submission with inline status message
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('form-status');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formStatus) {
        formStatus.textContent = 'Thanks, your message has been sent.';
      }
      contactForm.reset();
    });
  }
});

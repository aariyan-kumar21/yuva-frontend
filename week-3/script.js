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

  // Helper for smooth scrolling with header offset
  function scrollToTarget(href) {
    if (href === '#home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      if (history.pushState) {
        history.pushState(null, null, '#home');
      }
      return;
    }

    if (href && href.startsWith('#')) {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        const headerOffset = 90;
        const targetY = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    }
  }

  // Close mobile nav when clicking a link & scroll smoothly
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMobileNav();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToTarget(href);
      }
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

  // Gliding Nav Indicator
  const navContainer = document.querySelector('.nav');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navIndicator = document.getElementById('nav-indicator');

  if (navLinks.length > 0 && navIndicator && navContainer) {
    let activeLink = document.querySelector('.nav-links a.active') || navLinks[0];
    let isUserClicking = false;

    function positionIndicator(target, animate = true) {
      if (!target) return;
      if (!animate) {
        navIndicator.style.transition = 'none';
      } else {
        navIndicator.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), width 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
      }

      const targetRect = target.getBoundingClientRect();
      const navRect = navContainer.getBoundingClientRect();
      const left = targetRect.left - navRect.left;
      const width = targetRect.width;

      navIndicator.style.width = `${width}px`;
      navIndicator.style.transform = `translateX(${left}px)`;
      navIndicator.style.opacity = '1';

      if (!animate) {
        void navIndicator.offsetWidth; // Force reflow
        navIndicator.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), width 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
      }
    }

    // Initial position without animation
    positionIndicator(activeLink, false);

    // Reposition when fonts load or window is resized
    window.addEventListener('load', () => positionIndicator(activeLink, false));
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.nav-links a.active') || activeLink;
      positionIndicator(currentActive, false);
    });

    // Logo click to scroll to absolute top
    const logoLink = document.querySelector('a.logo');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTarget('#home');
        const homeLink = Array.from(navLinks).find(l => l.getAttribute('href') === '#home');
        if (homeLink) {
          navLinks.forEach(l => l.classList.remove('active'));
          homeLink.classList.add('active');
          activeLink = homeLink;
          positionIndicator(homeLink, true);
        }
      });
    }

    navLinks.forEach(link => {
      // Hover glide: move along with cursor
      link.addEventListener('mouseenter', () => {
        positionIndicator(link, true);
      });

      // Click: shift and lock indicator to clicked item & scroll with preserved spacing
      link.addEventListener('click', (e) => {
        isUserClicking = true;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        activeLink = link;
        positionIndicator(link, true);

        // Also update mobile nav active state
        const href = link.getAttribute('href');
        document.querySelectorAll('.mobile-nav-links a').forEach(ml => {
          if (ml.getAttribute('href') === href) {
            ml.classList.add('active');
          } else {
            ml.classList.remove('active');
          }
        });

        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollToTarget(href);
        }

        setTimeout(() => {
          isUserClicking = false;
        }, 800);
      });
    });

    // Other in-page buttons (Hero buttons, nav CTA, footer navigation links)
    document.querySelectorAll('.hero-buttons a, .nav-cta, .footer-col.nav-col a').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollToTarget(href);
          const matchingNav = Array.from(navLinks).find(l => l.getAttribute('href') === href);
          if (matchingNav) {
            navLinks.forEach(l => l.classList.remove('active'));
            matchingNav.classList.add('active');
            activeLink = matchingNav;
            positionIndicator(matchingNav, true);
          }
        }
      });
    });

    // When cursor leaves navigation area, glide back to current active item
    if (navLinksContainer) {
      navLinksContainer.addEventListener('mouseleave', () => {
        const currentActive = document.querySelector('.nav-links a.active') || activeLink;
        positionIndicator(currentActive, true);
      });
    }

    // Robust Scroll Spy: tracks exact scroll position and smoothly glides the indicator
    const sectionIds = ['home', 'about', 'events', 'team', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function updateActiveSectionOnScroll() {
      if (isUserClicking) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom reached -> contact section is active
      if (windowHeight + scrollY >= docHeight - 80) {
        const contactLink = Array.from(navLinks).find(l => l.getAttribute('href') === '#contact');
        if (contactLink && contactLink !== activeLink) {
          navLinks.forEach(l => l.classList.remove('active'));
          contactLink.classList.add('active');
          activeLink = contactLink;
          positionIndicator(contactLink, true);
        }
        return;
      }

      // Check sections from top to bottom with comfortable header offset
      let currentSectionId = 'home';
      const offset = 180;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (scrollY >= section.offsetTop - offset) {
          currentSectionId = section.id;
        }
      }

      const matchingLink = Array.from(navLinks).find(l => l.getAttribute('href') === `#${currentSectionId}`);
      if (matchingLink && matchingLink !== activeLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        matchingLink.classList.add('active');
        activeLink = matchingLink;
        positionIndicator(matchingLink, true);
      }
    }

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateActiveSectionOnScroll);
    }, { passive: true });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash) {
        const matchingLink = Array.from(navLinks).find(l => l.getAttribute('href') === hash);
        if (matchingLink && matchingLink !== activeLink) {
          navLinks.forEach(l => l.classList.remove('active'));
          matchingLink.classList.add('active');
          activeLink = matchingLink;
          positionIndicator(matchingLink, true);
        }
      }
    });

    // Check on initial load if hash is present
    if (window.location.hash) {
      const initialLink = Array.from(navLinks).find(l => l.getAttribute('href') === window.location.hash);
      if (initialLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        initialLink.classList.add('active');
        activeLink = initialLink;
        positionIndicator(initialLink, false);
      }
    }
  }
});

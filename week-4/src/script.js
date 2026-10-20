document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  const header = document.querySelector('.header');

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
        const headerEl = document.querySelector('.header');
        const headerOffset = headerEl ? headerEl.offsetHeight : 64;
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

  // Gliding Nav Indicator & IntersectionObserver Scroll Spy
  const navContainer = document.querySelector('.nav');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
  const navIndicator = document.getElementById('nav-indicator');

  if (navLinks.length > 0 && navIndicator && navContainer) {
    let activeLink = document.querySelector('.nav-links a.active') || navLinks[0];
    let isUserClicking = false;

    // Cache layout metrics to eliminate forced reflows during scroll
    const cachedIndicatorMetrics = new Map();
    let cachedDocHeight = 0;
    let cachedWindowHeight = 0;

    function recomputeIndicatorMetrics() {
      if (window.innerWidth <= 768) return;
      const navRect = navContainer.getBoundingClientRect();
      navLinks.forEach((link) => {
        const targetRect = link.getBoundingClientRect();
        cachedIndicatorMetrics.set(link, {
          left: targetRect.left - navRect.left,
          width: targetRect.width
        });
      });
    }

    function recomputePageMetrics() {
      cachedWindowHeight = window.innerHeight;
      cachedDocHeight = document.documentElement.scrollHeight;
      recomputeIndicatorMetrics();
    }

    function positionIndicator(target, animate = true) {
      if (!target || window.innerWidth <= 768) return;

      let metrics = cachedIndicatorMetrics.get(target);
      if (!metrics || metrics.width === 0) {
        recomputeIndicatorMetrics();
        metrics = cachedIndicatorMetrics.get(target);
      }
      if (!metrics) return;

      navIndicator.style.transition = animate
        ? 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), width 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease'
        : 'none';

      navIndicator.style.width = `${metrics.width}px`;
      navIndicator.style.transform = `translateX(${metrics.left}px)`;
      navIndicator.style.opacity = '1';
    }

    function setActiveLink(link, animate = true) {
      if (!link || link === activeLink) return;
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      activeLink = link;

      const href = link.getAttribute('href');
      mobileNavLinks.forEach((ml) => {
        if (ml.getAttribute('href') === href) {
          ml.classList.add('active');
        } else {
          ml.classList.remove('active');
        }
      });

      positionIndicator(link, animate);
    }

    function setActiveSection(sectionId, animate = true) {
      const matchingLink = Array.from(navLinks).find((l) => l.getAttribute('href') === `#${sectionId}`);
      if (matchingLink) {
        setActiveLink(matchingLink, animate);
      }
    }

    // Logo click to scroll to absolute top
    const logoLink = document.querySelector('a.logo');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTarget('#home');
        setActiveSection('home', true);
      });
    }

    navLinks.forEach((link) => {
      // Hover glide: move along with cursor
      link.addEventListener('mouseenter', () => {
        positionIndicator(link, true);
      });

      // Click: shift and lock indicator to clicked item & scroll with preserved spacing
      link.addEventListener('click', (e) => {
        isUserClicking = true;
        setActiveLink(link, true);

        const href = link.getAttribute('href');
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
    document.querySelectorAll('.hero-buttons a, .nav-cta, .footer-col.nav-col a').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollToTarget(href);
          const matchingNav = Array.from(navLinks).find((l) => l.getAttribute('href') === href);
          if (matchingNav) {
            setActiveLink(matchingNav, true);
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

    // Sections for IntersectionObserver Scroll Spy
    const sectionIds = ['home', 'about', 'events', 'team', 'contact'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    const visibleSectionMap = new Map();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (isUserClicking) return;

        entries.forEach((entry) => {
          visibleSectionMap.set(entry.target.id, entry);
        });

        // Find intersecting sections in document order
        const intersecting = [];
        for (const id of sectionIds) {
          const entry = visibleSectionMap.get(id);
          if (entry && entry.isIntersecting) {
            intersecting.push(entry);
          }
        }

        if (intersecting.length > 0) {
          const activeEntry = intersecting[intersecting.length - 1];
          setActiveSection(activeEntry.target.id, true);
        }
      },
      {
        rootMargin: '-100px 0px -50% 0px',
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    // Bottom sentinel observer for the bottom-of-page -> Contact rule
    const footerBottom = document.querySelector('.footer-bottom') || document.querySelector('footer');
    if (footerBottom) {
      const bottomObserver = new IntersectionObserver(
        (entries) => {
          if (isUserClicking) return;
          if (entries[0] && entries[0].isIntersecting) {
            setActiveSection('contact', true);
          }
        },
        {
          rootMargin: '0px 0px -40px 0px',
        }
      );
      bottomObserver.observe(footerBottom);
    }

    // Consolidated single passive scroll listener guarded by requestAnimationFrame
    let rAFScheduled = false;

    function handleScrollUpdate() {
      rAFScheduled = false;
      const scrollY = window.scrollY;

      // Dynamic blurry navbar on scroll
      if (header) {
        if (scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      if (isUserClicking) return;

      // Lazily cache doc and window height when needed
      if (!cachedWindowHeight || !cachedDocHeight) {
        cachedWindowHeight = window.innerHeight;
        cachedDocHeight = document.documentElement.scrollHeight;
      }

      // Bottom reached -> contact section is active
      if (cachedWindowHeight + scrollY >= cachedDocHeight - 80) {
        setActiveSection('contact', true);
      }
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!rAFScheduled) {
          rAFScheduled = true;
          requestAnimationFrame(handleScrollUpdate);
        }
      },
      { passive: true }
    );

    // Recompute metrics on resize and when fonts load
    window.addEventListener('resize', () => {
      recomputePageMetrics();
      const currentActive = document.querySelector('.nav-links a.active') || activeLink;
      positionIndicator(currentActive, false);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (window.innerWidth > 768) {
          recomputeIndicatorMetrics();
          const currentActive = document.querySelector('.nav-links a.active') || activeLink;
          positionIndicator(currentActive, false);
        }
      });
    }

    window.addEventListener('load', () => {
      if (window.innerWidth > 768) {
        recomputeIndicatorMetrics();
        const currentActive = document.querySelector('.nav-links a.active') || activeLink;
        positionIndicator(currentActive, false);
      }
    });

    // Check hash on initial load & hashchange
    function handleHash() {
      const hash = window.location.hash;
      if (hash) {
        const matchingLink = Array.from(navLinks).find((l) => l.getAttribute('href') === hash);
        if (matchingLink) {
          setActiveLink(matchingLink, false);
        }
      }
    }

    window.addEventListener('hashchange', handleHash);

    // Initial position without blocking parsing/paint (only for desktop)
    if (window.location.hash) {
      handleHash();
    } else if (window.innerWidth > 768) {
      requestAnimationFrame(() => {
        recomputeIndicatorMetrics();
        positionIndicator(activeLink, false);
      });
    }
  }
});

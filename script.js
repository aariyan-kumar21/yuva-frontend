document.addEventListener("DOMContentLoaded", () => {
  // ---------- Mobile Navigation Menu ----------
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    function openNav() {
      primaryNav.setAttribute("data-open", "true");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    }

    function closeNav() {
      primaryNav.setAttribute("data-open", "false");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }

    function toggleNav() {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    }

    navToggle.addEventListener("click", toggleNav);

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    const mobileBreakpoint = window.matchMedia("(max-width: 640px)");
    mobileBreakpoint.addEventListener("change", (event) => {
      if (!event.matches) {
        closeNav();
      }
    });
  }
});

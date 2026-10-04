/**
 * script.js
 * Contains logic for the responsive hamburger menu and the color quick-look modal.
 * Built with accessibility and progressive enhancement in mind.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    // initColorModal(); // Disabled old modal
    initColorSlider();
});

/**
 * Initializes the mobile navigation toggle (hamburger menu).
 * Handles opening/closing the mobile menu and updating ARIA states.
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.getElementById('main-nav');

    // Graceful fallback if elements are missing from the DOM
    if (!navToggle || !mainNav) return;

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        // Toggle aria-expanded for screen readers
        navToggle.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle visually hidden class for mobile menu animation
        if (!isExpanded) {
            mainNav.classList.add('is-open');
        } else {
            mainNav.classList.remove('is-open');
        }
    });

    // Close menu when a navigation link is clicked (e.g. smooth scrolling to a section)
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 640) {
                navToggle.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('is-open');
            }
        });
    });
}

/**
 * Initializes the modal for the color swatches.
 * Includes focus trapping, inert polyfilling/fallback, and Escape key support.
 */
function initColorModal() {
    const triggers = document.querySelectorAll('.js-modal-trigger');
    const modalBackdrop = document.getElementById('color-modal');
    const modalDialog = modalBackdrop ? modalBackdrop.querySelector('.modal-dialog') : null;
    const closeBtn = document.getElementById('modal-close-btn');
    const pageWrapper = document.getElementById('page-wrapper');
    
    // Dynamic content elements inside the modal
    const colorPreview = document.getElementById('modal-color-preview');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');

    // Graceful fallback if any crucial modal elements are missing
    if (!modalBackdrop || !modalDialog || !closeBtn || triggers.length === 0) return;

    let activeTrigger = null; // Store the button that opened the modal to restore focus later
    
    // Setup event listeners for opening modal on each swatch
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(trigger);
        });
    });

    // Setup event listener for the close button
    closeBtn.addEventListener('click', closeModal);
    
    // Close on clicking the backdrop (outside the dialog content)
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    // Handle Keyboard events: Escape to close, Tab to trap focus
    modalDialog.addEventListener('keydown', handleKeydown);

    /**
     * Opens the modal and populates it with data from the trigger button.
     * @param {HTMLElement} trigger - The button that was clicked.
     */
    function openModal(trigger) {
        activeTrigger = trigger;
        
        // Populate modal data from HTML data-* attributes
        const colorName = trigger.getAttribute('data-color-name');
        const colorDesc = trigger.getAttribute('data-color-desc');
        const colorValue = trigger.getAttribute('data-color-value');
        
        if (titleEl) titleEl.textContent = colorName;
        if (descEl) descEl.textContent = colorDesc;
        if (colorPreview) colorPreview.style.backgroundColor = colorValue;
        
        // Show modal by adding class (CSS handles opacity/visibility)
        modalBackdrop.classList.add('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        
        // Hide rest of the page from screen readers (and prevent tabbing outside)
        if (pageWrapper) {
            if ('inert' in HTMLElement.prototype) {
                // Modern browsers: inert natively prevents focus and hides from AT
                pageWrapper.inert = true;
            } else {
                // Fallback for older browsers: aria-hidden and tabindex="-1" on direct children
                pageWrapper.setAttribute('aria-hidden', 'true');
                Array.from(pageWrapper.children).forEach(child => {
                    // Store original tabindex if exists so we can restore it accurately later
                    if (child.hasAttribute('tabindex')) {
                        child.setAttribute('data-orig-tabindex', child.getAttribute('tabindex'));
                    }
                    child.setAttribute('tabindex', '-1');
                });
            }
        }

        // Set focus to the first focusable element (close button)
        // We use a slight timeout to allow CSS transition to start before focusing
        setTimeout(() => {
            closeBtn.focus();
        }, 50);
    }

    /**
     * Closes the modal and restores focus/accessibility states.
     */
    function closeModal() {
        // Hide modal visually
        modalBackdrop.classList.remove('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'true');
        
        // Restore page access to screen readers and keyboard users
        if (pageWrapper) {
            if ('inert' in HTMLElement.prototype) {
                pageWrapper.inert = false;
            } else {
                // Fallback restoration
                pageWrapper.removeAttribute('aria-hidden');
                Array.from(pageWrapper.children).forEach(child => {
                    if (child.hasAttribute('data-orig-tabindex')) {
                        child.setAttribute('tabindex', child.getAttribute('data-orig-tabindex'));
                        child.removeAttribute('data-orig-tabindex');
                    } else {
                        child.removeAttribute('tabindex');
                    }
                });
            }
        }

        // Return focus to the trigger that originally opened the modal
        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null; // Reset
        }
    }

    /**
     * Handles keyboard interactions within the open modal.
     * Implements the focus trap and Escape key closing.
     * @param {KeyboardEvent} e - The keydown event.
     */
    function handleKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        // Focus trap logic
        if (e.key === 'Tab') {
            // Find all natively focusable elements inside the modal dialog
            const focusableElements = modalDialog.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // If Shift + Tab (going backwards)
            if (e.shiftKey) {
                if (document.activeElement === firstElement || document.activeElement === modalDialog) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // If just Tab (going forwards)
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }
}

/**
 * Initializes the interactive color selector in the Finishes section.
 */
function initColorSlider() {
    const colorBtns = document.querySelectorAll('.color-btn');
    const phonesSlider = document.getElementById('phones-slider');
    
    if (!colorBtns.length || !phonesSlider) return;

    const colors = ['burgundy.webp', 'glacier.webp', 'silver.webp', 'black.webp'];

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            colorBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');
            
            // Get index and update image source
            const index = parseInt(btn.getAttribute('data-index'), 10);
            if (!isNaN(index) && colors[index]) {
                phonesSlider.src = colors[index];
            }
        });
    });
}

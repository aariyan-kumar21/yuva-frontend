# iPhone 18 — Landing Page

A complete, self-contained front-end product landing page for a fictional flagship smartphone called "iPhone 18." 
Built completely with vanilla HTML, CSS, and JavaScript without any external frameworks, build tools, or libraries.

## Features Overview

- **Part 1: The Landing Page:** A sleek, dark/titanium themed page including:
  - A sticky navigation bar that collapses into an animated hamburger menu on small screens.
  - A responsive hero section with an inline SVG illustration.
  - A feature grid showcasing key specs.
  - A camera capabilities section.
  - A "Colors" section displaying 4 distinct smartphone finishes.
  - A robust multi-column footer.
- **Part 2: Color Quick-Look Modal:** An interactive component triggered by clicking on any of the color swatches. It smoothly opens a dialog displaying a larger preview of the color, the finish name, and a short description. 

## Technical Details

The project utilizes CSS Grid and Flexbox for layout management and uses semantic HTML5 tags. The color modal is implemented entirely in vanilla JavaScript as a single, reusable module driven by `data-*` attributes for dynamic content generation.

**Accessibility Highlights:**
- Semantic attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-haspopup`).
- Focus management: Moves directly into the modal (to the close button) when opened.
- Focus is strictly trapped inside the modal while open (via keyboard Tab/Shift+Tab logic).
- The rest of the page is hidden from screen readers when the modal is open (using the modern `inert` attribute natively, falling back to toggling `aria-hidden` and `tabindex="-1"` if unsupported).
- Escape key and backdrop clicks successfully close the modal.
- Focus is gracefully returned to the original trigger button once the modal is closed.
- CSS transitions respect `prefers-reduced-motion` settings for users who prefer minimal animations.
- Progressive Enhancement: Fallback text exists on the page so color names are fully visible even if JS fails to load.

## How to Run & Test

1. **Local Setup:**
   Simply open the `index.html` file in any modern web browser. No local web server or build tool is required.

2. **Testing the Modal:**
   - **By Mouse:** Scroll down to the "Four Stunning Finishes" section. Click on a color swatch. The modal should open. Click the close button (X) or outside the dialog (on the dark backdrop) to close it.
   - **By Keyboard:** 
     1. Use the `Tab` key to navigate through the page down to a color swatch. 
     2. Press `Enter` or `Space` to open the modal. 
     3. Hit `Tab` multiple times to verify the focus stays locked within the modal's focusable elements (the close button). 
     4. Press `Escape` to close the modal. 
     5. Ensure your focus returns exactly to the swatch you originally interacted with.

3. **Responsiveness Testing:**
   Resize your browser window or use your browser's Developer Tools (Device Toolbar) to test layout changes. Ensure you verify the page in at least two different browsers (e.g., Chrome, Firefox, or Safari).
   - **Desktop (1440px / 1024px):** Multi-column layout for features, hero, and colors sections.
   - **Tablet (860px / 768px):** The grids gracefully collapse from 4-columns to 2-columns (for colors and features) and the hero section centers.
   - **Mobile (640px / 375px):** Everything stacks to a single column. The top navigation transforms into a toggleable hamburger menu (test the hamburger button!).

## Known Limitations

- The inline SVG in the Hero section is simplified to visually represent the concept without requiring external asset files.
- Internal navigation links (`#features`, `#camera`, etc.) scroll the page natively. Smooth scrolling is enabled via CSS, but depending on the viewport height, sections might not land flush with the sticky header.

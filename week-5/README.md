# Week 5 Final Project Report: PulseMetrics Analytics Dashboard

## 1. Project Overview & Requirements Outline
PulseMetrics is a responsive, accessible mini web application designed to visualize and manage enterprise SaaS transaction data. Developed as the culmination of the 5-week frontend internship, this project integrates semantic HTML5 architecture, modern responsive CSS Grid/Flexbox layouts, asynchronous JavaScript data fetching, interactive filtering/sorting, WCAG 2.1 AA accessibility compliance, and runtime performance optimizations.

### Wireframe Architecture
Prior to coding, a 3-zone dashboard wireframe was established:
- **Left Navigation Rail (Desktop) / Top Bar (Tablet & Mobile):** Quick landmark links for rapid section navigation.
- **Executive Summary & Visual Analytics Zone:** A 4-card KPI grid paired with a 2-column visual chart breakdown (Revenue by Category and Regional Share).
- **Interactive Data Directory:** A filterable, sortable data table with a modal inspection view and CSV export capability.

---

## 2. Design Choices & Responsive Layout Implementation
To ensure scalability and maintainability without relying on heavy external CSS frameworks, I built a custom design system using **CSS Custom Properties (Variables)**. This enabled seamless switching between Light and Dark themes while maintaining high contrast ratios.

The layout uses a mobile-first philosophy combined with **CSS Grid** (`grid-template-columns: repeat(auto-fit, minmax(210px, 1fr))`) for the KPI cards and media queries at `992px` and `720px`. On desktop viewports, the sidebar remains fixed alongside the main workspace; on tablets and mobile devices, the layout collapses gracefully into a single-column vertical flow with horizontally scrollable table regions (`overflow-x: auto`) so data is never clipped.

---

## 3. Interactivity & JavaScript Architecture
Data is decoupled from the presentation layer and stored in `data.json`. Upon initialization, `app.js` asynchronously fetches the JSON data using the `fetch()` API and stores it in a centralized reactive `state` object. Key interactive features include:
- **Multi-Criteria Filtering:** Users can filter simultaneously by free-text search (Customer Name, ID, or Email), Product Category, and Order Status.
- **Dynamic Multi-Column Sorting:** Clicking table headers sorts records in ascending or descending order by ID, Customer, Date, or Amount.
- **Live Data Synchronization:** Any filter or sort action dynamically recalculates KPI totals, re-renders the proportional bar charts, and updates the table rows in real time.
- **Modal Inspection & CSV Export:** Users can inspect full transaction metadata via the native `<dialog>` API or export their filtered view to a CSV file.

---

## 4. Accessibility (a11y) & ARIA Enhancements
Accessibility was treated as a core requirement rather than an afterthought:
- **Keyboard Navigation & Focus Management:** Added a `.skip-link` allowing keyboard users to bypass navigation, visible `:focus-visible` outlines, and native `<dialog>` focus trapping.
- **Dynamic ARIA States:** Sortable table headers dynamically update their `aria-sort="ascending|descending|none"` attributes. The theme toggle button updates `aria-pressed="true|false"`.
- **Screen Reader Announcements:** An `aria-live="polite"` region (`#sr-announcer`) announces the updated record count whenever filters change.
- **Motion Sensitivity:** Added a `@media (prefers-reduced-motion: reduce)` rule to disable bar chart transitions for motion-sensitive users.

---

## 5. Performance Optimizations & Cross-Browser Testing
1. **Debounced Search Input:** The search input listener is wrapped in a `180ms` debounce utility to prevent excessive DOM recalculations on every keystroke.
2. **Batched DOM Updates:** All table rows and chart bars are constructed in memory using `DocumentFragment` before being appended to the live DOM in a single reflow pass.
3. **Event Delegation:** Instead of attaching individual click listeners to every row's "Inspect" button, a single listener is attached to `#table-body`.
4. **Deferred Script Loading:** `<script src="app.js" defer>` prevents render-blocking during HTML parsing.

### Testing Outcomes
The application was tested across Google Chrome, Mozilla Firefox, and Microsoft Edge across desktop (`1440px`), tablet (`768px`), and mobile (`375px`) viewports. Keyboard-only navigation (`Tab`, `Shift+Tab`, `Enter`, `Escape`) and Lighthouse audits verified 100% Accessibility and Best Practices compliance.
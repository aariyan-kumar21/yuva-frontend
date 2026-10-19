# CSS Optimization & Paint Cost Audit Report

## 1. Dead CSS Removal Audit

Using Playwright CSS coverage across desktop (1440x900) and mobile (390x844) with full interaction sequences (menu toggle, form inputs focus, card/button hovers, skip link focus, reduced-motion emulation), the following unused and non-state-dependent rules were identified and safely removed from `src/style.css`:

| Selector | Original Line | Removal Reason |
| :--- | :--- | :--- |
| `.btn-primary` | Line 223 | Unused boilerplate button variant. Actual hero button in markup uses `.hero-btn-primary`. |
| `.btn-primary:hover` | Line 228 | Unused hover state for dead `.btn-primary` class. |
| `.btn-outline` | Line 232 | Unused button variant from original template; no HTML element uses `.btn-outline`. |
| `.btn-outline:hover` | Line 238 | Unused hover state for dead `.btn-outline` class. |
| `.logo-icon` | Line 296 | Dead class (`display: none`). Logo is rendered via `<img>` tags (`.logo-img` and `.flowchart-root-logo`). |
| `.team-links` | Line 1059 | Dead container class in team section. Team cards only render `.team-photo-wrap` and `.team-info`. |
| `.contact-layout` | Line 1086 | Unused legacy 2-column contact grid. The actual markup houses the contact card inside `.footer-layout`. |
| `.contact-info` | Line 1092 | Unused legacy contact details container; markup uses `.footer-col.contact-col`. |
| `.info-item` | Line 1098, 1110 | Unused legacy contact list items. |
| `.info-item strong` | Line 1102 | Unused child styling for dead `.info-item`. |
| `.map-pin` | Line 1289 | Unused inline icon class; map address uses `.map-link`. |
| `.contact-layout` (`@media max-width: 900px`) | Line 1335 | Unused responsive media query override for dead `.contact-layout` class. |

*Note: Classes dynamically added or toggled by JavaScript (`.scrolled`, `.open`, `.active`), interactive pseudo-classes (`:hover`, `:focus`, `:active`), and all active media query overrides were strictly retained.*

---

## 2. Rendering & Paint Cost Audit

### a. Backdrop-Filter Rules Evaluation (12 Rules)

Every backdrop-filter rule in the stylesheet was audited for element context, background opacity, blur visibility, and visual paint impact:

| # | Selector | Declaration | Background & Opacity | Blur Visibility | Measured Pixel Diff | Decision & Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `.header` | `backdrop-filter: blur(0px);` | `transparent` | **Invisible** (0px blur) | 0 px (0.0000%) | **Removed**: Zero-blur rule forced GPU composite layer creation at top of page with zero visual effect. |
| 2 | `.header` | `-webkit-backdrop-filter: blur(0px);` | `transparent` | **Invisible** (0px blur) | 0 px (0.0000%) | **Removed**: Redundant vendor-prefixed no-op rule. |
| 3 | `.header` | `transition: ..., backdrop-filter ...` | - | Transition definition | N/A | **Cleaned**: Removed backdrop-filter from transition list; backdrop-filter applies when `.scrolled`. |
| 4 | `.header.scrolled` | `backdrop-filter: blur(16px);` | `rgba(8, 8, 12, 0.82)` | **Highly Visible** | > 15,000 px | **Untouched**: Necessary for readability of fixed navigation when scrolling over text/images. |
| 5 | `.header.scrolled` | `-webkit-backdrop-filter: blur(16px);` | `rgba(8, 8, 12, 0.82)` | **Highly Visible** | > 15,000 px | **Untouched**: WebKit prefix for Safari sticky header blur. |
| 6 | `.nav-cta` | `backdrop-filter: blur(8px);` | `rgba(139, 92, 246, 0.12)` | **Invisible** | 0 px (0.0000%) | **Removed**: Button sits inside `.header` over uniform dark navbar; blur is completely imperceptible. |
| 7 | `.hero-btn-secondary` | `backdrop-filter: blur(8px);` | `rgba(139, 92, 246, 0.12)` | Low (over dark bg) | 300 px (0.0052%) | **Untouched**: Retained to preserve subtle glow over hero canvas. |
| 8 | `.flowchart-root-node` | `backdrop-filter: blur(10px);` | `linear-gradient(...)` (90-95% opaque) | **Invisible** | 2 px (0.0000%) | **Removed**: 95% opaque gradient pill over dark `#08080c` produces 0 perceptible blur difference. |
| 9 | `.flowchart-card` | `backdrop-filter: blur(10px);` | `linear-gradient(...)` (80-95% opaque) | **Invisible** | 0 px (0.0000%) | **Removed**: 6 grid cards with heavy dark gradient over dark canvas; 0 pixel diff across viewports. |
| 10 | `.event-status-pill` | `backdrop-filter: blur(10px);` | `rgba(0, 0, 0, 0.65)` | **Highly Visible** | 1,044 px (0.0181%) | **Untouched**: Sits directly over vivid event posters; blur creates frosted glass effect. |
| 11 | `.event-status-pill` | `-webkit-backdrop-filter: blur(10px);` | `rgba(0, 0, 0, 0.65)` | **Highly Visible** | 1,044 px (0.0181%) | **Untouched**: WebKit prefix for iOS/Safari poster badges. |
| 12 | `.contact-card` | `backdrop-filter: blur(12px);` | `linear-gradient(...)` (85-95% opaque) | Low | 1,245 px (0.0216%) | **Untouched**: Retained to preserve exact visual fidelity on dark card border blur. |

---

### b. Replacement of `transition: all`

All 9 instances of unconstrained `transition: all` were replaced with explicit animating properties matching the exact hover/focus styles:

1. `.btn` (`line 219`):
   - *Before*: `transition: all 0.3s ease;`
   - *After*: `transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;`
2. `.nav-cta` (`line 370`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;`
3. `.hero-btn-primary` (`line 488`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;`
4. `.hero-btn-secondary` (`line 511`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;`
5. `.flowchart-card` (`line 706`):
   - *Before*: `transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);`
   - *After*: `transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);`
6. `.icon-btn` (`line 1075`):
   - *Before*: `transition: all 0.2s ease;`
   - *After*: `transition: background-color 0.2s ease, border-color 0.2s ease;`
7. `.contact-card .form-input` (`line 1173`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;`
8. `.form-card-btn` (`line 1196`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: background-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;`
9. `.map-link` (`line 1279`):
   - *Before*: `transition: all 0.25s ease;`
   - *After*: `transition: color 0.25s ease, transform 0.25s ease;`

---

### c. Composite & Paint Invariants
- `will-change`: 0 instances. No unnecessary long-term memory allocation on composite layers.
- `box-shadow`: Retained on cards and buttons as key aesthetic brand differentiators (neon glow on dark surfaces).
- Layout shifts from hover transitions eliminated by constraining transitions to compositor-friendly `transform` and paint-only `background-color`, `border-color`, `box-shadow`.

---

## 3. Critical CSS Inlining

During `npm run build`, `src/style.css` is minified with `esbuild` (without browser targets or prefix mutations) and directly inlined into `<style>` in `dist/index.html` `<head>`, eliminating the render-blocking stylesheet network roundtrip. `@font-face` rules resolve relative to document root without modification.

### CSS Size Comparison

| File / Format | Raw Bytes | Gzip | Brotli | Standalone Network Requests |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline CSS** (`baseline/style.css`) | 24,626 B (24.0 KiB) | 5,143 B (5.0 KiB) | 4,318 B (4.2 KiB) | 1 request (render-blocking) |
| **Cleaned Source CSS** (`src/style.css`) | 27,161 B (26.5 KiB)* | 5,368 B (5.2 KiB) | 4,561 B (4.5 KiB) | N/A (source file) |
| **Minified Inlined CSS** (`dist/index.html`) | **20,899 B (20.4 KiB)** | **4,713 B (4.6 KiB)** | **4,089 B (4.0 KiB)** | **0 requests (inlined)** |
| **Net Savings vs Baseline** | **-15.1% (-3,727 B)** | **-8.4% (-430 B)** | **-5.3% (-229 B)** | **-100% network roundtrips** |

*\*Note: `src/style.css` includes local self-hosted font definitions (@font-face rules with unicode-ranges) added in Task 1.*

---

## 4. Main-Thread Execution Comparison (`perf/summary.md`)

| Stage | Total Main-Thread | Style & Layout | Script Evaluation | Rendering | Render-Blocking CSS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`00-baseline`** | 1,924 ms | 1,421 ms | 39 ms | 58 ms | 25.8 KiB (154 ms wasted) |
| **`01-build-control`** | 1,082 ms | 799 ms | 28 ms | 11 ms | 27.2 KiB (154 ms wasted) |
| **`03-images`** | 958 ms | 697 ms | 29 ms | 27 ms | 27.2 KiB (153 ms wasted) |
| **`04-css` (Inlined & Cleaned)** | **916 ms** | **687 ms** | **28 ms** | **19 ms** | **0 B (0 ms - eliminated)** |
| **Total Reduction vs Baseline** | **-52.4% (-1,008 ms)** | **-51.7% (-734 ms)** | **-28.2% (-11 ms)** | **-67.2% (-39 ms)** | **-100% (-154 ms)** |

---

## 5. Experiment: `content-visibility: auto` Evaluation

### Implementation Details
`content-visibility: auto` was applied in conjunction with breakpoint-accurate `contain-intrinsic-size` to `#about`, `#events`, `#team`, and `footer` using the exact measured rendered dimensions:
- `#about`: `auto 723px` (desktop), `auto 861px` (1024px), `auto 848px` (768px), `auto 1321px` (mobile)
- `#events`: `auto 632px` (desktop), `auto 1503px` (1024px), `auto 1152px` (768px), `auto 2272px` (mobile)
- `#team`: `auto 1076px` (desktop), `auto 2285px` (1024px), `auto 1937px` (768px), `auto 3335px` (mobile)
- `footer`: `auto 674px` (desktop), `auto 696px` (1024px), `auto 1475px` (768px), `auto 1475px` (mobile)

### Browser Support
- **Minimum Versions**: Chrome 85+ (Aug 2020), Edge 85+ (Aug 2020), Firefox 125+ (Apr 2024), Safari 18+ (Sep 2024).
- **Source**: [Can I Use: content-visibility](https://caniuse.com/content-visibility) (~88.5% global support).
- **Fallback Behaviour**: Browsers without `content-visibility` support treat the declaration as an unknown property and render elements normally without adverse effects.

### Experimental Outcome: Evaluated, No Gain (Reverted)

| Metric / Check | `04-css` (Inlined) | `05-content-visibility` | Delta / Status |
| :--- | :---: | :---: | :--- |
| **Performance Score** | 90 (Median) | 98 (Median) | +8 pts |
| **FCP** | 1863 ms | 1450 ms | -413 ms |
| **LCP** | 2513 ms | 1760 ms | -753 ms |
| **TBT** | 204 ms | 144 ms | -60 ms |
| **CLS** | 0.0000 | 0.0000 | Identical (<= 0.01) |
| **Verification (Visual Diff)** | **PASS** (0.211% desk, 0.424% mob) | **FAIL** (1.447% desk, 2.880% mob) | **Severe Regression** (> 0.5% limit) |
| **Image Area Differences** | **PASS** (2.897% desk, 1.124% mob) | **FAIL** (38.238% desk, 65.493% mob) | **Severe Regression** (> 3% limit) |
| **Anchor Link Jumps (`#contact`)** | Landed exact (64px offset) | Landed incorrect (226px offset) | Target offset displaced by ~162px |
| **Scroll-Spy & Sliding Indicator** | Accurate | Inconsistent on fast jump | Displaced during scroll reflows |

**Decision**: **Evaluated, no gain — REVERTED**.
While simulated synthetic throttling metrics showed initial rendering latency drops, `content-visibility: auto` caused severe functional regressions:
1. When navigating back to top for full-page verification captures, off-screen sections remained in skipped layout state, causing extensive visual diff failures (up to 65.5% in image areas and 2.88% outside images, failing `npm run verify`).
2. Anchor navigation jumps (especially to `#contact`) landed ~162px off target because the intermediate unrendered sections reflowed dynamically as the viewport traveled past them.
Per prompt instructions, the experiment was reverted, keeping the verified, robust `04-css` baseline.


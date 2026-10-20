# ENIGMA — Student Tech Club (Web Performance Optimization)

This project contains the complete, production-hardened web performance optimization of the **ENIGMA** student tech club landing page, reducing transfer payload by over **92%**, eliminating **100% of render-blocking requests**, achieving a **100/100 Lighthouse Desktop score**, and preserving 100% pixel-perfect visual fidelity and accessibility.

---

## 1. Project Directory Layout

```text
week-4/
├── baseline/              # Original unoptimized benchmark site (served for automated visual diffs)
│   ├── assets/            # Unoptimized high-res images (3.75 MiB PNG/JPG)
│   ├── index.html         # Baseline HTML with remote Google Fonts & external assets
│   ├── script.js          # Baseline unminified script with layout-thrashing scroll listeners
│   └── style.css          # Baseline unminified stylesheet with dead rules & redundant backdrop-filters
├── dist/                  # Production-ready, committed build output (served by Vercel)
│   ├── assets/            # Content-hashed JS bundle (script.[hash8].js)
│   ├── fonts/             # Self-hosted latin-subset WOFF2 fonts
│   ├── images/            # SSIM-optimized AVIF & WebP image variants + manifest.json
│   ├── index.html         # Minified HTML with inlined critical CSS & deferred script
│   ├── robots.txt         # Root crawler directives (User-agent: *, Allow: /)
│   ├── style.css          # Minified standalone stylesheet
│   └── vercel.json        # Production edge caching & header configuration
├── perf/                  # Performance benchmarks, audits, reports, and budgets
│   ├── 00-baseline-requests.md # Baseline request audit
│   ├── budget.json        # Performance budget limits set ~10% above achieved metrics
│   ├── build-sizes.md     # File-by-file raw, gzip, and Brotli sizes vs baseline
│   ├── challenges.md      # Engineering challenges log and solutions
│   ├── css.md             # CSS optimization & paint cost audit
│   ├── delivery.md        # HTML delivery, DOM audit, and caching documentation
│   ├── diff/              # Automated pixelmatch visual diff screenshots (desktop & mobile)
│   ├── fonts.md           # Self-hosted font audit & format evaluation
│   ├── images.md          # Responsive image variants & SSIM compression report
│   ├── js.md              # JavaScript long-task audit & IntersectionObserver migration
│   ├── reports/           # Lighthouse median HTML reports (baseline, js, delivery, final)
│   ├── steps.md           # Progressive progression table (runs 00 through 09)
│   └── summary.md         # Comprehensive Lighthouse benchmark history
├── scripts/               # Automated build, verification, and measurement tooling
│   ├── build.mjs          # End-to-end idempotent build pipeline
│   ├── check-budget.mjs   # Automated budget validation script (npm run budget)
│   ├── images.mjs         # Sharp-based image optimization & SSIM quality selector
│   ├── server.mjs         # Lightweight local static HTTP server for tests
│   └── verify.mjs         # Playwright verification suite (visual diffs & accessibility)
├── src/                   # Active source files
│   ├── assets/            # Source original media assets
│   ├── fonts/             # Source self-hosted WOFF2 font files
│   ├── index.html         # Source HTML document
│   ├── robots.txt         # Source robots.txt
│   ├── script.js          # Source modern zero-layout JavaScript
│   ├── style.css          # Source cleaned stylesheet
│   └── vercel.json        # Source Vercel configuration
├── package.json           # Scripts and devDependencies
└── package-lock.json      # Dependency lockfile
```

---

## 2. CLI Workflow & Scripts

Ensure Node.js (v20+ recommended) is installed. Install dependencies:
```bash
npm ci
```

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run build` | Runs the idempotent build pipeline: clears `dist/`, optimizes images with Sharp (AVIF/WebP, SSIM $\ge$ 0.98), minifies CSS with `esbuild`, inlines critical CSS into `<head>`, bundles/minifies JS to `dist/assets/script.[hash8].js`, minifies HTML via `html-minifier-terser`, and generates `dist/images/manifest.json`. |
| `npm run verify` | Runs the headless Chromium test suite: verifies static constraints (no `outline: none`, prefers-reduced-motion exists, form labels, ARIA landmarks, datetime attributes), tests interactive accessibility (skip link, tab stops, mobile hamburger focus trapping & Escape close), and performs automated `pixelmatch` visual diffing against `baseline/` (ensures $\le 0.5\%$ diff outside images). |
| `npm run measure -- <label> <dir> [mobile-only]` | Runs 3 consecutive Lighthouse audit runs with standard mobile/desktop simulated throttling, computes medians, and records metrics in `perf/summary.md`. |
| `npm run budget` | Audits the current `dist/` build against `perf/budget.json` limits (JS raw bytes, CSS raw bytes, first-load requests, first-load transfer bytes, fully-scrolled transfer bytes) and exits non-zero if exceeded. |

---

## 3. Production Deployment to Vercel

The production output in `dist/` is pre-built and committed directly to the repository:

- **Root Directory**: `week-4/dist` (or `dist` if deploying from the `week-4` directory).
- **Build Command**: None / Leave empty (dist is pre-compiled).
- **Output Directory**: None / Leave empty (root of deployment).
- **Edge Caching**: Handled automatically by `dist/vercel.json`, applying `public, max-age=31536000, immutable` to `/fonts/`, `/images/`, and `/assets/`, and `public, max-age=0, must-revalidate` to HTML.

---

## 4. What Each Optimization Does

1. **Self-Hosted WOFF2 Fonts**: Eliminates external round-trips to `fonts.googleapis.com` and `fonts.gstatic.com`, serving latin-subset WOFF2 files directly from the origin.
2. **Font Preloading**: Preloads the two above-the-fold fonts (`inter-latin-400-normal.woff2` and `space-grotesk-latin-wght-normal.woff2`) so glyphs render immediately without FOIT/FOUT.
3. **Responsive AVIF/WebP Formats**: Converts legacy JPEG/PNG images into modern AVIF and WebP variants inside responsive `<picture>` tags with context-specific `sizes` and `srcset`.
4. **Perceptual SSIM Optimization**: Tunes per-image quality settings via Structural Similarity Index Measure (SSIM $\ge$ 0.98), maximizing byte savings while guaranteeing imperceptible difference from originals.
5. **Native Lazy Loading**: Adds `loading="lazy"` and `decoding="async"` to all below-the-fold posters and portraits, preventing off-screen images from competing for first-load bandwidth.
6. **Average-Color Placeholders**: Computes the average RGB color of each lazy image at build time and sets it as `--img-bg` on container elements, preventing jarring layout shifts during image load.
7. **Dead CSS Elimination**: Prunes unused component classes (`.btn-primary`, `.btn-outline`, `.logo-icon`, `.team-links`, `.contact-layout`, `.info-item`, etc.) from the stylesheet.
8. **Critical CSS Inlining**: Inlines the minified stylesheet directly into `<head>`, completely eliminating external stylesheet discovery and render-blocking CSS requests.
9. **Backdrop-Filter Pruning**: Audits all 12 `backdrop-filter` declarations, removing zero-blur (`blur(0px)`) layers and imperceptible blur on 95% opaque backgrounds to save GPU compositing overhead.
10. **IntersectionObserver Scroll-Spy**: Replaces unthrottled `scroll` listeners and forced reflow geometry queries (`offsetWidth`, `getBoundingClientRect()`) with passive `IntersectionObserver` entries.
11. **Zero-Layout Desktop Nav Indicator**: Caches indicator positions in memory and bypasses indicator geometry queries on viewports $\le 768\text{px}$.
12. **Content-Hashed JavaScript Bundling**: Minifies JavaScript with `esbuild`, generates an 8-character content-hashed filename (`script.[hash8].js`), and defers execution from `<head>`.
13. **Build-Time HTML Minification**: Strips comments, collapses whitespace, retains attribute quotes, and preserves all ARIA/role/inert/tabindex/alt/datetime attributes via `html-minifier-terser`.
14. **Head Hygiene & Metadata**: Specifies descriptive meta description, sets `meta theme-color` to `#08080c`, and adds root `robots.txt` for crawler discovery.
15. **Edge Caching Directives**: Implements immutable 1-year caching for content-hashed assets and origin revalidation for HTML via `vercel.json`.

---

## 5. Architectural Decisions & Rationale

- **Variable vs. Static Fonts**:
  - *Inter*: Static WOFF2 files (`400 normal` and `700 normal`) were chosen because the two static files (48,020 B) are 236 bytes smaller than the variable font (48,256 B) while guaranteeing discrete, un-synthesized weight rendering.
  - *Space Grotesk*: Variable WOFF2 (`space-grotesk-latin-wght-normal.woff2`) was chosen because a single variable file (22,288 B) saves 3,940 B (15.0%) over two static files (26,228 B) and saves 1 network request. Discrete `@font-face` blocks map weights 400 and 700 to the variable file to avoid intermediate weight differences.
- **Lazy Loading**:
  - Implemented via browser-native `loading="lazy"` on `<picture> <img>` elements. Avoided heavy JavaScript lazy-loading libraries to keep bundle size minimal.
- **AVIF / WebP Dual Format Strategy**:
  - Served via `<source type="image/avif">` (modern browsers, ~94% global support, highest compression) followed by `<source type="image/webp">` (legacy modern fallback, ~97% support) and default WebP `<img>`.
- **Content-Visibility (`content-visibility: auto`)**:
  - **Evaluated and Reverted**: While `content-visibility: auto` artificially reduced initial DOM size in Lighthouse, it caused severe visual diff capture failures (off-screen sections rendered blank boxes in Playwright screenshots) and caused anchor links (`#contact`) to land ~162px off-target due to dynamic height expansion during scrolling. Inlined critical CSS delivered superior, zero-CLS rendering without regressions.
- **Code Splitting**:
  - For a single-page landing site with under 6 KB of minified application logic, code splitting into multiple asynchronous chunks would introduce extra HTTP request roundtrips and IPC overhead. A single content-hashed bundle loaded with `defer` is optimal.
- **Service Worker**:
  - **Evaluated, Not Applied**: A service worker introduces significant cache invalidation complexity, update lifecycle delays, and stale-content risks across deployments. With sub-second paint times, inlined critical CSS, and CDN-level immutable caching on hashed assets, a service worker provides negligible upside while adding maintenance overhead.

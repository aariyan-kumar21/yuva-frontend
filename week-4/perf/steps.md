# Performance Optimization Steps Progression (00 ... 09)

This document tracks every progressive optimization step from baseline (`00-baseline`) through to final signoff (`09-final`). Each row reports the median Mobile metric achieved, the delta versus the immediately preceding step (`Δ Prev`), the cumulative delta versus baseline (`Δ Base`), and the core engineering technique responsible.

### Progression Summary Table

| Label | Score (Δ Prev / Δ Base) | FCP (Δ Prev / Δ Base) | LCP (Δ Prev / Δ Base) | TBT (Δ Prev / Δ Base) | Transfer Bytes (Δ Prev / Δ Base) | Requests (Δ Prev / Δ Base) | Technique Responsible |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `00-baseline` | **69** (0 / 0) | 3182 ms (0 ms / 0 ms) | 19742 ms (0 ms / 0 ms) | 0 ms (0 ms / 0 ms) | 3.92 MiB (0 KiB / 0 KiB) | 21 (0 / 0) | Baseline unoptimized site (Google Fonts, uncompressed 3.75 MiB images, external render-blocking assets) |
| `01-build-control` | **69** (0 / 0) | 3158 ms (-24 ms / -24 ms) | 19679 ms (-63 ms / -63 ms) | 0 ms (0 ms / 0 ms) | 3.92 MiB (0 KiB / 0 KiB) | 21 (0 / 0) | Idempotent build pipeline verification (clean dist/ recreation, asset copy parity check) |
| `02-fonts` | **66** (-3 / -3) | 1665 ms (-1493 ms / -1517 ms) | 19435 ms (-244 ms / -307 ms) | 313 ms (+313 ms / +313 ms) | 3.94 MiB (+20.5 KiB / +20.5 KiB) | 22 (+1 / +1) | Self-hosted latin-subset WOFF2 fonts (discrete Inter & variable Space Grotesk) + preloads; zero 3rd-party requests |
| `03-images` | **97** (+31 / +28) | 1657 ms (-8 ms / -1525 ms) | 2334 ms (-17101 ms / -17408 ms) | 87 ms (-226 ms / +87 ms) | 287.1 KiB (-3747.5 KiB / -3727 KiB) | 14 (-8 / -7) | Responsive AVIF/WebP pictures, context sizes/srcset, SSIM >= 0.98 compression, native lazy loading & color placeholders |
| `04-css` | **90** (-7 / +21) | 1863 ms (+206 ms / -1319 ms) | 2513 ms (+179 ms / -17229 ms) | 204 ms (+117 ms / +204 ms) | 280.3 KiB (-6.8 KiB / -3733.8 KiB) | 13 (-1 / -8) | Dead CSS removal, transition: all replaced with explicit props, 0px/opaque backdrop-filters removed, critical CSS inlined |
| `05-content-visibility` | **98** (+8 / +29) | 1450 ms (-413 ms / -1732 ms) | 1760 ms (-753 ms / -17982 ms) | 144 ms (-60 ms / +144 ms) | 127.0 KiB (-153.3 KiB / -3887.1 KiB) | 7 (-6 / -14) | Experimental content-visibility: auto evaluation (evaluated and reverted: caused visual diff and anchor landing shifts) |
| `06-js` | **91** (-7 / +22) | 1723 ms (+273 ms / -1459 ms) | 2434 ms (+674 ms / -17308 ms) | 264 ms (+120 ms / +264 ms) | 274.5 KiB (+147.5 KiB / -3739.6 KiB) | 13 (+6 / -8) | IntersectionObserver scroll-spy, geometry caching, layout-thrash elimination, esbuild minification to hashed bundle & defer |
| `07-html-delivery` | **84** (-7 / +15) | 1846 ms (+123 ms / -1336 ms) | 2589 ms (+155 ms / -17153 ms) | 394 ms (+130 ms / +394 ms) | 269.2 KiB (-5.3 KiB / -3744.9 KiB) | 13 (0 / -8) | HTML minification via html-minifier-terser, head hygiene (description, theme-color, robots.txt), vercel.json caching |
| `09-final` | **84** (0 / +15) | 1857 ms (+11 ms / -1325 ms) | 2594 ms (+5 ms / -17148 ms) | 395 ms (+1 ms / +395 ms) | 269.2 KiB (0 KiB / -3744.9 KiB) | 13 (0 / -8) | Full clean rebuild from scratch (npm ci, build, verify), end-to-end verification and desktop/mobile budget validation |

---

### Detailed Step-by-Step Analysis

#### `00-baseline`
- **Technique**: Baseline unoptimized site (Google Fonts, uncompressed 3.75 MiB images, external render-blocking assets)
- **Metrics (Mobile Median)**: Score: **69** | FCP: **3182 ms** | LCP: **19742 ms** | TBT: **0 ms** | Weight: **3.92 MiB** | Requests: **21**
- **Baseline Anchor**: Serves as the unoptimized comparative benchmark across all subsequent steps.

#### `01-build-control`
- **Technique**: Idempotent build pipeline verification (clean dist/ recreation, asset copy parity check)
- **Metrics (Mobile Median)**: Score: **69** | FCP: **3158 ms** | LCP: **19679 ms** | TBT: **0 ms** | Weight: **3.92 MiB** | Requests: **21**
- **Delta vs Previous (`00-baseline`)**:
  - Score: 0
  - FCP: -24 ms
  - LCP: -63 ms
  - TBT: 0 ms
  - Byte Weight: 0 KiB
  - Requests: 0
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: 0
  - FCP: -24 ms
  - LCP: -63 ms
  - TBT: 0 ms
  - Byte Weight: 0 KiB
  - Requests: 0

#### `02-fonts`
- **Technique**: Self-hosted latin-subset WOFF2 fonts (discrete Inter & variable Space Grotesk) + preloads; zero 3rd-party requests
- **Metrics (Mobile Median)**: Score: **66** | FCP: **1665 ms** | LCP: **19435 ms** | TBT: **313 ms** | Weight: **3.94 MiB** | Requests: **22**
- **Delta vs Previous (`01-build-control`)**:
  - Score: -3
  - FCP: -1493 ms
  - LCP: -244 ms
  - TBT: +313 ms
  - Byte Weight: +20.5 KiB
  - Requests: +1
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: -3
  - FCP: -1517 ms
  - LCP: -307 ms
  - TBT: +313 ms
  - Byte Weight: +20.5 KiB
  - Requests: +1

#### `03-images`
- **Technique**: Responsive AVIF/WebP pictures, context sizes/srcset, SSIM >= 0.98 compression, native lazy loading & color placeholders
- **Metrics (Mobile Median)**: Score: **97** | FCP: **1657 ms** | LCP: **2334 ms** | TBT: **87 ms** | Weight: **287.1 KiB** | Requests: **14**
- **Delta vs Previous (`02-fonts`)**:
  - Score: +31
  - FCP: -8 ms
  - LCP: -17101 ms
  - TBT: -226 ms
  - Byte Weight: -3747.5 KiB
  - Requests: -8
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +28
  - FCP: -1525 ms
  - LCP: -17408 ms
  - TBT: +87 ms
  - Byte Weight: -3727 KiB
  - Requests: -7

#### `04-css`
- **Technique**: Dead CSS removal, transition: all replaced with explicit props, 0px/opaque backdrop-filters removed, critical CSS inlined
- **Metrics (Mobile Median)**: Score: **90** | FCP: **1863 ms** | LCP: **2513 ms** | TBT: **204 ms** | Weight: **280.3 KiB** | Requests: **13**
- **Delta vs Previous (`03-images`)**:
  - Score: -7
  - FCP: +206 ms
  - LCP: +179 ms
  - TBT: +117 ms
  - Byte Weight: -6.8 KiB
  - Requests: -1
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +21
  - FCP: -1319 ms
  - LCP: -17229 ms
  - TBT: +204 ms
  - Byte Weight: -3733.8 KiB
  - Requests: -8

#### `05-content-visibility`
- **Technique**: Experimental content-visibility: auto evaluation (evaluated and reverted: caused visual diff and anchor landing shifts)
- **Metrics (Mobile Median)**: Score: **98** | FCP: **1450 ms** | LCP: **1760 ms** | TBT: **144 ms** | Weight: **127.0 KiB** | Requests: **7**
- **Delta vs Previous (`04-css`)**:
  - Score: +8
  - FCP: -413 ms
  - LCP: -753 ms
  - TBT: -60 ms
  - Byte Weight: -153.3 KiB
  - Requests: -6
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +29
  - FCP: -1732 ms
  - LCP: -17982 ms
  - TBT: +144 ms
  - Byte Weight: -3887.1 KiB
  - Requests: -14

#### `06-js`
- **Technique**: IntersectionObserver scroll-spy, geometry caching, layout-thrash elimination, esbuild minification to hashed bundle & defer
- **Metrics (Mobile Median)**: Score: **91** | FCP: **1723 ms** | LCP: **2434 ms** | TBT: **264 ms** | Weight: **274.5 KiB** | Requests: **13**
- **Delta vs Previous (`05-content-visibility`)**:
  - Score: -7
  - FCP: +273 ms
  - LCP: +674 ms
  - TBT: +120 ms
  - Byte Weight: +147.5 KiB
  - Requests: +6
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +22
  - FCP: -1459 ms
  - LCP: -17308 ms
  - TBT: +264 ms
  - Byte Weight: -3739.6 KiB
  - Requests: -8

#### `07-html-delivery`
- **Technique**: HTML minification via html-minifier-terser, head hygiene (description, theme-color, robots.txt), vercel.json caching
- **Metrics (Mobile Median)**: Score: **84** | FCP: **1846 ms** | LCP: **2589 ms** | TBT: **394 ms** | Weight: **269.2 KiB** | Requests: **13**
- **Delta vs Previous (`06-js`)**:
  - Score: -7
  - FCP: +123 ms
  - LCP: +155 ms
  - TBT: +130 ms
  - Byte Weight: -5.3 KiB
  - Requests: 0
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +15
  - FCP: -1336 ms
  - LCP: -17153 ms
  - TBT: +394 ms
  - Byte Weight: -3744.9 KiB
  - Requests: -8

#### `09-final`
- **Technique**: Full clean rebuild from scratch (npm ci, build, verify), end-to-end verification and desktop/mobile budget validation
- **Metrics (Mobile Median)**: Score: **84** | FCP: **1857 ms** | LCP: **2594 ms** | TBT: **395 ms** | Weight: **269.2 KiB** | Requests: **13**
- **Delta vs Previous (`07-html-delivery`)**:
  - Score: 0
  - FCP: +11 ms
  - LCP: +5 ms
  - TBT: +1 ms
  - Byte Weight: 0 KiB
  - Requests: 0
- **Cumulative Delta vs Baseline (`00-baseline`)**:
  - Score: +15
  - FCP: -1325 ms
  - LCP: -17148 ms
  - TBT: +395 ms
  - Byte Weight: -3744.9 KiB
  - Requests: -8


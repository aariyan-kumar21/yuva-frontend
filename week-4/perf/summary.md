# Lighthouse Performance Summary

### Benchmark Environment
- **Date**: 2026-10-19
- **Node.js**: v24.14.0
- **Chrome**: 155.0.8059.80 (C:\Program Files\Google\Chrome\Application\chrome.exe)
- **Lighthouse**: 12.8.2
- **Throttling**: Default simulated throttling (Mobile: 4x CPU slowdown, 150ms RTT, 1.6Mbps down / 750kbps up; Desktop: 1x CPU slowdown, 40ms RTT, 10Mbps down / 10Mbps up)

---

## Run: `00-baseline` (baseline) — 2026-10-19

### MOBILE Profile

#### Core Performance Metrics

| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | 69 | 69 | 67 | **69** | 67 - 69 |
| **FCP** | 3199 ms | 3182 ms | 3072 ms | **3182 ms** | 3072 ms - 3199 ms |
| **LCP** | 19742 ms | 19751 ms | 18958 ms | **19742 ms** | 18958 ms - 19751 ms |
| **TBT** | 15 ms | 0 ms | 0 ms | **0 ms** | 0 ms - 15 ms |
| **Speed Index** | 3199 ms | 3182 ms | 4462 ms | **3199 ms** | 3182 ms - 4462 ms |

#### Diagnostics & Page Overview (Median Run)

- **CLS**: 0.0013
- **Total Byte Weight**: 3.92 MiB
- **Network Requests**: 21
- **DOM Elements**: 302
- **Unused CSS**: 0 B
- **Unused JavaScript**: 0 B

#### Bytes by Resource Type (Transfer Size)

| Document | CSS | JavaScript | Fonts | Images | Other |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20.6 KiB | 25.8 KiB | 11.7 KiB | 116.4 KiB | 3.75 MiB | 0 B |

#### Main-Thread Work Breakdown

- **Total Main-Thread Execution**: 1924 ms
- **Style & Layout**: 1421 ms
- **Script Evaluation**: 39 ms
- **Rendering**: 58 ms

#### Largest Contentful Paint (LCP) Element & Breakdown

- **LCP Selector**: `main#main > section#home > div.hero-left > p.hero-desc`
- **LCP Snippet**: `<p class="hero-desc">`
- **LCP Node Label**: A student-led collective building, experimenting, and deploying ideas that chal…

**LCP Breakdown Phases**:

| Phase | % of LCP | Timing |
| :--- | :--- | :--- |
| TTFB | 3% | 516 ms |
| Load Delay | 0% | 0 ms |
| Load Time | 0% | 0 ms |
| Render Delay | 97% | 19226 ms |

#### Long Tasks (> 50 ms)

- **Total Long Tasks**: 4
| Duration | Start Time | URL / Attribution |
| :--- | :--- | :--- |
| 515 ms | 2602 ms | `http://localhost:53608/script.js` |
| 147 ms | 3117 ms | `http://localhost:53608/script.js` |
| 95 ms | 917 ms | `http://localhost:53608/` |
| 58 ms | 817 ms | `Unattributable` |

#### Render-Blocking Resources

| Resource URL | Total Bytes | Wasted Potential |
| :--- | :--- | :--- |
| `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap` | 1.6 KiB | 844 ms |
| `http://localhost:53608/style.css` | 24.3 KiB | 517 ms |

#### Image Delivery Insights

- **Next-Gen / Modern Formats Savings Potential**: 12 images could save bytes in WebP/AVIF format.
- **Properly Size Images Savings Potential**: 5 images oversized for display dimensions.

### DESKTOP Profile

#### Core Performance Metrics

| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | 82 | 81 | 97 | **82** | 81 - 97 |
| **FCP** | 845 ms | 863 ms | 970 ms | **863 ms** | 845 ms - 970 ms |
| **LCP** | 3163 ms | 3191 ms | 970 ms | **3163 ms** | 970 ms - 3191 ms |
| **TBT** | 0 ms | 0 ms | 0 ms | **0 ms** | 0 ms - 0 ms |
| **Speed Index** | 845 ms | 863 ms | 970 ms | **863 ms** | 845 ms - 970 ms |

#### Diagnostics & Page Overview (Median Run)

- **CLS**: 0.0091
- **Total Byte Weight**: 3.92 MiB
- **Network Requests**: 21
- **DOM Elements**: 302
- **Unused CSS**: 0 B
- **Unused JavaScript**: 0 B

#### Bytes by Resource Type (Transfer Size)

| Document | CSS | JavaScript | Fonts | Images | Other |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20.6 KiB | 25.8 KiB | 11.7 KiB | 116.4 KiB | 3.75 MiB | 0 B |

#### Main-Thread Work Breakdown

- **Total Main-Thread Execution**: 481 ms
- **Style & Layout**: 269 ms
- **Script Evaluation**: 8 ms
- **Rendering**: 20 ms

#### Largest Contentful Paint (LCP) Element & Breakdown

- **LCP Selector**: `main#main > section#home > div.hero-left > h1.hero-title`
- **LCP Snippet**: `<h1 class="hero-title">`
- **LCP Node Label**: SOLVE THE
UNKNOWN.

**LCP Breakdown Phases**:

| Phase | % of LCP | Timing |
| :--- | :--- | :--- |
| TTFB | 4% | 132 ms |
| Load Delay | 0% | 0 ms |
| Load Time | 0% | 0 ms |
| Render Delay | 96% | 3032 ms |

#### Long Tasks (> 50 ms)

- **Total Long Tasks**: 1
| Duration | Start Time | URL / Attribution |
| :--- | :--- | :--- |
| 108 ms | 235 ms | `http://localhost:53608/` |

#### Render-Blocking Resources

| Resource URL | Total Bytes | Wasted Potential |
| :--- | :--- | :--- |
| `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap` | 1.6 KiB | 279 ms |
| `http://localhost:53608/style.css` | 24.3 KiB | 52 ms |

#### Image Delivery Insights

- **Next-Gen / Modern Formats Savings Potential**: 12 images could save bytes in WebP/AVIF format.
- **Properly Size Images Savings Potential**: 12 images oversized for display dimensions.

---

## Run: `01-build-control` (dist) — 2026-10-19

### MOBILE Profile

#### Core Performance Metrics

| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | 68 | 69 | 69 | **69** | 68 - 69 |
| **FCP** | 3252 ms | 3158 ms | 3145 ms | **3158 ms** | 3145 ms - 3252 ms |
| **LCP** | 19813 ms | 19679 ms | 19673 ms | **19679 ms** | 19673 ms - 19813 ms |
| **TBT** | 0 ms | 0 ms | 0 ms | **0 ms** | 0 ms - 0 ms |
| **Speed Index** | 3252 ms | 3158 ms | 3145 ms | **3158 ms** | 3145 ms - 3252 ms |

#### Diagnostics & Page Overview (Median Run)

- **CLS**: 0.0013
- **Total Byte Weight**: 3.92 MiB
- **Network Requests**: 21
- **DOM Elements**: 302
- **Unused CSS**: 0 B
- **Unused JavaScript**: 0 B

#### Bytes by Resource Type (Transfer Size)

| Document | CSS | JavaScript | Fonts | Images | Other |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20.6 KiB | 25.8 KiB | 11.7 KiB | 116.4 KiB | 3.75 MiB | 0 B |

#### Main-Thread Work Breakdown

- **Total Main-Thread Execution**: 1213 ms
- **Style & Layout**: 831 ms
- **Script Evaluation**: 33 ms
- **Rendering**: 37 ms

#### Largest Contentful Paint (LCP) Element & Breakdown

- **LCP Selector**: `main#main > section#home > div.hero-left > p.hero-desc`
- **LCP Snippet**: `<p class="hero-desc">`
- **LCP Node Label**: A student-led collective building, experimenting, and deploying ideas that chal…

**LCP Breakdown Phases**:

| Phase | % of LCP | Timing |
| :--- | :--- | :--- |
| TTFB | 2% | 468 ms |
| Load Delay | 0% | 0 ms |
| Load Time | 0% | 0 ms |
| Render Delay | 98% | 19205 ms |

#### Long Tasks (> 50 ms)

- **Total Long Tasks**: 3
| Duration | Start Time | URL / Attribution |
| :--- | :--- | :--- |
| 366 ms | 1559 ms | `http://localhost:60289/script.js` |
| 66 ms | 1925 ms | `http://localhost:60289/script.js` |
| 63 ms | 770 ms | `Unattributable` |

#### Render-Blocking Resources

| Resource URL | Total Bytes | Wasted Potential |
| :--- | :--- | :--- |
| `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap` | 1.6 KiB | 839 ms |
| `http://localhost:60289/style.css` | 24.3 KiB | 470 ms |

#### Image Delivery Insights

- **Next-Gen / Modern Formats Savings Potential**: 12 images could save bytes in WebP/AVIF format.
- **Properly Size Images Savings Potential**: 5 images oversized for display dimensions.

---

## Run: `02-fonts` (dist) — 2026-10-19

### MOBILE Profile

#### Core Performance Metrics

| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | 63 | 67 | 66 | **66** | 63 - 67 |
| **FCP** | 1671 ms | 1665 ms | 1661 ms | **1665 ms** | 1661 ms - 1671 ms |
| **LCP** | 19439 ms | 19435 ms | 19432 ms | **19435 ms** | 19432 ms - 19439 ms |
| **TBT** | 408 ms | 288 ms | 313 ms | **313 ms** | 288 ms - 408 ms |
| **Speed Index** | 3349 ms | 3310 ms | 3326 ms | **3326 ms** | 3310 ms - 3349 ms |

#### Diagnostics & Page Overview (Median Run)

- **CLS**: 0.0000
- **Total Byte Weight**: 3.94 MiB
- **Network Requests**: 22
- **DOM Elements**: 302
- **Unused CSS**: 0 B
- **Unused JavaScript**: 0 B

#### Bytes by Resource Type (Transfer Size)

| Document | CSS | JavaScript | Fonts | Images | Other |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20.4 KiB | 27.2 KiB | 11.7 KiB | 131.3 KiB | 3.75 MiB | 0 B |

#### Main-Thread Work Breakdown

- **Total Main-Thread Execution**: 1082 ms
- **Style & Layout**: 799 ms
- **Script Evaluation**: 28 ms
- **Rendering**: 11 ms

#### Largest Contentful Paint (LCP) Element & Breakdown

- **LCP Selector**: `main#main > section#home > div.hero-left > p.hero-desc`
- **LCP Snippet**: `<p class="hero-desc">`
- **LCP Node Label**: A student-led collective building, experimenting, and deploying ideas that chal…

**LCP Breakdown Phases**:

| Phase | % of LCP | Timing |
| :--- | :--- | :--- |
| TTFB | 2% | 454 ms |
| Load Delay | 0% | 0 ms |
| Load Time | 0% | 0 ms |
| Render Delay | 98% | 18979 ms |

#### Long Tasks (> 50 ms)

- **Total Long Tasks**: 3
| Duration | Start Time | URL / Attribution |
| :--- | :--- | :--- |
| 341 ms | 3165 ms | `http://localhost:49681/script.js` |
| 72 ms | 3506 ms | `http://localhost:49681/script.js` |
| 60 ms | 754 ms | `Unattributable` |

#### Render-Blocking Resources

| Resource URL | Total Bytes | Wasted Potential |
| :--- | :--- | :--- |
| `http://localhost:49681/style.css` | 27.2 KiB | 154 ms |

#### Image Delivery Insights

- **Next-Gen / Modern Formats Savings Potential**: 12 images could save bytes in WebP/AVIF format.
- **Properly Size Images Savings Potential**: 5 images oversized for display dimensions.

---

## Run: `03-images` (dist) — 2026-10-19

### MOBILE Profile

#### Core Performance Metrics

| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | 93 | 97 | 98 | **97** | 93 - 98 |
| **FCP** | 1657 ms | 1658 ms | 1655 ms | **1657 ms** | 1655 ms - 1658 ms |
| **LCP** | 2334 ms | 2335 ms | 2330 ms | **2334 ms** | 2330 ms - 2335 ms |
| **TBT** | 172 ms | 87 ms | 48 ms | **87 ms** | 48 ms - 172 ms |
| **Speed Index** | 4027 ms | 1658 ms | 1655 ms | **1658 ms** | 1655 ms - 4027 ms |

#### Diagnostics & Page Overview (Median Run)

- **CLS**: 0.0000
- **Total Byte Weight**: 287.1 KiB
- **Network Requests**: 14
- **DOM Elements**: 341
- **Unused CSS**: 0 B
- **Unused JavaScript**: 0 B

#### Bytes by Resource Type (Transfer Size)

| Document | CSS | JavaScript | Fonts | Images | Other |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 30.9 KiB | 27.2 KiB | 11.7 KiB | 131.3 KiB | 85.9 KiB | 0 B |

#### Main-Thread Work Breakdown

- **Total Main-Thread Execution**: 958 ms
- **Style & Layout**: 697 ms
- **Script Evaluation**: 29 ms
- **Rendering**: 27 ms

#### Largest Contentful Paint (LCP) Element & Breakdown

- **LCP Selector**: `main#main > section#home > div.hero-left > p.hero-desc`
- **LCP Snippet**: `<p class="hero-desc">`
- **LCP Node Label**: A student-led collective building, experimenting, and deploying ideas that chal…

**LCP Breakdown Phases**:

| Phase | % of LCP | Timing |
| :--- | :--- | :--- |
| TTFB | 19% | 453 ms |
| Load Delay | 0% | 0 ms |
| Load Time | 0% | 0 ms |
| Render Delay | 81% | 1882 ms |

#### Long Tasks (> 50 ms)

- **Total Long Tasks**: 3
| Duration | Start Time | URL / Attribution |
| :--- | :--- | :--- |
| 264 ms | 1508 ms | `http://localhost:56090/script.js` |
| 73 ms | 1772 ms | `http://localhost:56090/script.js` |
| 57 ms | 753 ms | `Unattributable` |

#### Render-Blocking Resources

| Resource URL | Total Bytes | Wasted Potential |
| :--- | :--- | :--- |
| `http://localhost:56090/style.css` | 27.2 KiB | 153 ms |

#### Image Delivery Insights

*No major image delivery optimizations flagged*

---


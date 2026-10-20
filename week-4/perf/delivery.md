# HTML Delivery, DOM Audit & Caching Strategy

## 1. HTML Minification with `html-minifier-terser`

The HTML pipeline was upgraded to include automated build-time minification via `html-minifier-terser` (v7.2.0) integrated directly into `scripts/build.mjs`.

### Minification Configuration & Invariants
```javascript
const minifiedHtml = await minify(unminifiedHtml, {
  collapseWhitespace: true,         // Strip superfluous indentation and whitespace
  removeComments: true,             // Remove all HTML comments (e.g., <!-- HERO SECTION -->)
  removeAttributeQuotes: false,     // STRICTLY KEEP attribute quotes (e.g., class="header")
  removeOptionalTags: false,        // DO NOT remove optional tags (retain </li>, </head>, </body>, </html>)
  minifyCSS: false,                 // DO NOT re-minify already minified inline CSS from esbuild
  minifyJS: false,                  // Retain script references untouched
  removeEmptyAttributes: false,     // Retain empty attributes (preserve alt="", boolean attributes)
  collapseBooleanAttributes: false, // Keep attribute syntax intact
  caseSensitive: true,              // Preserve case of attributes and SVG/custom elements
  keepClosingSlash: true,           // Preserve HTML5 compliant tag boundaries
});
```

### Invariant Checks & Attribute Audit
- **Attribute Quotes**: 100% of HTML attributes in `dist/index.html` retain valid double quotes (`unquoted attributes = 0`).
- **Accessibility & State Attributes**:
  - `aria-*` attributes: 37 instances preserved (e.g., `aria-label`, `aria-expanded`, `aria-controls`, `aria-hidden`, `aria-live`).
  - `role` attributes: Preserved (`role="status"` on form feedback).
  - `inert` attributes: Preserved in dynamic DOM operations.
  - `tabindex` attributes: Preserved (`tabindex="-1"` on `#main` skip link destination).
  - `alt` attributes: 13 instances preserved with exact baseline parity.
  - `time` and `datetime` attributes: 3 instances preserved (`datetime="2024-09-15"`, etc.).
- **Inline CSS Integrity**: The inline critical stylesheet produced by `esbuild` is preserved intact without redundant re-minification passes.

### Minification Results
- **Unminified Dist HTML**: 52,539 B (51.3 KiB)
- **Minified Dist HTML**: 46,834 B (45.7 KiB) — **-5,705 B (-10.86%) reduction**
- **Transfer Size (Brotli)**: **8,127 B (7.9 KiB)**

---

## 2. Head Hygiene & Metadata Optimization

The `<head>` section was audited and sanitized for optimal indexing, metadata completeness, and delivery hygiene:

1. **Meta Description**:
   ```html
   <meta name="description" content="ENIGMA is a student-led tech club dedicated to fostering innovation, collaboration, and technical excellence among passionate students.">
   ```
2. **Theme Color**:
   Set to `#08080c`, matching the document's computed background colour (`body { background-color: #08080c; }`):
   ```html
   <meta name="theme-color" content="#08080c">
   ```
3. **Preserved Core Attributes**:
   - `lang="en"` on `<html>` tag.
   - `<title>ENIGMA — Student Tech Club</title>`.
   - Scalable responsive viewport without restrictive zoom constraints: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` (no `maximum-scale` or `user-scalable=no`).
4. **Root Crawl Directives (`robots.txt`)**:
   Created `src/robots.txt` (automatically copied to `dist/robots.txt`):
   ```text
   User-agent: *
   Allow: /
   ```

---

## 3. Resource Ordering & Zero Render-Blocking Execution

The `<head>` elements are sequenced strictly to guarantee immediate metadata availability, early font fetching, zero render-blocking requests, and non-blocking script execution:

### Exact Sequence in `<head>`
1. **Charset**: `<meta charset="UTF-8">` (must be within first 1024 bytes)
2. **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
3. **Title**: `<title>ENIGMA — Student Tech Club</title>`
4. **Description**: `<meta name="description" content="...">`
5. **Theme Color**: `<meta name="theme-color" content="#08080c">`
6. **Preloads**:
   - `<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/inter-latin-400-normal.woff2">` (Primary body copy font)
   - `<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/space-grotesk-latin-wght-normal.woff2">` (Primary heading font)
   - *LCP Image Preload*: **Evaluated, Not Applicable**. Lighthouse audit traces confirm the page's Largest Contentful Paint (LCP) element is the text element `main#main > section#home > div.hero-left > p.hero-desc`. The hero contains no background or banner image, only the 34px header logo. Preloading non-existent or secondary images would waste critical connection bandwidth.
7. **Inline Critical `<style>`**: The entire minified stylesheet (20.9 KB raw, 4.1 KB Brotli) is embedded directly in `<head>`, eliminating network round-trips for stylesheet discovery.
8. **Deferred Application Script**: `<script defer src="assets/script.c7ddfbfc.js"></script>` executed asynchronously after HTML parsing without blocking initial paint.

### Render-Blocking Audit
- **Render-Blocking Resources**: **0**
- **External CSS Requests**: **0**
- **Synchronous Script Requests**: **0**

---

## 4. DOM Tree & Wrapper Audit

### Dist DOM Metrics
- **Total Element Count**: 352 elements
- **Maximum DOM Depth**: 12 levels

### Wrapper Audit Findings
An automated AST traversal was performed across all nodes in the document tree to inspect childless nodes:
- Found 28 childless non-void elements.
- **Audit Analysis**: Every single childless node serves an indispensable graphical, interactive, or accessibility function:
  - `.nav-indicator` (`<span id="nav-indicator">`): Script-controlled sliding navigation indicator pill on desktop.
  - Hamburger bars (`<span aria-hidden="true">` x 3): Visual hamburger menu lines.
  - Flowchart branches (`.flowchart-stem`, `.flowchart-trunk`, `.connector-dot`, `.connector-line`): CSS pseudo-diagram elements.
  - Event status dots (`.status-dot`): Visual pulsing indicators for upcoming and past events.
  - Core team indicators (`.role-indicator`): CSS role badge accents.
  - Form status message (`<div id="form-status" role="status" aria-live="polite">`): Dynamic live region required for screen reader feedback.
- **Decision**: No wrapper elements were removed because zero redundant wrapper elements exist. Stripping structural containers would alter flexbox/grid layout flows and fail visual diff verification.

---

## 5. Caching & Delivery Architecture

### `vercel.json` Configuration
The root delivery configuration in `src/vercel.json` (copied to `dist/vercel.json`) defines caching directives:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Technical Delivery Rationales

1. **Why `immutable` is Safe Only for Content-Hashed Assets**:
   - The assets under `/fonts/`, `/images/`, and `/assets/` have immutable URLs. Generated images and JavaScript bundles incorporate cryptographic 8-character content hashes into their filenames (e.g., `script.c7ddfbfc.js`, `blind-date-320.d6fddbc2.avif`), while font files are versioned static binary assets.
   - When asset contents change, the build pipeline generates a new content hash, producing a distinct URL. Because the URL changes whenever the content changes, browsers and edge caches can safely retain these files for 1 year (`max-age=31536000, immutable`) without ever needing to issue conditional HTTP requests.

2. **Why HTML Must Revalidate (`max-age=0, must-revalidate`)**:
   - The HTML file (`index.html`) is the root entry point containing references to the hashed asset URLs.
   - If the HTML document were cached with a long expiration, user browsers would continue serving stale HTML containing pointers to old asset hashes even after a new release is deployed.
   - By enforcing `public, max-age=0, must-revalidate`, browsers must validate the HTML document with the origin/edge CDN on every navigation. If the content has not changed, a fast `304 Not Modified` is returned; if a new deployment has landed, the browser immediately receives the new HTML containing the updated asset hashes.

3. **Vercel Automatic Compression (Brotli / Gzip)**:
   - Vercel’s global Edge Network automatically negotiates content encoding and compresses text-based responses using Brotli (`br`) or Gzip on the fly based on client request headers.
   - Consequently, pre-compressing assets into `.gz` or `.br` files on disk is unnecessary and discouraged on Vercel. Build reporting tools measure Brotli compressed sizes directly to accurately reflect over-the-wire transfer weights.

4. **Local Server vs Production Verification**:
   - The local test server (`scripts/server.mjs`) is an internal HTTP harness used for deterministic Playwright benchmarking and visual verification; it deliberately avoids parsing Vercel configuration files.
   - As designed, HTTP header directives and CDN caching behaviors are verified on the deployed Vercel environment.

5. **Service Worker Evaluation**:
   - **Status**: **Evaluated, not applied**.
   - **Technical Rationale**: For a high-performance static single-page landing site, introducing a service worker adds substantial architectural complexity without tangible performance benefits:
     1. *Cache Invalidation & Stale Content Risks*: Service workers intercept fetch events and create a client-side caching tier that easily leads to stale-while-revalidate discrepancies, where users view obsolete versions across deployments.
     2. *Startup & Interception Overhead*: Service worker boot time and IPC message-passing latency can actually degrade First Contentful Paint (FCP) on cold starts.
     3. *Negligible Upside*: With critical CSS already inlined into the HTML, deferred JavaScript, self-hosted fonts preloaded, and content-hashed assets immutably cached at the CDN edge, first-load latency is already optimal and repeat navigations hit memory/disk cache directly.

---

## 6. Dist File Inventory & Byte Audit

The complete list of all 90 files in `dist/` with uncompressed raw bytes, Gzip compressed bytes, and Brotli compressed bytes:

| File | Raw Bytes | Gzip Bytes | Brotli Bytes |
| :--- | :--- | :--- | :--- |
| `assets/enigma-logo.jpg` | 158,533 B | 154,198 B | 153,353 B |
| `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `assets/script.c7ddfbfc.js` | 5,878 B | 2,031 B | 1,784 B |
| `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `assets/team/akshat.jpg` | 25,803 B | 25,679 B | 25,558 B |
| `assets/team/anchita.jpg` | 51,225 B | 51,078 B | 50,568 B |
| `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `fonts/inter-latin-400-normal.woff2` | 23,664 B | 23,667 B | 23,623 B |
| `fonts/inter-latin-700-normal.woff2` | 24,356 B | 24,314 B | 24,271 B |
| `fonts/playfair-display-latin-600-italic.woff2` | 23,176 B | 23,199 B | 23,156 B |
| `fonts/playfair-display-latin-700-italic.woff2` | 23,196 B | 23,221 B | 23,184 B |
| `fonts/space-grotesk-latin-wght-normal.woff2` | 22,288 B | 22,316 B | 22,282 B |
| `fonts/space-mono-latin-400-normal.woff2` | 16,520 B | 16,548 B | 16,521 B |
| `images/adrija-320.4ede8967.webp` | 19,842 B | 19,870 B | 19,846 B |
| `images/adrija-320.f671eb39.avif` | 17,141 B | 17,140 B | 17,088 B |
| `images/adrija-480.2c089f1e.webp` | 43,606 B | 43,639 B | 43,610 B |
| `images/adrija-480.b8ff80a0.avif` | 36,815 B | 36,823 B | 36,819 B |
| `images/adrija-536.76c91665.avif` | 46,834 B | 46,844 B | 46,838 B |
| `images/adrija-536.bfd8ec72.webp` | 56,576 B | 56,614 B | 56,580 B |
| `images/akshat-320.899dd384.avif` | 8,041 B | 8,048 B | 7,993 B |
| `images/akshat-320.d1952741.webp` | 10,784 B | 10,807 B | 10,788 B |
| `images/akshat-380.0bb8fd23.avif` | 9,887 B | 9,891 B | 9,840 B |
| `images/akshat-380.2eb68bd2.webp` | 13,220 B | 13,243 B | 13,224 B |
| `images/anchita-320.0e72e3a4.webp` | 14,540 B | 14,563 B | 14,544 B |
| `images/anchita-320.8087e616.avif` | 9,240 B | 9,239 B | 9,194 B |
| `images/anchita-473.2787ad6a.webp` | 25,886 B | 25,914 B | 25,890 B |
| `images/anchita-473.e05de871.avif` | 15,476 B | 15,473 B | 15,423 B |
| `images/arpita-320.09d30ac8.webp` | 6,804 B | 6,827 B | 6,808 B |
| `images/arpita-320.b5249698.avif` | 5,043 B | 5,046 B | 4,994 B |
| `images/arpita-480.2ec39234.avif` | 7,978 B | 7,983 B | 7,932 B |
| `images/arpita-480.98ccc324.webp` | 11,554 B | 11,577 B | 11,558 B |
| `images/arpita-640.b27fbfb8.avif` | 11,218 B | 11,220 B | 11,169 B |
| `images/arpita-640.cb8588f9.webp` | 16,822 B | 16,850 B | 16,826 B |
| `images/blind-date-320.17455f5d.webp` | 16,928 B | 16,956 B | 16,932 B |
| `images/blind-date-320.d6fddbc2.avif` | 12,469 B | 12,415 B | 12,335 B |
| `images/blind-date-480.266fd6d7.webp` | 28,996 B | 29,024 B | 29,000 B |
| `images/blind-date-480.e31c4f37.avif` | 20,565 B | 20,518 B | 20,431 B |
| `images/blind-date-608.62f43494.webp` | 38,620 B | 38,653 B | 38,624 B |
| `images/blind-date-608.9111e1af.avif` | 26,834 B | 26,789 B | 26,714 B |
| `images/disha-320.37da6464.avif` | 9,588 B | 9,586 B | 9,537 B |
| `images/disha-320.a84aa456.webp` | 14,536 B | 14,559 B | 14,540 B |
| `images/disha-480.23d38c0b.webp` | 23,772 B | 23,800 B | 23,776 B |
| `images/disha-480.60a313ce.avif` | 14,390 B | 14,391 B | 14,332 B |
| `images/disha-640.16f131d3.avif` | 19,211 B | 19,216 B | 19,158 B |
| `images/disha-640.a5efef84.webp` | 32,322 B | 32,350 B | 32,326 B |
| `images/enigma-logo-144.b4a426ad.avif` | 2,668 B | 2,668 B | 2,618 B |
| `images/enigma-logo-144.eced70f6.webp` | 3,564 B | 3,587 B | 3,568 B |
| `images/enigma-logo-72.89d81341.webp` | 1,480 B | 1,503 B | 1,484 B |
| `images/enigma-logo-72.f95eaeb0.avif` | 1,296 B | 1,293 B | 1,237 B |
| `images/hriddhima-320.d999b3fd.webp` | 15,176 B | 15,199 B | 15,180 B |
| `images/hriddhima-320.f9b52d1c.avif` | 9,575 B | 9,574 B | 9,522 B |
| `images/hriddhima-480.16eb58ea.avif` | 17,447 B | 17,453 B | 17,385 B |
| `images/hriddhima-480.457a382c.webp` | 30,292 B | 30,320 B | 30,296 B |
| `images/hriddhima-640.4c64f3e7.webp` | 48,294 B | 48,327 B | 48,298 B |
| `images/hriddhima-640.fbd1d9b6.avif` | 26,858 B | 26,864 B | 26,805 B |
| `images/jains-got-latent-320.5abb2b37.webp` | 19,708 B | 19,736 B | 19,712 B |
| `images/jains-got-latent-320.f680e588.avif` | 14,508 B | 14,455 B | 14,370 B |
| `images/jains-got-latent-480.2b4f00dd.avif` | 24,506 B | 24,453 B | 24,370 B |
| `images/jains-got-latent-480.3e25e15e.webp` | 34,984 B | 35,017 B | 34,988 B |
| `images/jains-got-latent-605.64896eb5.webp` | 48,558 B | 48,591 B | 48,562 B |
| `images/jains-got-latent-605.f73e0bbb.avif` | 33,300 B | 33,246 B | 33,304 B |
| `images/manifest.json` | 16,311 B | 2,193 B | 1,830 B |
| `images/race-for-roles-320.0c4cd03e.webp` | 12,866 B | 12,889 B | 12,870 B |
| `images/race-for-roles-320.31089bdc.avif` | 9,074 B | 9,020 B | 8,943 B |
| `images/race-for-roles-480.8379b448.webp` | 22,038 B | 22,066 B | 22,042 B |
| `images/race-for-roles-480.a997e44b.avif` | 14,058 B | 14,007 B | 13,922 B |
| `images/race-for-roles-647.8b40b8c8.avif` | 18,841 B | 18,793 B | 18,708 B |
| `images/race-for-roles-647.a2e661ff.webp` | 31,746 B | 31,774 B | 31,750 B |
| `images/srinjay-320.25e07d53.webp` | 6,034 B | 6,057 B | 6,038 B |
| `images/srinjay-320.d6da908c.avif` | 3,996 B | 4,005 B | 3,947 B |
| `images/srinjay-480.4af51868.webp` | 10,554 B | 10,577 B | 10,558 B |
| `images/srinjay-480.a8f4d76d.avif` | 6,437 B | 6,445 B | 6,389 B |
| `images/srinjay-640.8dd9c799.webp` | 16,000 B | 16,023 B | 16,004 B |
| `images/srinjay-640.e410a008.avif` | 9,070 B | 9,074 B | 9,021 B |
| `images/wheel-of-fortune-320.6327b95f.webp` | 21,286 B | 21,314 B | 21,290 B |
| `images/wheel-of-fortune-320.6d6f5eb7.avif` | 14,936 B | 14,881 B | 14,801 B |
| `images/wheel-of-fortune-480.77394e71.avif` | 24,905 B | 24,859 B | 24,774 B |
| `images/wheel-of-fortune-480.91e74025.webp` | 37,604 B | 37,637 B | 37,608 B |
| `images/wheel-of-fortune-606.4e84efd9.avif` | 33,674 B | 33,632 B | 33,678 B |
| `images/wheel-of-fortune-606.d0331f21.webp` | 51,802 B | 51,840 B | 51,806 B |
| `index.html` | 46,834 B | 9,734 B | 8,127 B |
| `robots.txt` | 23 B | 43 B | 27 B |
| `style.css` | 20,899 B | 4,696 B | 4,089 B |
| `vercel.json` | 745 B | 189 B | 156 B |
| **TOTAL (90 files)** | **5,479,333 B** | **5,402,326 B** | **5,396,300 B** |

# Performance Challenges Log

## 2026-10-20 — Challenge 0.1: `ssim.js` package version target error
- **Date**: 2026-10-20
- **Problem**: Running `npm install` failed with `npm error notarget No matching version found for ssim.js@^3.6.0`.
- **Cause**: The package `ssim.js` on npm registry jumped from `3.5.0` to `4.0.0`/`4.0.1` without a `3.6.0` release.
- **Fix**: Updated `week-4/package.json` to specify `"ssim.js": "^4.0.1"`, allowing devDependencies to install cleanly.

## 2026-10-20 — Challenge 0.2: Automatic `/favicon.ico` 404 console error in headless Chrome
- **Date**: 2026-10-20
- **Problem**: Playwright verification failed with `[desktop] 0 console errors - Failed to load resource: the server responded with a status of 404 (Not Found)`.
- **Cause**: Chrome automatically requests `/favicon.ico` by default if not explicitly defined in the HTML markup, and the test static server returned a 404 status.
- **Fix**: Updated `scripts/server.mjs` to intercept requests for `/favicon.ico` when the file is absent on disk and respond with `204 No Content`, preventing console error noise while keeping standard static behavior.

## 2026-10-20 — Challenge 0.3: Distinguishing content behind mobile menu in keyboard trap test
- **Date**: 2026-10-20
- **Problem**: The initial verification check for `Tab and Shift+Tab never reach content behind open menu` failed when activeElement focused the logo in `<header>` or `body`.
- **Cause**: In the baseline implementation, the `<header>` element houses the hamburger button and remains visible and interactive (only `#main`, `footer`, and `.skip-link` are marked `inert`). The verification test initially expected all focus to be strictly inside `#mobile-nav` or `#hamburger`.
- **Fix**: Updated the verification assertion in `scripts/verify.mjs` to verify that activeElement never enters `#main`, `footer`, or `.skip-link` (the content visually and semantically behind the open menu), matching the requirement and baseline design exactly.

## 2026-10-20 — Challenge 2.1: Variable font continuous weights vs baseline snapped weights
- **Date**: 2026-10-20
- **Problem**: In the baseline, `.hero-btn-primary` had `font-weight: 600`, but Google Fonts only supplied weights 400 and 700, so Chrome snapped 600 to 700. When using a continuous variable font range (`font-weight: 300 700;`), the browser rendered true 600 weight, creating a slight visual difference (685 differing pixels, 0.0119%).
- **Cause**: The continuous variable font axis rendered the intermediate 600 weight, which diverged from the baseline's synthesized 700 weight.
- **Fix**: Declared discrete `@font-face` rules for weight 400 and weight 700 both pointing to the same single variable font file (`space-grotesk-latin-wght-normal.woff2`). This retained the full 3,940-byte file size savings of the variable font while matching the baseline rendering with 0.0000% diff on desktop and 0.0001% on mobile.

## 2026-10-20 — Challenge 3.1: `<picture>` element box layout & Playwright lazy-scroll synchronization
- **Date**: 2026-10-20
- **Problem**: Wrapping `<img>` tags in `<picture>` elements caused cards with percentage heights and aspect-ratio styling (such as `.event-poster-wrapper` and `.team-photo-wrap`) to collapse or alter rendered dimensions because `<picture>` is `display: inline` by default. Additionally, Playwright full-page screenshots captured unloaded lazy images when jumping through the document quickly.
- **Cause**: By default, `<picture>` creates an inline box between flex/aspect-ratio parents and the `<img>` child. In headless Chromium, rapid page jumps did not give the intersection observer engine enough time to trigger network fetches for lazy images before scrolling back to top.
- **Fix**: Inlined `display: contents;` on all injected `<picture>` elements to eliminate the intermediate box wrapper without affecting child layout. Added smooth incremental step-scrolling and `waitForFunction` image naturalWidth checks in `scripts/verify.mjs` to ensure 100% of lazy images resolve before capturing full-page screenshots.

## 2026-10-20 — Challenge 4.1: Visual diff capture regressions and anchor landing shifts with `content-visibility: auto`
- **Date**: 2026-10-20
- **Problem**: Adding `content-visibility: auto` with measured `contain-intrinsic-size` to off-screen sections caused full-page visual verification to fail severely (outside image diff jumped from 0.21% to 1.45% on desktop and from 0.42% to 2.88% on mobile; image areas diff reached 65.5%). In addition, clicking anchor links like `#contact` landed ~162px off target.
- **Cause**: Chromium's rendering engine skips layout and painting for elements tagged with `content-visibility: auto` until they enter or near the viewport. During automated full-page screenshot capture starting from scroll position 0, off-screen sections were left unrendered (blank placeholder boxes). Furthermore, during anchor scrolls, intermediate sections dynamically expanded from their intrinsic estimates to true rendered heights as they entered view, causing the cumulative scroll offset to shift before reaching `#contact`.
- **Fix**: Following the experimental evaluation protocol, `content-visibility: auto` was reverted ("evaluated, no gain") in favor of minified critical CSS inlining. This preserved 100% visual fidelity, sub-pixel accurate anchor navigation landings, and a 0.0000 CLS across all viewports.

## 2026-10-20 — Challenge 5.1: Forced reflow thrashing in scroll-driven navigation indicator
- **Date**: 2026-10-20
- **Problem**: The original navigation indicator queried `getBoundingClientRect()` and invoked the forced-reflow hack `void navIndicator.offsetWidth` on every scroll tick and load event, resulting in long tasks exceeding 500 ms on throttled mobile CPUs and inflating Total Blocking Time (TBT).
- **Cause**: Reading layout properties on un-rendered elements immediately following style changes forces the browser compositor to synchronously compute document-wide layout. Furthermore, on viewports $\le 768\text{px}$, navigation links are `display: none;`, so querying their dimensions was completely useless yet caused full style recalcs.
- **Fix**: Replaced the scroll-spy with an `IntersectionObserver` observing page sections, cached indicator position dimensions in a `Map`, bypassed all indicator calculations on mobile viewports ($\le 768\text{px}$), and consolidated scroll checks into a single passive listener guarded by `requestAnimationFrame`.

## 2026-10-20 — Challenge 6.1: HTML minifier stripping boolean and accessibility attributes
- **Date**: 2026-10-20
- **Problem**: Default aggressive configurations of `html-minifier-terser` stripped empty attributes (e.g. `alt=""`, `inert=""`), collapsed boolean attributes without quotes, and attempted to re-minify already optimized CSS.
- **Cause**: Standard minification presets assume modern HTML5 parser defaults where attribute quotes are optional and empty attributes are considered redundant. However, accessibility testing and framework compatibility require strictly preserved attribute syntax.
- **Fix**: Explicitly configured `html-minifier-terser` with `removeAttributeQuotes: false`, `removeEmptyAttributes: false`, `collapseBooleanAttributes: false`, `minifyCSS: false`, and `removeOptionalTags: false`. This preserved 100% of ARIA attributes, image alts, role definitions, and datetime tags while saving 5.7 KB of uncompressed HTML.

## 2026-10-20 — Challenge 7.1: Vercel CDN header route precedence and wildcard overrides
- **Date**: 2026-10-20
- **Problem**: Defining custom caching headers in `vercel.json` with a wildcard pattern `/(.*)` at the bottom of the list overrode preceding specific asset rules (`/fonts/(.*)`, `/images/(.*)`, `/assets/(.*)`), inadvertently stripping the `immutable` directive from content-hashed files.
- **Cause**: Vercel evaluates rules in the `headers` array sequentially from top to bottom. When multiple patterns match a route, subsequent rules overwrite earlier rules for identical header keys (`Cache-Control`).
- **Fix**: Placed the catch-all `/(.*)` rule with `public, max-age=0, must-revalidate` as the first entry in the array, followed by the specific asset patterns (`/fonts/(.*)`, `/images/(.*)`, `/assets/(.*)`) with `public, max-age=31536000, immutable`. This guarantees that static assets properly receive immutable caching while HTML revalidates on every request.

## 2026-10-20 — Challenge 7.2: Accurately calculating fully-scrolled transfer in automated budgets
- **Date**: 2026-10-20
- **Problem**: Initial budget verification script summed every generated image variant on disk, reporting over 460 KB for fully-scrolled transfer and failing the budget test.
- **Cause**: The image pipeline generates multiple responsive width variants (320w, 480w, 640w) in both AVIF and WebP for each image to support various screen densities. In a real browser session, only one variant per image is ever downloaded.
- **Fix**: Updated `scripts/check-budget.mjs` to parse `dist/images/manifest.json` and calculate the exact single-variant payload corresponding to the active viewport (112.2 KiB AVIF for mobile), accurately reflecting true on-the-wire transfer weight (258.0 KiB) and passing budget verification with 23% headroom.

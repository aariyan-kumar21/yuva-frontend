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
## 2026-10-20 — Challenge 4.1: Visual diff capture regressions and anchor landing shifts with `content-visibility: auto`
- **Date**: 2026-10-20
- **Problem**: Adding `content-visibility: auto` with measured `contain-intrinsic-size` to off-screen sections caused full-page visual verification to fail severely (outside image diff jumped from 0.21% to 1.45% on desktop and from 0.42% to 2.88% on mobile; image areas diff reached 65.5%). In addition, clicking anchor links like `#contact` landed ~162px off target.
- **Cause**: Chromium's rendering engine skips layout and painting for elements tagged with `content-visibility: auto` until they enter or near the viewport. During automated full-page screenshot capture starting from scroll position 0, off-screen sections were left unrendered (blank placeholder boxes). Furthermore, during anchor scrolls, intermediate sections dynamically expanded from their intrinsic estimates to true rendered heights as they entered view, causing the cumulative scroll offset to shift before reaching `#contact`.
- **Fix**: Following the experimental evaluation protocol, `content-visibility: auto` was reverted ("evaluated, no gain") in favor of minified critical CSS inlining. This preserved 100% visual fidelity, sub-pixel accurate anchor navigation landings, and a 0.0000 CLS across all viewports.


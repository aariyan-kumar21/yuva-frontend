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

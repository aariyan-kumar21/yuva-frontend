# Font Performance and Self-Hosting Audit

## 1. Initial Baseline Font Audit (via Playwright CDP `CSS.getPlatformFontsForNode`)

The baseline site requested the Google Fonts stylesheet:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap" rel="stylesheet">
```

Using Chrome DevTools Protocol (`CSS.getPlatformFontsForNode`), the fonts actually used across all text nodes were audited at both desktop (1440x900) and mobile (390x844, closed and open menu):

### Platform Fonts Rendered per Viewport

| Font Family | PostScript / File Name | Style & Weight | Desktop Glyphs | Mobile (Closed) | Mobile (Open Menu) | Purpose / Elements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Inter** | `Inter` | Regular 400 | 5,233 | 5,161 | 5,161 | Body text, descriptions, paragraph copy, form labels |
| **Inter** | `Inter-Bold` | Bold 700 | 420 | 420 | 420 | Event meta, badges, emphasized inline labels |
| **Space Grotesk** | `Space-Grotesk-Light` | Regular 400 | 497 | 593 | 593 | Flowchart cards, subheadings, nav items |
| **Space Grotesk** | `Space-Grotesk-Light-Bold` | Bold 700 | 769 | 769 | 769 | Hero h1, section titles, card headings, buttons |
| **Space Mono** | `SpaceMono-Regular` | Regular 400 | 546 | 546 | 546 | Section numbers, badges, mission tags, team roles |
| **Playfair Display** | `Playfair-Display-SemiBold-Italic` | Italic 600 | 18 | 18 | 18 | Event title prefixes (`the` in event cards) |
| **Playfair Display** | `Playfair-Display-Bold-Italic` | Italic 700 | 177 | 177 | 177 | Event card titles |

### Unused Faces Requested by Baseline Google Fonts
The baseline Google Fonts request included several faces that were never rendered:
- `Inter:ital,wght@1,400` (Italic 400) — **0 glyphs used**
- `Inter:ital,wght@1,700` (Italic 700) — **0 glyphs used**
- `Playfair Display:ital,wght@1,800` (Italic 800) — **0 glyphs used**

### Non-Latin Characters on Page
Every character rendered across the DOM was inspected for characters outside Google's standard `latin` subset (`U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`):
- `—` (`U+2014`, em dash in `<title>`) — Included in `U+2000-206F`
- `•` (`U+2022`, bullet separator in events) — Included in `U+2000-206F`
- `©` (`U+00A9`, copyright symbol in footer) — Included in `U+0000-00FF`
- **Result**: All page characters reside within the standard `latin` subset. No non-latin characters require fallback fonts.

---

## 2. Format Selection Measurement: Static vs Variable (@fontsource)

Measurements were taken directly from `@fontsource` and `@fontsource-variable` packages for the used weights and styles:

### Comparison Table

| Font Family | Used Weights & Styles | Option (a): Static WOFF2 Files | Option (b): Variable WOFF2 | Winner / Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Inter** | 400 normal, 700 normal | `inter-latin-400-normal.woff2` (23,664 B)<br>`inter-latin-700-normal.woff2` (24,356 B)<br>**Total: 48,020 B** (2 files) | `inter-latin-wght-normal.woff2`<br>**Total: 48,256 B** (1 file) | **Static (Option a)**<br>Saves 236 bytes; exact weight rendering |
| **Space Grotesk** | 400 normal, 700 normal | `space-grotesk-latin-400-normal.woff2` (13,388 B)<br>`space-grotesk-latin-700-normal.woff2` (12,840 B)<br>**Total: 26,228 B** (2 files) | `space-grotesk-latin-wght-normal.woff2`<br>**Total: 22,288 B** (1 file) | **Variable (Option b)**<br>Saves 3,940 bytes (15.0% reduction) + 1 fewer request |
| **Space Mono** | 400 normal | `space-mono-latin-400-normal.woff2`<br>**Total: 16,520 B** (1 file) | N/A (single weight used) | **Static** (16,520 B) |
| **Playfair Display** | 600 italic, 700 italic | `playfair-display-latin-600-italic.woff2` (23,176 B)<br>`playfair-display-latin-700-italic.woff2` (23,196 B)<br>**Total: 46,372 B** (2 files) | N/A | **Static** (46,372 B) |

---

## 3. Self-Hosted Font Inventory in `src/fonts/`

| Filename | Family | Weight / Style | File Size (Bytes) | Preloaded |
| :--- | :--- | :--- | :--- | :--- |
| `inter-latin-400-normal.woff2` | Inter | 400 Normal | 23,664 B (23.1 KiB) | **Yes** (body font) |
| `space-grotesk-latin-wght-normal.woff2` | Space Grotesk | 400 & 700 Normal | 22,288 B (21.8 KiB) | **Yes** (h1 font) |
| `inter-latin-700-normal.woff2` | Inter | 700 Normal | 24,356 B (23.8 KiB) | No |
| `space-mono-latin-400-normal.woff2` | Space Mono | 400 Normal | 16,520 B (16.1 KiB) | No |
| `playfair-display-latin-600-italic.woff2` | Playfair Display | 600 Italic | 23,176 B (22.6 KiB) | No |
| `playfair-display-latin-700-italic.woff2` | Playfair Display | 700 Italic | 23,196 B (22.7 KiB) | No |
| **Total Font Assets** | — | — | **133,200 B (130.1 KiB)** | 2 files preloaded |

---

## 4. Key Performance Gains

1. **Third-Party Requests Eliminated**: Zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
2. **Network Chain Flatted**: Removed a 3-hop blocking network dependency (HTML -> Google CSS -> gstatic WOFF2).
3. **Preload First-Paint Optimization**: `fonts/inter-latin-400-normal.woff2` and `fonts/space-grotesk-latin-wght-normal.woff2` are initiated immediately during HTML parsing.
4. **Visual Fidelity**: `document.fonts.check()` returns `true` for all 7 faces. Pixelmatch full-page visual diff is 0.000% on desktop and 0.000% on mobile.

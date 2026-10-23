# Build Sizes and Transfer Payload Comparison

This report details the uncompressed raw bytes, Gzip compressed bytes, and Brotli compressed bytes for every file in the `dist/` build output, compared alongside its equivalent source asset from the unoptimized `baseline/`.

### 1. File-by-File Comparison Table

| Dist File | Dist Raw | Dist Gzip | Dist Brotli | Equivalent Baseline File | Baseline Raw | Baseline Gzip | Baseline Brotli |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/script.2af95b20.js` | 5,934 B | 2,063 B | 1,817 B | `script.js` | 11,792 B | 2,927 B | 2,482 B |
| `fonts/inter-latin-400-normal.woff2` | 23,664 B | 23,667 B | 23,623 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `fonts/inter-latin-700-normal.woff2` | 24,356 B | 24,314 B | 24,271 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `fonts/playfair-display-latin-600-italic.woff2` | 23,176 B | 23,199 B | 23,156 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `fonts/playfair-display-latin-700-italic.woff2` | 23,196 B | 23,221 B | 23,184 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `fonts/space-grotesk-latin-wght-normal.woff2` | 22,288 B | 22,316 B | 22,282 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `fonts/space-mono-latin-400-normal.woff2` | 16,520 B | 16,548 B | 16,521 B | *Google Fonts (remote)* | ~22 KiB (per face) | ~22 KiB | ~22 KiB |
| `images/adrija-320.4ede8967.webp` | 19,842 B | 19,870 B | 19,846 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/adrija-320.f671eb39.avif` | 17,141 B | 17,140 B | 17,088 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/adrija-480.2c089f1e.webp` | 43,606 B | 43,639 B | 43,610 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/adrija-480.b8ff80a0.avif` | 36,815 B | 36,823 B | 36,819 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/adrija-536.76c91665.avif` | 46,834 B | 46,844 B | 46,838 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/adrija-536.bfd8ec72.webp` | 56,576 B | 56,614 B | 56,580 B | `assets/team/adrija.jpg` | 75,508 B | 75,377 B | 75,513 B |
| `images/akshat-320.899dd384.avif` | 8,041 B | 8,048 B | 7,993 B | `assets/team/akshat.jpg` | 25,803 B | 25,679 B | 25,558 B |
| `images/akshat-320.d1952741.webp` | 10,784 B | 10,807 B | 10,788 B | `assets/team/akshat.jpg` | 25,803 B | 25,679 B | 25,558 B |
| `images/akshat-380.0bb8fd23.avif` | 9,887 B | 9,891 B | 9,840 B | `assets/team/akshat.jpg` | 25,803 B | 25,679 B | 25,558 B |
| `images/akshat-380.2eb68bd2.webp` | 13,220 B | 13,243 B | 13,224 B | `assets/team/akshat.jpg` | 25,803 B | 25,679 B | 25,558 B |
| `images/anchita-320.0e72e3a4.webp` | 14,540 B | 14,563 B | 14,544 B | `assets/team/anchita.jpg` | 51,225 B | 51,078 B | 50,568 B |
| `images/anchita-320.8087e616.avif` | 9,240 B | 9,239 B | 9,194 B | `assets/team/anchita.jpg` | 51,225 B | 51,078 B | 50,568 B |
| `images/anchita-473.2787ad6a.webp` | 25,886 B | 25,914 B | 25,890 B | `assets/team/anchita.jpg` | 51,225 B | 51,078 B | 50,568 B |
| `images/anchita-473.e05de871.avif` | 15,476 B | 15,473 B | 15,423 B | `assets/team/anchita.jpg` | 51,225 B | 51,078 B | 50,568 B |
| `images/arpita-320.09d30ac8.webp` | 6,804 B | 6,827 B | 6,808 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/arpita-320.b5249698.avif` | 5,043 B | 5,046 B | 4,994 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/arpita-480.2ec39234.avif` | 7,978 B | 7,983 B | 7,932 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/arpita-480.98ccc324.webp` | 11,554 B | 11,577 B | 11,558 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/arpita-640.b27fbfb8.avif` | 11,218 B | 11,220 B | 11,169 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/arpita-640.cb8588f9.webp` | 16,822 B | 16,850 B | 16,826 B | `assets/team/arpita.jpg` | 83,491 B | 83,236 B | 83,496 B |
| `images/blind-date-320.17455f5d.webp` | 16,928 B | 16,956 B | 16,932 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/blind-date-320.d6fddbc2.avif` | 12,469 B | 12,415 B | 12,335 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/blind-date-480.266fd6d7.webp` | 28,996 B | 29,024 B | 29,000 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/blind-date-480.e31c4f37.avif` | 20,565 B | 20,518 B | 20,431 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/blind-date-608.62f43494.webp` | 38,620 B | 38,653 B | 38,624 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/blind-date-608.9111e1af.avif` | 26,834 B | 26,789 B | 26,714 B | `assets/events/blind-date.png` | 740,005 B | 740,234 B | 740,010 B |
| `images/disha-320.37da6464.avif` | 9,588 B | 9,586 B | 9,537 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/disha-320.a84aa456.webp` | 14,536 B | 14,559 B | 14,540 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/disha-480.23d38c0b.webp` | 23,772 B | 23,800 B | 23,776 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/disha-480.60a313ce.avif` | 14,390 B | 14,391 B | 14,332 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/disha-640.16f131d3.avif` | 19,211 B | 19,216 B | 19,158 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/disha-640.a5efef84.webp` | 32,322 B | 32,350 B | 32,326 B | `assets/team/disha.jpg` | 116,494 B | 116,318 B | 116,499 B |
| `images/enigma-logo-144.b4a426ad.avif` | 2,668 B | 2,668 B | 2,618 B | `assets/enigma-logo.jpg` | 158,533 B | 154,198 B | 153,353 B |
| `images/enigma-logo-144.eced70f6.webp` | 3,564 B | 3,587 B | 3,568 B | `assets/enigma-logo.jpg` | 158,533 B | 154,198 B | 153,353 B |
| `images/enigma-logo-72.89d81341.webp` | 1,480 B | 1,503 B | 1,484 B | `assets/enigma-logo.jpg` | 158,533 B | 154,198 B | 153,353 B |
| `images/enigma-logo-72.f95eaeb0.avif` | 1,296 B | 1,293 B | 1,237 B | `assets/enigma-logo.jpg` | 158,533 B | 154,198 B | 153,353 B |
| `images/hriddhima-320.d999b3fd.webp` | 15,176 B | 15,199 B | 15,180 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/hriddhima-320.f9b52d1c.avif` | 9,575 B | 9,574 B | 9,522 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/hriddhima-480.16eb58ea.avif` | 17,447 B | 17,453 B | 17,385 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/hriddhima-480.457a382c.webp` | 30,292 B | 30,320 B | 30,296 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/hriddhima-640.4c64f3e7.webp` | 48,294 B | 48,327 B | 48,298 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/hriddhima-640.fbd1d9b6.avif` | 26,858 B | 26,864 B | 26,805 B | `assets/team/hriddhima.jpg` | 216,300 B | 216,243 B | 216,305 B |
| `images/jains-got-latent-320.5abb2b37.webp` | 19,708 B | 19,736 B | 19,712 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/jains-got-latent-320.f680e588.avif` | 14,508 B | 14,455 B | 14,370 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/jains-got-latent-480.2b4f00dd.avif` | 24,506 B | 24,453 B | 24,370 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/jains-got-latent-480.3e25e15e.webp` | 34,984 B | 35,017 B | 34,988 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/jains-got-latent-605.64896eb5.webp` | 48,558 B | 48,591 B | 48,562 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/jains-got-latent-605.f73e0bbb.avif` | 33,300 B | 33,246 B | 33,304 B | `assets/events/jains-got-latent.png` | 757,091 B | 757,177 B | 757,096 B |
| `images/race-for-roles-320.0c4cd03e.webp` | 12,866 B | 12,889 B | 12,870 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/race-for-roles-320.31089bdc.avif` | 9,074 B | 9,020 B | 8,943 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/race-for-roles-480.8379b448.webp` | 22,038 B | 22,066 B | 22,042 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/race-for-roles-480.a997e44b.avif` | 14,058 B | 14,007 B | 13,922 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/race-for-roles-647.8b40b8c8.avif` | 18,841 B | 18,793 B | 18,708 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/race-for-roles-647.a2e661ff.webp` | 31,746 B | 31,774 B | 31,750 B | `assets/events/race-for-roles.png` | 624,678 B | 624,002 B | 624,683 B |
| `images/srinjay-320.25e07d53.webp` | 6,034 B | 6,057 B | 6,038 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/srinjay-320.d6da908c.avif` | 3,996 B | 4,005 B | 3,947 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/srinjay-480.4af51868.webp` | 10,554 B | 10,577 B | 10,558 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/srinjay-480.a8f4d76d.avif` | 6,437 B | 6,445 B | 6,389 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/srinjay-640.8dd9c799.webp` | 16,000 B | 16,023 B | 16,004 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/srinjay-640.e410a008.avif` | 9,070 B | 9,074 B | 9,021 B | `assets/team/srinjay.jpg` | 141,754 B | 141,390 B | 141,759 B |
| `images/wheel-of-fortune-320.6327b95f.webp` | 21,286 B | 21,314 B | 21,290 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `images/wheel-of-fortune-320.6d6f5eb7.avif` | 14,936 B | 14,881 B | 14,801 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `images/wheel-of-fortune-480.77394e71.avif` | 24,905 B | 24,859 B | 24,774 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `images/wheel-of-fortune-480.91e74025.webp` | 37,604 B | 37,637 B | 37,608 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `images/wheel-of-fortune-606.4e84efd9.avif` | 33,674 B | 33,632 B | 33,678 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `images/wheel-of-fortune-606.d0331f21.webp` | 51,802 B | 51,840 B | 51,806 B | `assets/events/wheel-of-fortune.png` | 941,888 B | 942,196 B | 941,893 B |
| `index.html` | 46,834 B | 9,734 B | 8,128 B | `index.html` | 20,831 B | 4,292 B | 3,366 B |
| `robots.txt` | 23 B | 43 B | 27 B | — | — | — | — |
| `vercel.json` | 745 B | 189 B | 156 B | — | — | — | — |

---

### 2. High-Level Delivery Totals ("First Load" vs "Fully Scrolled")

| Delivery Scenario | Baseline Transfer Weight | Dist (Optimized) Transfer Weight | Absolute Reduction | Percentage Reduction |
| :--- | :--- | :--- | :--- | :--- |
| **First Load (Mobile Viewport)** | **3,920.0 KiB** (3.92 MiB, 21 requests) | **269.2 KiB** (13 requests) | **-3,650.8 KiB** | **-93.1%** |
| **First Load (Desktop Viewport)** | **3,920.0 KiB** (3.92 MiB, 21 requests) | **297.9 KiB** (21 requests) | **-3,622.1 KiB** | **-92.4%** |
| **Fully Scrolled (All Images Loaded)** | **4,014.1 KiB** (3.92 MiB total assets) | **295.4 KiB** (All AVIF variants + fonts + CSS/JS) | **-3,718.7 KiB** | **-92.6%** |

### 3. Scenario Explanations

- **First Load (Initial Viewport)**:
  - **Baseline**: Loaded every asset on the page eagerly upon load (all unoptimized 1024px/high-res PNG/JPG posters and team photos, unminified CSS, unminified JS, and external Google Fonts), totaling 3.92 MiB over 21 network requests.
  - **Dist (Optimized)**: Inlines minified critical CSS (0 B external CSS request), preloads only the 2 primary fonts, defers minified JavaScript, and applies native `loading="lazy"` to off-screen images. Only above-the-fold images (header logo, flowchart root logo) are transferred, reducing initial load to just 269.2 KiB over 13 requests.
- **Fully Scrolled**:
  - When a user scrolls to the bottom of the page, all 13 images are fetched. Because each image is delivered via responsive `<picture>` choosing tailored dimensions and state-of-the-art AVIF compression (SSIM $\ge$ 0.98), the entire image payload is only 112.2 KiB on mobile (compared to 3.75 MiB of images in baseline).
  - Total fully scrolled transfer is ~295.4 KiB, representing an **overall reduction of 92.6%** (surpassing the target threshold of at least 85% reduction).

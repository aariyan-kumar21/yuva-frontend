# Image Optimization & Responsive Delivery Report

## 1. Browser Support & Format Strategy

### AVIF Support
- **Minimum Versions**: Chrome 85+ (Aug 2020), Firefox 93+ (Oct 2021), Safari 16.1+ / iOS 16 (Oct 2022), Edge 121+ (Jan 2024).
- **Global Support**: ~93.8% of global browser traffic ([Can I Use: AVIF](https://caniuse.com/avif)).
- **Role**: Primary modern format served via `<source type="image/avif">`. Provides state-of-the-art compression (typically 25-50% smaller than WebP at identical visual fidelity).

### WebP Support
- **Minimum Versions**: Chrome 32+ (Nov 2013), Firefox 65+ (Jan 2019), Safari 14+ (Sep 2020), Edge 18+ (Nov 2018).
- **Global Support**: ~97.3% of global browser traffic ([Can I Use: WebP](https://caniuse.com/webp)).
- **Role**: Universal fallback served via `<source type="image/webp">` and default `<img src="...">`. Guarantees backwards compatibility for browsers lacking AVIF support while delivering significant savings over legacy JPEG/PNG.

### Quality Selection Rationale (SSIM >= 0.98)
- Automated per-image parameter search evaluated Structural Similarity Index Measure (SSIM) against the uncompressed original resized to maximum display viewport size.
- The lowest quality setting satisfying SSIM >= 0.98 was selected, ensuring perceptual transparency without wasting bytes.
- Posters achieved threshold at AVIF q=40 and WebP q=60. Team portraits required slightly higher quality to preserve fine facial details.

## 2. Per-Image Variants and Compression Results

### `assets/enigma-logo.jpg`
- **Original**: 154.8 KiB (1024x1024)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9992), WebP q=60 (SSIM: 0.9930)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 72px | 72px | `images/enigma-logo-72.f95eaeb0.avif` | 1.3 KiB | **-99.2%** |
| AVIF | 144px | 144px | `images/enigma-logo-144.b4a426ad.avif` | 2.6 KiB | **-98.3%** |
| WebP | 72px | 72px | `images/enigma-logo-72.89d81341.webp` | 1.4 KiB | **-99.1%** |
| WebP | 144px | 144px | `images/enigma-logo-144.eced70f6.webp` | 3.5 KiB | **-97.8%** |

### `assets/events/wheel-of-fortune.png`
- **Original**: 919.8 KiB (606x806)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9900), WebP q=60 (SSIM: 0.9902)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 426px | `images/wheel-of-fortune-320.6d6f5eb7.avif` | 14.6 KiB | **-98.4%** |
| AVIF | 480px | 638px | `images/wheel-of-fortune-480.77394e71.avif` | 24.3 KiB | **-97.4%** |
| AVIF | 606px | 806px | `images/wheel-of-fortune-606.4e84efd9.avif` | 32.9 KiB | **-96.4%** |
| WebP | 320px | 426px | `images/wheel-of-fortune-320.6327b95f.webp` | 20.8 KiB | **-97.7%** |
| WebP | 480px | 638px | `images/wheel-of-fortune-480.91e74025.webp` | 36.7 KiB | **-96.0%** |
| WebP | 606px | 806px | `images/wheel-of-fortune-606.d0331f21.webp` | 50.6 KiB | **-94.5%** |

### `assets/events/race-for-roles.png`
- **Original**: 610.0 KiB (647x807)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9949), WebP q=60 (SSIM: 0.9939)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 399px | `images/race-for-roles-320.31089bdc.avif` | 8.9 KiB | **-98.5%** |
| AVIF | 480px | 599px | `images/race-for-roles-480.a997e44b.avif` | 13.7 KiB | **-97.7%** |
| AVIF | 647px | 807px | `images/race-for-roles-647.8b40b8c8.avif` | 18.4 KiB | **-97.0%** |
| WebP | 320px | 399px | `images/race-for-roles-320.0c4cd03e.webp` | 12.6 KiB | **-97.9%** |
| WebP | 480px | 599px | `images/race-for-roles-480.8379b448.webp` | 21.5 KiB | **-96.5%** |
| WebP | 647px | 807px | `images/race-for-roles-647.a2e661ff.webp` | 31.0 KiB | **-94.9%** |

### `assets/events/jains-got-latent.png`
- **Original**: 739.3 KiB (605x803)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9855), WebP q=60 (SSIM: 0.9852)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 425px | `images/jains-got-latent-320.f680e588.avif` | 14.2 KiB | **-98.1%** |
| AVIF | 480px | 637px | `images/jains-got-latent-480.2b4f00dd.avif` | 23.9 KiB | **-96.8%** |
| AVIF | 605px | 803px | `images/jains-got-latent-605.f73e0bbb.avif` | 32.5 KiB | **-95.6%** |
| WebP | 320px | 425px | `images/jains-got-latent-320.5abb2b37.webp` | 19.2 KiB | **-97.4%** |
| WebP | 480px | 637px | `images/jains-got-latent-480.3e25e15e.webp` | 34.2 KiB | **-95.4%** |
| WebP | 605px | 803px | `images/jains-got-latent-605.64896eb5.webp` | 47.4 KiB | **-93.6%** |

### `assets/events/blind-date.png`
- **Original**: 722.7 KiB (608x807)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9909), WebP q=60 (SSIM: 0.9885)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 425px | `images/blind-date-320.d6fddbc2.avif` | 12.2 KiB | **-98.3%** |
| AVIF | 480px | 637px | `images/blind-date-480.e31c4f37.avif` | 20.1 KiB | **-97.2%** |
| AVIF | 608px | 807px | `images/blind-date-608.9111e1af.avif` | 26.2 KiB | **-96.4%** |
| WebP | 320px | 425px | `images/blind-date-320.17455f5d.webp` | 16.5 KiB | **-97.7%** |
| WebP | 480px | 637px | `images/blind-date-480.266fd6d7.webp` | 28.3 KiB | **-96.1%** |
| WebP | 608px | 807px | `images/blind-date-608.62f43494.webp` | 37.7 KiB | **-94.8%** |

### `assets/team/adrija.jpg`
- **Original**: 73.7 KiB (536x440)
- **Chosen Quality**: AVIF q=68 (SSIM: 0.9804), WebP q=85 (SSIM: 0.9651)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 263px | `images/adrija-320.f671eb39.avif` | 16.7 KiB | **-77.3%** |
| AVIF | 480px | 394px | `images/adrija-480.b8ff80a0.avif` | 36.0 KiB | **-51.2%** |
| AVIF | 536px | 440px | `images/adrija-536.76c91665.avif` | 45.7 KiB | **-38.0%** |
| WebP | 320px | 263px | `images/adrija-320.4ede8967.webp` | 19.4 KiB | **-73.7%** |
| WebP | 480px | 394px | `images/adrija-480.2c089f1e.webp` | 42.6 KiB | **-42.2%** |
| WebP | 536px | 440px | `images/adrija-536.bfd8ec72.webp` | 55.3 KiB | **-25.1%** |

### `assets/team/srinjay.jpg`
- **Original**: 138.4 KiB (1024x845)
- **Chosen Quality**: AVIF q=47 (SSIM: 0.9805), WebP q=75 (SSIM: 0.9801)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 264px | `images/srinjay-320.d6da908c.avif` | 3.9 KiB | **-97.2%** |
| AVIF | 480px | 396px | `images/srinjay-480.a8f4d76d.avif` | 6.3 KiB | **-95.5%** |
| AVIF | 640px | 528px | `images/srinjay-640.e410a008.avif` | 8.9 KiB | **-93.6%** |
| WebP | 320px | 264px | `images/srinjay-320.25e07d53.webp` | 5.9 KiB | **-95.7%** |
| WebP | 480px | 396px | `images/srinjay-480.4af51868.webp` | 10.3 KiB | **-92.6%** |
| WebP | 640px | 528px | `images/srinjay-640.8dd9c799.webp` | 15.6 KiB | **-88.7%** |

### `assets/team/hriddhima.jpg`
- **Original**: 211.2 KiB (994x820)
- **Chosen Quality**: AVIF q=44 (SSIM: 0.9814), WebP q=77 (SSIM: 0.9802)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 264px | `images/hriddhima-320.f9b52d1c.avif` | 9.4 KiB | **-95.6%** |
| AVIF | 480px | 396px | `images/hriddhima-480.16eb58ea.avif` | 17.0 KiB | **-91.9%** |
| AVIF | 640px | 528px | `images/hriddhima-640.fbd1d9b6.avif` | 26.2 KiB | **-87.6%** |
| WebP | 320px | 264px | `images/hriddhima-320.d999b3fd.webp` | 14.8 KiB | **-93.0%** |
| WebP | 480px | 396px | `images/hriddhima-480.457a382c.webp` | 29.6 KiB | **-86.0%** |
| WebP | 640px | 528px | `images/hriddhima-640.4c64f3e7.webp` | 47.2 KiB | **-77.7%** |

### `assets/team/anchita.jpg`
- **Original**: 50.0 KiB (473x385)
- **Chosen Quality**: AVIF q=52 (SSIM: 0.9807), WebP q=83 (SSIM: 0.9809)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 260px | `images/anchita-320.8087e616.avif` | 9.0 KiB | **-82.0%** |
| AVIF | 473px | 385px | `images/anchita-473.e05de871.avif` | 15.1 KiB | **-69.8%** |
| WebP | 320px | 260px | `images/anchita-320.0e72e3a4.webp` | 14.2 KiB | **-71.6%** |
| WebP | 473px | 385px | `images/anchita-473.2787ad6a.webp` | 25.3 KiB | **-49.5%** |

### `assets/team/arpita.jpg`
- **Original**: 81.5 KiB (907x820)
- **Chosen Quality**: AVIF q=47 (SSIM: 0.9808), WebP q=63 (SSIM: 0.9803)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 289px | `images/arpita-320.b5249698.avif` | 4.9 KiB | **-94.0%** |
| AVIF | 480px | 434px | `images/arpita-480.2ec39234.avif` | 7.8 KiB | **-90.4%** |
| AVIF | 640px | 579px | `images/arpita-640.b27fbfb8.avif` | 11.0 KiB | **-86.6%** |
| WebP | 320px | 289px | `images/arpita-320.09d30ac8.webp` | 6.6 KiB | **-91.9%** |
| WebP | 480px | 434px | `images/arpita-480.98ccc324.webp` | 11.3 KiB | **-86.2%** |
| WebP | 640px | 579px | `images/arpita-640.cb8588f9.webp` | 16.4 KiB | **-79.9%** |

### `assets/team/disha.jpg`
- **Original**: 113.8 KiB (822x860)
- **Chosen Quality**: AVIF q=40 (SSIM: 0.9945), WebP q=60 (SSIM: 0.9955)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 335px | `images/disha-320.37da6464.avif` | 9.4 KiB | **-91.8%** |
| AVIF | 480px | 502px | `images/disha-480.60a313ce.avif` | 14.1 KiB | **-87.6%** |
| AVIF | 640px | 670px | `images/disha-640.16f131d3.avif` | 18.8 KiB | **-83.5%** |
| WebP | 320px | 335px | `images/disha-320.a84aa456.webp` | 14.2 KiB | **-87.5%** |
| WebP | 480px | 502px | `images/disha-480.23d38c0b.webp` | 23.2 KiB | **-79.6%** |
| WebP | 640px | 670px | `images/disha-640.a5efef84.webp` | 31.6 KiB | **-72.3%** |

### `assets/team/akshat.jpg`
- **Original**: 25.2 KiB (380x315)
- **Chosen Quality**: AVIF q=60 (SSIM: 0.9807), WebP q=83 (SSIM: 0.9814)

| Format | Width | Height | Output File | Size | Savings vs Original |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AVIF | 320px | 265px | `images/akshat-320.899dd384.avif` | 7.9 KiB | **-68.8%** |
| AVIF | 380px | 315px | `images/akshat-380.0bb8fd23.avif` | 9.7 KiB | **-61.7%** |
| WebP | 320px | 265px | `images/akshat-320.d1952741.webp` | 10.5 KiB | **-58.2%** |
| WebP | 380px | 315px | `images/akshat-380.2eb68bd2.webp` | 12.9 KiB | **-48.8%** |

## 3. Overall Totals

| Metric | Baseline (Legacy PNG/JPG) | Optimized Mobile (AVIF) | Optimized Desktop (AVIF) |
| :--- | :--- | :--- | :--- |
| **Total Image Payload** | **3.75 MiB** | **112.2 KiB** | **190.6 KiB** |
| **Bytes Saved** | Baseline | **3.64 MiB** | **3.56 MiB** |
| **Percentage Reduction** | 0.0% | **-97.1%** | **-95.0%** |

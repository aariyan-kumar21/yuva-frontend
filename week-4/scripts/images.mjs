import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ssimPkg from 'ssim.js';
import { parse } from 'node-html-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ssimFn = ssimPkg.ssim || ssimPkg.default || ssimPkg;

const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const imagesDistDir = path.join(distDir, 'images');

fs.mkdirSync(imagesDistDir, { recursive: true });

async function findOptimalQuality(srcPath, maxDisplayWidth, format, minQ, maxQ, step = 2) {
  const refBuffer = await sharp(srcPath)
    .rotate()
    .ensureAlpha()
    .resize({ width: maxDisplayWidth })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bestQ = maxQ;
  let bestSSIM = 0;

  for (let q = minQ; q <= maxQ; q += step) {
    let instance = sharp(srcPath).rotate();
    let encodedBuf;
    if (format === 'avif') {
      encodedBuf = await instance.avif({ quality: q }).toBuffer();
    } else {
      encodedBuf = await instance.webp({ quality: q }).toBuffer();
    }

    const decoded = await sharp(encodedBuf)
      .ensureAlpha()
      .resize({ width: maxDisplayWidth })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const ssimResult = ssimFn(
      { data: refBuffer.data, width: refBuffer.info.width, height: refBuffer.info.height },
      { data: decoded.data, width: decoded.info.width, height: decoded.info.height }
    );

    const mssim = ssimResult.mssim || 0;
    if (mssim >= 0.98) {
      bestQ = q;
      bestSSIM = mssim;
      break;
    }
    if (mssim > bestSSIM) {
      bestSSIM = mssim;
      bestQ = q;
    }
  }

  return { quality: bestQ, ssim: bestSSIM };
}

export async function processImages() {
  console.log('[images] Starting responsive image optimization with Sharp & SSIM...');

  const htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
  const root = parse(htmlContent);
  const imgElements = root.querySelectorAll('img');

  const uniqueSrcs = new Set();
  imgElements.forEach((img) => {
    const s = img.getAttribute('src');
    if (s && !s.startsWith('http') && !s.startsWith('//') && !s.startsWith('data:')) {
      uniqueSrcs.add(s);
    }
  });

  const manifest = {};
  const imageReports = [];

  for (const relSrc of uniqueSrcs) {
    const srcPath = path.join(srcDir, relSrc);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[images] Source image not found: ${srcPath}`);
      continue;
    }

    const origStats = fs.statSync(srcPath);
    const meta = await sharp(srcPath).metadata();
    const basename = path.basename(relSrc, path.extname(relSrc));

    // Determine category, target widths, sizes attribute, and max displayed size
    let targetWidths = [];
    let sizes = '';
    let maxDisplayWidth = 448;
    let isLogo = false;

    if (relSrc.includes('enigma-logo')) {
      isLogo = true;
      targetWidths = [72, 144];
      maxDisplayWidth = 72;
      sizes = '34px';
    } else if (relSrc.includes('events')) {
      const candidates = [320, 480, meta.width];
      targetWidths = Array.from(new Set(candidates.filter((w) => w <= meta.width))).sort((a, b) => a - b);
      maxDisplayWidth = 448;
      sizes = '(min-width: 1101px) 306px, (min-width: 601px) 448px, 349px';
    } else if (relSrc.includes('team')) {
      const candidates = [320, 480, 640];
      const filtered = candidates.filter((w) => w <= meta.width);
      if (filtered.length === 0 || !filtered.includes(meta.width)) {
        filtered.push(meta.width);
      }
      targetWidths = Array.from(new Set(filtered)).sort((a, b) => a - b);
      maxDisplayWidth = 408;
      sizes = '(min-width: 1201px) 265px, (min-width: 641px) 408px, 310px';
    } else {
      targetWidths = [320, meta.width];
      maxDisplayWidth = Math.min(meta.width, 600);
      sizes = '100vw';
    }

    console.log(`  Processing ${relSrc} (${meta.width}x${meta.height}, ${origStats.size} B)...`);

    // Average color calculation for placeholder background
    const stats = await sharp(srcPath).stats();
    const avgRgb = stats.channels.slice(0, 3).map((c) => Math.round(c.mean));
    const avgColor = `rgb(${avgRgb[0]}, ${avgRgb[1]}, ${avgRgb[2]})`;

    // SSIM quality search
    const avifResult = await findOptimalQuality(srcPath, maxDisplayWidth, 'avif', 40, 70, 2);
    const webpResult = await findOptimalQuality(srcPath, maxDisplayWidth, 'webp', 60, 85, 2);

    console.log(`    AVIF chosen q=${avifResult.quality} (SSIM: ${avifResult.ssim.toFixed(4)})`);
    console.log(`    WebP chosen q=${webpResult.quality} (SSIM: ${webpResult.ssim.toFixed(4)})`);

    const avifVariants = [];
    const webpVariants = [];

    for (const w of targetWidths) {
      const targetHeight = Math.round(meta.height * (w / meta.width));

      // Generate AVIF
      const avifBuf = await sharp(srcPath)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .avif({ quality: avifResult.quality })
        .toBuffer();

      const avifHash = crypto.createHash('sha256').update(avifBuf).digest('hex').slice(0, 8);
      const avifFilename = `${basename}-${w}.${avifHash}.avif`;
      const avifDestPath = path.join(imagesDistDir, avifFilename);
      fs.writeFileSync(avifDestPath, avifBuf);

      avifVariants.push({
        width: w,
        height: targetHeight,
        filename: `images/${avifFilename}`,
        bytes: avifBuf.length,
      });

      // Generate WebP
      const webpBuf = await sharp(srcPath)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: webpResult.quality })
        .toBuffer();

      const webpHash = crypto.createHash('sha256').update(webpBuf).digest('hex').slice(0, 8);
      const webpFilename = `${basename}-${w}.${webpHash}.webp`;
      const webpDestPath = path.join(imagesDistDir, webpFilename);
      fs.writeFileSync(webpDestPath, webpBuf);

      webpVariants.push({
        width: w,
        height: targetHeight,
        filename: `images/${webpFilename}`,
        bytes: webpBuf.length,
      });
    }

    // Default WebP fallback is the mid-sized or full width variant
    let defaultWebp = webpVariants.find((v) => v.width === 480) || webpVariants[webpVariants.length - 1];

    manifest[relSrc] = {
      originalBytes: origStats.size,
      originalWidth: meta.width,
      originalHeight: meta.height,
      avgColor,
      sizes,
      avifQuality: avifResult.quality,
      avifSSIM: avifResult.ssim,
      webpQuality: webpResult.quality,
      webpSSIM: webpResult.ssim,
      avifVariants,
      webpVariants,
      defaultWebp,
    };

    imageReports.push({
      relSrc,
      origBytes: origStats.size,
      dimensions: `${meta.width}x${meta.height}`,
      avifQ: avifResult.quality,
      avifSSIM: avifResult.ssim,
      webpQ: webpResult.quality,
      webpSSIM: webpResult.ssim,
      avifVariants,
      webpVariants,
    });
  }

  // Save manifest
  fs.writeFileSync(path.join(imagesDistDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[images] Manifest written to dist/images/manifest.json');

  return { manifest, imageReports };
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processImages().catch((err) => {
    console.error('[images] Error:', err);
    process.exit(1);
  });
}

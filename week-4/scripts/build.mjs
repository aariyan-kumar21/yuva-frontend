import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { processImages } from './images.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

async function build() {
  console.log('[build] Starting build pipeline...');

  if (!fs.existsSync(srcDir)) {
    console.error(`[build] Error: src directory not found at ${srcDir}`);
    process.exit(1);
  }

  // 1. Remove and recreate dist directory idempotently
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 2. Copy all files from src to dist
  fs.cpSync(srcDir, distDir, { recursive: true });
  console.log('  Copied src/ to dist/');

  // 3. Process images: generate AVIF, WebP, manifest, and perf/images.md
  const { manifest } = await processImages();

  // 4. HTML transformation with node-html-parser: rewrite <img> to <picture>
  const distHtmlPath = path.join(distDir, 'index.html');
  const htmlContent = fs.readFileSync(distHtmlPath, 'utf8');
  const root = parse(htmlContent, { comment: true });

  const imgElements = root.querySelectorAll('img');
  console.log(`  Rewriting ${imgElements.length} <img> tags to responsive <picture> elements...`);

  for (const img of imgElements) {
    const rawSrc = img.getAttribute('src');
    if (!rawSrc) continue;

    const entry = manifest[rawSrc];
    if (!entry) continue;

    const avifSrcset = entry.avifVariants.map((v) => `${v.filename} ${v.width}w`).join(', ');
    const webpSrcset = entry.webpVariants.map((v) => `${v.filename} ${v.width}w`).join(', ');
    const sizes = entry.sizes;

    // Determine loading priority
    const isHeaderLogo = rawSrc.includes('enigma-logo') && img.closest('.header') !== null;
    const loading = isHeaderLogo ? 'eager' : 'lazy';
    const fetchpriority = isHeaderLogo ? 'high' : null;
    const decoding = isHeaderLogo ? null : 'async';

    // Set placeholder average color on container for lazy images
    if (loading === 'lazy') {
      const container = img.closest('.event-poster-wrapper, .team-photo-wrap, .flowchart-root-node');
      if (container) {
        const existingStyle = container.getAttribute('style') || '';
        const separator = existingStyle && !existingStyle.trim().endsWith(';') ? '; ' : (existingStyle ? ' ' : '');
        container.setAttribute(
          'style',
          `${existingStyle}${separator}--img-bg: ${entry.avgColor}; background-color: var(--img-bg);`
        );
      }
    }

    // Preserve all existing attributes
    const existingAttrs = { ...img.attributes };
    existingAttrs.src = entry.defaultWebp.filename;
    existingAttrs.srcset = webpSrcset;
    existingAttrs.sizes = sizes;
    existingAttrs.width = String(entry.defaultWebp.width);
    existingAttrs.height = String(entry.defaultWebp.height);
    existingAttrs.loading = loading;

    if (fetchpriority) {
      existingAttrs.fetchpriority = fetchpriority;
    } else {
      delete existingAttrs.fetchpriority;
    }

    if (decoding) {
      existingAttrs.decoding = decoding;
    } else {
      delete existingAttrs.decoding;
    }

    const attrStr = Object.entries(existingAttrs)
      .map(([k, v]) => `${k}="${v.replace(/"/g, '&quot;')}"`)
      .join(' ');

    const pictureHtml = `<picture>` +
      `<source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">` +
      `<source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">` +
      `<img ${attrStr}>` +
      `</picture>`;

    const pictureNode = parse(pictureHtml);
    img.replaceWith(pictureNode);
  }

  fs.writeFileSync(distHtmlPath, root.toString(), 'utf8');
  console.log('[build] Successfully transformed dist/index.html with responsive <picture> elements.');
  console.log('[build] Build completed successfully.');
}

build().catch((err) => {
  console.error('[build] Error:', err);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
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

    // Determine context-specific sizes and loading priority
    const isHeaderLogo = rawSrc.includes('enigma-logo') && img.closest('.header') !== null;
    const isFlowchartLogo = rawSrc.includes('enigma-logo') && !isHeaderLogo;

    let sizes = entry.sizes;
    if (isHeaderLogo) {
      sizes = '34px';
    } else if (isFlowchartLogo) {
      sizes = '24px';
    }

    const avifSrcset = entry.avifVariants.map((v) => `${v.filename} ${v.width}w`).join(', ');
    const webpSrcset = entry.webpVariants.map((v) => `${v.filename} ${v.width}w`).join(', ');

    const loading = isHeaderLogo ? 'eager' : 'lazy';
    const fetchpriority = isHeaderLogo ? 'high' : null;
    const decoding = isHeaderLogo ? null : 'async';

    // Set placeholder average color on container for lazy images (posters and team photos)
    if (loading === 'lazy') {
      const container = img.closest('.event-poster-wrapper, .team-photo-wrap');
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

    const pictureHtml = `<picture style="display: contents;">` +
      `<source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">` +
      `<source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">` +
      `<img ${attrStr}>` +
      `</picture>`;

    const pictureNode = parse(pictureHtml);
    img.replaceWith(pictureNode);
  }

  // 5. Minify CSS with esbuild (no browser targets, no prefix changes) and INLINE into <head>
  const srcCssPath = path.join(srcDir, 'style.css');
  const cssContent = fs.readFileSync(srcCssPath, 'utf8');
  const minifiedCss = await esbuild.transform(cssContent, {
    loader: 'css',
    minify: true,
  });

  const linkCss = root.querySelector('link[rel="stylesheet"][href="style.css"]');
  if (linkCss) {
    const styleNode = parse(`<style>${minifiedCss.code}</style>`);
    linkCss.replaceWith(styleNode);
    console.log(`  Inlined minified critical CSS (${minifiedCss.code.length} bytes) into <head>`);
  }

  // Also write minified CSS to dist/style.css
  fs.writeFileSync(path.join(distDir, 'style.css'), minifiedCss.code, 'utf8');

  // 6. Minify JS with esbuild to dist/assets/script.<hash8>.js and load with defer from <head>
  const srcJsPath = path.join(srcDir, 'script.js');
  const jsContent = fs.readFileSync(srcJsPath, 'utf8');
  const minifiedJs = await esbuild.transform(jsContent, {
    loader: 'js',
    minify: true,
    legalComments: 'none',
  });

  const hash8 = crypto.createHash('sha256').update(minifiedJs.code).digest('hex').slice(0, 8);
  const scriptFileName = `script.${hash8}.js`;
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Clean any existing hashed scripts in dist/assets
  const existingAssets = fs.readdirSync(assetsDir);
  for (const f of existingAssets) {
    if (/^script(\.[a-f0-9]+)?\.js$/.test(f)) {
      fs.unlinkSync(path.join(assetsDir, f));
    }
  }

  const distScriptPath = path.join(assetsDir, scriptFileName);
  fs.writeFileSync(distScriptPath, minifiedJs.code, 'utf8');
  console.log(`  Minified JS to dist/assets/${scriptFileName} (${minifiedJs.code.length} bytes)`);

  // Remove any old script tags (end-of-body or elsewhere)
  const oldScriptTags = root.querySelectorAll('script');
  for (const s of oldScriptTags) {
    const src = s.getAttribute('src');
    if (src && (src === 'script.js' || src.includes('script.'))) {
      s.remove();
    }
  }

  // Remove unminified dist/script.js if copied
  const unminifiedDistScript = path.join(distDir, 'script.js');
  if (fs.existsSync(unminifiedDistScript)) {
    fs.unlinkSync(unminifiedDistScript);
  }

  // Add deferred script tag into <head>
  const head = root.querySelector('head');
  if (head) {
    const scriptNode = parse(`<script defer src="assets/${scriptFileName}"></script>`);
    head.appendChild(scriptNode);
    console.log(`  Added deferred script tag to <head>: assets/${scriptFileName}`);
  }

  fs.writeFileSync(distHtmlPath, root.toString(), 'utf8');
  console.log('[build] Successfully transformed dist/index.html with inlined CSS, deferred minified JS, & responsive pictures.');
  console.log('[build] Build completed successfully.');
}

build().catch((err) => {
  console.error('[build] Error:', err);
  process.exit(1);
});

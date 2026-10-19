import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { parse } from 'node-html-parser';
import { startServer } from './server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const baselineDir = path.join(rootDir, 'baseline');
const distDir = path.join(rootDir, 'dist');
const diffDir = path.join(rootDir, 'perf', 'diff');

if (!fs.existsSync(distDir)) {
  console.error('[verify] Error: dist directory does not exist. Run "npm run build" first.');
  console.log('VERIFY FAILED');
  process.exit(1);
}

fs.mkdirSync(diffDir, { recursive: true });

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    try {
      return await chromium.launch({ headless: true });
    } catch (e) {
      throw new Error(`Failed to launch browser: ${err.message}; ${e.message}`);
    }
  }
}

async function scrollPage(page) {
  await page.evaluate(async () => {
    const scrollStep = 300;
    const scrollDelay = 40;
    while (window.scrollY + window.innerHeight < document.body.scrollHeight) {
      window.scrollBy(0, scrollStep);
      await new Promise((r) => setTimeout(r, scrollDelay));
    }
  });

  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) {
      if (!img.complete || img.naturalWidth === 0) {
        img.scrollIntoView();
        await new Promise((r) => setTimeout(r, 60));
      }
    }
  });

  await page.waitForFunction(() => {
    return Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0);
  }, { timeout: 10000 }).catch(() => {});

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  await page.waitForTimeout(200);
}

async function getImageBoundingBoxes(page) {
  return await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img, svg'));
    return images
      .map((img) => {
        const rect = img.getBoundingClientRect();
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter((b) => b.width > 0 && b.height > 0);
  });
}

function getAllCssContent(dir) {
  let cssText = '';
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.css')) {
        cssText += '\n' + fs.readFileSync(fullPath, 'utf8');
      } else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(fullPath, 'utf8');
        const root = parse(html);
        root.querySelectorAll('style').forEach((st) => {
          cssText += '\n' + st.text;
        });
        root.querySelectorAll('[style]').forEach((el) => {
          cssText += '\n' + el.getAttribute('style');
        });
      }
    }
  }
  walk(dir);
  return cssText;
}

async function run() {
  console.log('[verify] Starting verification suite...');
  let allPassed = true;

  function reportItem(name, passed, detail = '') {
    if (!passed) allPassed = false;
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${name}${detail ? ` - ${detail}` : ''}`);
  }

  // Check static files and CSS rules first
  console.log('\n--- Checking Static Constraints & Baseline Equivalence ---');

  const baselineHtml = fs.readFileSync(path.join(baselineDir, 'index.html'), 'utf8');
  const distHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const baselineRoot = parse(baselineHtml);
  const distRoot = parse(distHtml);

  // Outline: none check
  const distCss = getAllCssContent(distDir);
  const hasOutlineNone = /outline\s*:\s*(none|0(\s|;|$))/i.test(distCss);
  reportItem('No "outline: none" anywhere in final CSS', !hasOutlineNone);

  // prefers-reduced-motion block exists
  const hasReducedMotion = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(distCss);
  reportItem('prefers-reduced-motion media query exists', hasReducedMotion);

  // 3 form fields have labels
  const formFieldIds = ['contact-name', 'contact-email', 'contact-message'];
  const allLabelsExist = formFieldIds.every((id) => {
    const label = distRoot.querySelector(`label[for="${id}"]`);
    return label !== null;
  });
  reportItem('3 form fields have <label>s', allLabelsExist);

  // role="status" form message exists
  const roleStatusExists = distRoot.querySelector('[role="status"]') !== null;
  reportItem('role="status" form message exists', roleStatusExists);

  // 3 <time datetime> elements exist
  const timeElements = distRoot.querySelectorAll('time[datetime]');
  reportItem('3 <time datetime> elements exist', timeElements.length === 3, `Found ${timeElements.length}`);

  // Image alt texts match baseline in order
  const baselineImgs = baselineRoot.querySelectorAll('img');
  const distImgs = distRoot.querySelectorAll('img');
  let altMatches = baselineImgs.length === distImgs.length;
  if (altMatches) {
    for (let i = 0; i < baselineImgs.length; i++) {
      const bAlt = baselineImgs[i].getAttribute('alt') || '';
      const dAlt = distImgs[i].getAttribute('alt') || '';
      if (bAlt !== dAlt) {
        altMatches = false;
        break;
      }
    }
  }
  reportItem('Every <img> keeps the same alt text as baseline (by order)', altMatches);

  // The three <nav> keep their aria-labels
  const baselineNavs = baselineRoot.querySelectorAll('nav');
  const distNavs = distRoot.querySelectorAll('nav');
  let navsMatch = baselineNavs.length === distNavs.length;
  if (navsMatch) {
    for (let i = 0; i < baselineNavs.length; i++) {
      const bLabel = baselineNavs[i].getAttribute('aria-label') || '';
      const dLabel = distNavs[i].getAttribute('aria-label') || '';
      if (bLabel !== dLabel) {
        navsMatch = false;
        break;
      }
    }
  }
  reportItem('The three <nav> elements keep their aria-labels', navsMatch);

  // Start local servers
  const distServer = await startServer(distDir);
  const baselineServer = await startServer(baselineDir);
  const browser = await launchBrowser();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  try {
    for (const vp of viewports) {
      console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

      // 1. Check Dist Page Health & Page Behaviour
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: 'reduce',
      });

      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => pageErrors.push(err.message));
      page.on('requestfailed', (req) => failedRequests.push(req.url()));
      page.on('response', (res) => {
        // Report 4xx and 5xx responses as failed requests
        if (res.status() >= 400) {
          failedRequests.push(`${res.url()} (${res.status()})`);
        }
      });

      const googleFontRequests = [];
      page.on('request', (req) => {
        if (req.url().includes('fonts.googleapis.com') || req.url().includes('fonts.gstatic.com')) {
          googleFontRequests.push(req.url());
        }
      });

      await page.goto(distServer.url, { waitUntil: 'load' });
      await scrollPage(page);

      // Verify zero third-party font requests
      reportItem(
        `[${vp.name}] Zero requests to fonts.googleapis.com or fonts.gstatic.com`,
        googleFontRequests.length === 0,
        googleFontRequests.join('; ')
      );

      // Verify document.fonts.check() is true for every used face
      const fontChecks = await page.evaluate(async () => {
        if (document.fonts) await document.fonts.ready;
        return {
          'Inter 400': document.fonts.check('400 16px Inter'),
          'Inter 700': document.fonts.check('700 16px Inter'),
          'Space Grotesk 400': document.fonts.check('400 16px "Space Grotesk"'),
          'Space Grotesk 700': document.fonts.check('700 16px "Space Grotesk"'),
          'Space Mono 400': document.fonts.check('400 16px "Space Mono"'),
          'Playfair Display 600 Italic': document.fonts.check('italic 600 16px "Playfair Display"'),
          'Playfair Display 700 Italic': document.fonts.check('italic 700 16px "Playfair Display"'),
        };
      });
      const allFontsReady = Object.values(fontChecks).every(Boolean);
      const failedFontList = Object.entries(fontChecks).filter(([, v]) => !v).map(([k]) => k).join(', ');
      reportItem(
        `[${vp.name}] document.fonts.check() is true for every used face`,
        allFontsReady,
        failedFontList ? `Missing: ${failedFontList}` : ''
      );

      // Check broken images
      const brokenImages = await page.evaluate(() => {
        return Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.src);
      });

      // Check horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth
        );
      });

      reportItem(`[${vp.name}] 0 console errors`, consoleErrors.length === 0, consoleErrors.join('; '));
      reportItem(`[${vp.name}] 0 page errors`, pageErrors.length === 0, pageErrors.join('; '));
      reportItem(`[${vp.name}] 0 failed requests`, failedRequests.length === 0, failedRequests.join('; '));
      reportItem(`[${vp.name}] 0 broken images`, brokenImages.length === 0, brokenImages.join('; '));
      reportItem(`[${vp.name}] No horizontal overflow`, !hasHorizontalOverflow);

      // Accessibility interactive tests
      // Reload page clean for keyboard tests
      await page.goto(distServer.url, { waitUntil: 'load' });
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));

      // 1. Skip link is first Tab stop and becomes visible
      await page.keyboard.press('Tab');
      const skipLinkCheck = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return { isSkip: false, isVisible: false };
        const isSkip = el.classList.contains('skip-link') || el.getAttribute('href') === '#main';
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.clip !== 'rect(0px, 0px, 0px, 0px)';
        return { isSkip, isVisible };
      });
      reportItem(
        `[${vp.name}] Skip link is first Tab stop and becomes visible`,
        skipLinkCheck.isSkip && skipLinkCheck.isVisible
      );

      // 2. Tab stops have visible outlines and none inside hidden mobile menu
      const visitedStops = new Set();
      let outlineOk = true;
      let outlineDetail = '';
      for (let step = 0; step < 40; step++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(400);

        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const cs = window.getComputedStyle(el);
          const style = cs.outlineStyle;
          const width = parseFloat(cs.outlineWidth) || 0;
          const hasOutline = style !== 'none' && width > 0;
          const insideHiddenMenu = !!el.closest('.mobile-nav:not(.open)');
          const id = `${el.tagName}:${el.id || ''}:${el.getAttribute('href') || ''}:${el.className || ''}`;
          return { id, hasOutline, insideHiddenMenu, style, width };
        });

        if (!stop) break;
        if (visitedStops.has(stop.id)) break;
        visitedStops.add(stop.id);

        if (!stop.hasOutline) {
          outlineOk = false;
          outlineDetail = `Element missing visible outline: ${stop.id}`;
          break;
        }
        if (stop.insideHiddenMenu) {
          outlineOk = false;
          outlineDetail = `Element inside hidden mobile menu received focus: ${stop.id}`;
          break;
        }
      }
      reportItem(
        `[${vp.name}] Tab stops have visible outline after 400ms and none in hidden menu`,
        outlineOk,
        outlineDetail
      );

      // Mobile specific interactive checks (at 390x844)
      if (vp.name === 'mobile') {
        await page.goto(distServer.url, { waitUntil: 'load' });
        const hamburger = page.locator('#hamburger');

        // Check hamburger initial attributes
        const initLabel = await hamburger.getAttribute('aria-label');
        const initExpanded = await hamburger.getAttribute('aria-expanded');
        const initControls = await hamburger.getAttribute('aria-controls');
        const hamburgerInitOk =
          !!initLabel && initExpanded === 'false' && initControls === 'mobile-nav';

        // Click hamburger -> toggles aria attributes & focus moves into menu
        await hamburger.click();
        const openExpanded = await hamburger.getAttribute('aria-expanded');
        const openLabel = await hamburger.getAttribute('aria-label');
        const focusInMenu = await page.evaluate(() => {
          const menu = document.getElementById('mobile-nav');
          return menu ? menu.contains(document.activeElement) : false;
        });

        // Tab & Shift-Tab trapping: never reach content behind open menu (#main, footer, skip-link)
        let reachedBehind = false;
        for (let t = 0; t < 15; t++) {
          await page.keyboard.press('Tab');
          const isBehind = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return false;
            return !!el.closest('#main, footer, .skip-link');
          });
          if (isBehind) {
            reachedBehind = true;
            break;
          }
        }
        for (let t = 0; t < 15; t++) {
          await page.keyboard.press('Shift+Tab');
          const isBehind = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return false;
            return !!el.closest('#main, footer, .skip-link');
          });
          if (isBehind) {
            reachedBehind = true;
            break;
          }
        }

        // Escape key closes menu and returns focus to hamburger
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        const escapeOk = await page.evaluate(() => {
          const menu = document.getElementById('mobile-nav');
          const btn = document.getElementById('hamburger');
          const isClosed = !menu.classList.contains('open');
          const isAriaClosed = btn.getAttribute('aria-expanded') === 'false';
          const isFocused = document.activeElement === btn;
          return isClosed && isAriaClosed && isFocused;
        });

        reportItem(
          `[${vp.name}] Hamburger has aria-label, aria-expanded, aria-controls and toggles`,
          hamburgerInitOk && openExpanded === 'true' && openLabel !== initLabel
        );
        reportItem(`[${vp.name}] Focus moves into mobile menu on open`, focusInMenu);
        reportItem(`[${vp.name}] Tab and Shift+Tab never reach content behind open menu`, !reachedBehind);
        reportItem(`[${vp.name}] Escape closes menu and returns focus to hamburger`, escapeOk);
      }

      await context.close();

      // 2. Visual Diff between baseline/ and dist/
      console.log(`  Capturing visual diff for ${vp.name}...`);
      const baseContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: 'reduce',
      });
      const basePage = await baseContext.newPage();
      await basePage.goto(baselineServer.url, { waitUntil: 'load' });
      await scrollPage(basePage);
      const baseScreenshot = await basePage.screenshot({ fullPage: true });
      const baseBoxes = await getImageBoundingBoxes(basePage);
      await baseContext.close();

      const distContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: 'reduce',
      });
      const distPage = await distContext.newPage();
      await distPage.goto(distServer.url, { waitUntil: 'load' });
      await scrollPage(distPage);
      const distScreenshot = await distPage.screenshot({ fullPage: true });
      const distBoxes = await getImageBoundingBoxes(distPage);
      await distContext.close();

      const imgBase = PNG.sync.read(baseScreenshot);
      const imgDist = PNG.sync.read(distScreenshot);

      const width = Math.max(imgBase.width, imgDist.width);
      const height = Math.max(imgBase.height, imgDist.height);

      // Pad if heights or widths differ
      function padImage(src, targetW, targetH) {
        if (src.width === targetW && src.height === targetH) return src;
        const out = new PNG({ width: targetW, height: targetH, fill: true });
        PNG.bitblt(src, out, 0, 0, src.width, src.height, 0, 0);
        return out;
      }

      const paddedBase = padImage(imgBase, width, height);
      const paddedDist = padImage(imgDist, width, height);
      const diffPng = new PNG({ width, height });

      const numDiffPixels = pixelmatch(
        paddedBase.data,
        paddedDist.data,
        diffPng.data,
        width,
        height,
        { threshold: 0.1 }
      );

      const diffPath = path.join(diffDir, `diff-${vp.name}.png`);
      fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

      // Separate diffs inside image areas vs outside image areas
      const combinedBoxes = [...baseBoxes, ...distBoxes];
      let diffInside = 0;
      let totalInside = 0;
      let diffOutside = 0;
      let totalOutside = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const inImage = combinedBoxes.some(
            (b) => x >= Math.floor(b.left) - 1 && x <= Math.ceil(b.right) + 1 && y >= Math.floor(b.top) - 1 && y <= Math.ceil(b.bottom) + 1
          );
          const idx = (y * width + x) * 4;
          // Check if pixelmatch marked diff (red pixel [255, 0, 0])
          const isDiff =
            diffPng.data[idx] === 255 &&
            diffPng.data[idx + 1] === 0 &&
            diffPng.data[idx + 2] === 0;

          if (inImage) {
            totalInside++;
            if (isDiff) diffInside++;
          } else {
            totalOutside++;
            if (isDiff) diffOutside++;
          }
        }
      }

      const pctOutside = totalOutside > 0 ? (diffOutside / totalOutside) * 100 : 0;
      const pctInside = totalInside > 0 ? (diffInside / totalInside) * 100 : 0;
      const pctTotal = (numDiffPixels / (width * height)) * 100;

      console.log(
        `    Visual diff [${vp.name}]: total=${pctTotal.toFixed(3)}%, outsideImages=${pctOutside.toFixed(3)}%, insideImages=${pctInside.toFixed(3)}%`
      );

      if (pctInside > 3) {
        console.log(`    [FLAG FOR MANUAL REVIEW] Image area diff is ${pctInside.toFixed(2)}% (> 3%)`);
      }

      const visualDiffPass = pctOutside <= 0.5;
      reportItem(
        `[${vp.name}] Visual diff <= 0.5% outside image areas`,
        visualDiffPass,
        `outside=${pctOutside.toFixed(3)}%, inside=${pctInside.toFixed(3)}%`
      );
    }
  } finally {
    await browser.close();
    await distServer.close();
    await baselineServer.close();
  }

  console.log('\n=============================================');
  if (allPassed) {
    console.log('VERIFY PASSED');
    process.exit(0);
  } else {
    console.log('VERIFY FAILED');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('[verify] Unexpected fatal error:', err);
  console.log('VERIFY FAILED');
  process.exit(1);
});

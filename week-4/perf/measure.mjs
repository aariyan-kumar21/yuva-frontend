import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import child_process from 'node:child_process';
import { startServer } from '../scripts/server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const label = process.argv[2];
const targetDir = process.argv[3];
const mobileOnly = process.argv[4] === 'mobile-only';

if (!label || !targetDir) {
  console.error('Usage: node ./perf/measure.mjs <label> <dir> [mobile-only]');
  process.exit(1);
}

const targetPath = path.resolve(rootDir, targetDir);
if (!fs.existsSync(targetPath)) {
  console.error(`Target directory not found: ${targetPath}`);
  process.exit(1);
}

const runsDir = path.resolve(rootDir, 'perf', 'runs', label);
const reportsDir = path.resolve(rootDir, 'perf', 'reports');
const summaryMdPath = path.resolve(rootDir, 'perf', 'summary.md');

fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(reportsDir, { recursive: true });

function getChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  ];
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return 'chrome';
}

function getChromeVersion(chromePath) {
  try {
    const escaped = chromePath.replace(/'/g, "''");
    const cmd = `(Get-Item -LiteralPath '${escaped}').VersionInfo.ProductVersion`;
    const out = child_process.execFileSync('powershell.exe', ['-NoProfile', '-Command', cmd], { encoding: 'utf8' });
    return out.trim() || '155.0.8059.80';
  } catch {
    return '155.0.8059.80';
  }
}

function getLighthouseVersion() {
  try {
    const pkgPath = path.resolve(rootDir, 'node_modules', 'lighthouse', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return '12.8.2';
  }
}

function runLighthouse(url, outBasePath, isDesktop = false, chromePath) {
  return new Promise((resolve, reject) => {
    const cli = path.resolve(rootDir, 'node_modules', 'lighthouse', 'cli', 'index.js');
    const args = [
      cli,
      url,
      '--output=json,html',
      `--output-path=${outBasePath}`,
      '--chrome-flags=--headless=new --no-sandbox',
      '--quiet',
    ];

    if (isDesktop) {
      args.push('--preset=desktop');
    }

    const proc = child_process.spawn(process.execPath, args, {
      env: { ...process.env, CHROME_PATH: chromePath },
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse CLI exited with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

function parseRunData(jsonPath) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const audits = raw.audits || {};
  const perfCategory = raw.categories?.performance || {};

  const score = Math.round((perfCategory.score || 0) * 100);
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  const speedIndex = audits['speed-index']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const totalByteWeight = audits['total-byte-weight']?.numericValue || 0;
  const domSize = audits['dom-size']?.numericValue || 0;

  // Network requests
  const networkItems = audits['network-requests']?.details?.items || [];
  const requestCount = networkItems.length;

  // Resource summary
  const resourceSummary = audits['resource-summary']?.details?.items || [];
  const bytesByType = {
    document: 0,
    css: 0,
    js: 0,
    font: 0,
    image: 0,
    other: 0,
  };
  for (const item of resourceSummary) {
    if (item.resourceType === 'document') bytesByType.document = item.transferSize;
    else if (item.resourceType === 'stylesheet') bytesByType.css = item.transferSize;
    else if (item.resourceType === 'script') bytesByType.js = item.transferSize;
    else if (item.resourceType === 'font') bytesByType.font = item.transferSize;
    else if (item.resourceType === 'image') bytesByType.image = item.transferSize;
    else if (item.resourceType === 'other' || item.resourceType === 'media') bytesByType.other += item.transferSize;
  }

  // Unused CSS and JS
  const unusedCss = audits['unused-css-rules']?.details?.overallSavingsBytes || 0;
  const unusedJs = audits['unused-javascript']?.details?.overallSavingsBytes || 0;

  // Main thread work breakdown
  const mainThreadWork = audits['mainthread-work-breakdown']?.numericValue || 0;
  const mainThreadItems = audits['mainthread-work-breakdown']?.details?.items || [];
  let styleLayout = 0;
  let scriptEvaluation = 0;
  let rendering = 0;
  for (const item of mainThreadItems) {
    if (item.group === 'styleLayout') styleLayout += item.duration;
    else if (item.group === 'scriptEvaluation') scriptEvaluation += item.duration;
    else if (item.group === 'paintCompositeRender') rendering += item.duration;
  }

  // LCP Element and Phases
  const lcpElementItems = audits['largest-contentful-paint-element']?.details?.items || [];
  let lcpNode = null;
  let lcpPhases = [];
  for (const item of lcpElementItems) {
    if (item.type === 'table') {
      if (item.items?.[0]?.node) {
        lcpNode = item.items[0].node;
      }
      if (item.items?.[0]?.phase) {
        lcpPhases = item.items;
      }
    }
  }

  // Long tasks
  const longTasks = audits['long-tasks']?.details?.items || [];

  // Render-blocking resources
  const renderBlocking = audits['render-blocking-resources']?.details?.items || [];

  // Image delivery insights
  const modernImages = audits['modern-image-formats']?.details?.items || [];
  const optimizedImages = audits['uses-optimized-images']?.details?.items || [];
  const responsiveImages = audits['uses-responsive-images']?.details?.items || [];

  return {
    score,
    fcp,
    lcp,
    tbt,
    speedIndex,
    cls,
    totalByteWeight,
    requestCount,
    domSize,
    bytesByType,
    unusedCss,
    unusedJs,
    mainThreadWork,
    styleLayout,
    scriptEvaluation,
    rendering,
    lcpNode,
    lcpPhases,
    longTasks,
    renderBlocking,
    modernImages,
    optimizedImages,
    responsiveImages,
    networkItems,
    raw,
  };
}

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return { min, max, median };
}

function formatMs(ms) {
  return `${Math.round(ms)} ms`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

async function run() {
  console.log(`[measure] Running Lighthouse for label "${label}" on dir "${targetDir}" (mobileOnly: ${mobileOnly})...`);

  const chromePath = getChromePath();
  const chromeVer = getChromeVersion(chromePath);
  const lhVer = getLighthouseVersion();
  const nodeVer = process.version;
  const dateStr = new Date().toISOString().split('T')[0];

  console.log(`  Environment: Chrome ${chromeVer}, Lighthouse ${lhVer}, Node ${nodeVer}, Date ${dateStr}`);

  const server = await startServer(targetPath);
  console.log(`  Server started at ${server.url}`);

  const modes = ['mobile'];
  if (!mobileOnly) {
    modes.push('desktop');
  }

  const resultsByMode = {};

  try {
    for (const mode of modes) {
      console.log(`\n--- Running 3 ${mode.toUpperCase()} runs ---`);
      const runs = [];
      const isDesktop = mode === 'desktop';

      for (let runIdx = 1; runIdx <= 3; runIdx++) {
        const outBase = path.join(runsDir, `${mode}-run-${runIdx}`);
        console.log(`  [${mode}] Run ${runIdx}/3 starting...`);
        await runLighthouse(server.url, outBase, isDesktop, chromePath);
        const jsonPath = `${outBase}.report.json`;
        const data = parseRunData(jsonPath);
        data.htmlPath = `${outBase}.report.html`;
        data.jsonPath = jsonPath;
        runs.push(data);
        console.log(
          `  [${mode}] Run ${runIdx}/3 completed: Score ${data.score}, FCP ${formatMs(data.fcp)}, LCP ${formatMs(data.lcp)}, TBT ${formatMs(data.tbt)}, SI ${formatMs(data.speedIndex)}`
        );
      }

      // Pick median run index based on performance score, break ties with LCP
      const runsWithIndex = runs.map((r, i) => ({ run: r, index: i }));
      runsWithIndex.sort((a, b) => {
        if (a.run.score !== b.run.score) return a.run.score - b.run.score;
        return a.run.lcp - b.run.lcp;
      });
      const medianRunObj = runsWithIndex[1].run;

      resultsByMode[mode] = {
        runs,
        medianRun: medianRunObj,
        stats: {
          score: calculateStats(runs.map((r) => r.score)),
          fcp: calculateStats(runs.map((r) => r.fcp)),
          lcp: calculateStats(runs.map((r) => r.lcp)),
          tbt: calculateStats(runs.map((r) => r.tbt)),
          speedIndex: calculateStats(runs.map((r) => r.speedIndex)),
        },
      };

      // For labels 00-baseline and 09-final, save median HTML report and requests table
      if (label === '00-baseline' || label === '09-final') {
        const destHtml = path.join(reportsDir, `${label}-${mode}-median.html`);
        fs.copyFileSync(medianRunObj.htmlPath, destHtml);
        console.log(`  Saved median HTML report to ${destHtml}`);

        if (mode === 'mobile') {
          // Per-resource table for requests
          const requestsMdPath = path.join(rootDir, 'perf', `${label}-requests.md`);
          let mdReq = `# Network Requests: ${label} (${mode} median run)\n\n`;
          mdReq += `| URL | Resource Type | Transfer Bytes | Resource Bytes |\n`;
          mdReq += `| :--- | :--- | :--- | :--- |\n`;
          for (const item of medianRunObj.networkItems) {
            mdReq += `| \`${item.url}\` | ${item.resourceType || 'other'} | ${formatBytes(item.transferSize || 0)} | ${formatBytes(item.resourceSize || 0)} |\n`;
          }
          fs.writeFileSync(requestsMdPath, mdReq, 'utf8');
          console.log(`  Saved requests table to ${requestsMdPath}`);
        }
      }
    }
  } finally {
    await server.close();
  }

  // Update perf/summary.md
  let summaryContent = '';
  if (fs.existsSync(summaryMdPath)) {
    summaryContent = fs.readFileSync(summaryMdPath, 'utf8');
  }

  // Check if environment header exists
  if (!summaryContent.includes('# Lighthouse Performance Summary')) {
    const envSection = `# Lighthouse Performance Summary\n\n` +
      `### Benchmark Environment\n` +
      `- **Date**: ${dateStr}\n` +
      `- **Node.js**: ${nodeVer}\n` +
      `- **Chrome**: ${chromeVer} (${chromePath})\n` +
      `- **Lighthouse**: ${lhVer}\n` +
      `- **Throttling**: Default simulated throttling (Mobile: 4x CPU slowdown, 150ms RTT, 1.6Mbps down / 750kbps up; Desktop: 1x CPU slowdown, 40ms RTT, 10Mbps down / 10Mbps up)\n\n` +
      `---\n\n`;
    summaryContent = envSection + summaryContent;
  }

  let entrySection = `## Run: \`${label}\` (${targetDir}) — ${dateStr}\n\n`;

  for (const mode of modes) {
    const res = resultsByMode[mode];
    const s = res.stats;
    const m = res.medianRun;

    entrySection += `### ${mode.toUpperCase()} Profile\n\n`;

    // Metrics table
    entrySection += `#### Core Performance Metrics\n\n`;
    entrySection += `| Metric | Run 1 | Run 2 | Run 3 | Median | Min - Max |\n`;
    entrySection += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    entrySection += `| **Performance Score** | ${res.runs[0].score} | ${res.runs[1].score} | ${res.runs[2].score} | **${Math.round(s.score.median)}** | ${s.score.min} - ${s.score.max} |\n`;
    entrySection += `| **FCP** | ${formatMs(res.runs[0].fcp)} | ${formatMs(res.runs[1].fcp)} | ${formatMs(res.runs[2].fcp)} | **${formatMs(s.fcp.median)}** | ${formatMs(s.fcp.min)} - ${formatMs(s.fcp.max)} |\n`;
    entrySection += `| **LCP** | ${formatMs(res.runs[0].lcp)} | ${formatMs(res.runs[1].lcp)} | ${formatMs(res.runs[2].lcp)} | **${formatMs(s.lcp.median)}** | ${formatMs(s.lcp.min)} - ${formatMs(s.lcp.max)} |\n`;
    entrySection += `| **TBT** | ${formatMs(res.runs[0].tbt)} | ${formatMs(res.runs[1].tbt)} | ${formatMs(res.runs[2].tbt)} | **${formatMs(s.tbt.median)}** | ${formatMs(s.tbt.min)} - ${formatMs(s.tbt.max)} |\n`;
    entrySection += `| **Speed Index** | ${formatMs(res.runs[0].speedIndex)} | ${formatMs(res.runs[1].speedIndex)} | ${formatMs(res.runs[2].speedIndex)} | **${formatMs(s.speedIndex.median)}** | ${formatMs(s.speedIndex.min)} - ${formatMs(s.speedIndex.max)} |\n\n`;

    // Secondary & Diagnostic Metrics (from median run)
    entrySection += `#### Diagnostics & Page Overview (Median Run)\n\n`;
    entrySection += `- **CLS**: ${m.cls.toFixed(4)}\n`;
    entrySection += `- **Total Byte Weight**: ${formatBytes(m.totalByteWeight)}\n`;
    entrySection += `- **Network Requests**: ${m.requestCount}\n`;
    entrySection += `- **DOM Elements**: ${m.domSize}\n`;
    entrySection += `- **Unused CSS**: ${formatBytes(m.unusedCss)}\n`;
    entrySection += `- **Unused JavaScript**: ${formatBytes(m.unusedJs)}\n\n`;

    // Bytes by resource type
    entrySection += `#### Bytes by Resource Type (Transfer Size)\n\n`;
    entrySection += `| Document | CSS | JavaScript | Fonts | Images | Other |\n`;
    entrySection += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    entrySection += `| ${formatBytes(m.bytesByType.document)} | ${formatBytes(m.bytesByType.css)} | ${formatBytes(m.bytesByType.js)} | ${formatBytes(m.bytesByType.font)} | ${formatBytes(m.bytesByType.image)} | ${formatBytes(m.bytesByType.other)} |\n\n`;

    // Main-thread work breakdown
    entrySection += `#### Main-Thread Work Breakdown\n\n`;
    entrySection += `- **Total Main-Thread Execution**: ${formatMs(m.mainThreadWork)}\n`;
    entrySection += `- **Style & Layout**: ${formatMs(m.styleLayout)}\n`;
    entrySection += `- **Script Evaluation**: ${formatMs(m.scriptEvaluation)}\n`;
    entrySection += `- **Rendering**: ${formatMs(m.rendering)}\n\n`;

    // LCP Element & Phases
    entrySection += `#### Largest Contentful Paint (LCP) Element & Breakdown\n\n`;
    if (m.lcpNode) {
      entrySection += `- **LCP Selector**: \`${m.lcpNode.selector || ''}\`\n`;
      entrySection += `- **LCP Snippet**: \`${m.lcpNode.snippet || ''}\`\n`;
      entrySection += `- **LCP Node Label**: ${m.lcpNode.nodeLabel || ''}\n`;
    } else {
      entrySection += `*LCP Element node details unavailable*\n`;
    }

    if (m.lcpPhases && m.lcpPhases.length > 0) {
      entrySection += `\n**LCP Breakdown Phases**:\n\n`;
      entrySection += `| Phase | % of LCP | Timing |\n`;
      entrySection += `| :--- | :--- | :--- |\n`;
      for (const ph of m.lcpPhases) {
        entrySection += `| ${ph.phase} | ${ph.percent} | ${formatMs(ph.timing || 0)} |\n`;
      }
      entrySection += `\n`;
    }

    // Long Tasks
    entrySection += `#### Long Tasks (> 50 ms)\n\n`;
    entrySection += `- **Total Long Tasks**: ${m.longTasks.length}\n`;
    if (m.longTasks.length > 0) {
      entrySection += `| Duration | Start Time | URL / Attribution |\n`;
      entrySection += `| :--- | :--- | :--- |\n`;
      for (const lt of m.longTasks) {
        entrySection += `| ${formatMs(lt.duration)} | ${formatMs(lt.startTime)} | \`${lt.url || 'Unattributable'}\` |\n`;
      }
      entrySection += `\n`;
    } else {
      entrySection += `*No long tasks recorded*\n\n`;
    }

    // Render-blocking resources
    entrySection += `#### Render-Blocking Resources\n\n`;
    if (m.renderBlocking.length > 0) {
      entrySection += `| Resource URL | Total Bytes | Wasted Potential |\n`;
      entrySection += `| :--- | :--- | :--- |\n`;
      for (const rb of m.renderBlocking) {
        entrySection += `| \`${rb.url}\` | ${formatBytes(rb.totalBytes || 0)} | ${formatMs(rb.wastedMs || 0)} |\n`;
      }
      entrySection += `\n`;
    } else {
      entrySection += `*No render-blocking resources identified*\n\n`;
    }

    // Image delivery insights
    entrySection += `#### Image Delivery Insights\n\n`;
    let hasImageInsight = false;
    if (m.modernImages.length > 0) {
      hasImageInsight = true;
      entrySection += `- **Next-Gen / Modern Formats Savings Potential**: ${m.modernImages.length} images could save bytes in WebP/AVIF format.\n`;
    }
    if (m.responsiveImages.length > 0) {
      hasImageInsight = true;
      entrySection += `- **Properly Size Images Savings Potential**: ${m.responsiveImages.length} images oversized for display dimensions.\n`;
    }
    if (m.optimizedImages.length > 0) {
      hasImageInsight = true;
      entrySection += `- **Efficiently Encode Images Savings Potential**: ${m.optimizedImages.length} unoptimized images.\n`;
    }
    if (!hasImageInsight) {
      entrySection += `*No major image delivery optimizations flagged*\n`;
    }
    entrySection += `\n`;
  }

  entrySection += `---\n\n`;
  summaryContent += entrySection;
  fs.writeFileSync(summaryMdPath, summaryContent, 'utf8');
  console.log(`  Updated ${summaryMdPath} successfully.`);

  // Print console table for user
  console.log(`\n================ Summary for ${label} ================`);
  for (const mode of modes) {
    const s = resultsByMode[mode].stats;
    console.log(`\nMode: ${mode.toUpperCase()}`);
    console.log(`  Score:       Median ${Math.round(s.score.median)} (Min: ${s.score.min}, Max: ${s.score.max})`);
    console.log(`  FCP:         Median ${formatMs(s.fcp.median)} (Min: ${formatMs(s.fcp.min)}, Max: ${formatMs(s.fcp.max)})`);
    console.log(`  LCP:         Median ${formatMs(s.lcp.median)} (Min: ${formatMs(s.lcp.min)}, Max: ${formatMs(s.lcp.max)})`);
    console.log(`  TBT:         Median ${formatMs(s.tbt.median)} (Min: ${formatMs(s.tbt.min)}, Max: ${formatMs(s.tbt.max)})`);
    console.log(`  Speed Index: Median ${formatMs(s.speedIndex.median)} (Min: ${formatMs(s.speedIndex.min)}, Max: ${formatMs(s.speedIndex.max)})`);
  }
}

run().catch((err) => {
  console.error('[measure] Error:', err);
  process.exit(1);
});

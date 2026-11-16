import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const PORT = Number(process.env.PERF_PORT || 5173);
const TARGET_URL = process.env.PERF_URL || `http://127.0.0.1:${PORT}`;
const REPORT_PATH = path.join(process.cwd(), 'perf-report.json');
const POSTER_PATH = path.join(process.cwd(), 'public', 'images', 'poster-hero.webp');
const MAX_POSTER_BYTES = 80 * 1024;
const MAX_BLANK_MS = 3000;
const MAX_TTI_MS = 10000;
const DOWNLOAD_BPS = Math.round((400 * 1024) / 8);
const LATENCY_MS = 400;

async function serverIsUp() {
  try { return (await fetch(TARGET_URL, { method: 'HEAD' })).ok; } catch { return false; }
}

async function waitForServer(timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await serverIsUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Production server did not start at ${TARGET_URL}.`);
}

async function measurePaint({ mobile }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: DOWNLOAD_BPS,
    uploadThroughput: DOWNLOAD_BPS,
    latency: LATENCY_MS,
  });
  const sequence2Requests = [];
  page.on('request', (request) => {
    if (/\/sequence-2(?:\/|$)/.test(new URL(request.url()).pathname)) sequence2Requests.push(request.url());
  });
  const startedAt = Date.now();
  const navigation = page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((error) => {
    throw new Error(`Navigation failed: ${error.message}`);
  });
  let firstVisibleContentMs = null;
  let lastMeanBrightness = null;
  let nearBlackSince = startedAt;
  let screenshotCount = 0;
  try {
    await navigation;
    while (Date.now() - startedAt < 12000) {
      const screenshot = await page.screenshot({ type: 'png' });
      const { data, width, height } = PNG.sync.read(screenshot);
      let sum = 0;
      let count = 0;
      for (let y = Math.floor(height * 0.08); y < height; y += 12) {
        for (let x = 0; x < width; x += 12) {
          const offset = (y * width + x) * 4;
          sum += (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
          count += 1;
        }
      }
      lastMeanBrightness = count ? sum / count : 0;
      screenshotCount += 1;
      const now = Date.now();
      if (lastMeanBrightness > 12) {
        firstVisibleContentMs = now - startedAt;
        break;
      }
      if (now - nearBlackSince > MAX_BLANK_MS) break;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  } finally {
    await browser.close();
  }
  return {
    viewport: mobile ? 'lite-mobile-390x844' : 'desktop-1280x800',
    firstVisibleContentMs,
    lastMeanBrightness: Number((lastMeanBrightness ?? 0).toFixed(2)),
    screenshotsSampled: screenshotCount,
    sequence2RequestsBeforeScroll: sequence2Requests.length,
    passedBlankCheck: firstVisibleContentMs !== null && firstVisibleContentMs <= MAX_BLANK_MS,
    passedLazySequenceCheck: sequence2Requests.length === 0,
  };
}

async function measureTti() {
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  try {
    const result = await lighthouse(TARGET_URL, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      throttlingMethod: 'devtools',
      formFactor: 'desktop',
      throttling: {
        rttMs: LATENCY_MS,
        throughputKbps: 400,
        requestLatencyMs: LATENCY_MS,
        downloadThroughputKbps: 400,
        uploadThroughputKbps: 400,
        cpuSlowdownMultiplier: 4,
      },
      screenEmulation: { mobile: false, width: 1280, height: 800, deviceScaleFactor: 1, disabled: false },
    });
    const ttiMs = Math.round(result.lhr.audits['interactive']?.numericValue ?? Infinity);
    return { ttiMs, fcpMs: Math.round(result.lhr.audits['first-contentful-paint']?.numericValue ?? Infinity), passed: ttiMs <= MAX_TTI_MS };
  } finally {
    await chrome.kill();
  }
}

async function main() {
  let server;
  if (!(await serverIsUp())) {
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    await waitForServer();
  }
  try {
    const posterStat = await fs.stat(POSTER_PATH);
    const poster = { bytes: posterStat.size, passed: posterStat.size < MAX_POSTER_BYTES };
    const testSprite = { attempted: false, reason: 'TestSprite MCP is not available as a callable tool in this environment; using the local Playwright/CDP + Lighthouse fallback.' };
    const desktop = await measurePaint({ mobile: false });
    const lite = await measurePaint({ mobile: true });
    const lighthouseResult = await measureTti();
    const passed = poster.passed && desktop.passedBlankCheck && desktop.passedLazySequenceCheck &&
      lite.passedBlankCheck && lite.passedLazySequenceCheck && lighthouseResult.passed;
    const report = {
      timestamp: new Date().toISOString(),
      toolUsed: 'playwright-cdp + lighthouse (fallback)',
      fallbackReason: testSprite.reason,
      profile: { downloadKbps: 400, latencyMs: LATENCY_MS },
      thresholds: { maxPosterBytes: MAX_POSTER_BYTES, maxBlankScreenMs: MAX_BLANK_MS, maxTtiMs: MAX_TTI_MS },
      results: { poster, desktop, liteMode: lite, lighthouse: lighthouseResult },
      passed,
    };
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify(report, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    if (server && !server.killed) server.kill();
  }
}

main().catch((error) => {
  console.error('[perf-test] Fatal error:', error);
  process.exitCode = 1;
});

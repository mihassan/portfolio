#!/usr/bin/env node
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import os from 'node:os';
import path from 'node:path';

const SOURCE = path.resolve(new URL('..', import.meta.url).pathname);

async function isExecutable(candidate) {
  try {
    await fs.access(candidate, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [];
  const systemCandidates = process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
      ]
    : [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
      ];

  const cacheRoot = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
    : path.join(os.homedir(), '.cache', 'ms-playwright');
  try {
    const entries = (await fs.readdir(cacheRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
    for (const entry of entries) {
      if (entry.startsWith('chromium_headless_shell-')) {
        candidates.push(process.platform === 'darwin'
          ? path.join(cacheRoot, entry, `chrome-headless-shell-mac-${process.arch === 'arm64' ? 'arm64' : 'x64'}`, 'chrome-headless-shell')
          : path.join(cacheRoot, entry, 'chrome-headless-shell-linux64', 'chrome-headless-shell'));
      }
      if (entry.startsWith('chromium-')) {
        candidates.push(process.platform === 'darwin'
          ? path.join(cacheRoot, entry, `chrome-mac-${process.arch === 'arm64' ? 'arm64' : 'x64'}`, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')
          : path.join(cacheRoot, entry, 'chrome-linux64', 'chrome'));
      }
    }
  } catch {
    // The Playwright cache is optional; common system paths remain candidates.
  }
  candidates.push(...systemCandidates);

  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate;
  }
  throw new Error('No Chrome or Chromium executable found. Set CHROME_PATH to an installed browser.');
}

const CHROME = await resolveChrome();
const QA = process.env.QA_DIR || '/tmp/homepage-final-qa';
const PORT = Number(process.env.HUGO_TEST_PORT || 14145);
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT || 14245);
const BASE = `http://127.0.0.1:${PORT}`;
const DEBUG = `http://127.0.0.1:${DEBUG_PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

await fs.rm(QA, { recursive: true, force: true });
await fs.mkdir(`${QA}/visual`, { recursive: true });

const server = spawn('hugo', ['server', '--source', SOURCE, '--port', String(PORT), '--bind', '127.0.0.1', '--disableFastRender', '--renderToMemory', '--disableLiveReload', '--cacheDir', `${QA}/hugo-cache`], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });
const chrome = spawn(CHROME, ['--headless', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${DEBUG_PORT}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${QA}/chrome-profile`, '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let chromeLog = '';
chrome.stdout.on('data', (chunk) => { chromeLog += chunk.toString(); });
chrome.stderr.on('data', (chunk) => { chromeLog += chunk.toString(); });

async function ready(url) {
  let reason = 'not attempted';
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      reason = `HTTP ${response.status}`;
    } catch (error) { reason = error.message; }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}: ${reason}`);
}

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.sequence = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const call = this.pending.get(message.id);
        if (!call) return;
        clearTimeout(call.timeout);
        this.pending.delete(message.id);
        if (message.error) call.reject(new Error(JSON.stringify(message.error)));
        else call.resolve(message.result);
        return;
      }
      for (const handler of this.listeners.get(message.method) || []) handler(message.params);
    });
  }
  on(method, handler) {
    const handlers = this.listeners.get(method) || [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
  }
  send(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(`Evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result.value;
}

async function screenshot(cdp, name, full = false) {
  const params = { format: 'png', fromSurface: true, captureBeyondViewport: full };
  if (full) {
    const metrics = await cdp.send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    params.clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
  }
  const result = await cdp.send('Page.captureScreenshot', params);
  await fs.writeFile(`${QA}/visual/${name}.png`, Buffer.from(result.data, 'base64'));
}

const inspectExpression = `(() => {
  const box = (element) => { if (!element) return null; const r = element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
  const visible = (element) => { if (!element) return false; const s=getComputedStyle(element),r=element.getBoundingClientRect(); return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>0&&r.height>0; };
  const nav = document.querySelector('.site-nav');
  const images = [...document.images].map((image) => ({src:image.getAttribute('src'),loaded:image.complete&&image.naturalWidth>0,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,...box(image)}));
  return {
    path: location.pathname,
    viewport: {width:innerWidth,height:innerHeight},
    scrollWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    mainTextLength: document.querySelector('main')?.innerText.trim().length || 0,
    mainVisible: visible(document.querySelector('main')),
    brand: document.querySelector('.site-brand__name')?.textContent.trim(),
    heading: document.querySelector('h1') ? {text:document.querySelector('h1').innerText.trim(),...box(document.querySelector('h1'))} : null,
    cta: box(document.querySelector('.hero .button--primary')),
    currentLinks: [...document.querySelectorAll('.site-nav [aria-current="page"]')].map((link)=>link.textContent.trim()),
    menu: {open:document.querySelector('[data-site-menu]')?.open || false,visible:visible(nav),box:box(nav),links:nav?[...nav.querySelectorAll('a')].map((link)=>({text:link.textContent.trim(),...box(link)})):[]},
    images,
    heroImage: box(document.querySelector('.hero__visual img')),
    fontSize: parseFloat(getComputedStyle(document.body).fontSize),
    focusOutline: document.activeElement ? getComputedStyle(document.activeElement).outlineStyle : null
  };
})()`;

const routes = [
  '/',
  '/work/',
  '/work/bananagram-solver/',
  '/work/calendar-puzzle/',
  '/work/phonetiq/',
  '/work/qless-solver/',
  '/work/qibla-direction/',
  '/work/advent-of-code/',
  '/work/haskell-on-cloud-run/',
  '/work/crystal-cave/',
  '/work/ozbloom/',
  '/work/barebone-fsm/',
  '/notes/',
  '/notes/directing-ai-assisted-project/',
  '/notes/three-word-grid-solvers/',
  '/notes/short-utterance-speech-recognition/',
  '/research/',
  '/creative/',
  '/about/',
  '/career/',
  '/elsewhere/',
  '/poems/',
  '/poems/jirno-sriti/',
  '/poems/bedonar-rong/',
];
const cases = [
  { name: 'home-desktop', route: '/', width: 1440, height: 1000, full: true },
  { name: 'home-laptop', route: '/', width: 1024, height: 768 },
  { name: 'home-tablet', route: '/', width: 768, height: 1024 },
  { name: 'home-mobile', route: '/', width: 390, height: 844, full: true, menu: true },
  { name: 'home-small', route: '/', width: 320, height: 568, menu: true },
  { name: 'home-dark', route: '/', width: 1440, height: 1000, dark: true, hover: true },
  { name: 'home-no-js', route: '/', width: 390, height: 844, noJS: true, menu: true },
  { name: 'home-blocked-js', route: '/', width: 390, height: 844, blockJS: true },
  { name: 'home-reduced-motion', route: '/', width: 390, height: 844, reduced: true },
  { name: 'home-zoom-like', route: '/', width: 720, height: 500, dpr: 2 },
  { name: 'work-desktop', route: '/work/', width: 1440, height: 1000, full: true },
  { name: 'work-mobile', route: '/work/', width: 390, height: 844 },
  { name: 'bananagram-desktop', route: '/work/bananagram-solver/', width: 1440, height: 1000, full: true },
  { name: 'calendar-mobile', route: '/work/calendar-puzzle/', width: 390, height: 844, full: true },
  { name: 'notes-desktop', route: '/notes/', width: 1440, height: 1000, full: true },
  { name: 'notes-mobile', route: '/notes/', width: 390, height: 844, full: true },
  { name: 'note-desktop', route: '/notes/three-word-grid-solvers/', width: 1200, height: 900, full: true },
  { name: 'note-mobile', route: '/notes/short-utterance-speech-recognition/', width: 390, height: 844, full: true },
  { name: 'research-desktop', route: '/research/', width: 1440, height: 1000, full: true },
  { name: 'creative-mobile', route: '/creative/', width: 390, height: 844, full: true },
  { name: 'about-desktop', route: '/about/', width: 1440, height: 1000, full: true, keyboard: true },
  { name: 'poem-mobile', route: '/poems/bedonar-rong/', width: 390, height: 844, full: true },
  { name: 'not-found', route: '/definitely-missing/', width: 390, height: 844 },
];

const report = [];
let failure;
try {
  await Promise.all([ready(BASE), ready(`${DEBUG}/json/version`)]);
  for (const route of routes) {
    const response = await fetch(BASE + route);
    assert(response.status === 200, `${route}: expected HTTP 200, got ${response.status}`);
  }
  const missing = await fetch(BASE + '/definitely-missing/');
  assert(missing.status === 404, `unknown route: expected HTTP 404, got ${missing.status}`);

  for (const test of cases) {
    const target = await (await fetch(`${DEBUG}/json/new?about:blank`, { method: 'PUT' })).json();
    const cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.open();
    const errors = [];
    const consoleErrors = [];
    const responses = [];
    const failures = [];
    const inflight = new Set();
    cdp.on('Runtime.exceptionThrown', (event) => errors.push(event.exceptionDetails));
    cdp.on('Log.entryAdded', (event) => { if (event.entry.level === 'error') consoleErrors.push(event.entry); });
    cdp.on('Network.requestWillBeSent', (event) => inflight.add(event.requestId));
    cdp.on('Network.loadingFinished', (event) => inflight.delete(event.requestId));
    cdp.on('Network.loadingFailed', (event) => { inflight.delete(event.requestId); failures.push(event); });
    cdp.on('Network.responseReceived', (event) => responses.push({ url:event.response.url, status:event.response.status }));
    await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Network.enable'), cdp.send('Log.enable')]);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width:test.width, height:test.height, deviceScaleFactor:test.dpr || 1, mobile:test.width < 600 });
    await cdp.send('Emulation.setEmulatedMedia', { media:'screen', features:[
      { name:'prefers-color-scheme', value:test.dark ? 'dark' : 'light' },
      { name:'prefers-reduced-motion', value:test.reduced ? 'reduce' : 'no-preference' },
    ]});
    if (test.noJS) await cdp.send('Emulation.setScriptExecutionDisabled', { value:true });
    if (test.blockJS) await cdp.send('Network.setBlockedURLs', { urls:['*js/site.js*'] });
    await cdp.send('Page.navigate', { url:BASE + test.route });
    let quiet = 0;
    for (let attempt = 0; attempt < 160; attempt += 1) {
      await sleep(75);
      quiet = inflight.size === 0 ? quiet + 1 : 0;
      if (quiet >= 6) break;
    }
    await sleep(250);
    const initial = await evaluate(cdp, inspectExpression);
    await screenshot(cdp, `${test.name}-fold`);

    assert(initial.mainVisible && initial.mainTextLength > 120, `${test.name}: substantive content not visible`);
    assert(initial.scrollWidth <= initial.viewport.width + 1, `${test.name}: horizontal overflow ${initial.scrollWidth}/${initial.viewport.width}`);
    assert(initial.brand === 'Md Imrul Hassan', `${test.name}: incorrect header brand ${initial.brand}`);
    assert(initial.heading && initial.heading.text.length > 0, `${test.name}: missing h1`);
    assert(initial.images.every((image) => image.loaded), `${test.name}: an image failed to load`);
    const unexpectedConsoleErrors = consoleErrors.filter((entry) => !(test.route === '/definitely-missing/' && entry.text.includes('404')));
    assert(errors.length === 0 && unexpectedConsoleErrors.length === 0, `${test.name}: browser errors present`);
    const unexpectedFailures = failures.filter((event) => !(test.blockJS && event.blockedReason === 'inspector'));
    assert(unexpectedFailures.length === 0, `${test.name}: unexpected network failure ${JSON.stringify(unexpectedFailures)}`);
    const thirdParty = responses.filter(({url}) => { const parsed = new URL(url); return parsed.protocol.startsWith('http') && parsed.hostname !== '127.0.0.1'; });
    assert(thirdParty.length === 0, `${test.name}: unexpected third-party request ${JSON.stringify(thirdParty)}`);
    if (test.route !== '/definitely-missing/') {
      const expectedCurrentLinks = test.route.startsWith('/notes/') ? 0 : 1;
      assert(initial.currentLinks.length === expectedCurrentLinks, `${test.name}: expected ${expectedCurrentLinks} current nav links, got ${initial.currentLinks}`);
    }
    if (test.width >= 900) assert(initial.menu.visible && initial.menu.box.width > 300, `${test.name}: desktop primary navigation is not visible`);
    if (test.route === '/') {
      assert(initial.heading.text === 'Md Imrul Hassan', `${test.name}: homepage h1 must be full name`);
      if (test.width >= 390) assert(initial.cta && initial.cta.bottom <= initial.viewport.height, `${test.name}: primary CTA is below initial viewport`);
      else assert(initial.cta && initial.cta.width > 0, `${test.name}: primary CTA is not rendered`);
      assert(initial.heroImage && Math.abs(initial.heroImage.width / initial.heroImage.height - 4 / 3) < 0.03, `${test.name}: hero art ratio distorted`);
    }
    if (test.name === 'home-desktop') assert(initial.pageHeight <= 7200, `desktop homepage is too long: ${initial.pageHeight}`);
    if (test.name === 'home-mobile') assert(initial.pageHeight <= 9200, `mobile homepage is too long: ${initial.pageHeight}`);
    if (test.noJS || test.blockJS) assert(initial.mainTextLength > 1000, `${test.name}: failed/disabled JS hid content`);

    const additional = {};
    if (test.name === 'home-desktop' || test.name === 'home-dark') {
      additional.accentLabelContrast = await evaluate(cdp, `(() => {
        const parse=(s)=>s.match(/[\\d.]+/g).slice(0,3).map(Number),lum=(c)=>{const v=parse(c).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]},ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
        const label=document.querySelector('.creative-card--poem > p:first-child'),card=document.querySelector('.creative-card--poem');return {foreground:getComputedStyle(label).color,background:getComputedStyle(card).backgroundColor,ratio:ratio(getComputedStyle(label).color,getComputedStyle(card).backgroundColor)};
      })()`);
      assert(additional.accentLabelContrast.ratio >= 4.5, `${test.name}: small accent label contrast ${additional.accentLabelContrast.ratio.toFixed(2)}`);
    }
    if (test.menu) {
      if (!initial.menu.open) {
        await evaluate(cdp, `document.querySelector('[data-site-menu] summary').click()`);
        await sleep(180);
      }
      additional.menuOpen = await evaluate(cdp, inspectExpression);
      assert(additional.menuOpen.menu.open, `${test.name}: menu did not open`);
      assert(additional.menuOpen.menu.links.length === 6, `${test.name}: menu link count is not six`);
      for (const link of additional.menuOpen.menu.links) {
        assert(link.x >= 0 && link.right <= test.width + 1, `${test.name}: clipped menu link ${link.text}`);
        assert(link.height >= 44, `${test.name}: menu target below 44px: ${link.text}`);
      }
      assert(additional.menuOpen.menu.box.bottom <= test.height + 1, `${test.name}: menu panel clipped below viewport`);
      await screenshot(cdp, `${test.name}-menu-open`);
      if (!test.noJS) {
        await cdp.send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
        await sleep(80);
        additional.afterEscape = await evaluate(cdp, inspectExpression);
        assert(!additional.afterEscape.menu.open, `${test.name}: Escape did not close open menu`);
      }
    }
    if (test.keyboard) {
      additional.focus = await evaluate(cdp, `(() => {const e=document.querySelector('.skip-link');e.focus();const r=e.getBoundingClientRect();return {tag:document.activeElement.tagName,text:document.activeElement.textContent.trim(),top:r.top,outline:getComputedStyle(e).outlineStyle};})()`);
      assert(additional.focus.tag === 'A' && additional.focus.top >= 0 && additional.focus.outline !== 'none', `${test.name}: skip link focus treatment failed`);
      await evaluate(cdp, `document.activeElement.blur()`);
      await cdp.send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
      additional.desktopAfterEscape = await evaluate(cdp, inspectExpression);
      assert(additional.desktopAfterEscape.menu.visible, `${test.name}: desktop Escape incorrectly hid primary navigation`);
    }
    if (test.hover) {
      const point = await evaluate(cdp, `(() => {const r=document.querySelector('.project-card').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await cdp.send('Input.dispatchMouseEvent', { type:'mouseMoved', x:point.x, y:point.y });
      await sleep(200);
      additional.hover = await evaluate(cdp, `(() => {
        const parse=(s)=>s.match(/[\\d.]+/g).slice(0,3).map(Number),lum=(c)=>{const v=parse(c).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]},ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
        const card=document.querySelector('.project-card'),title=card.querySelector('h3 a');return {background:getComputedStyle(card).backgroundColor,text:getComputedStyle(title).color,contrast:ratio(getComputedStyle(card).backgroundColor,getComputedStyle(title).color)};
      })()`);
      assert(additional.hover.contrast >= 4.5, `${test.name}: project hover contrast ${additional.hover.contrast.toFixed(2)}`);
      await screenshot(cdp, `${test.name}-project-hover`);
    }
    if (test.reduced) {
      additional.motion = await evaluate(cdp, `parseFloat(getComputedStyle(document.querySelector('.project-card')).transitionDuration)`);
      assert(additional.motion <= 0.001, `${test.name}: reduced-motion override not applied (${additional.motion}s)`);
    }
    if (test.full) await screenshot(cdp, `${test.name}-full`, true);
    report.push({ test, initial, additional, errors, consoleErrors, failures, responses });
    await fetch(`${DEBUG}/json/close/${target.id}`);
    cdp.close();
    console.log(`PASS browser: ${test.name} (${initial.viewport.width}×${initial.viewport.height}, page ${initial.pageHeight}px)`);
  }
  await fs.writeFile(`${QA}/browser-report.json`, JSON.stringify(report, null, 2));
  console.log(`PASS browser: ${routes.length} route responses + designed 404`);
  console.log(`Screenshots and report: ${QA}`);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await fs.writeFile(`${QA}/server.log`, serverLog);
  await fs.writeFile(`${QA}/chrome.log`, chromeLog);
  if (chrome.exitCode === null) { const ended = once(chrome, 'exit'); chrome.kill('SIGTERM'); await Promise.race([ended, sleep(3000)]); }
  if (server.exitCode === null) { const ended = once(server, 'exit'); server.kill('SIGTERM'); await Promise.race([ended, sleep(3000)]); }
  if (failure) console.error(`Browser smoke failed: ${failure.message}`);
}

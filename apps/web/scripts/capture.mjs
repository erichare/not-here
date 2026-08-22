#!/usr/bin/env node
/**
 * Refresh docs/screenshots from the live dev server — zero dependencies.
 *
 * Drives headless Chrome over the DevTools protocol: walks the engine to a
 * target scene in-process, seeds that save into localStorage, clicks the
 * window to resume, lets the page settle, captures. Desktop and phone.
 *
 *   pnpm --filter @not-here/app-web dev          # in another terminal
 *   node apps/web/scripts/capture.mjs            # → docs/screenshots/*.jpg
 *   NH_PROBE=1 node apps/web/scripts/capture.mjs # no shots: a 10 s frame probe + layer audit
 *
 * Env: NH_URL (default http://localhost:5199), NH_OUT (default docs/screenshots),
 *      CHROME (path to the Chrome binary).
 */

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { advance, initialState } from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..');
const URL_ = process.env.NH_URL ?? 'http://localhost:5199';
const OUT = resolve(ROOT, process.env.NH_OUT ?? 'docs/screenshots');
const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const SEED = 1971;

/** Instant text, motion on, the lamp lit: stills want the settled page. */
const SETTINGS = { v: 1, textScale: 1, revealMs: 0, motion: 'on', flicker: 'on', volume: 0.8, muted: false };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ——— engine walk: the first path that reaches a scene ———————————————————

const content = buildContent();

const walkTo = (targets) => {
  const start = advance(content, initialState(SEED, OPENING_SCENE), { kind: 'enter' });
  const seen = new Set();
  const dfs = (step, depth) => {
    if (targets.includes(step.state.sceneId)) return step;
    if (depth > 240 || step.view.ending !== undefined) return null;
    if (seen.has(step.state.sceneId)) return null;
    seen.add(step.state.sceneId);
    for (const choice of step.view.choices) {
      if (choice.locked) continue;
      const next = advance(content, step.state, { kind: 'choose', choiceId: choice.id });
      const hit = dfs(next, depth + 1);
      if (hit) return hit;
    }
    return null;
  };
  const hit = dfs(start, 0);
  if (!hit) throw new Error(`no path to ${targets.join(' | ')}`);
  return hit;
};

// ——— a tiny DevTools client ——————————————————————————————————————————————

const connect = async () => {
  for (let i = 0; i < 60; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error('Chrome did not expose a page target');
};

const client = async (wsUrl) => {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let nextId = 0;
  const pending = new Map();
  const waiters = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(String(m.data));
    if (msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method && waiters.has(msg.method)) {
      for (const w of waiters.get(msg.method)) w(msg.params);
      waiters.delete(msg.method);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++nextId;
      pending.set(id, (msg) => (msg.error ? rej(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : res(msg.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) =>
    new Promise((res) => {
      waiters.set(method, [...(waiters.get(method) ?? []), res]);
    });
  return { send, once, close: () => ws.close() };
};

// ——— the shots ————————————————————————————————————————————————————————————

const main = async () => {
  mkdirSync(OUT, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), 'nh-capture-'));
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--window-size=1440,900',
      '--autoplay-policy=no-user-gesture-required',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  try {
    const cdp = await client(await connect());
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const evaluate = async (expression) => {
      const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'evaluate failed');
      return result.value;
    };
    const navigate = async (url) => {
      const loaded = cdp.once('Page.loadEventFired');
      await cdp.send('Page.navigate', { url });
      await loaded;
      await sleep(300);
    };

    // JPEG, not PNG: the film grain on every stage defeats PNG compression
    // (a 2x PNG of the wharf is ~5 MB; the same frame as JPEG q86 is a tenth).
    const shoot = async ({ file, width, height, mobile = false, dsf = 1.5, seed, before, settle = 2600 }) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile });
      await navigate(URL_);
      const seedJs =
        seed === undefined
          ? ''
          : `localStorage.setItem('not-here:slot1', ${JSON.stringify(JSON.stringify(seed.state))});
             localStorage.setItem('not-here:slot1:margin', ${JSON.stringify(
               JSON.stringify({ v: seed.state.v, sceneId: seed.state.sceneId, events: seed.events }),
             )});`;
      await evaluate(`localStorage.clear(); ${seedJs} localStorage.setItem('not-here:settings', ${JSON.stringify(JSON.stringify(SETTINGS))}); 'seeded'`);
      await navigate(URL_);
      await sleep(700);
      if (seed !== undefined) {
        await evaluate(`(document.querySelector('.title-page button') ?? document.querySelector('#reading button')).click(); 'clicked'`);
        await sleep(1200);
      }
      if (before !== undefined) await before(evaluate);
      await sleep(settle);
      const scene = await evaluate(
        `document.querySelector('main.page')?.dataset.scene ?? (document.querySelector('.title-page') ? 'title' : 'none')`,
      );
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
      writeFileSync(join(OUT, file), Buffer.from(data, 'base64'));
      console.log(`${file.padEnd(18)} ${width}x${height}  ${scene}`);
    };

    // NH_PROBE=1: no shots — ten seconds of frames on the Kettle while the
    // typewriter runs, plus the fixed-layer and backdrop-filter audit.
    if (process.env.NH_PROBE === '1') {
      const kettleSeed = walkTo(['d12-counter', 'd11-counter', 'd9-walkin', 'd18-kettle']);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await navigate(URL_);
      await evaluate(`localStorage.clear();
        localStorage.setItem('not-here:slot1', ${JSON.stringify(JSON.stringify(kettleSeed.state))});
        localStorage.setItem('not-here:settings', ${JSON.stringify(JSON.stringify({ ...SETTINGS, revealMs: 26 }))}); 'seeded'`);
      await navigate(URL_);
      await sleep(700);
      await evaluate(`document.querySelector('.title-page button').click(); 'clicked'`);
      const stats = await evaluate(`new Promise((res) => {
        const frames = [];
        const t0 = performance.now();
        let last = t0;
        const tick = (now) => {
          frames.push(now - last);
          last = now;
          if (now - t0 < 10000) requestAnimationFrame(tick);
          else {
            const big = [...document.querySelectorAll('body *')].filter((e) => {
              const cs = getComputedStyle(e);
              const r = e.getBoundingClientRect();
              return cs.position === 'fixed' && r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
            });
            const backdrop = [...document.querySelectorAll('body *')].filter((e) => {
              const cs = getComputedStyle(e);
              return (cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none');
            }).length;
            res({
              frames: frames.length,
              over20ms: frames.filter((d) => d > 20).length,
              over50ms: frames.filter((d) => d > 50).length,
              maxMs: Math.round(Math.max(...frames)),
              fixedFullLayers: big.length,
              fixedFullIds: big.map((e) => e.id || e.className).slice(0, 12),
              backdropFilters: backdrop,
              animations: document.getAnimations().length,
              scene: document.querySelector('main.page')?.dataset.scene,
            });
          }
        };
        requestAnimationFrame(tick);
      })`);
      console.log(JSON.stringify(stats, null, 2));
      cdp.close();
      return;
    }

    const beach = walkTo(['n1-beach']);
    const timetable = walkTo(['d2-dianne-2']);
    const wharf = walkTo(['d4-wharf']);
    const kettle = walkTo(['d12-counter', 'd11-counter', 'd9-walkin', 'd18-kettle']);
    const openBook = async (evaluate) => {
      await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', bubbles: true })); 'l'`);
    };

    await shoot({ file: 'title.jpg', width: 1440, height: 900 });
    await shoot({ file: 'arrival.jpg', width: 1440, height: 900, seed: beach });
    await shoot({ file: 'timetable.jpg', width: 1440, height: 900, seed: timetable });
    await shoot({ file: 'barbs-book.jpg', width: 1440, height: 900, seed: timetable, before: openBook });
    await shoot({ file: 'wharf.jpg', width: 1440, height: 900, seed: wharf });
    await shoot({ file: 'kettle.jpg', width: 1440, height: 900, seed: kettle });
    await shoot({ file: 'title-phone.jpg', width: 390, height: 844, mobile: true, dsf: 2 });
    await shoot({ file: 'wharf-phone.jpg', width: 390, height: 844, mobile: true, dsf: 2, seed: wharf });
    cdp.close();
  } finally {
    const gone = new Promise((res) => chrome.once('exit', res));
    chrome.kill();
    await Promise.race([gone, sleep(3000)]);
    rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});

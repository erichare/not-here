/**
 * Vite config for @not-here/app-web. The repo-root `auditions/` directory is
 * exposed at `/auditions/<name>.wav` — served by middleware in dev, emitted
 * as bundle assets on build — so audio.ts can fetch cues by name on both
 * paths without symlinks.
 */

import { createReadStream, existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const APP_DIR = dirname(fileURLToPath(import.meta.url));
const AUDITIONS_DIR = resolve(APP_DIR, '../../auditions');

/** Only plain kebab-case wav names — no traversal, no dotfiles. */
const WAV_NAME = /^[a-z0-9][a-z0-9-]*\.wav$/;

const auditionsPlugin = (): Plugin => ({
  name: 'not-here:auditions',

  configureServer(server) {
    server.middlewares.use('/auditions', (req, res, next) => {
      const raw = (req.url ?? '').split('?')[0] ?? '';
      const name = raw.replace(/^\//, '');
      if ((req.method !== 'GET' && req.method !== 'HEAD') || !WAV_NAME.test(name)) {
        next();
        return;
      }
      const path = join(AUDITIONS_DIR, name);
      if (!existsSync(path)) {
        res.statusCode = 404;
        res.end('not here');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'audio/wav');
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      createReadStream(path).pipe(res);
    });
  },

  async generateBundle() {
    let entries;
    try {
      entries = await readdir(AUDITIONS_DIR, { withFileTypes: true });
    } catch {
      // No auditions rendered yet — the app degrades to '♪ cue' captions.
      return;
    }
    for (const entry of entries) {
      if (!entry.isFile() || !WAV_NAME.test(entry.name)) continue;
      this.emitFile({
        type: 'asset',
        fileName: `auditions/${entry.name}`,
        source: new Uint8Array(await readFile(join(AUDITIONS_DIR, entry.name))),
      });
    }
  },
});

export default defineConfig({
  plugins: [auditionsPlugin()],
});

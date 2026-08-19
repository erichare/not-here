// Drives the NOT HERE CLI, always picking the highest-numbered choice.
// Usage: node drive-cli.mjs <output-file>
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const outPath = process.argv[2] ?? '/tmp/driven.txt';
const child = spawn('node', ['apps/cli/src/main.ts'], { cwd: '/Users/erichare/GitHub/not-here' });
const out = createWriteStream(outPath);

let buf = '';
let busy = false;
const strip = (s) => s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');

child.stdout.on('data', (d) => {
  out.write(d);
  buf += d.toString();
  if (busy) return;
  const clean = strip(buf);
  const tail = clean.slice(-300);
  if (/>\s*$/.test(tail) || tail.includes('a number chooses')) {
    busy = true;
    setTimeout(() => {
      const nums = [...clean.matchAll(/^\s*!?\s*(\d+)\.\s+\S/gm)].map((m) => Number(m[1]));
      const pick = nums.length ? Math.max(...nums) : 1;
      console.error(`pick ${pick} of [${nums}]`);
      child.stdin.write(`${pick}\n`);
      buf = '';
      busy = false;
    }, 30);
  }
});

child.on('exit', () => {
  out.end();
  process.exit(0);
});

setTimeout(() => { child.kill('SIGTERM'); out.end(); process.exit(0); }, 240000);

import { spawnSync } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

async function walk(dir, files = []) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) await walk(full, files);
    else if (extname(full) === '.js') files.push(full);
  }
  return files;
}

const files = await walk(SRC);
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || result.stdout || `Failed: ${file}\n`);
  }
}

if (failed) process.exit(1);
console.log(`Typecheck passed (${files.length} JS modules). JSX is validated by the Vite production build.`);

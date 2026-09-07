import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

const FORBIDDEN = [
  { name: 'console.log', pattern: /\bconsole\.(log|debug|info)\s*\(/ },
  { name: 'debugger', pattern: /\bdebugger\b/ },
  { name: 'stitch sample order KS-104', pattern: /\bKS-104\b/ },
  { name: 'Prompt 1 route placeholder', pattern: /RoutePlaceholder/ },
];

async function walk(dir, files = []) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) await walk(full, files);
    else if (/\.(js|jsx)$/.test(extname(full))) files.push(full);
  }
  return files;
}

const files = await walk(SRC);
const hits = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(text)) hits.push(`${file.replace(`${SRC}\\`, '').replace(`${SRC}/`, '')}: ${rule.name}`);
  }
}

if (hits.length) {
  console.error('QA scan failed:\n' + hits.map((line) => `  - ${line}`).join('\n'));
  process.exit(1);
}

console.log(`QA scan passed (${files.length} source files).`);

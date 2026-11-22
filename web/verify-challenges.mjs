// Runs every challenge's reference solutions (JS + Python) through the real test harness.
// Usage: cd web && node verify-challenges.mjs [filter]
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const filter = process.argv[2] || '';
const dataDir = '../src/challenges/data';
const files = readdirSync(dataDir, { recursive: true }).filter((f) => String(f).endsWith('.ts')).map((f) => join(dataDir, String(f))).filter((f) => f.includes(filter)).sort();
const entry = `import { withHarness, PASS_SENTINEL, snake, starterCode } from '../src/challenges/harness';\n` +
  files.map((f, i) => `import m${i} from ${JSON.stringify('../' + f.replace(/^\.\.\//, '').replace(/\.ts$/, ''))};`).join('\n') +
  `\nexport const modules = [${files.map((f, i) => `[${JSON.stringify(f)}, m${i}]`).join(', ')}];\nexport { withHarness, PASS_SENTINEL, snake, starterCode };\n`;

const tmp = mkdtempSync(join(tmpdir(), 'cpverify-'));
writeFileSync(join(process.cwd(), '.verify-entry.ts'), entry);
await build({ entryPoints: ['.verify-entry.ts'], bundle: true, format: 'esm', platform: 'node', outfile: join(tmp, 'bundle.mjs'), logLevel: 'error' });
const { modules, withHarness, PASS_SENTINEL, starterCode } = await import(pathToFileURL(join(tmp, 'bundle.mjs')).href);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let failures = 0, count = 0;
const pyJobs = [];
const seen = new Set();
for (const [file, mod] of modules) {
  if (mod.challenges.length !== 10) { console.log(`! ${file}: ${mod.challenges.length} challenges (expected 10)`); failures++; }
  for (const c of mod.challenges) {
    count++;
    const key = file + ' › ' + c.title;
    if (seen.has(c.title + mod.id + file)) { console.log('! duplicate', key); failures++; }
    seen.add(c.title + mod.id + file);
    if (!c.tests.length) { console.log('! no tests', key); failures++; }
    // Starter code must build without throwing.
    const fake = { ...c, id: 'x', level: 'easy', moduleId: mod.id, moduleTitle: mod.title, index: 1 };
    starterCode(fake, 'javascript'); starterCode(fake, 'python');
    const logs = [];
    const con = { log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push(a.join(' ')), warn: (...a) => logs.push(a.join(' ')) };
    try {
      await new AsyncFunction('input', 'prompt', 'console', withHarness(c, 'javascript', c.js))(() => '', () => '', con);
    } catch (e) { logs.push('THREW ' + e.message); }
    if (!logs.some((l) => l.includes(PASS_SENTINEL))) { failures++; console.log(`✗ JS  ${key}\n    ${logs.filter((l) => !l.startsWith('✓')).join('\n    ')}`); }
    pyJobs.push({ key, code: withHarness(c, 'python', c.py) });
  }
}
const jobsFile = join(tmp, 'jobs.json');
writeFileSync(jobsFile, JSON.stringify(pyJobs));
const driver = `
import json, sys, io, contextlib
jobs = json.load(open(sys.argv[1]))
bad = 0
for j in jobs:
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(j['code'], 'main.py', 'exec'), {'__name__': '__main__'})
    except Exception as e:
        buf.write('THREW %r' % e)
    out = buf.getvalue()
    if ${JSON.stringify(PASS_SENTINEL)} not in out:
        bad += 1
        print('✗ PY  ' + j['key'] + '\\n    ' + '\\n    '.join(l for l in out.splitlines() if not l.startswith('✓')))
print('PYBAD', bad)
`;
writeFileSync(join(tmp, 'driver.py'), driver);
const pyOut = execFileSync('python3', ['-I', join(tmp, 'driver.py'), jobsFile], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const pyBad = Number((pyOut.match(/PYBAD (\d+)/) || [])[1] || 0);
process.stdout.write(pyOut.replace(/PYBAD \d+\n?/, ''));
failures += pyBad;
console.log(`\n${count} challenges in ${modules.length} modules · ${failures ? failures + ' problem(s)' : 'all JS + Python solutions pass'}`);
process.exit(failures ? 1 : 0);

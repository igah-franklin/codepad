// JavaScript execution worker. Runs user code in an isolated Web Worker.
import { parse } from 'acorn';

const send = (kind, text, extra) => postMessage({ kind, text, ...(extra || {}) });

// ---------- Pretty printer (node-inspect-ish) ----------
function fmt(v, depth = 0, seen = new WeakSet(), top = true) {
  const t = typeof v;
  if (v === null) return 'null';
  if (t === 'undefined') return 'undefined';
  if (t === 'string') return top ? v : JSON.stringify(v).replace(/^"|"$/g, "'").replace(/\\"/g, '"');
  if (t === 'number' || t === 'boolean') return Object.is(v, -0) ? '-0' : String(v);
  if (t === 'bigint') return v + 'n';
  if (t === 'symbol') return v.toString();
  if (t === 'function') {
    const isClass = /^class\s/.test(Function.prototype.toString.call(v));
    return isClass ? `[class ${v.name || '(anonymous)'}]` : `[Function: ${v.name || '(anonymous)'}]`;
  }
  if (v instanceof Error) return v.stack && depth === 0 ? cleanStack(v) : `${v.name}: ${v.message}`;
  if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
  if (v instanceof RegExp) return v.toString();
  if (v instanceof Promise) return 'Promise { <pending> }';
  if (seen.has(v)) return '[Circular]';
  if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
  seen.add(v);
  const pad = '  '.repeat(depth + 1);
  const end = '  '.repeat(depth);
  let out;
  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    const arr = Array.from(v);
    const items = arr.slice(0, 100).map((x) => fmt(x, depth + 1, seen, false));
    if (arr.length > 100) items.push(`... ${arr.length - 100} more items`);
    const prefix = Array.isArray(v) ? '' : `${v.constructor.name}(${arr.length}) `;
    const flat = prefix + '[ ' + items.join(', ') + ' ]';
    out = items.length === 0 ? prefix + '[]' : flat.length <= 72 && !flat.includes('\n') ? flat : prefix + '[\n' + pad + items.join(',\n' + pad) + '\n' + end + ']';
  } else if (v instanceof Map) {
    const items = [...v].map(([k, x]) => `${fmt(k, depth + 1, seen, false)} => ${fmt(x, depth + 1, seen, false)}`);
    out = `Map(${v.size}) { ${items.join(', ')} }`;
  } else if (v instanceof Set) {
    const items = [...v].map((x) => fmt(x, depth + 1, seen, false));
    out = `Set(${v.size}) { ${items.join(', ')} }`;
  } else {
    const keys = Object.keys(v);
    const name = v.constructor && v.constructor !== Object ? v.constructor.name + ' ' : '';
    const items = keys.map((k) => {
      const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${key}: ${fmt(v[k], depth + 1, seen, false)}`;
    });
    const flat = name + '{ ' + items.join(', ') + ' }';
    out = items.length === 0 ? name + '{}' : flat.length <= 72 && !flat.includes('\n') ? flat : name + '{\n' + pad + items.join(',\n' + pad) + '\n' + end + '}';
  }
  seen.delete(v);
  return out;
}

const format = (args) => {
  if (typeof args[0] === 'string' && /%[sdifoOc%]/.test(args[0])) {
    let i = 1;
    const first = args[0].replace(/%([sdifoOc%])/g, (m, c) => {
      if (c === '%') return '%';
      if (i >= args.length) return m;
      const a = args[i++];
      if (c === 's') return String(a);
      if (c === 'd' || c === 'i') return String(parseInt(a));
      if (c === 'f') return String(parseFloat(a));
      if (c === 'c') return '';
      return fmt(a, 0, new WeakSet(), false);
    });
    args = [first, ...args.slice(i)];
  }
  return args.map((a) => fmt(a)).join(' ');
};

// ---------- Line mapping ----------
let LINE_OFFSET = 0;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
// Find how many lines the Function wrapper adds before the body.
const probed = new AsyncFunction('input', 'prompt', 'console', 'throw new Error("probe")\n//# sourceURL=probe.js')()
  .catch((e) => { const m = String(e.stack).match(/probe\.js:(\d+)/); if (m) LINE_OFFSET = parseInt(m[1]) - 1; });

function errorLine(e) {
  const m = String(e && e.stack).match(/main\.js:(\d+)(?::(\d+))?/);
  return m ? parseInt(m[1]) - LINE_OFFSET : null;
}
function cleanStack(e) {
  const head = `${e.name || 'Error'}: ${e.message}`;
  const frames = String(e.stack || '')
    .split('\n')
    .filter((l) => /main\.js:\d+/.test(l))
    .map((l) => {
      const m = l.match(/main\.js:(\d+):(\d+)/);
      const fn = (l.match(/at\s+([^\s(]+)\s+\(/) || l.match(/^([^@\s]+)@/) || [])[1];
      const ln = m ? parseInt(m[1]) - LINE_OFFSET : '?';
      const name = fn && !/^(eval|anonymous|async)$/.test(fn) ? fn : '<main>';
      return `    at ${name} (line ${ln}${m ? ':' + m[2] : ''})`;
    });
  return [head, ...frames].join('\n');
}

// ---------- Console ----------
const timers = new Map();
const counts = new Map();
let groupDepth = 0;
const ind = () => '  '.repeat(groupDepth);
const out = (kind) => (...a) => send(kind, ind() + format(a));
const con = {
  log: out('log'), info: out('info'), debug: out('log'), warn: out('warn'), error: out('error'),
  trace: (...a) => send('log', ind() + 'Trace: ' + format(a)),
  dir: (o) => send('log', ind() + fmt(o, 0, new WeakSet(), false)),
  assert: (c, ...a) => { if (!c) send('error', 'Assertion failed' + (a.length ? ': ' + format(a) : '')); },
  clear: () => send('clear', ''),
  group: (...a) => { if (a.length) send('log', ind() + format(a)); groupDepth++; },
  groupCollapsed: (...a) => { if (a.length) send('log', ind() + format(a)); groupDepth++; },
  groupEnd: () => { groupDepth = Math.max(0, groupDepth - 1); },
  time: (l = 'default') => timers.set(l, performance.now()),
  timeLog: (l = 'default') => send('log', `${l}: ${(performance.now() - (timers.get(l) || 0)).toFixed(3)}ms`),
  timeEnd: (l = 'default') => { send('log', `${l}: ${(performance.now() - (timers.get(l) || 0)).toFixed(3)}ms`); timers.delete(l); },
  count: (l = 'default') => { const n = (counts.get(l) || 0) + 1; counts.set(l, n); send('log', `${l}: ${n}`); },
  countReset: (l = 'default') => counts.set(l, 0),
  table: (data) => {
    if (data && typeof data === 'object') {
      const rows = Object.keys(data);
      const cols = new Set();
      rows.forEach((r) => { const v = data[r]; if (v && typeof v === 'object') Object.keys(v).forEach((c) => cols.add(c)); else cols.add('Values'); });
      const header = ['(index)', ...cols];
      const body = rows.map((r) => { const v = data[r]; return [r, ...[...cols].map((c) => (v && typeof v === 'object' ? (c in v ? fmt(v[c], 1, new WeakSet(), false) : '') : c === 'Values' ? fmt(v, 1, new WeakSet(), false) : ''))]; });
      send('table', '', { table: { header, body } });
    } else con.log(data);
  },
};
self.console = con;

// ---------- Timers tracking (so async output finishes before "done") ----------
let pending = 0;
const _st = self.setTimeout, _ct = self.clearTimeout, _si = self.setInterval, _ci = self.clearInterval;
const live = new Set();
self.setTimeout = (fn, ms, ...a) => {
  pending++;
  const id = _st(() => { live.delete(id); pending--; try { typeof fn === 'function' ? fn(...a) : null; } catch (e) { reportError(e); } }, ms);
  live.add(id);
  return id;
};
self.clearTimeout = (id) => { if (live.delete(id)) pending--; _ct(id); };
self.setInterval = (fn, ms, ...a) => {
  pending++;
  const id = _si(() => { try { fn(...a); } catch (e) { reportError(e); } }, ms);
  live.add('i' + id);
  return id;
};
self.clearInterval = (id) => { if (live.delete('i' + id)) pending--; _ci(id); };
self.addEventListener('unhandledrejection', (ev) => { ev.preventDefault(); reportError(ev.reason, 'Uncaught (in promise) '); });

function reportError(e, prefix = '') {
  if (e instanceof Error) {
    send('error', prefix + cleanStack(e), { line: errorLine(e) });
  } else send('error', prefix + 'Uncaught ' + fmt(e, 0, new WeakSet(), false));
}

// ---------- Stdin helpers ----------
let stdin = [];
const readLine = (q) => {
  if (q !== undefined && q !== null && q !== '') send('stdout', String(q));
  const v = stdin.length ? stdin.shift() : null;
  if (v !== null) send('stdin', v + '\n');
  else send('warn', '(no more input — add values in the Input tab)');
  return v;
};
self.prompt = readLine;
self.input = readLine;
self.alert = (m) => send('info', '[alert] ' + String(m));

// ---------- Run ----------
self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  stdin = data.stdin ? data.stdin.replace(/\r/g, '').split('\n') : [];
  if (stdin.length && stdin[stdin.length - 1] === '' && data.stdin.endsWith('\n')) stdin.pop();
  const code = data.code;

  // Syntax check with acorn for precise line/column messages.
  try {
    parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true, allowHashBang: true });
  } catch (e) {
    if (e instanceof SyntaxError && e.loc) {
      const lines = code.split('\n');
      const src = lines[e.loc.line - 1] || '';
      const msg = e.message.replace(/\s*\(\d+:\d+\)$/, '');
      send('error', `SyntaxError: ${msg}\n    at line ${e.loc.line}:${e.loc.column + 1}\n\n  ${src}\n  ${' '.repeat(e.loc.column)}^`, { line: e.loc.line });
      postMessage({ done: true, ok: false, line: e.loc.line });
      return;
    }
  }

  await probed;
  let ok = true;
  let line = null;
  try {
    const fn = new AsyncFunction('input', 'prompt', 'console', code + '\n//# sourceURL=main.js');
    const result = await fn(readLine, readLine, con);
    if (result !== undefined) send('result', fmt(result, 0, new WeakSet(), false));
  } catch (e) {
    ok = false;
    line = errorLine(e);
    reportError(e);
  }
  // Wait for pending timers (bounded by the host's timeout).
  while (pending > 0) await new Promise((r) => _st(r, 20));
  await new Promise((r) => _st(r, 0));
  postMessage({ done: true, ok, line });
};
postMessage({ ready: true });

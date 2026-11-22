// Runner host page: owns the JS and Python workers, enforces timeouts, relays output to React Native.
/* global __JS_WORKER_SRC__, __PY_WORKER_SRC__, __PYODIDE_BASE__ */
const post = (msg) => {
  const s = JSON.stringify(msg);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
  else window.parent && window.parent.postMessage(s, '*');
};

const jsUrl = URL.createObjectURL(new Blob([__JS_WORKER_SRC__], { type: 'text/javascript' }));
const pyUrl = URL.createObjectURL(new Blob([`self.PYODIDE_BASE=${JSON.stringify(__PYODIDE_BASE__)};\n` + __PY_WORKER_SRC__], { type: 'text/javascript' }));

const workers = { javascript: null, python: null };
let current = null; // { id, language, timer, start }
let pyStatus = 'idle';

function setPyStatus(s, message) {
  pyStatus = s;
  post({ type: 'pyStatus', status: s, message });
}

function spawn(language) {
  const w = language === 'python' ? new Worker(pyUrl, { type: 'module' }) : new Worker(jsUrl);
  w.onmessage = ({ data }) => {
    if (data.pyStatus) { setPyStatus(data.pyStatus, data.message); return; }
    if (data.ready) return;
    if (!current || current.language !== language) return;
    if (data.done) { finish(data.ok, data.line); return; }
    enqueue({ kind: data.kind, text: data.text, data: data.data, table: data.table, line: data.line });
  };
  w.onerror = (e) => {
    e.preventDefault();
    if (current && current.language === language) {
      post({ type: 'event', id: current.id, kind: 'error', text: String(e.message || 'Worker error') });
      finish(false, null);
    }
  };
  workers[language] = w;
  return w;
}

// ---- Output batching: keeps the RN bridge fast even for print-heavy loops ----
const MAX_OUTPUT = 1_000_000; // characters per run
let buf = [];
let flushTimer = null;
let outSize = 0;
let truncated = false;
function enqueue(ev) {
  if (!current) return;
  const size = (ev.text ? ev.text.length : 0) + (ev.data ? 2000 : 0);
  if (outSize + size > MAX_OUTPUT) {
    if (!truncated) { truncated = true; buf.push({ kind: 'warn', text: '… output truncated (over 1M characters). The program is still running — tap Stop to end it.' }); }
  } else {
    outSize += size;
    const last = buf[buf.length - 1];
    if (last && (ev.kind === 'stdout' || ev.kind === 'stderr') && last.kind === ev.kind) last.text += ev.text;
    else buf.push(ev);
  }
  if (!flushTimer) flushTimer = setTimeout(flush, 40);
}
function flush() {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (!buf.length || !current) { buf = []; return; }
  post({ type: 'events', id: current.id, events: buf });
  buf = [];
}

function get(language) { return workers[language] || spawn(language); }

function finish(ok, line, reason) {
  if (!current) return;
  flush();
  clearTimeout(current.timer);
  const ms = Math.round(performance.now() - current.start);
  post({ type: 'done', id: current.id, ok, line: line || null, ms, reason: reason || null });
  current = null;
}

function kill(language, reason) {
  const w = workers[language];
  if (w) w.terminate();
  workers[language] = null;
  if (language === 'python') {
    setPyStatus('idle', 'Python stopped');
  }
  finish(false, null, reason);
  // Warm a fresh worker so the next run is quick.
  if (language === 'python') get('python').postMessage({ type: 'preload' });
  else get('javascript');
}

function run({ id, language, code, stdin, timeoutMs }) {
  if (current) kill(current.language, 'replaced');
  const w = get(language);
  current = { id, language, start: performance.now(), timer: null };
  buf = []; outSize = 0; truncated = false;
  // Python timeout starts after the runtime is ready.
  const arm = () => {
    if (!current || current.id !== id) return;
    current.start = performance.now();
    current.timer = setTimeout(() => {
      if (current && current.id === id) {
        flush(); post({ type: 'event', id, kind: 'error', text: `⏱ Execution stopped after ${Math.round(timeoutMs / 1000)}s (time limit). Check for infinite loops, or raise the limit in Settings.` });
        kill(language, 'timeout');
      }
    }, timeoutMs);
  };
  if (language === 'python' && pyStatus !== 'ready') {
    const wait = setInterval(() => {
      if (!current || current.id !== id) return clearInterval(wait);
      if (pyStatus === 'ready' || pyStatus === 'error') { clearInterval(wait); arm(); }
    }, 100);
  } else arm();
  w.postMessage({ type: 'run', code, stdin });
}

function handle(raw) {
  let msg;
  try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return; }
  if (!msg || !msg.type) return;
  if (msg.type === 'run') run(msg);
  else if (msg.type === 'stop') { if (current) { flush(); post({ type: 'event', id: current.id, kind: 'warn', text: '■ Stopped by user' }); kill(current.language, 'stopped'); } }
  else if (msg.type === 'preload') { if (msg.language === 'python' && pyStatus !== 'ready' && pyStatus !== 'loading') get('python').postMessage({ type: 'preload' }); }
  else if (msg.type === 'restartPython') { if (current && current.language === 'python') kill('python', 'restart'); else { if (workers.python) workers.python.terminate(); workers.python = null; setPyStatus('idle'); get('python').postMessage({ type: 'preload' }); } }
}
window.addEventListener('message', (e) => handle(e.data));
document.addEventListener('message', (e) => handle(e.data));
window.__runnerHandle = handle;
get('javascript');
post({ type: 'runnerReady' });

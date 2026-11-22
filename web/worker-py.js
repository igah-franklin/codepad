// Python execution worker powered by Pyodide (CPython compiled to WebAssembly).
const PYODIDE_URL = self.PYODIDE_BASE + 'pyodide.mjs';
const send = (kind, text, extra) => postMessage({ kind, text, ...(extra || {}) });
const status = (s, message) => postMessage({ pyStatus: s, message });

let py = null;
let stdin = [];
const decoder = new TextDecoder();

const PRELUDE = `
import sys, io, base64, os
os.environ.setdefault("MPLBACKEND", "AGG")

def __codepad_emit_figures():
    if "matplotlib.pyplot" not in sys.modules:
        return
    import matplotlib.pyplot as plt
    for n in plt.get_fignums():
        fig = plt.figure(n)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=120, bbox_inches="tight", facecolor="white")
        __codepad_image(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")

def __codepad_patch_mpl():
    if "matplotlib" in sys.modules:
        import matplotlib
        matplotlib.use("AGG")
        import matplotlib.pyplot as plt
        plt.show = lambda *a, **k: __codepad_emit_figures()

def __codepad_clean_tb(tb):
    lines = tb.splitlines()
    out, keep = [], False
    for i, line in enumerate(lines):
        if line.startswith("Traceback"):
            out.append(line); continue
        if 'File "main.py"' in line or 'File "<exec>"' in line:
            keep = True
        elif line.strip().startswith("File ") and ("/lib/python" in line or "_pyodide" in line):
            keep = False
            continue
        if keep or not line.startswith("  "):
            out.append(line.replace('File "<exec>"', 'File "main.py"'))
    return "\\n".join(out)
`;

async function boot() {
  if (py) return py;
  status('loading', 'Downloading Python runtime…');
  const { loadPyodide } = await import(PYODIDE_URL);
  status('loading', 'Starting Python…');
  py = await loadPyodide({ indexURL: self.PYODIDE_BASE });
  py.setStdout({ write: (buf) => { send('stdout', decoder.decode(buf)); return buf.length; } });
  py.setStderr({ write: (buf) => { send('stderr', decoder.decode(buf)); return buf.length; } });
  py.setStdin({
    stdin: () => {
      if (!stdin.length) { send('warn', '\n(no more input — add values in the Input tab)\n'); return null; }
      const v = stdin.shift();
      send('stdin', v + '\n');
      return v + '\n';
    },
    autoEOF: true,
  });
  py.globals.set('__codepad_image', (b64) => send('image', '', { data: b64 }));
  await py.runPythonAsync(PRELUDE);
  status('ready', `Python ${py.runPython('import sys; sys.version.split()[0]')} ready`);
  return py;
}

let booting = null;
const ensure = () => (booting = booting || boot().catch((e) => { booting = null; status('error', String(e && e.message || e)); throw e; }));

self.onmessage = async ({ data }) => {
  if (data.type === 'preload') { ensure().catch(() => {}); return; }
  if (data.type !== 'run') return;
  try {
    await ensure();
  } catch (e) {
    send('error', 'Could not start Python. The runtime downloads once (~10 MB) — check your internet connection and try again.\n\n' + String(e && e.message || e));
    postMessage({ done: true, ok: false });
    return;
  }
  stdin = data.stdin ? data.stdin.replace(/\r/g, '').split('\n') : [];
  if (stdin.length && stdin[stdin.length - 1] === '') stdin.pop();
  const code = data.code;

  // Auto-install packages that ship with Pyodide (numpy, pandas, matplotlib, …)
  try {
    await py.loadPackagesFromImports(code, {
      messageCallback: (m) => { if (/^Loading|^Loaded/.test(m)) send('system', m); },
      errorCallback: (m) => send('warn', m),
    });
  } catch (e) {
    send('warn', 'Package load failed: ' + (e && e.message || e));
  }

  const ns = py.toPy({ __name__: '__main__' });
  let ok = true;
  let line = null;
  try {
    if (/matplotlib/.test(code)) {
      await py.runPythonAsync('import matplotlib\nmatplotlib.use("AGG")\nimport matplotlib.pyplot\n__codepad_patch_mpl()');
    }
    const result = await py.runPythonAsync(code, { globals: ns, filename: 'main.py' });
    if (result !== undefined && result !== null) {
      try {
        const r = py.globals.get('repr')(result);
        send('result', String(r));
      } catch { send('result', String(result)); }
      if (result && result.destroy) result.destroy();
    }
  } catch (e) {
    ok = false;
    const raw = String(e && e.message || e);
    let clean = raw;
    try { clean = py.globals.get('__codepad_clean_tb')(raw); } catch {}
    const matches = [...raw.matchAll(/File "(?:main\.py|<exec>)", line (\d+)/g)];
    if (matches.length) line = parseInt(matches[matches.length - 1][1]);
    send('error', clean.trim(), { line });
  } finally {
    try { py.runPython('__codepad_emit_figures()'); } catch {}
    try { py.runPython('import sys; sys.stdout.flush(); sys.stderr.flush()'); } catch {}
    ns.destroy && ns.destroy();
  }
  postMessage({ done: true, ok, line });
};

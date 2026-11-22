// Builds starter code for a challenge and the hidden test harness that is appended when it runs.
// The harness prints one line per test and ends with PASS_SENTINEL when every test passes.
import type { Language } from '../theme';
import type { Challenge, ChallengeDef } from './types';

export const PASS_SENTINEL = 'All tests passed';

export const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase();
export const isClass = (c: Pick<ChallengeDef, 'methods'>) => !!c.methods;
/** Name of the function/class in a language. */
export const nameIn = (c: Pick<ChallengeDef, 'fn' | 'methods'>, lang: Language) => (lang === 'python' && !isClass(c) ? snake(c.fn) : c.fn);

const short = (s: string, n = 160) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const j = (v: unknown) => JSON.stringify(v);

/** "twoSum([2,7,11,15], 9) → [0,1]" */
export function exampleLine(c: ChallengeDef, test: ChallengeDef['tests'][number], lang: Language) {
  if (isClass(c)) {
    const [ops, argLists] = test[0] as [string[], unknown[][]];
    const outs = test[1] as unknown[];
    return ops.map((op, i) => {
      const call = i === 0 ? `new ${op}(${(argLists[i] || []).map(j).join(', ')})` : `.${lang === 'python' ? snake(op) : op}(${(argLists[i] || []).map(j).join(', ')})`;
      return outs[i] === null || i === 0 ? call : `${call} → ${j(outs[i])}`;
    }).join('\n');
  }
  return `${nameIn(c, lang)}(${test[0].map(j).join(', ')}) → ${j(test[1])}`;
}

function wrap(text: string, width = 72) {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if ((line + ' ' + word).trim().length > width) { out.push(line.trim()); line = word; } else line += ' ' + word;
    }
    out.push(line.trim());
  }
  return out;
}

const LIST_JS = `class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}`;
const TREE_JS = `class TreeNode {
  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}`;
const LIST_PY = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`;
const TREE_PY = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right`;

function usedTypes(c: ChallengeDef) {
  const all = [...(c.types?.args || []), c.types?.ret];
  return { list: all.includes('list'), tree: all.includes('tree') };
}

export function starterCode(c: Challenge, lang: Language) {
  const cm = lang === 'python' ? '#' : '//';
  const lines: string[] = [];
  lines.push(`${cm} ${c.title}  ·  ${c.level[0].toUpperCase() + c.level.slice(1)} · ${c.moduleTitle}`);
  lines.push(cm);
  for (const l of wrap(c.prompt)) lines.push(l ? `${cm} ${l}` : cm);
  const ex = c.tests.slice(0, isClass(c) ? 1 : 2);
  if (ex.length) {
    lines.push(cm);
    lines.push(`${cm} Example${ex.length > 1 ? 's' : ''}:`);
    for (const t of ex) for (const l of exampleLine(c, t, lang).split('\n')) lines.push(`${cm}   ${short(l, 90)}`);
  }
  lines.push(cm);
  lines.push(`${cm} Tap ▶ Run to test your solution against ${c.tests.length} test cases.`);
  lines.push('');
  const { list, tree } = usedTypes(c);
  if (list) lines.push(lang === 'python' ? LIST_PY : LIST_JS, '');
  if (tree) lines.push(lang === 'python' ? TREE_PY : TREE_JS, '');
  if (lang === 'python') {
    const args = c.args.map(snake);
    if (c.methods) {
      lines.push(`class ${c.fn}:`);
      lines.push(`    def __init__(self${args.map((a) => ', ' + a).join('')}):`, '        pass');
      for (const m of c.methods) lines.push('', `    def ${snake(m.name)}(self${m.args.map((a) => ', ' + snake(a)).join('')}):`, '        pass');
    } else {
      lines.push(`def ${snake(c.fn)}(${args.join(', ')}):`, '    pass');
    }
  } else if (c.methods) {
    lines.push(`class ${c.fn} {`, `  constructor(${c.args.join(', ')}) {`, '  }');
    for (const m of c.methods) lines.push('', `  ${m.name}(${m.args.join(', ')}) {`, '  }');
    lines.push('}');
  } else {
    lines.push(`function ${c.fn}(${c.args.join(', ')}) {`, '  ', '}');
  }
  return lines.join('\n') + '\n';
}

function config(c: ChallengeDef) {
  return {
    title: c.title,
    fn: c.fn,
    py: nameIn(c, 'python'),
    cls: isClass(c),
    tests: c.tests,
    compare: c.compare || 'exact',
    argTypes: c.types?.args || [],
    ret: c.types?.ret || null,
  };
}

const JS_HARNESS = `
;{
const __cfg = __CFG__;
const __fn = typeof __NAME__ !== 'undefined' ? __NAME__ : undefined;
if (typeof ListNode === 'undefined') globalThis.ListNode = class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } };
if (typeof TreeNode === 'undefined') globalThis.TreeNode = class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } };
const __LN = ListNode, __TN = TreeNode;
const __toList = (a) => { let h = null; for (let i = a.length - 1; i >= 0; i--) h = new __LN(a[i], h); return h; };
const __fromList = (n) => { const out = []; let guard = 0; while (n && guard++ < 10000) { out.push(n.val); n = n.next; } return out; };
const __toTree = (a) => {
  if (!a.length || a[0] === null) return null;
  const root = new __TN(a[0]); const q = [root]; let i = 1;
  while (q.length && i < a.length) {
    const n = q.shift();
    if (i < a.length && a[i] !== null) { n.left = new __TN(a[i]); q.push(n.left); } i++;
    if (i < a.length && a[i] !== null) { n.right = new __TN(a[i]); q.push(n.right); } i++;
  }
  return root;
};
const __fromTree = (r) => {
  const out = []; const q = [r];
  while (q.length) { const n = q.shift(); if (n) { out.push(n.val); q.push(n.left || null, n.right || null); } else out.push(null); }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
};
const __in = (v, t) => (t === 'list' ? __toList(v) : t === 'tree' ? __toTree(v) : v);
const __out = (v, t) => (t === 'list' ? __fromList(v) : t === 'tree' ? __fromTree(v) : v);
const __canon = (v) => {
  if (v === undefined) return null;
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  if (v instanceof Set) v = [...v];
  if (Array.isArray(v)) return v.map(__canon);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v).sort()) o[k] = __canon(v[k]); return o; }
  return v;
};
const __key = (v) => JSON.stringify(v);
const __cmp = (a, b) => { const x = __key(a), y = __key(b); return x < y ? -1 : x > y ? 1 : 0; };
const __prep = (v, mode) => {
  v = __canon(v);
  if (!Array.isArray(v)) return v;
  if (mode === 'unordered') return [...v].sort(__cmp);
  if (mode === 'unorderedDeep') return v.map((x) => (Array.isArray(x) ? [...x].sort(__cmp) : x)).sort(__cmp);
  return v;
};
const __near = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => __near(x, b[i]));
  return __key(a) === __key(b);
};
const __eq = (got, exp, mode) => (mode === 'float' ? __near(__canon(got), __canon(exp)) : __key(__prep(got, mode)) === __key(__prep(exp, mode)));
const __show = (v) => { try { const s = JSON.stringify(__canon(v)); return s.length > 200 ? s.slice(0, 199) + '…' : s; } catch { return String(v); } };
const __clone = (v) => JSON.parse(JSON.stringify(v));
(() => {
  if (typeof __fn !== 'function') { console.error('✗ Could not find ' + (__cfg.cls ? 'class ' : 'function ') + __cfg.fn + '(). Keep the original name so the tests can call it.'); return; }
  console.log('🧪 Testing ' + __cfg.fn + ' against ' + __cfg.tests.length + ' cases');
  let passed = 0;
  __cfg.tests.forEach(([args, expected], i) => {
    let got, err = null, label;
    try {
      if (__cfg.cls) {
        const [ops, argLists] = args;
        label = ops.map((op, k) => op + '(' + (argLists[k] || []).map((a) => JSON.stringify(a)).join(', ') + ')').join(', ');
        const obj = new __fn(...__clone(argLists[0] || []));
        got = [null];
        for (let k = 1; k < ops.length; k++) { const r = obj[ops[k]](...__clone(argLists[k] || [])); got.push(r === undefined ? null : r); }
      } else {
        label = __cfg.fn + '(' + args.map((a) => JSON.stringify(a)).join(', ') + ')';
        const input = __clone(args).map((a, k) => __in(a, __cfg.argTypes[k]));
        got = __out(__fn(...input), __cfg.ret);
      }
    } catch (e) { err = e; }
    if (label.length > 200) label = label.slice(0, 199) + '…';
    if (!err && __eq(got, expected, __cfg.compare)) { passed++; console.log('✓ Test ' + (i + 1) + ' passed'); }
    else {
      console.error('✗ Test ' + (i + 1) + ' failed\\n   input:    ' + label + '\\n   expected: ' + __show(expected) + '\\n   ' + (err ? 'error:    ' + (err && err.message ? err.message : String(err)) : 'got:      ' + __show(got)));
    }
  });
  if (passed === __cfg.tests.length) console.log('✅ ${PASS_SENTINEL} (' + passed + '/' + passed + ') — challenge solved!');
  else console.warn('❌ ' + passed + '/' + __cfg.tests.length + ' tests passed. Keep going!');
})();
}
`;

const PY_HARNESS = `

def __codepad_tests():
    import json, re
    cfg = json.loads(__CFG__)
    g = globals()
    camel_to_snake = lambda s: re.sub(r'([A-Z])([A-Z][a-z])', r'\\1_\\2', re.sub(r'([a-z0-9])([A-Z])', r'\\1_\\2', s)).lower()
    fn = g.get(cfg['py']) or g.get(cfg['fn'])
    LN = g.get('ListNode')
    if LN is None:
        class LN:
            def __init__(self, val=0, next=None):
                self.val = val; self.next = next
    TN = g.get('TreeNode')
    if TN is None:
        class TN:
            def __init__(self, val=0, left=None, right=None):
                self.val = val; self.left = left; self.right = right
    g.setdefault('ListNode', LN)
    g.setdefault('TreeNode', TN)
    def to_list(a):
        h = None
        for v in reversed(a):
            h = LN(v, h)
        return h
    def from_list(n):
        out, guard = [], 0
        while n is not None and guard < 10000:
            out.append(n.val); n = n.next; guard += 1
        return out
    def to_tree(a):
        if not a or a[0] is None:
            return None
        root = TN(a[0]); q = [root]; i = 1
        while q and i < len(a):
            n = q.pop(0)
            if i < len(a) and a[i] is not None:
                n.left = TN(a[i]); q.append(n.left)
            i += 1
            if i < len(a) and a[i] is not None:
                n.right = TN(a[i]); q.append(n.right)
            i += 1
        return root
    def from_tree(r):
        out, q = [], [r]
        while q:
            n = q.pop(0)
            if n is not None:
                out.append(n.val); q.append(n.left); q.append(n.right)
            else:
                out.append(None)
        while out and out[-1] is None:
            out.pop()
        return out
    conv_in = lambda v, t: to_list(v) if t == 'list' else to_tree(v) if t == 'tree' else v
    conv_out = lambda v, t: from_list(v) if t == 'list' else from_tree(v) if t == 'tree' else v
    def canon(v):
        if isinstance(v, bool) or v is None or isinstance(v, str):
            return v
        if isinstance(v, float):
            if v != v or v in (float('inf'), float('-inf')):
                return 'NaN' if v != v else ('Infinity' if v > 0 else '-Infinity')
            return int(v) if v.is_integer() and abs(v) < 2 ** 53 else v
        if isinstance(v, int):
            return v
        if isinstance(v, dict):
            return {str(k): canon(x) for k, x in v.items()}
        if isinstance(v, (list, tuple, set, frozenset)):
            items = [canon(x) for x in v]
            return sorted(items, key=key) if isinstance(v, (set, frozenset)) else items
        return v
    key = lambda v: json.dumps(v, sort_keys=True)
    def prep(v, mode):
        v = canon(v)
        if not isinstance(v, list):
            return v
        if mode == 'unordered':
            return sorted(v, key=key)
        if mode == 'unorderedDeep':
            return sorted([sorted(x, key=key) if isinstance(x, list) else x for x in v], key=key)
        return v
    def near(a, b):
        if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool):
            return abs(a - b) <= 1e-6 * max(1, abs(b))
        if isinstance(a, list) and isinstance(b, list):
            return len(a) == len(b) and all(near(a[i], b[i]) for i in range(len(a)))
        return key(a) == key(b)
    def eq(got, exp, mode):
        if mode == 'float':
            return near(canon(got), canon(exp))
        try:
            return key(prep(got, mode)) == key(prep(exp, mode))
        except TypeError:
            return False
    def show(v):
        try:
            s = json.dumps(canon(v))
        except Exception:
            s = repr(v)
        return s if len(s) <= 200 else s[:199] + '…'
    if fn is None:
        print('✗ Could not find ' + ('class ' if cfg['cls'] else 'function ') + cfg['py'] + '(). Keep the original name so the tests can call it.')
        return
    print('🧪 Testing ' + cfg['py'] + ' against ' + str(len(cfg['tests'])) + ' cases')
    passed = 0
    for i, (args, expected) in enumerate(cfg['tests']):
        err = None; got = None
        try:
            if cfg['cls']:
                ops, arg_lists = args
                label = ', '.join(op + '(' + ', '.join(json.dumps(a) for a in (arg_lists[k] if k < len(arg_lists) else [])) + ')' for k, op in enumerate(ops))
                obj = fn(*json.loads(json.dumps(arg_lists[0] if arg_lists else [])))
                got = [None]
                for k in range(1, len(ops)):
                    m = getattr(obj, camel_to_snake(ops[k]), None) or getattr(obj, ops[k])
                    got.append(m(*json.loads(json.dumps(arg_lists[k] if k < len(arg_lists) else []))))
            else:
                label = cfg['py'] + '(' + ', '.join(json.dumps(a) for a in args) + ')'
                data = json.loads(json.dumps(args))
                inp = [conv_in(a, cfg['argTypes'][k] if k < len(cfg['argTypes']) else None) for k, a in enumerate(data)]
                got = conv_out(fn(*inp), cfg['ret'])
        except Exception as e:
            err = e
        if len(label) > 200:
            label = label[:199] + '…'
        if err is None and eq(got, expected, cfg['compare']):
            passed += 1
            print('✓ Test %d passed' % (i + 1))
        else:
            detail = ('error:    %s: %s' % (type(err).__name__, err)) if err is not None else ('got:      ' + show(got))
            print('✗ Test %d failed\\n   input:    %s\\n   expected: %s\\n   %s' % (i + 1, label, show(expected), detail))
    if passed == len(cfg['tests']):
        print('✅ ${PASS_SENTINEL} (%d/%d) — challenge solved!' % (passed, passed))
    else:
        print('❌ %d/%d tests passed. Keep going!' % (passed, len(cfg['tests'])))

__codepad_tests()
del __codepad_tests
`;

/** The user's code followed by the hidden test harness. */
export function withHarness(c: ChallengeDef, lang: Language, code: string) {
  const cfg = JSON.stringify(config(c));
  if (lang === 'python') return code + '\n' + PY_HARNESS.replace('__CFG__', () => JSON.stringify(cfg));
  const name = c.fn;
  return code + '\n' + JS_HARNESS.replace('__CFG__', () => cfg).replace(/__NAME__/g, () => name);
}

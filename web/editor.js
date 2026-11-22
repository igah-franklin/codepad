// CodeMirror 6 editor that runs inside a React Native WebView.
// Messages in (from RN):  {type:'init'|'setDoc'|'setLanguage'|'setOptions'|'insert'|'command'|'focus'|'blur'|'gotoLine'|'markError'}
// Messages out (to RN):   {type:'ready'|'change'|'cursor'|'focus'|'blur'}
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  drawSelection, dropCursor, rectangularSelection, highlightSpecialChars, Decoration,
} from '@codemirror/view';
import {
  defaultKeymap, history, historyKeymap, indentWithTab, undo, redo, toggleComment,
  indentMore, indentLess, selectAll, cursorLineBoundaryBackward, cursorLineBoundaryForward,
} from '@codemirror/commands';
import {
  indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting,
  defaultHighlightStyle, HighlightStyle, indentUnit,
} from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches, openSearchPanel, search } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { tags as t } from '@lezer/highlight';

const post = (msg) => {
  const s = JSON.stringify(msg);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
  else window.parent && window.parent.postMessage(s, '*');
};

// ---------- Themes ----------
const palettes = {
  dark: {
    bg: '#0E1117', fg: '#E6EDF3', gutter: '#5C6573', gutterBg: '#0E1117', activeLine: '#161B24',
    selection: '#2A3B5C', cursor: '#7CF5C3', match: '#2C3E2F',
    kw: '#FF7AB2', str: '#A5E075', num: '#FFB86B', com: '#5F6B7C', fn: '#7CC7FF', type: '#C9A2FF',
    prop: '#9CDCFE', op: '#E6EDF3', bool: '#FFB86B', def: '#7CF5C3',
  },
  light: {
    bg: '#FFFFFF', fg: '#1F2328', gutter: '#A0A7B1', gutterBg: '#FFFFFF', activeLine: '#F4F6FA',
    selection: '#CFE3FF', cursor: '#0A7D5A', match: '#E3F4E8',
    kw: '#C2185B', str: '#2E7D32', num: '#D35400', com: '#9AA3AE', fn: '#1565C0', type: '#7B1FA2',
    prop: '#00695C', op: '#1F2328', bool: '#D35400', def: '#0A7D5A',
  },
};

function makeTheme(name, fontSize) {
  const p = palettes[name] || palettes.dark;
  const theme = EditorView.theme({
    '&': { color: p.fg, backgroundColor: p.bg, height: '100%', fontSize: fontSize + 'px' },
    '.cm-scroller': {
      fontFamily: "'JetBrains Mono', ui-monospace, Menlo, 'Roboto Mono', monospace",
      lineHeight: '1.6', overscrollBehavior: 'contain',
    },
    '.cm-content': { caretColor: p.cursor, padding: '10px 0 40vh 0' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: p.cursor, borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: p.selection + ' !important' },
    '.cm-activeLine': { backgroundColor: p.activeLine },
    '.cm-activeLineGutter': { backgroundColor: p.activeLine, color: p.fg },
    '.cm-gutters': { backgroundColor: p.gutterBg, color: p.gutter, border: 'none', paddingLeft: '4px' },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', padding: '0 6px 0 2px' },
    '.cm-foldGutter .cm-gutterElement': { width: '12px', color: p.gutter },
    '.cm-selectionMatch': { backgroundColor: p.match },
    '&.cm-focused .cm-matchingBracket': { backgroundColor: p.match, outline: '1px solid ' + p.cursor + '66' },
    '.cm-tooltip': { backgroundColor: name === 'dark' ? '#1A2030' : '#FFFFFF', border: '1px solid ' + (name === 'dark' ? '#2A3245' : '#E1E5EB'), borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.25)' },
    '.cm-tooltip-autocomplete > ul': { fontFamily: "'JetBrains Mono', ui-monospace, monospace", maxHeight: '40vh' },
    '.cm-tooltip-autocomplete > ul > li': { padding: '6px 10px !important', lineHeight: '1.4' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: p.selection, color: p.fg },
    '.cm-completionIcon': { opacity: '.7' },
    '.cm-panels': { backgroundColor: name === 'dark' ? '#141821' : '#F4F6FA', color: p.fg, borderTop: 'none' },
    '.cm-panels.cm-panels-top': { borderBottom: '1px solid ' + (name === 'dark' ? '#232A38' : '#E1E5EB') },
    '.cm-search': { padding: '8px', fontSize: '14px' },
    '.cm-search input, .cm-search button': { fontSize: '14px', borderRadius: '8px', padding: '4px 8px' },
    '.cm-textfield': { backgroundColor: p.bg, color: p.fg, border: '1px solid ' + p.gutter },
    '.cm-button': { backgroundImage: 'none', backgroundColor: p.activeLine, color: p.fg, border: '1px solid ' + p.gutter },
    '.cm-error-line': { backgroundColor: 'rgba(255, 90, 90, 0.14)' },
    '.cm-foldPlaceholder': { backgroundColor: p.activeLine, border: 'none', color: p.gutter },
  }, { dark: name === 'dark' });

  const hl = HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword], color: p.kw },
    { tag: [t.string, t.special(t.string), t.regexp], color: p.str },
    { tag: [t.number, t.integer, t.float], color: p.num },
    { tag: [t.bool, t.null, t.atom], color: p.bool },
    { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: p.com, fontStyle: 'italic' },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: p.fn },
    { tag: [t.definition(t.variableName), t.definition(t.function(t.variableName))], color: p.def },
    { tag: [t.className, t.typeName, t.namespace], color: p.type },
    { tag: [t.propertyName, t.attributeName], color: p.prop },
    { tag: [t.self, t.special(t.variableName)], color: p.kw, fontStyle: 'italic' },
    { tag: [t.operator, t.punctuation], color: p.op },
    { tag: t.meta, color: p.type },
  ]);
  document.body.style.background = p.bg;
  return [theme, syntaxHighlighting(hl), syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
}

// ---------- Python completions (keywords + builtins) ----------
const pyModules = 'math random datetime json re collections itertools functools time string statistics numpy pandas matplotlib dataclasses typing'.split(' ');
const pySnippets = [
  { label: 'def', type: 'text', detail: 'function snippet', apply: 'def name(args):\n    pass' },
  { label: 'for', type: 'text', detail: 'loop snippet', apply: 'for i in range(10):\n    ' },
  { label: 'class', type: 'text', detail: 'class snippet', apply: 'class Name:\n    def __init__(self):\n        pass' },
  { label: 'ifmain', type: 'text', detail: "if __name__ == '__main__'", apply: "if __name__ == '__main__':\n    main()" },
];
// lang-python already completes keywords, builtins and local names; we add snippets + common modules.
function pythonCompletions(context) {
  const word = context.matchBefore(/\w+/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  const before = context.state.sliceDoc(Math.max(0, word.from - 1), word.from);
  if (before === '.') return null;
  const line = context.state.doc.lineAt(word.from);
  const isImport = /^\s*(import|from)\s+\w*$/.test(line.text.slice(0, word.to - line.from));
  const opts = isImport ? pyModules.map((k) => ({ label: k, type: 'namespace' })) : pySnippets.map((s) => ({ ...s, label: s.label, boost: -2 }));
  return { from: word.from, options: opts, validFor: /^\w*$/ };
}

// ---------- Error line marking ----------
const setErrorLine = StateEffect.define();
const errorField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value == null) deco = Decoration.none;
        else {
          const line = tr.state.doc.line(Math.max(1, Math.min(e.value, tr.state.doc.lines)));
          deco = Decoration.set([Decoration.line({ class: 'cm-error-line' }).range(line.from)]);
        }
      }
    }
    if (tr.docChanged) deco = Decoration.none;
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ---------- Editor setup ----------
const langC = new Compartment();
const themeC = new Compartment();
const wrapC = new Compartment();
const completeC = new Compartment();
const gutterC = new Compartment();
const tabC = new Compartment();

let opts = { language: 'javascript', theme: 'dark', fontSize: 14, wrap: false, autocomplete: true, lineNumbers: true, tabSize: 4 };
let changeTimer = null;
let suppress = false;

function langExt(lang) {
  if (lang === 'python') return [python(), EditorState.languageData.of(() => [{ autocomplete: pythonCompletions }])];
  return javascript({ jsx: false, typescript: false });
}
function completeExt(on) {
  return on ? autocompletion({ activateOnTyping: true, icons: true, maxRenderedOptions: 40 }) : [];
}
function gutterExt(on) {
  return on ? [lineNumbers(), highlightActiveLineGutter(), foldGutter({ openText: '▾', closedText: '▸' })] : [];
}
function tabExt(n) {
  return [EditorState.tabSize.of(n), indentUnit.of(' '.repeat(n))];
}

const view = new EditorView({
  parent: document.getElementById('editor'),
  state: EditorState.create({
    doc: '',
    extensions: [
      gutterC.of(gutterExt(true)),
      highlightSpecialChars(), history(), drawSelection(), dropCursor(),
      indentOnInput(), bracketMatching(), closeBrackets(), rectangularSelection(),
      highlightActiveLine(), highlightSelectionMatches(), search({ top: true }),
      errorField,
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, indentWithTab]),
      langC.of(langExt('javascript')),
      themeC.of(makeTheme('dark', 14)),
      wrapC.of([]),
      completeC.of(completeExt(true)),
      tabC.of(tabExt(4)),
      EditorView.contentAttributes.of({ autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', autocomplete: 'off' }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged && !suppress) {
          clearTimeout(changeTimer);
          changeTimer = setTimeout(() => post({ type: 'change', doc: view.state.doc.toString() }), 250);
        }
        if (u.selectionSet || u.docChanged) {
          const head = u.state.selection.main.head;
          const line = u.state.doc.lineAt(head);
          post({ type: 'cursor', line: line.number, col: head - line.from + 1, lines: u.state.doc.lines });
        }
        if (u.focusChanged) post({ type: view.hasFocus ? 'focus' : 'blur' });
      }),
    ],
  }),
});

function applyOptions(o) {
  const prev = opts;
  opts = { ...opts, ...o };
  const effects = [];
  if (o.language && o.language !== prev.language) effects.push(langC.reconfigure(langExt(opts.language)));
  if ((o.theme && o.theme !== prev.theme) || (o.fontSize && o.fontSize !== prev.fontSize)) effects.push(themeC.reconfigure(makeTheme(opts.theme, opts.fontSize)));
  if (o.wrap !== undefined) effects.push(wrapC.reconfigure(opts.wrap ? EditorView.lineWrapping : []));
  if (o.autocomplete !== undefined) effects.push(completeC.reconfigure(completeExt(opts.autocomplete)));
  if (o.lineNumbers !== undefined) effects.push(gutterC.reconfigure(gutterExt(opts.lineNumbers)));
  if (o.tabSize !== undefined) effects.push(tabC.reconfigure(tabExt(opts.tabSize)));
  if (effects.length) view.dispatch({ effects });
}

function setDoc(doc) {
  suppress = true;
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: doc || '' }, selection: { anchor: 0 } });
  suppress = false;
}

// Insert text at cursor. "|" in pair inserts places cursor between.
function insert(text) {
  const { state } = view;
  const sel = state.selection.main;
  const cursorIdx = text.indexOf('‸'); // caret marker
  const clean = text.replace('‸', '');
  const selected = state.sliceDoc(sel.from, sel.to);
  let insertText = clean;
  let anchor = sel.from + clean.length;
  if (cursorIdx >= 0) {
    // wrap selection if any
    insertText = clean.slice(0, cursorIdx) + selected + clean.slice(cursorIdx);
    anchor = sel.from + cursorIdx + selected.length;
  }
  view.dispatch({ changes: { from: sel.from, to: sel.to, insert: insertText }, selection: { anchor }, scrollIntoView: true, userEvent: 'input' });
  view.focus();
}

const commands = {
  undo: () => undo(view), redo: () => redo(view), comment: () => toggleComment(view),
  indent: () => indentMore(view), outdent: () => indentLess(view), selectAll: () => selectAll(view),
  search: () => openSearchPanel(view), home: () => cursorLineBoundaryBackward(view), end: () => cursorLineBoundaryForward(view),
  left: () => moveBy(-1), right: () => moveBy(1),
};
function moveBy(d) {
  const head = view.state.selection.main.head;
  const pos = Math.max(0, Math.min(view.state.doc.length, head + d));
  view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
}

function gotoLine(n, error) {
  const doc = view.state.doc;
  const line = doc.line(Math.max(1, Math.min(n, doc.lines)));
  view.dispatch({ selection: { anchor: line.from }, scrollIntoView: true, effects: error ? setErrorLine.of(n) : [] });
}

function handle(raw) {
  let msg;
  try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return; }
  if (!msg || !msg.type) return;
  switch (msg.type) {
    case 'init': applyOptions(msg.options || {}); setDoc(msg.doc); break;
    case 'setDoc': setDoc(msg.doc); break;
    case 'setOptions': applyOptions(msg.options || {}); break;
    case 'insert': insert(msg.text); break;
    case 'command': commands[msg.name] && commands[msg.name](); view.focus(); break;
    case 'focus': view.focus(); break;
    case 'blur': view.contentDOM.blur(); break;
    case 'gotoLine': gotoLine(msg.line, msg.error); break;
    case 'clearError': view.dispatch({ effects: setErrorLine.of(null) }); break;
    case 'getDoc': post({ type: 'change', doc: view.state.doc.toString(), flush: true, requestId: msg.requestId }); break;
  }
}
window.addEventListener('message', (e) => handle(e.data));
document.addEventListener('message', (e) => handle(e.data)); // Android
window.__cmHandle = handle;
post({ type: 'ready' });

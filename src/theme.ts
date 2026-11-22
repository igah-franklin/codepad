import { Platform, useColorScheme } from 'react-native';
import { useStore } from './store';

export type Language = 'javascript' | 'python';

/** Colors used by the CodeMirror editor inside the WebView. */
export type EditorPalette = {
  bg: string; fg: string; gutter: string; gutterBg: string; activeLine: string;
  selection: string; cursor: string; match: string;
  kw: string; str: string; num: string; com: string; fn: string; type: string;
  prop: string; op: string; bool: string; def: string;
  tooltipBg: string; tooltipBorder: string; panelBg: string; panelBorder: string;
};

export type Theme = {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  bg: string; surface: string; surface2: string; elevated: string; border: string;
  text: string; textDim: string; textFaint: string;
  accent: string; accentInk: string;
  danger: string; warn: string; info: string; success: string;
  editorBg: string; consoleBg: string;
  editor: EditorPalette;
};

type Ui = Omit<Theme, 'id' | 'name' | 'mode' | 'editor' | 'editorBg'>;
const dark = (id: string, name: string, ui: Ui, editor: EditorPalette): Theme => ({ id, name, mode: 'dark', ...ui, editorBg: editor.bg, editor });

// ---------- Light (unchanged) ----------
export const lightTheme: Theme = {
  id: 'light', name: 'Codepad Light', mode: 'light',
  bg: '#F5F6F9', surface: '#FFFFFF', surface2: '#F0F2F6', elevated: '#FFFFFF', border: '#E2E6ED',
  text: '#141821', textDim: '#5B6577', textFaint: '#98A1B0',
  accent: '#0A9C6E', accentInk: '#FFFFFF',
  danger: '#D93838', warn: '#B97800', info: '#1565C0', success: '#0A9C6E',
  editorBg: '#FFFFFF', consoleBg: '#FAFBFC',
  editor: {
    bg: '#FFFFFF', fg: '#1F2328', gutter: '#A0A7B1', gutterBg: '#FFFFFF', activeLine: '#F4F6FA',
    selection: '#CFE3FF', cursor: '#0A7D5A', match: '#E3F4E8',
    kw: '#C2185B', str: '#2E7D32', num: '#D35400', com: '#9AA3AE', fn: '#1565C0', type: '#7B1FA2',
    prop: '#00695C', op: '#1F2328', bool: '#D35400', def: '#0A7D5A',
    tooltipBg: '#FFFFFF', tooltipBorder: '#E1E5EB', panelBg: '#F4F6FA', panelBorder: '#E1E5EB',
  },
};

// ---------- Dark themes ----------
export const darkThemes: Theme[] = [
  dark('github-dark', 'GitHub Dark', {
    bg: '#0D1117', surface: '#161B22', surface2: '#21262D', elevated: '#1C2128', border: '#30363D',
    text: '#E6EDF3', textDim: '#9198A1', textFaint: '#6E7681',
    accent: '#3FB950', accentInk: '#04260F',
    danger: '#F85149', warn: '#D29922', info: '#58A6FF', success: '#3FB950', consoleBg: '#010409',
  }, {
    bg: '#0D1117', fg: '#E6EDF3', gutter: '#6E7681', gutterBg: '#0D1117', activeLine: '#161B22',
    selection: '#264F78', cursor: '#58A6FF', match: '#23452C',
    kw: '#FF7B72', str: '#A5D6FF', num: '#79C0FF', com: '#8B949E', fn: '#D2A8FF', type: '#FFA657',
    prop: '#79C0FF', op: '#FF7B72', bool: '#79C0FF', def: '#FFA657',
    tooltipBg: '#161B22', tooltipBorder: '#30363D', panelBg: '#161B22', panelBorder: '#30363D',
  }),
  dark('codepad', 'Codepad Classic', {
    bg: '#0B0D12', surface: '#131720', surface2: '#1A1F2B', elevated: '#202636', border: '#252C3B',
    text: '#E8EDF4', textDim: '#9AA4B5', textFaint: '#5F6A7D',
    accent: '#7CF5C3', accentInk: '#06281C',
    danger: '#FF6B6B', warn: '#FFC555', info: '#7CC7FF', success: '#7CF5C3', consoleBg: '#0A0C10',
  }, {
    bg: '#0E1117', fg: '#E6EDF3', gutter: '#5C6573', gutterBg: '#0E1117', activeLine: '#161B24',
    selection: '#2A3B5C', cursor: '#7CF5C3', match: '#2C3E2F',
    kw: '#FF7AB2', str: '#A5E075', num: '#FFB86B', com: '#5F6B7C', fn: '#7CC7FF', type: '#C9A2FF',
    prop: '#9CDCFE', op: '#E6EDF3', bool: '#FFB86B', def: '#7CF5C3',
    tooltipBg: '#1A2030', tooltipBorder: '#2A3245', panelBg: '#141821', panelBorder: '#232A38',
  }),
  dark('one-dark', 'One Dark', {
    bg: '#21252B', surface: '#282C34', surface2: '#2F343E', elevated: '#323842', border: '#3B4048',
    text: '#DCDFE4', textDim: '#9DA5B4', textFaint: '#636D83',
    accent: '#61AFEF', accentInk: '#0B1E2E',
    danger: '#E06C75', warn: '#E5C07B', info: '#61AFEF', success: '#98C379', consoleBg: '#1E2227',
  }, {
    bg: '#282C34', fg: '#ABB2BF', gutter: '#636D83', gutterBg: '#282C34', activeLine: '#2C313A',
    selection: '#3E4451', cursor: '#528BFF', match: '#3A4452',
    kw: '#C678DD', str: '#98C379', num: '#D19A66', com: '#7F848E', fn: '#61AFEF', type: '#E5C07B',
    prop: '#E06C75', op: '#56B6C2', bool: '#D19A66', def: '#E06C75',
    tooltipBg: '#21252B', tooltipBorder: '#3B4048', panelBg: '#21252B', panelBorder: '#3B4048',
  }),
  dark('dracula', 'Dracula', {
    bg: '#1E1F29', surface: '#282A36', surface2: '#313442', elevated: '#343746', border: '#44475A',
    text: '#F8F8F2', textDim: '#B6B9CC', textFaint: '#6272A4',
    accent: '#BD93F9', accentInk: '#1E1235',
    danger: '#FF5555', warn: '#F1FA8C', info: '#8BE9FD', success: '#50FA7B', consoleBg: '#191A21',
  }, {
    bg: '#282A36', fg: '#F8F8F2', gutter: '#6272A4', gutterBg: '#282A36', activeLine: '#2F3242',
    selection: '#44475A', cursor: '#F8F8F2', match: '#3D4A3F',
    kw: '#FF79C6', str: '#F1FA8C', num: '#BD93F9', com: '#6272A4', fn: '#50FA7B', type: '#8BE9FD',
    prop: '#66D9EF', op: '#FF79C6', bool: '#BD93F9', def: '#50FA7B',
    tooltipBg: '#21222C', tooltipBorder: '#44475A', panelBg: '#21222C', panelBorder: '#44475A',
  }),
  dark('monokai', 'Monokai', {
    bg: '#1E1F1C', surface: '#272822', surface2: '#31322B', elevated: '#34352E', border: '#3E3D32',
    text: '#F8F8F2', textDim: '#B8B8A8', textFaint: '#75715E',
    accent: '#A6E22E', accentInk: '#1C2905',
    danger: '#F92672', warn: '#E6DB74', info: '#66D9EF', success: '#A6E22E', consoleBg: '#1A1B17',
  }, {
    bg: '#272822', fg: '#F8F8F2', gutter: '#75715E', gutterBg: '#272822', activeLine: '#3E3D32',
    selection: '#49483E', cursor: '#F8F8F0', match: '#3E4A2A',
    kw: '#F92672', str: '#E6DB74', num: '#AE81FF', com: '#75715E', fn: '#A6E22E', type: '#66D9EF',
    prop: '#FD971F', op: '#F92672', bool: '#AE81FF', def: '#A6E22E',
    tooltipBg: '#1E1F1C', tooltipBorder: '#3E3D32', panelBg: '#1E1F1C', panelBorder: '#3E3D32',
  }),
  dark('nord', 'Nord', {
    bg: '#242933', surface: '#2E3440', surface2: '#3B4252', elevated: '#3B4252', border: '#434C5E',
    text: '#ECEFF4', textDim: '#C0C8D6', textFaint: '#7B88A1',
    accent: '#88C0D0', accentInk: '#13262C',
    danger: '#BF616A', warn: '#EBCB8B', info: '#81A1C1', success: '#A3BE8C', consoleBg: '#21252E',
  }, {
    bg: '#2E3440', fg: '#D8DEE9', gutter: '#616E88', gutterBg: '#2E3440', activeLine: '#3B4252',
    selection: '#434C5E', cursor: '#D8DEE9', match: '#3B4F4A',
    kw: '#81A1C1', str: '#A3BE8C', num: '#B48EAD', com: '#616E88', fn: '#88C0D0', type: '#8FBCBB',
    prop: '#D8DEE9', op: '#81A1C1', bool: '#81A1C1', def: '#88C0D0',
    tooltipBg: '#3B4252', tooltipBorder: '#4C566A', panelBg: '#3B4252', panelBorder: '#4C566A',
  }),
  dark('tokyo-night', 'Tokyo Night', {
    bg: '#16161E', surface: '#1A1B26', surface2: '#24283B', elevated: '#24283B', border: '#2F334D',
    text: '#C0CAF5', textDim: '#A9B1D6', textFaint: '#565F89',
    accent: '#7AA2F7', accentInk: '#0F1A33',
    danger: '#F7768E', warn: '#E0AF68', info: '#7DCFFF', success: '#9ECE6A', consoleBg: '#13131A',
  }, {
    bg: '#1A1B26', fg: '#C0CAF5', gutter: '#3B4261', gutterBg: '#1A1B26', activeLine: '#1F2335',
    selection: '#283457', cursor: '#C0CAF5', match: '#2B3A4A',
    kw: '#BB9AF7', str: '#9ECE6A', num: '#FF9E64', com: '#565F89', fn: '#7AA2F7', type: '#2AC3DE',
    prop: '#73DACA', op: '#89DDFF', bool: '#FF9E64', def: '#7DCFFF',
    tooltipBg: '#16161E', tooltipBorder: '#2F334D', panelBg: '#16161E', panelBorder: '#2F334D',
  }),
  dark('solarized-dark', 'Solarized Dark', {
    bg: '#00212B', surface: '#002B36', surface2: '#073642', elevated: '#073642', border: '#0E4552',
    text: '#EEE8D5', textDim: '#93A1A1', textFaint: '#657B83',
    accent: '#2AA198', accentInk: '#00211E',
    danger: '#DC322F', warn: '#B58900', info: '#268BD2', success: '#859900', consoleBg: '#001E27',
  }, {
    bg: '#002B36', fg: '#93A1A1', gutter: '#586E75', gutterBg: '#002B36', activeLine: '#073642',
    selection: '#0F4B5A', cursor: '#D30102', match: '#174A3A',
    kw: '#859900', str: '#2AA198', num: '#D33682', com: '#586E75', fn: '#268BD2', type: '#B58900',
    prop: '#268BD2', op: '#93A1A1', bool: '#CB4B16', def: '#268BD2',
    tooltipBg: '#073642', tooltipBorder: '#0E4552', panelBg: '#073642', panelBorder: '#0E4552',
  }),
  dark('gruvbox-dark', 'Gruvbox Dark', {
    bg: '#1D2021', surface: '#282828', surface2: '#32302F', elevated: '#3C3836', border: '#45403D',
    text: '#EBDBB2', textDim: '#BDAE93', textFaint: '#7C6F64',
    accent: '#B8BB26', accentInk: '#1F2004',
    danger: '#FB4934', warn: '#FABD2F', info: '#83A598', success: '#B8BB26', consoleBg: '#1A1C1D',
  }, {
    bg: '#282828', fg: '#EBDBB2', gutter: '#7C6F64', gutterBg: '#282828', activeLine: '#32302F',
    selection: '#504945', cursor: '#EBDBB2', match: '#3F4A2E',
    kw: '#FB4934', str: '#B8BB26', num: '#D3869B', com: '#928374', fn: '#FABD2F', type: '#8EC07C',
    prop: '#83A598', op: '#FE8019', bool: '#D3869B', def: '#83A598',
    tooltipBg: '#32302F', tooltipBorder: '#504945', panelBg: '#32302F', panelBorder: '#504945',
  }),
  dark('catppuccin-mocha', 'Catppuccin Mocha', {
    bg: '#11111B', surface: '#1E1E2E', surface2: '#313244', elevated: '#26263A', border: '#313244',
    text: '#CDD6F4', textDim: '#A6ADC8', textFaint: '#6C7086',
    accent: '#CBA6F7', accentInk: '#231338',
    danger: '#F38BA8', warn: '#F9E2AF', info: '#89B4FA', success: '#A6E3A1', consoleBg: '#0E0E16',
  }, {
    bg: '#1E1E2E', fg: '#CDD6F4', gutter: '#6C7086', gutterBg: '#1E1E2E', activeLine: '#26263A',
    selection: '#45475A', cursor: '#F5E0DC', match: '#2F4238',
    kw: '#CBA6F7', str: '#A6E3A1', num: '#FAB387', com: '#7F849C', fn: '#89B4FA', type: '#F9E2AF',
    prop: '#89DCEB', op: '#94E2D5', bool: '#FAB387', def: '#F5C2E7',
    tooltipBg: '#181825', tooltipBorder: '#313244', panelBg: '#181825', panelBorder: '#313244',
  }),
  dark('night-owl', 'Night Owl', {
    bg: '#010E17', surface: '#011627', surface2: '#0B2942', elevated: '#0B2942', border: '#1D3B53',
    text: '#D6DEEB', textDim: '#A1B3C9', textFaint: '#637777',
    accent: '#82AAFF', accentInk: '#071B3D',
    danger: '#EF5350', warn: '#FFCB8B', info: '#7FDBCA', success: '#ADDB67', consoleBg: '#010C14',
  }, {
    bg: '#011627', fg: '#D6DEEB', gutter: '#4B6479', gutterBg: '#011627', activeLine: '#0B2942',
    selection: '#1D3B53', cursor: '#80A4C2', match: '#16384A',
    kw: '#C792EA', str: '#ECC48D', num: '#F78C6C', com: '#637777', fn: '#82AAFF', type: '#FFCB8B',
    prop: '#7FDBCA', op: '#7FDBCA', bool: '#FF5874', def: '#ADDB67',
    tooltipBg: '#0B2942', tooltipBorder: '#1D3B53', panelBg: '#0B2942', panelBorder: '#1D3B53',
  }),
  dark('material-ocean', 'Material Ocean', {
    bg: '#090B10', surface: '#0F111A', surface2: '#1A1C25', elevated: '#1A1C25', border: '#232637',
    text: '#EEFFFF', textDim: '#A6ACCD', textFaint: '#4B526D',
    accent: '#84FFFF', accentInk: '#002B2B',
    danger: '#F07178', warn: '#FFCB6B', info: '#82AAFF', success: '#C3E88D', consoleBg: '#07090D',
  }, {
    bg: '#0F111A', fg: '#A6ACCD', gutter: '#3B3F51', gutterBg: '#0F111A', activeLine: '#141722',
    selection: '#1F2233', cursor: '#FFCC00', match: '#1F3330',
    kw: '#C792EA', str: '#C3E88D', num: '#F78C6C', com: '#464B5D', fn: '#82AAFF', type: '#FFCB6B',
    prop: '#89DDFF', op: '#89DDFF', bool: '#FF5370', def: '#F07178',
    tooltipBg: '#1A1C25', tooltipBorder: '#232637', panelBg: '#1A1C25', panelBorder: '#232637',
  }),
  dark('ayu-mirage', 'Ayu Mirage', {
    bg: '#1C212B', surface: '#1F2430', surface2: '#272D38', elevated: '#2A303C', border: '#343B48',
    text: '#CCCAC2', textDim: '#9FA3AA', textFaint: '#707A8C',
    accent: '#FFCC66', accentInk: '#332300',
    danger: '#F28779', warn: '#FFAD66', info: '#73D0FF', success: '#D5FF80', consoleBg: '#191E27',
  }, {
    bg: '#1F2430', fg: '#CCCAC2', gutter: '#5C6773', gutterBg: '#1F2430', activeLine: '#242936',
    selection: '#33415E', cursor: '#FFCC66', match: '#2E3B33',
    kw: '#FFAD66', str: '#D5FF80', num: '#DFBFFF', com: '#6E7C8F', fn: '#FFD173', type: '#73D0FF',
    prop: '#F29E74', op: '#F29E74', bool: '#DFBFFF', def: '#95E6CB',
    tooltipBg: '#1C212B', tooltipBorder: '#343B48', panelBg: '#1C212B', panelBorder: '#343B48',
  }),
];

export const DEFAULT_DARK_THEME = 'github-dark';
export const darkThemeById = (id: string) => darkThemes.find((x) => x.id === id) ?? darkThemes[0];

// ---------- Editor fonts ----------
export type EditorFont = { id: string; name: string; css: string; google?: string; ligatures?: boolean };
const FALLBACK = "ui-monospace, Menlo, 'Roboto Mono', monospace";
export const editorFonts: EditorFont[] = [
  { id: 'jetbrains', name: 'JetBrains Mono', css: `'JetBrains Mono', ${FALLBACK}`, google: 'JetBrains+Mono:wght@400;600' },
  { id: 'fira', name: 'Fira Code', css: `'Fira Code', ${FALLBACK}`, google: 'Fira+Code:wght@400;600', ligatures: true },
  { id: 'source', name: 'Source Code Pro', css: `'Source Code Pro', ${FALLBACK}`, google: 'Source+Code+Pro:wght@400;600' },
  { id: 'ibm', name: 'IBM Plex Mono', css: `'IBM Plex Mono', ${FALLBACK}`, google: 'IBM+Plex+Mono:wght@400;600' },
  { id: 'roboto', name: 'Roboto Mono', css: `'Roboto Mono', ${FALLBACK}`, google: 'Roboto+Mono:wght@400;600' },
  { id: 'ubuntu', name: 'Ubuntu Mono', css: `'Ubuntu Mono', ${FALLBACK}`, google: 'Ubuntu+Mono:wght@400;700' },
  { id: 'inconsolata', name: 'Inconsolata', css: `'Inconsolata', ${FALLBACK}`, google: 'Inconsolata:wght@400;600' },
  { id: 'space', name: 'Space Mono', css: `'Space Mono', ${FALLBACK}`, google: 'Space+Mono:wght@400;700' },
  { id: 'dm', name: 'DM Mono', css: `'DM Mono', ${FALLBACK}`, google: 'DM+Mono:wght@400;500' },
  { id: 'system', name: 'System', css: FALLBACK },
];
export const DEFAULT_EDITOR_FONT = 'jetbrains';
export const editorFontById = (id: string) => editorFonts.find((x) => x.id === id) ?? editorFonts[0];

export const langMeta: Record<Language, { label: string; short: string; ext: string; color: string; ink: string; icon: 'logo-javascript' | 'logo-python' }> = {
  javascript: { label: 'JavaScript', short: 'JS', ext: 'js', color: '#F7DF1E', ink: '#1A1600', icon: 'logo-javascript' },
  python: { label: 'Python', short: 'PY', ext: 'py', color: '#4B8BBE', ink: '#FFFFFF', icon: 'logo-python' },
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function useTheme(): Theme {
  const system = useColorScheme();
  const { settings } = useStore();
  const mode = settings.theme === 'system' ? (system === 'light' ? 'light' : 'dark') : settings.theme;
  return mode === 'light' ? lightTheme : darkThemeById(settings.darkTheme);
}

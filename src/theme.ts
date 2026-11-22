import { Platform, useColorScheme } from 'react-native';
import { useStore } from './store';

export type Language = 'javascript' | 'python';

export const palette = {
  dark: {
    mode: 'dark' as const,
    bg: '#0B0D12',
    surface: '#131720',
    surface2: '#1A1F2B',
    elevated: '#202636',
    border: '#252C3B',
    text: '#E8EDF4',
    textDim: '#9AA4B5',
    textFaint: '#5F6A7D',
    accent: '#7CF5C3',
    accentInk: '#06281C',
    danger: '#FF6B6B',
    warn: '#FFC555',
    info: '#7CC7FF',
    success: '#7CF5C3',
    editorBg: '#0E1117',
    consoleBg: '#0A0C10',
  },
  light: {
    mode: 'light' as const,
    bg: '#F5F6F9',
    surface: '#FFFFFF',
    surface2: '#F0F2F6',
    elevated: '#FFFFFF',
    border: '#E2E6ED',
    text: '#141821',
    textDim: '#5B6577',
    textFaint: '#98A1B0',
    accent: '#0A9C6E',
    accentInk: '#FFFFFF',
    danger: '#D93838',
    warn: '#B97800',
    info: '#1565C0',
    success: '#0A9C6E',
    editorBg: '#FFFFFF',
    consoleBg: '#FAFBFC',
  },
};

export type Theme = (typeof palette)['dark'] | (typeof palette)['light'];

export const langMeta: Record<Language, { label: string; short: string; ext: string; color: string; ink: string; icon: 'logo-javascript' | 'logo-python' }> = {
  javascript: { label: 'JavaScript', short: 'JS', ext: 'js', color: '#F7DF1E', ink: '#1A1600', icon: 'logo-javascript' },
  python: { label: 'Python', short: 'PY', ext: 'py', color: '#4B8BBE', ink: '#FFFFFF', icon: 'logo-python' },
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function useTheme(): Theme {
  const system = useColorScheme();
  const { settings } = useStore();
  const mode = settings.theme === 'system' ? (system === 'light' ? 'light' : 'dark') : settings.theme;
  return palette[mode];
}

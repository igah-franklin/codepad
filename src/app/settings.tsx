import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, TextPrompt, useHaptics } from '@/components/ui';
import { useRunner } from '@/runner';
import { defaultSettings, useStore, type Settings } from '@/store';
import { darkThemeById, darkThemes, editorFontById, editorFonts, mono, useTheme, type Theme } from '@/theme';
import { PYODIDE_VERSION } from '@/web/runnerHtml';

function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { label: string; value: T }[]; onChange: (v: T) => void }) {
  const t = useTheme();
  const h = useHaptics();
  return (
    <View style={[styles.seg, { backgroundColor: t.surface2 }]}>
      {options.map((o) => (
        <Pressable key={String(o.value)} onPress={() => { h.tap(); onChange(o.value); }}
          style={[styles.segBtn, value === o.value && { backgroundColor: t.elevated, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }]}>
          <Text style={{ color: value === o.value ? t.text : t.textDim, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ThemeSwatch({ theme, selected, onPress }: { theme: Theme; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  const e = theme.editor;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${theme.name} theme`} accessibilityState={{ selected }}
      style={({ pressed }) => [styles.swatch, { borderColor: selected ? t.accent : t.border, opacity: pressed ? 0.8 : 1 }]}>
      <View style={[styles.swatchPreview, { backgroundColor: e.bg }]}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={[styles.bar, { width: 16, backgroundColor: e.kw }]} />
          <View style={[styles.bar, { width: 26, backgroundColor: e.fn }]} />
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginLeft: 8 }}>
          <View style={[styles.bar, { width: 20, backgroundColor: e.str }]} />
          <View style={[styles.bar, { width: 12, backgroundColor: e.num }]} />
        </View>
        <View style={[styles.bar, { width: 30, backgroundColor: e.com }]} />
        <View style={[styles.swatchDot, { backgroundColor: theme.accent }]} />
      </View>
      <View style={[styles.swatchLabel, { backgroundColor: selected ? t.surface2 : t.surface }]}>
        {selected && <Ionicons name="checkmark-circle" size={13} color={t.accent} />}
        <Text style={{ color: selected ? t.text : t.textDim, fontSize: 11, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{theme.name}</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { settings, updateSettings } = useStore();
  const runner = useRunner();
  const [confirmReset, setConfirmReset] = useState(false);
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => updateSettings({ [k]: v } as Partial<Settings>);

  const Row = ({ icon, title, desc, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; desc?: string; children: React.ReactNode }) => (
    <View style={[styles.row, { borderBottomColor: t.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><Ionicons name={icon} size={17} color={t.text} /></View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
        {desc ? <Text style={{ color: t.textDim, fontSize: 12, marginTop: 2, lineHeight: 16 }}>{desc}</Text> : null}
      </View>
      {children}
    </View>
  );
  const Toggle = ({ k }: { k: 'wrap' | 'autocomplete' | 'lineNumbers' | 'haptics' | 'keyBar' | 'preloadPython' | 'clearOnRun' }) => (
    <Switch value={settings[k]} onValueChange={(v) => { h.tap(); set(k)(v); }} trackColor={{ true: t.accent, false: t.border }} thumbColor="#fff" />
  );
  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginTop: 22 }}>
      <Text style={[styles.groupTitle, { color: t.textFaint }]}>{title}</Text>
      <View style={[styles.group, { backgroundColor: t.surface, borderColor: t.border }]}>{children}</View>
    </View>
  );

  const pyText = runner.py.status === 'ready' ? (runner.py.message || 'Ready') : runner.py.status === 'loading' ? 'Loading…' : runner.py.status === 'error' ? 'Offline / failed' : 'Not loaded';

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Settings</Text>
        <IconButton name="close" label="Close" onPress={() => router.back()} style={{ backgroundColor: t.surface }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}>
        <Group title="APPEARANCE">
          <Row icon="contrast-outline" title="Theme">
            <Segmented value={settings.theme} onChange={set('theme')} options={[{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }, { label: 'Auto', value: 'system' }]} />
          </Row>
          <View style={[styles.block, { borderBottomColor: t.border }]}>
            <View style={styles.blockHead}>
              <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><Ionicons name="color-palette-outline" size={17} color={t.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>Dark theme</Text>
                <Text style={{ color: t.textDim, fontSize: 12, marginTop: 2 }}>{darkThemeById(settings.darkTheme).name}{settings.theme === 'light' ? ' · used in Dark and Auto' : ''}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
              {darkThemes.map((th) => (
                <ThemeSwatch key={th.id} theme={th} selected={darkThemeById(settings.darkTheme).id === th.id} onPress={() => { h.tap(); set('darkTheme')(th.id); }} />
              ))}
            </ScrollView>
          </View>
          <View style={[styles.block, { borderBottomColor: t.border }]}>
            <View style={styles.blockHead}>
              <View style={[styles.rowIcon, { backgroundColor: t.surface2 }]}><Ionicons name="code-slash-outline" size={17} color={t.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>Editor font</Text>
                <Text style={{ color: t.textDim, fontSize: 12, marginTop: 2 }}>{editorFontById(settings.editorFont).name} · downloads once, falls back to system offline</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
              {editorFonts.map((f) => {
                const on = editorFontById(settings.editorFont).id === f.id;
                return (
                  <Pressable key={f.id} onPress={() => { h.tap(); set('editorFont')(f.id); }} accessibilityRole="button" accessibilityState={{ selected: on }}
                    style={[styles.fontChip, { backgroundColor: on ? t.text : t.surface2, borderColor: on ? t.text : t.border }]}>
                    <Text style={{ color: on ? t.bg : t.textDim, fontSize: 13, fontWeight: '700' }}>{f.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Row icon="text-outline" title="Font size" desc="Editor and console">
            <View style={styles.stepper}>
              <IconButton name="remove" label="Smaller" size={18} onPress={() => set('fontSize')(Math.max(10, settings.fontSize - 1))} style={{ backgroundColor: t.surface2, width: 34, height: 34 }} />
              <Text style={{ color: t.text, fontFamily: mono, width: 34, textAlign: 'center', fontWeight: '700' }}>{settings.fontSize}</Text>
              <IconButton name="add" label="Larger" size={18} onPress={() => set('fontSize')(Math.min(24, settings.fontSize + 1))} style={{ backgroundColor: t.surface2, width: 34, height: 34 }} />
            </View>
          </Row>
        </Group>

        <Group title="EDITOR">
          <Row icon="list-outline" title="Line numbers"><Toggle k="lineNumbers" /></Row>
          <Row icon="return-down-back-outline" title="Word wrap" desc="Wrap long lines instead of scrolling sideways"><Toggle k="wrap" /></Row>
          <Row icon="flash-outline" title="Autocomplete" desc="Keywords, built-ins and names from your file"><Toggle k="autocomplete" /></Row>
          <Row icon="keypad-outline" title="Coding key bar" desc="Brackets, symbols, undo and more above the keyboard"><Toggle k="keyBar" /></Row>
          <Row icon="arrow-forward-outline" title="Tab size">
            <Segmented value={settings.tabSize} onChange={set('tabSize')} options={[{ label: '2', value: 2 }, { label: '4', value: 4 }]} />
          </Row>
        </Group>

        <Group title="RUNNING CODE">
          <Row icon="timer-outline" title="Time limit" desc="Stops infinite loops automatically">
            <Segmented value={settings.timeoutSec} onChange={set('timeoutSec')} options={[{ label: '5s', value: 5 }, { label: '15s', value: 15 }, { label: '60s', value: 60 }]} />
          </Row>
          <Row icon="sparkles-outline" title="Clear console on run"><Toggle k="clearOnRun" /></Row>
          <Row icon="rocket-outline" title="Preload Python" desc="Warm up Python at launch so the first run is instant"><Toggle k="preloadPython" /></Row>
          <Row icon="phone-portrait-outline" title="Haptic feedback"><Toggle k="haptics" /></Row>
        </Group>

        <Group title="ENGINES">
          <Row icon="logo-javascript" title="JavaScript" desc="Device JavaScript engine (ES2023+), isolated worker">
            <Text style={{ color: runner.ready ? t.success : t.textDim, fontWeight: '700', fontSize: 12 }}>{runner.ready ? 'Ready' : 'Starting'}</Text>
          </Row>
          <Row icon="logo-python" title="Python" desc={`CPython via Pyodide ${PYODIDE_VERSION}. numpy, pandas & matplotlib install on first import (needs internet once).`}>
            <Text style={{ color: runner.py.status === 'ready' ? t.success : runner.py.status === 'error' ? t.danger : t.warn, fontWeight: '700', fontSize: 12, maxWidth: 110, textAlign: 'right' }}>{pyText}</Text>
          </Row>
          <Pressable onPress={() => { h.impact(); runner.restartPython(); }} style={({ pressed }) => [styles.action, { backgroundColor: pressed ? t.surface2 : 'transparent' }]}>
            <Ionicons name="refresh" size={17} color={t.accent} />
            <Text style={{ color: t.accent, fontWeight: '700' }}>Restart Python engine</Text>
          </Pressable>
        </Group>

        <Pressable onPress={() => setConfirmReset(true)} style={({ pressed }) => [styles.reset, { borderColor: t.border, backgroundColor: pressed ? t.surface2 : t.surface }]}>
          <Text style={{ color: t.danger, fontWeight: '700' }}>Reset settings to defaults</Text>
        </Pressable>
        <Text style={{ color: t.textFaint, textAlign: 'center', marginTop: 18, fontSize: 12 }}>
          Codepad {Constants.expoConfig?.version ?? '1.0.0'} · Your files stay on this device
        </Text>
      </ScrollView>
      <TextPrompt visible={confirmReset} title="Reset settings?" message="Your files are not affected." destructive confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)} onSubmit={() => { updateSettings(defaultSettings); setConfirmReset(false); h.success(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  groupTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  group: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  seg: { flexDirection: 'row', padding: 3, borderRadius: 10 },
  segBtn: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  block: { paddingTop: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  blockHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  strip: { gap: 10, paddingHorizontal: 14, paddingTop: 12 },
  swatch: { width: 104, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  swatchPreview: { height: 58, padding: 9, gap: 6 },
  swatchDot: { position: 'absolute', right: 8, bottom: 8, width: 12, height: 12, borderRadius: 6 },
  swatchLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  bar: { height: 5, borderRadius: 3 },
  fontChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 15, justifyContent: 'center' },
  reset: { marginTop: 22, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
});

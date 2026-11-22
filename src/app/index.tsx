import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet, IconButton, LangBadge, TextPrompt, Toast, timeAgo, useHaptics, useToast, type SheetAction } from '@/components/ui';
import { ALL_CHALLENGES } from '@/challenges';
import { useRunner } from '@/runner';
import { useStore, type Project } from '@/store';
import { langMeta, mono, useTheme, type Language } from '@/theme';

type Filter = 'all' | Language;

function preview(code: string) {
  const line = code.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#') && !l.startsWith('//'));
  return line || code.split('\n')[0] || '';
}

export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { projects, createProject, updateProject, deleteProject, duplicateProject, solved } = useStore();
  const solvedCount = useMemo(() => ALL_CHALLENGES.filter((c) => solved[c.id]).length, [solved]);
  const { py } = useRunner();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [menu, setMenu] = useState<Project | null>(null);
  const [rename, setRename] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<Project | null>(null);
  const [newMenu, setNewMenu] = useState(false);
  const { toast, show } = useToast();

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects
      .filter((p) => filter === 'all' || p.language === filter)
      .filter((p) => !s || p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s))
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updatedAt - a.updatedAt);
  }, [projects, q, filter]);

  const open = (p: Project) => router.push({ pathname: '/editor/[id]', params: { id: p.id } });
  const create = (language: Language, extra?: { name?: string; code?: string }) => {
    h.impact();
    open(createProject({ language, ...extra }));
  };

  const fromClipboard = async () => {
    const text = await Clipboard.getStringAsync().catch(() => '');
    if (!text.trim()) { show('Clipboard is empty'); return; }
    const looksPy = /^\s*(def |import |from |print\(|class .*:)/m.test(text) && !/[;{}]\s*$/m.test(text);
    create(looksPy ? 'python' : 'javascript', { name: 'pasted', code: text });
  };

  const importFile = async () => {
    try {
      const res = await File.pickFileAsync({ mimeTypes: ['*/*'] });
      if (res.canceled || !res.result) return;
      const f = res.result;
      const name = f.name || 'imported';
      const ext = name.split('.').pop()?.toLowerCase();
      if (ext !== 'py' && ext !== 'js' && ext !== 'mjs' && ext !== 'txt') { show('Choose a .py or .js file'); return; }
      const code = await f.text();
      create(ext === 'py' ? 'python' : 'javascript', { name: name.replace(/\.[^.]+$/, ''), code });
    } catch {
      show('Could not import that file');
    }
  };

  const actions = (p: Project): SheetAction[] => [
    { label: 'Open', icon: 'open-outline', onPress: () => open(p) },
    { label: 'Rename', icon: 'create-outline', onPress: () => setRename(p) },
    { label: 'Duplicate', icon: 'copy-outline', onPress: () => { const d = duplicateProject(p.id); if (d) show(`Created ${d.name}.${langMeta[d.language].ext}`); } },
    { label: p.pinned ? 'Unpin' : 'Pin to top', icon: p.pinned ? 'pin' : 'pin-outline', onPress: () => updateProject(p.id, { pinned: !p.pinned }) },
    { label: 'Copy code', icon: 'clipboard-outline', onPress: () => { Clipboard.setStringAsync(p.code); show('Code copied'); } },
    { label: 'Delete', icon: 'trash-outline', destructive: true, onPress: () => setConfirmDel(p) },
  ];

  const pyLabel = py.status === 'ready' ? py.message || 'Python ready' : py.status === 'loading' ? 'Warming up Python…' : py.status === 'error' ? 'Python offline — connect once to download' : 'Python sleeping';
  const pyColor = py.status === 'ready' ? t.success : py.status === 'error' ? t.danger : t.warn;

  const header = (
    <View>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: t.accent }]}>
            <Text style={[styles.logoText, { color: t.accentInk }]}>{'>_'}</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: t.text }]}>Codepad</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: pyColor }]} />
              <Text style={{ color: t.textDim, fontSize: 12 }} numberOfLines={1}>JS ready · {pyLabel}</Text>
            </View>
          </View>
        </View>
        <IconButton name="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <View style={styles.heroRow}>
        {(['python', 'javascript'] as Language[]).map((l) => {
          const m = langMeta[l];
          return (
            <Pressable key={l} onPress={() => create(l)} accessibilityLabel={`New ${m.label} file`}
              style={({ pressed }) => [styles.hero, { backgroundColor: t.surface, borderColor: t.border, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <View style={[styles.heroGlow, { backgroundColor: m.color }]} />
              <LangBadge language={l} size={40} />
              <Text style={[styles.heroTitle, { color: t.text }]}>New {m.label}</Text>
              <Text style={{ color: t.textDim, fontSize: 12, fontFamily: mono }}>main.{m.ext}</Text>
              <View style={[styles.heroPlus, { backgroundColor: t.surface2 }]}>
                <Ionicons name="add" size={18} color={t.text} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.quickRow}>
        <Pressable onPress={() => router.push('/templates')} style={({ pressed }) => [styles.quick, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
          <Ionicons name="sparkles-outline" size={17} color={t.accent} />
          <Text style={[styles.quickText, { color: t.text }]}>Examples</Text>
        </Pressable>
        <Pressable onPress={importFile} style={({ pressed }) => [styles.quick, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
          <Ionicons name="document-outline" size={17} color={t.info} />
          <Text style={[styles.quickText, { color: t.text }]}>Import</Text>
        </Pressable>
        <Pressable onPress={fromClipboard} style={({ pressed }) => [styles.quick, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
          <Ionicons name="clipboard-outline" size={17} color={t.warn} />
          <Text style={[styles.quickText, { color: t.text }]}>Paste</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/challenges')} accessibilityLabel="Coding challenges"
        style={({ pressed }) => [styles.challenges, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
        <View style={[styles.challengeIcon, { backgroundColor: t.accent + '22' }]}>
          <Ionicons name="trophy-outline" size={18} color={t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.quickText, { color: t.text, fontSize: 14 }]}>Coding challenges</Text>
          <Text style={{ color: t.textDim, fontSize: 12, marginTop: 1 }}>Easy → Interview · {solvedCount}/{ALL_CHALLENGES.length} solved</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.textFaint} />
      </Pressable>

      <View style={[styles.search, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Ionicons name="search" size={18} color={t.textFaint} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search files and code" placeholderTextColor={t.textFaint}
          style={[styles.searchInput, { color: t.text }]} autoCorrect={false} autoCapitalize="none" clearButtonMode="while-editing" />
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.section, { color: t.text }]}>Your files <Text style={{ color: t.textFaint }}>{projects.length}</Text></Text>
        <View style={styles.chips}>
          {(['all', 'python', 'javascript'] as Filter[]).map((f) => (
            <Pressable key={f} onPress={() => { h.tap(); setFilter(f); }}
              style={[styles.chip, { backgroundColor: filter === f ? t.text : t.surface, borderColor: t.border }]}>
              <Text style={{ color: filter === f ? t.bg : t.textDim, fontSize: 12, fontWeight: '700' }}>{f === 'all' ? 'All' : langMeta[f].short}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: t.border }]}>
            <Ionicons name={q ? 'search-outline' : 'code-slash-outline'} size={30} color={t.textFaint} />
            <Text style={{ color: t.textDim, marginTop: 10, textAlign: 'center' }}>
              {q ? `No files match “${q}”` : 'No files yet. Create one above or open an example.'}
            </Text>
          </View>
        }
        renderItem={({ item: p }) => (
          <Pressable
            onPress={() => open(p)}
            onLongPress={() => { h.impact(); setMenu(p); }}
            delayLongPress={300}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}
          >
            <LangBadge language={p.language} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>
                  {p.name}<Text style={{ color: t.textFaint }}>.{langMeta[p.language].ext}</Text>
                </Text>
                {p.pinned && <Ionicons name="pin" size={13} color={t.accent} />}
              </View>
              <Text style={[styles.cardPreview, { color: t.textDim }]} numberOfLines={1}>{preview(p.code)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ color: t.textFaint, fontSize: 11 }}>{timeAgo(p.updatedAt)}</Text>
              <IconButton name="ellipsis-horizontal" size={18} color={t.textDim} label={`More actions for ${p.name}`} onPress={() => { h.tap(); setMenu(p); }} style={{ width: 30, height: 26 }} />
            </View>
          </Pressable>
        )}
      />

      <Pressable onPress={() => { h.impact(); setNewMenu(true); }} accessibilityLabel="New file"
        style={({ pressed }) => [styles.fab, { backgroundColor: t.accent, bottom: insets.bottom + 20, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <Ionicons name="add" size={30} color={t.accentInk} />
      </Pressable>

      <ActionSheet visible={!!menu} title={menu ? `${menu.name}.${langMeta[menu.language].ext}` : ''} subtitle={menu ? `Edited ${timeAgo(menu.updatedAt)}` : ''} actions={menu ? actions(menu) : []} onClose={() => setMenu(null)} />
      <ActionSheet
        visible={newMenu} title="Create new" onClose={() => setNewMenu(false)}
        actions={[
          { label: 'Python file', icon: 'logo-python', onPress: () => create('python') },
          { label: 'JavaScript file', icon: 'logo-javascript', onPress: () => create('javascript') },
          { label: 'From an example', icon: 'sparkles-outline', onPress: () => router.push('/templates') },
          { label: 'Import .py / .js file', icon: 'document-outline', onPress: importFile },
          { label: 'Paste from clipboard', icon: 'clipboard-outline', onPress: fromClipboard },
        ]}
      />
      <TextPrompt
        visible={!!rename} title="Rename file" initial={rename?.name} suffix={rename ? '.' + langMeta[rename.language].ext : ''}
        onCancel={() => setRename(null)}
        onSubmit={(v) => { if (rename) updateProject(rename.id, { name: v.replace(/\.(py|js)$/i, '').replace(/[\\/]/g, '_') }); setRename(null); }}
      />
      <TextPrompt
        visible={!!confirmDel} title="Delete file?" destructive confirmLabel="Delete"
        message={confirmDel ? `“${confirmDel.name}.${langMeta[confirmDel.language].ext}” will be permanently removed.` : ''}
        onCancel={() => setConfirmDel(null)}
        onSubmit={() => { if (confirmDel) { deleteProject(confirmDel.id); h.success(); show('File deleted'); } setConfirmDel(null); }}
      />
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, marginTop: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logo: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: mono, fontWeight: '900', fontSize: 17 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1, maxWidth: 260 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  heroRow: { flexDirection: 'row', gap: 12 },
  hero: { flex: 1, borderRadius: 22, padding: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', minHeight: 140, justifyContent: 'flex-end', gap: 4 },
  heroGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, top: -70, right: -50, opacity: 0.18 },
  heroTitle: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  heroPlus: { position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quick: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  quickText: { fontWeight: '600', fontSize: 13 },
  challenges: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  challengeIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, borderRadius: 14, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  section: { fontSize: 18, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  cardTitle: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  cardPreview: { fontFamily: mono, fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', padding: 32, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed' },
  fab: { position: 'absolute', right: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});

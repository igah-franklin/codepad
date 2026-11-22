import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLevel, getModule } from '@/challenges';
import { ProgressBar, levelColor } from '@/components/challengeUi';
import { IconButton, LangBadge } from '@/components/ui';
import { useStore } from '@/store';
import { mono, useTheme, type Language } from '@/theme';

export default function ModuleScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { solved, projects } = useStore();
  const mod = getModule(key);

  if (!mod) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.textDim }}>Module not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: t.accent, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }
  const level = getLevel(mod.level)!;
  const color = levelColor(mod.level, t.accent);
  const n = mod.challenges.filter((c) => solved[c.id]).length;
  const started = (id: string) => [...new Set(projects.filter((p) => p.challengeId === id).map((p) => p.language))] as Language[];

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <IconButton name="chevron-back" label="Back" onPress={() => router.back()} size={26} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{mod.title}</Text>
          <Text style={{ color: t.textFaint, fontSize: 11, fontFamily: mono }}>{level.title} · {n}/{mod.challenges.length} solved</Text>
        </View>
      </View>
      <FlatList
        data={mod.challenges}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: t.textDim, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{mod.description}</Text>
            <ProgressBar value={n / mod.challenges.length} color={color} />
          </View>
        }
        renderItem={({ item: c }) => {
          const ok = !!solved[c.id];
          const langs = started(c.id);
          return (
            <Pressable onPress={() => router.push({ pathname: '/challenges/problem/[id]', params: { id: c.id } })}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: ok ? color + '66' : t.border }]}>
              <View style={[styles.num, { backgroundColor: ok ? color : t.surface2 }]}>
                {ok ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={{ color: t.textDim, fontFamily: mono, fontWeight: '700', fontSize: 12 }}>{c.index}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>{c.title}</Text>
                <Text style={{ color: t.textDim, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{c.prompt}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginLeft: 8 }}>
                {langs.map((l) => <LangBadge key={l} language={l} size={20} />)}
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.textFaint} style={{ marginLeft: 6 }} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  num: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

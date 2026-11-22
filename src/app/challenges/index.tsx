import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_CHALLENGES, LEVELS, type LevelId } from '@/challenges';
import { ProgressBar, levelColor } from '@/components/challengeUi';
import { IconButton, useHaptics } from '@/components/ui';
import { useStore } from '@/store';
import { mono, useTheme } from '@/theme';

let lastLevel: LevelId = 'easy';

export default function ChallengesHome() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { solved } = useStore();
  const [levelId, setLevelId] = useState<LevelId>(lastLevel);
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
  const total = ALL_CHALLENGES.length;
  const done = ALL_CHALLENGES.filter((c) => solved[c.id]).length;
  const count = (ids: { id: string }[]) => ids.filter((c) => solved[c.id]).length;

  const header = (
    <View>
      <View style={[styles.summary, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.trophy, { backgroundColor: t.accent + '22' }]}>
            <Ionicons name="trophy" size={22} color={t.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{done} of {total} solved</Text>
            <Text style={{ color: t.textDim, fontSize: 12, marginTop: 2 }}>Write a solution, tap Run, and the tests check it.</Text>
          </View>
        </View>
        <View style={{ marginTop: 14 }}><ProgressBar value={total ? done / total : 0} color={t.accent} /></View>
      </View>

      <View style={styles.levels}>
        {LEVELS.map((l) => {
          const on = l.id === level.id;
          const all = l.modules.flatMap((m) => m.challenges);
          const c = levelColor(l.id, t.accent);
          return (
            <Pressable key={l.id} onPress={() => { h.tap(); lastLevel = l.id; setLevelId(l.id); }} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={[styles.levelBtn, { backgroundColor: on ? t.surface : 'transparent', borderColor: on ? c : t.border }]}>
              <View style={[styles.dot, { backgroundColor: c }]} />
              <Text style={{ color: on ? t.text : t.textDim, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{l.title}</Text>
              <Text style={{ color: t.textFaint, fontSize: 11, fontFamily: mono }}>{count(all)}/{all.length}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ color: t.textDim, fontSize: 13, lineHeight: 18, marginTop: 12, marginBottom: 12, marginHorizontal: 2 }}>{level.blurb}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <IconButton name="chevron-back" label="Back" onPress={() => router.back()} size={26} />
        <Text style={[styles.title, { color: t.text }]}>Challenges</Text>
      </View>
      <FlatList
        data={level.modules}
        keyExtractor={(m) => m.key}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item: m, index }) => {
          const n = count(m.challenges);
          const c = levelColor(level.id, t.accent);
          return (
            <Pressable onPress={() => router.push({ pathname: '/challenges/module/[key]', params: { key: m.key } })}
              style={({ pressed }) => [styles.card, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
              <View style={[styles.num, { backgroundColor: c + '22' }]}>
                {n === m.challenges.length
                  ? <Ionicons name="checkmark" size={18} color={c} />
                  : <Text style={{ color: c, fontFamily: mono, fontWeight: '800', fontSize: 13 }}>{String(index + 1).padStart(2, '0')}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{m.title}</Text>
                  <Text style={{ color: t.textFaint, fontSize: 12, fontFamily: mono }}>{n}/{m.challenges.length}</Text>
                </View>
                <Text style={{ color: t.textDim, fontSize: 12.5, marginTop: 3, lineHeight: 17 }} numberOfLines={2}>{m.description}</Text>
                <View style={{ marginTop: 10 }}><ProgressBar value={n / m.challenges.length} color={c} height={4} /></View>
              </View>
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
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  summary: { borderRadius: 20, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  trophy: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levels: { flexDirection: 'row', gap: 6, marginTop: 14 },
  levelBtn: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 9, borderRadius: 14, borderWidth: 1 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  card: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  num: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

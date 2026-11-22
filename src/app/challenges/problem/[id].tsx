import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChallenge, getLevel, getModule } from '@/challenges';
import { exampleLine } from '@/challenges/harness';
import { CodeBlock, RichText, levelColor, openChallengeFile } from '@/components/challengeUi';
import { IconButton, LangBadge, Toast, useHaptics, useToast } from '@/components/ui';
import { useStore } from '@/store';
import { langMeta, mono, useTheme, type Language } from '@/theme';

const clip = (s: string) => (s.length > 420 ? s.slice(0, 419) + '…' : s);

export default function ProblemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { solved, projects, createProject } = useStore();
  const { toast, show } = useToast();
  const c = getChallenge(id);
  const [lang, setLang] = useState<Language>('python');
  const [reveal, setReveal] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { setReveal(false); scroll.current?.scrollTo({ y: 0, animated: false }); }, [id]);

  if (!c) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.textDim }}>Challenge not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: t.accent, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }
  const mod = getModule(`${c.level}.${c.moduleId}`)!;
  const level = getLevel(c.level)!;
  const color = levelColor(c.level, t.accent);
  const ok = !!solved[c.id];
  const prev = mod.challenges[c.index - 2];
  const next = mod.challenges[c.index];
  const go = (target: typeof prev) => target && router.setParams({ id: target.id });
  const hasFile = (l: Language) => projects.some((p) => p.challengeId === c.id && p.language === l);
  const solution = lang === 'python' ? c.py : c.js;

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <IconButton name="chevron-back" label="Back" onPress={() => router.back()} size={26} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{mod.title}</Text>
          <Text style={{ color: t.textFaint, fontSize: 11, fontFamily: mono }}>{level.title} · {c.index} of {mod.challenges.length}</Text>
        </View>
        <IconButton name="chevron-up" label="Previous challenge" disabled={!prev} onPress={() => { h.tap(); go(prev); }} />
        <IconButton name="chevron-down" label="Next challenge" disabled={!next} onPress={() => { h.tap(); go(next); }} />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View style={[styles.pill, { backgroundColor: color + '22' }]}><Text style={{ color, fontWeight: '800', fontSize: 11 }}>{level.title.toUpperCase()}</Text></View>
          {ok && (
            <View style={[styles.pill, { backgroundColor: t.success + '22', flexDirection: 'row', gap: 4, alignItems: 'center' }]}>
              <Ionicons name="checkmark-circle" size={12} color={t.success} />
              <Text style={{ color: t.success, fontWeight: '800', fontSize: 11 }}>SOLVED</Text>
            </View>
          )}
        </View>
        <Text style={[styles.h1, { color: t.text }]}>{c.title}</Text>
        <RichText text={c.prompt} />

        <Text style={[styles.h2, { color: t.textFaint }]}>EXAMPLES</Text>
        <View style={{ gap: 8 }}>
          {c.tests.slice(0, c.methods ? 2 : 3).map((tc, i) => (
            <View key={i} style={[styles.example, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text selectable style={{ fontFamily: mono, fontSize: 12.5, lineHeight: 19, color: t.text }}>{clip(exampleLine(c, tc, lang))}</Text>
            </View>
          ))}
        </View>
        {c.notes?.length ? (
          <>
            <Text style={[styles.h2, { color: t.textFaint }]}>NOTES</Text>
            <RichText text={c.notes.map((n) => '- ' + n).join('\n')} fontSize={14} />
          </>
        ) : null}
        <Text style={{ color: t.textFaint, fontSize: 12, marginTop: 12 }}>{c.tests.length} test cases run when you tap Run.</Text>

        <View style={styles.solveRow}>
          {(['python', 'javascript'] as Language[]).map((l) => (
            <Pressable key={l} onPress={() => { h.impact(); openChallengeFile(c, l, projects, createProject); }}
              style={({ pressed }) => [styles.solveBtn, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
              <LangBadge language={l} size={28} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700', fontSize: 14 }}>{hasFile(l) ? 'Continue' : 'Solve'}</Text>
                <Text style={{ color: t.textDim, fontSize: 11 }}>in {langMeta[l].label}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={t.textDim} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.solutionCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="bulb-outline" size={20} color={t.warn} />
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flex: 1 }}>Solution & explanation</Text>
          </View>
          {!reveal ? (
            <>
              <Text style={{ color: t.textDim, fontSize: 13, lineHeight: 19, marginTop: 8 }}>Give it a real try first. Working through a problem is how it sticks.</Text>
              <Pressable onPress={() => { h.tap(); setReveal(true); }} style={({ pressed }) => [styles.revealBtn, { backgroundColor: t.surface2, opacity: pressed ? 0.8 : 1 }]}>
                <Ionicons name="eye-outline" size={16} color={t.text} />
                <Text style={{ color: t.text, fontWeight: '700' }}>Reveal solution</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.seg, { backgroundColor: t.surface2 }]}>
                {(['python', 'javascript'] as Language[]).map((l) => (
                  <Pressable key={l} onPress={() => { h.tap(); setLang(l); }} style={[styles.segBtn, lang === l && { backgroundColor: t.elevated }]}>
                    <Ionicons name={langMeta[l].icon} size={14} color={lang === l ? langMeta[l].color : t.textDim} />
                    <Text style={{ color: lang === l ? t.text : t.textDim, fontWeight: '700', fontSize: 13 }}>{langMeta[l].label}</Text>
                  </Pressable>
                ))}
              </View>
              <View>
                <CodeBlock code={solution} />
                <IconButton name="copy-outline" label="Copy solution" size={16} color={t.textDim}
                  onPress={() => { Clipboard.setStringAsync(solution); h.success(); show('Solution copied'); }}
                  style={[styles.copy, { backgroundColor: t.surface }]} />
              </View>
              <Text style={[styles.h2, { color: t.textFaint, marginTop: 18 }]}>HOW IT WORKS</Text>
              <RichText text={c.explain} />
              <View style={[styles.complexity, { backgroundColor: t.surface2 }]}>
                <Ionicons name="speedometer-outline" size={15} color={t.info} />
                <Text style={{ color: t.text, fontSize: 13, flex: 1, lineHeight: 18 }}>{c.complexity}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.navRow}>
          <Pressable disabled={!prev} onPress={() => go(prev)} style={[styles.navBtn, { borderColor: t.border, opacity: prev ? 1 : 0.35 }]}>
            <Ionicons name="arrow-back" size={16} color={t.text} />
            <Text style={{ color: t.text, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>{prev ? prev.title : 'Previous'}</Text>
          </Pressable>
          <Pressable disabled={!next} onPress={() => go(next)} style={[styles.navBtn, { borderColor: t.border, opacity: next ? 1 : 0.35, justifyContent: 'flex-end' }]}>
            <Text style={{ color: t.text, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>{next ? next.title : 'Next'}</Text>
            <Ionicons name="arrow-forward" size={16} color={t.text} />
          </Pressable>
        </View>
      </ScrollView>
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 10 },
  h2: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 22, marginBottom: 8 },
  example: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
  solveRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  solveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  solutionCard: { marginTop: 18, borderRadius: 20, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  revealBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 12, borderRadius: 12 },
  seg: { flexDirection: 'row', padding: 3, borderRadius: 10, marginTop: 14, marginBottom: 10 },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8 },
  copy: { position: 'absolute', top: 6, right: 6, width: 32, height: 32, borderRadius: 10 },
  complexity: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 12 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
});

import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { starterCode } from '../challenges/harness';
import type { Challenge } from '../challenges/types';
import type { Project } from '../store';
import { mono, useTheme, type Language } from '../theme';

export function ProgressBar({ value, color, height = 6 }: { value: number; color: string; height?: number }) {
  const t = useTheme();
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: t.surface2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

/** Renders explanation text: blank-line separated paragraphs, "- " bullets and "1. " numbered steps. */
export function RichText({ text, fontSize = 15 }: { text: string; fontSize?: number }) {
  const t = useTheme();
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <View style={{ gap: 12 }}>
      {blocks.map((b, bi) => {
        const lines = b.split('\n');
        const isList = lines.every((l) => /^\s*(-|\d+\.)\s+/.test(l));
        if (isList) {
          return (
            <View key={bi} style={{ gap: 6 }}>
              {lines.map((l, li) => {
                const m = l.match(/^\s*(-|\d+\.)\s+(.*)$/)!;
                return (
                  <View key={li} style={{ flexDirection: 'row', gap: 8, paddingRight: 4 }}>
                    <Text style={{ color: t.accent, fontWeight: '800', fontSize, lineHeight: fontSize * 1.5, minWidth: m[1] === '-' ? 10 : 18 }}>{m[1] === '-' ? '•' : m[1]}</Text>
                    <Text style={{ color: t.text, fontSize, lineHeight: fontSize * 1.5, flex: 1 }}>{m[2]}</Text>
                  </View>
                );
              })}
            </View>
          );
        }
        // A heading-like first line followed by a list ("Step by step:" + items).
        const firstList = lines.findIndex((l) => /^\s*(-|\d+\.)\s+/.test(l));
        if (firstList > 0 && lines.slice(firstList).every((l) => /^\s*(-|\d+\.)\s+/.test(l))) {
          return (
            <View key={bi} style={{ gap: 6 }}>
              <Text style={{ color: t.text, fontSize, lineHeight: fontSize * 1.5 }}>{lines.slice(0, firstList).join('\n')}</Text>
              <RichText text={lines.slice(firstList).join('\n')} fontSize={fontSize} />
            </View>
          );
        }
        return <Text key={bi} style={{ color: t.text, fontSize, lineHeight: fontSize * 1.5 }}>{b}</Text>;
      })}
    </View>
  );
}

export function CodeBlock({ code, fontSize = 12.5 }: { code: string; fontSize?: number }) {
  const t = useTheme();
  return (
    <View style={[styles.code, { backgroundColor: t.editorBg, borderColor: t.border }]}>
      <Text selectable style={{ fontFamily: mono, fontSize, lineHeight: fontSize * 1.55, color: t.editor.fg }}>{code}</Text>
    </View>
  );
}

export const levelColor = (level: string, fallback: string) =>
  ({ easy: '#3FB950', medium: '#D29922', hard: '#F85149', interview: '#A371F7' } as Record<string, string>)[level] ?? fallback;

const fileName = (c: Challenge) => c.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** Opens the user's file for a challenge in a language, creating it from the starter code if needed. */
export function openChallengeFile(
  c: Challenge,
  lang: Language,
  projects: Project[],
  createProject: (p: { language: Language; name?: string; code?: string; challengeId?: string }) => Project,
) {
  const existing = projects.filter((p) => p.challengeId === c.id && p.language === lang).sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const p = existing ?? createProject({ language: lang, name: fileName(c), code: starterCode(c, lang), challengeId: c.id });
  router.push({ pathname: '/editor/[id]', params: { id: p.id } });
}

const styles = StyleSheet.create({
  code: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});

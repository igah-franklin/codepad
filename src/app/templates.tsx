import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, LangBadge, useHaptics } from '@/components/ui';
import { useStore } from '@/store';
import { TEMPLATES, type Template } from '@/templates';
import { langMeta, mono, useTheme, type Language } from '@/theme';

export default function Templates() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { createProject } = useStore();
  const [lang, setLang] = useState<Language>('python');

  const use = (tpl: Template) => {
    h.impact();
    const p = createProject({ language: tpl.language, name: tpl.filename, code: tpl.code, stdin: tpl.stdin });
    router.back();
    setTimeout(() => router.push({ pathname: '/editor/[id]', params: { id: p.id } }), 50);
  };

  const list = TEMPLATES.filter((x) => x.language === lang);

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]}>Examples</Text>
          <Text style={{ color: t.textDim, marginTop: 2 }}>Tap one to open a copy and run it.</Text>
        </View>
        <IconButton name="close" label="Close" onPress={() => router.back()} style={{ backgroundColor: t.surface }} />
      </View>

      <View style={[styles.segment, { backgroundColor: t.surface, borderColor: t.border }]}>
        {(['python', 'javascript'] as Language[]).map((l) => (
          <Pressable key={l} onPress={() => { h.tap(); setLang(l); }} style={[styles.segBtn, lang === l && { backgroundColor: t.surface2 }]}>
            <Ionicons name={langMeta[l].icon} size={16} color={lang === l ? langMeta[l].color : t.textDim} />
            <Text style={{ color: lang === l ? t.text : t.textDim, fontWeight: '700' }}>{langMeta[l].label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30, gap: 12 }}>
        {list.map((tpl) => (
          <Pressable key={tpl.id} onPress={() => use(tpl)}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? t.surface2 : t.surface, borderColor: t.border }]}>
            <View style={styles.cardTop}>
              <LangBadge language={tpl.language} size={30} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: t.text }]}>{tpl.title}</Text>
                <Text style={{ color: t.textDim, fontSize: 13, marginTop: 2, lineHeight: 18 }}>{tpl.description}</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={26} color={t.accent} />
            </View>
            <View style={[styles.code, { backgroundColor: t.editorBg, borderColor: t.border }]}>
              <Text style={{ fontFamily: mono, fontSize: 11.5, color: t.textDim, lineHeight: 17 }} numberOfLines={5}>
                {tpl.code.split('\n').filter((l) => l.trim()).slice(0, 5).join('\n')}
              </Text>
            </View>
            <View style={styles.tags}>
              {tpl.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: t.surface2 }]}>
                  <Text style={{ color: t.textDim, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
                </View>
              ))}
              {tpl.stdin ? (
                <View style={[styles.tag, { backgroundColor: t.accent + '22' }]}>
                  <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>uses input</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  segment: { flexDirection: 'row', marginHorizontal: 16, padding: 4, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  card: { borderRadius: 20, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  code: { marginTop: 12, borderRadius: 12, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});

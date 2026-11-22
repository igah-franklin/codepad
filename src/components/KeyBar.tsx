import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { mono, useTheme, type Language } from '../theme';
import type { CodeEditorHandle } from './CodeEditor';
import { useHaptics } from './ui';

const C = '‸'; // caret marker understood by the editor

type Key = { label?: string; icon?: keyof typeof Ionicons.glyphMap; insert?: string; cmd?: Parameters<CodeEditorHandle['command']>[0]; a11y: string };

const common: Key[] = [
  { icon: 'chevron-back', cmd: 'left', a11y: 'Cursor left' },
  { icon: 'chevron-forward', cmd: 'right', a11y: 'Cursor right' },
  { label: '( )', insert: `(${C})`, a11y: 'Parentheses' },
  { label: '[ ]', insert: `[${C}]`, a11y: 'Brackets' },
  { label: '{ }', insert: `{${C}}`, a11y: 'Braces' },
  { label: '" "', insert: `"${C}"`, a11y: 'Double quotes' },
  { label: "' '", insert: `'${C}'`, a11y: 'Single quotes' },
  { label: ':', insert: ':', a11y: 'Colon' },
  { label: '=', insert: ' = ', a11y: 'Equals' },
  { label: '.', insert: '.', a11y: 'Dot' },
  { label: ',', insert: ', ', a11y: 'Comma' },
  { label: '+', insert: '+', a11y: 'Plus' },
  { label: '-', insert: '-', a11y: 'Minus' },
  { label: '*', insert: '*', a11y: 'Star' },
  { label: '/', insert: '/', a11y: 'Slash' },
  { label: '<', insert: '<', a11y: 'Less than' },
  { label: '>', insert: '>', a11y: 'Greater than' },
  { label: '_', insert: '_', a11y: 'Underscore' },
  { label: '!', insert: '!', a11y: 'Exclamation' },
];
const jsKeys: Key[] = [
  { label: ';', insert: ';', a11y: 'Semicolon' },
  { label: '=>', insert: ' => ', a11y: 'Arrow' },
  { label: '` `', insert: `\`${C}\``, a11y: 'Backticks' },
  { label: '${}', insert: `\${${C}}`, a11y: 'Template placeholder' },
  { label: '&&', insert: ' && ', a11y: 'And' },
  { label: '||', insert: ' || ', a11y: 'Or' },
  { label: 'log', insert: `console.log(${C})`, a11y: 'console.log' },
];
const pyKeys: Key[] = [
  { label: '#', insert: '# ', a11y: 'Comment' },
  { label: 'f""', insert: `f"${C}"`, a11y: 'f-string' },
  { label: 'self', insert: 'self', a11y: 'self' },
  { label: 'print', insert: `print(${C})`, a11y: 'print' },
  { label: 'def', insert: `def ${C}():`, a11y: 'def' },
];
const tail: Key[] = [
  { icon: 'chatbox-ellipses-outline', cmd: 'comment', a11y: 'Toggle comment' },
  { icon: 'arrow-undo', cmd: 'undo', a11y: 'Undo' },
  { icon: 'arrow-redo', cmd: 'redo', a11y: 'Redo' },
  { icon: 'search', cmd: 'search', a11y: 'Find and replace' },
];

export function KeyBar({ language, editor, onDismiss }: { language: Language; editor: React.RefObject<CodeEditorHandle | null>; onDismiss: () => void }) {
  const t = useTheme();
  const h = useHaptics();
  const keys = [...common.slice(0, 2), ...(language === 'python' ? pyKeys : jsKeys), ...common.slice(2), ...tail];

  const press = (k: Key) => {
    h.tap();
    if (k.cmd) editor.current?.command(k.cmd);
    else if (k.insert) editor.current?.insert(k.insert);
  };

  return (
    <View style={[styles.bar, { backgroundColor: t.surface, borderTopColor: t.border }]}>
      <Pressable onPress={() => { h.tap(); editor.current?.command('indent'); }} onLongPress={() => editor.current?.command('outdent')}
        style={({ pressed }) => [styles.key, styles.fixed, { backgroundColor: pressed ? t.elevated : t.surface2 }]} accessibilityLabel="Indent (long-press to outdent)">
        <Text style={[styles.keyText, { color: t.accent }]}>⇥</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.scroll}>
        {keys.map((k) => (
          <Pressable key={k.a11y} onPress={() => press(k)} accessibilityLabel={k.a11y}
            style={({ pressed }) => [styles.key, { backgroundColor: pressed ? t.elevated : t.surface2 }]}>
            {k.icon ? <Ionicons name={k.icon} size={17} color={t.text} /> : <Text style={[styles.keyText, { color: t.text }]}>{k.label}</Text>}
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={onDismiss} style={({ pressed }) => [styles.key, styles.fixed, { backgroundColor: pressed ? t.elevated : t.surface2 }]} accessibilityLabel="Hide keyboard">
        <Ionicons name="chevron-down" size={18} color={t.textDim} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 6, borderTopWidth: StyleSheet.hairlineWidth },
  scroll: { gap: 6, paddingHorizontal: 6 },
  key: { minWidth: 40, height: 38, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fixed: { minWidth: 44 },
  keyText: { fontFamily: mono, fontSize: 15, fontWeight: '600' },
});

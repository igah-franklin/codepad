import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { OutputEvent } from '../runner';
import { mono, type Theme } from '../theme';

type Seg = { kind: string; text: string };
type Block =
  | { key: string; type: 'stream'; segs: Seg[] }
  | { key: string; type: 'line'; kind: OutputEvent['kind']; text: string; line?: number | null }
  | { key: string; type: 'image'; data: string }
  | { key: string; type: 'table'; table: { header: string[]; body: string[][] } };

export function toBlocks(events: OutputEvent[]): Block[] {
  const blocks: Block[] = [];
  events.forEach((e, i) => {
    const key = String(i);
    if (e.kind === 'stdout' || e.kind === 'stdin' || e.kind === 'stderr') {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'stream') {
        const ls = last.segs[last.segs.length - 1];
        if (ls.kind === e.kind) ls.text += e.text;
        else last.segs.push({ kind: e.kind, text: e.text });
      } else blocks.push({ key, type: 'stream', segs: [{ kind: e.kind, text: e.text }] });
    } else if (e.kind === 'image' && e.data) blocks.push({ key, type: 'image', data: e.data });
    else if (e.kind === 'table' && e.table) blocks.push({ key, type: 'table', table: e.table });
    else blocks.push({ key, type: 'line', kind: e.kind, text: e.text, line: e.line });
  });
  // trim trailing newline from streams for neat rendering
  blocks.forEach((b) => {
    if (b.type === 'stream') {
      const last = b.segs[b.segs.length - 1];
      last.text = last.text.replace(/\n$/, '');
    }
  });
  return blocks;
}

export function eventsToText(events: OutputEvent[]) {
  return events
    .map((e) => (e.kind === 'stdout' || e.kind === 'stdin' || e.kind === 'stderr' ? e.text : e.kind === 'table' && e.table ? [e.table.header, ...e.table.body].map((r) => r.join('\t')).join('\n') + '\n' : e.kind === 'image' ? '[image]\n' : e.text + '\n'))
    .join('');
}

const PlotImage = memo(function PlotImage({ data, theme }: { data: string; theme: Theme }) {
  const uri = `data:image/png;base64,${data}`;
  const [ratio, setRatio] = useState(1.6);
  useEffect(() => { Image.getSize(uri, (w, h) => h && setRatio(w / h), () => {}); }, [uri]);
  return (
    <View style={[styles.imageWrap, { borderColor: theme.border }]}>
      <Image source={{ uri }} style={{ width: '100%', aspectRatio: ratio }} resizeMode="contain" accessibilityLabel="Chart output" />
    </View>
  );
});

function TableBlock({ table, theme }: { table: { header: string[]; body: string[][] }; theme: Theme }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
      <View style={[styles.table, { borderColor: theme.border }]}>
        {[table.header, ...table.body].map((row, ri) => (
          <View key={ri} style={[styles.tr, { backgroundColor: ri === 0 ? theme.surface2 : 'transparent', borderColor: theme.border }]}>
            {row.map((c, ci) => (
              <Text key={ci} style={[styles.td, { color: ri === 0 ? theme.textDim : theme.text, fontWeight: ri === 0 ? '700' : '400' }]}>{c}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function ConsoleView({ events, theme, fontSize, onLineTap, emptyHint }: {
  events: OutputEvent[]; theme: Theme; fontSize: number; onLineTap: (line: number) => void; emptyHint: string;
}) {
  const blocks = useMemo(() => toBlocks(events), [events]);
  const list = useRef<FlatList<Block>>(null);
  const fs = Math.max(11, fontSize - 1);

  const color = (k: string) =>
    k === 'error' || k === 'stderr' ? theme.danger
      : k === 'warn' ? theme.warn
        : k === 'info' ? theme.info
          : k === 'stdin' ? theme.accent
            : k === 'system' ? theme.textFaint
              : k === 'result' ? theme.textDim
                : theme.text;

  if (!blocks.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="terminal-outline" size={28} color={theme.textFaint} />
        <Text style={{ color: theme.textFaint, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>{emptyHint}</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={list}
      data={blocks}
      keyExtractor={(b) => b.key}
      contentContainerStyle={styles.content}
      onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
      initialNumToRender={30}
      renderItem={({ item: b }) => {
        if (b.type === 'stream') {
          return (
            <Text selectable style={[styles.mono, { fontSize: fs, lineHeight: fs * 1.55 }]}>
              {b.segs.map((s, i) => (
                <Text key={i} style={{ color: color(s.kind), fontWeight: s.kind === 'stdin' ? '700' : '400' }}>{s.text}</Text>
              ))}
            </Text>
          );
        }
        if (b.type === 'image') return <PlotImage data={b.data} theme={theme} />;
        if (b.type === 'table') return <TableBlock table={b.table} theme={theme} />;
        const isErr = b.kind === 'error';
        const isWarn = b.kind === 'warn';
        const body = (
          <View style={[
            styles.line,
            isErr && { backgroundColor: theme.danger + '18', borderLeftColor: theme.danger, borderLeftWidth: 3 },
            isWarn && { backgroundColor: theme.warn + '14', borderLeftColor: theme.warn, borderLeftWidth: 3 },
          ]}>
            {b.kind === 'result' && <Text style={[styles.mono, { color: theme.textFaint, fontSize: fs }]}>{'← '}</Text>}
            <Text selectable style={[styles.mono, { flex: 1, color: color(b.kind), fontSize: fs, lineHeight: fs * 1.55, fontStyle: b.kind === 'system' ? 'italic' : 'normal' }]}>{b.text}</Text>
          </View>
        );
        if (isErr && b.line) {
          return (
            <Pressable onPress={() => onLineTap(b.line!)} accessibilityLabel={`Go to line ${b.line}`}>
              {body}
              <View style={styles.jump}>
                <Ionicons name="return-down-forward" size={13} color={theme.danger} />
                <Text style={{ color: theme.danger, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Go to line {b.line}</Text>
              </View>
            </Pressable>
          );
        }
        return body;
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 40, gap: 4 },
  mono: { fontFamily: mono },
  line: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginHorizontal: -8 },
  jump: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  imageWrap: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginVertical: 6, borderWidth: StyleSheet.hairlineWidth },
  table: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, overflow: 'hidden' },
  tr: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  td: { fontFamily: mono, fontSize: 13, paddingHorizontal: 10, paddingVertical: 6, minWidth: 70 },
});

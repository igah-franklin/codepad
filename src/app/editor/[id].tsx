import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, Share,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChallenge } from '@/challenges';
import { PASS_SENTINEL, withHarness } from '@/challenges/harness';
import { CodeEditor, type CodeEditorHandle } from '@/components/CodeEditor';
import { ConsoleView, eventsToText } from '@/components/ConsoleView';
import { KeyBar } from '@/components/KeyBar';
import { ActionSheet, IconButton, TextPrompt, Toast, useHaptics, useToast } from '@/components/ui';
import { useRunner, type OutputEvent, type RunResult } from '@/runner';
import { useStore } from '@/store';
import { langMeta, mono, useTheme } from '@/theme';

type RunState =
  | { s: 'idle' }
  | { s: 'running'; startedAt: number }
  | { s: 'done'; result: RunResult };
type Snap = 'min' | 'half' | 'full';
type Tab = 'console' | 'input';

const BAR_H = 58;
const MAX_EVENTS = 4000;

const usesInput = (lang: string, code: string) => {
  const stripped = code.replace(lang === 'python' ? /#.*$/gm : /\/\/.*$/gm, '');
  return lang === 'python' ? /\binput\s*\(/.test(stripped) : /\b(input|prompt)\s*\(/.test(stripped);
};

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  const { getProject, updateProject, deleteProject, duplicateProject, settings, projects, markSolved } = useStore();
  const runner = useRunner();
  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);
  const initial = useRef(getProject(id!)).current;
  const challenge = getChallenge(project?.challengeId);
  const passedRef = useRef(false);
  const tailRef = useRef('');

  const editor = useRef<CodeEditorHandle>(null);
  const [events, setEvents] = useState<OutputEvent[]>([]);
  const [run, setRun] = useState<RunState>({ s: 'idle' });
  const [elapsed, setElapsed] = useState(0);
  const [tab, setTab] = useState<Tab>('console');
  const [snap, setSnap] = useState<Snap>('min');
  const [kb, setKb] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1, lines: 1 });
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [askInput, setAskInput] = useState(false);
  const [stdinDraft, setStdinDraft] = useState('');
  const { toast, show } = useToast();
  const pendingEvents = useRef<OutputEvent[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Console panel sizing ----------
  const [areaH, setAreaH] = useState(0);
  const heights = useMemo(() => ({
    min: BAR_H,
    half: Math.max(BAR_H + 120, Math.round(areaH * 0.46)),
    full: Math.max(BAR_H + 200, areaH - 8),
  }), [areaH]);
  const panelH = useRef(new Animated.Value(BAR_H)).current;
  const curH = useRef(BAR_H);
  useEffect(() => {
    const sub = panelH.addListener(({ value }) => { curH.current = value; });
    return () => panelH.removeListener(sub);
  }, [panelH]);
  const animateTo = useCallback((s: Snap) => {
    setSnap(s);
    Animated.spring(panelH, { toValue: heights[s], useNativeDriver: false, bounciness: 0, speed: 16 }).start();
  }, [heights, panelH]);
  useEffect(() => { if (areaH) panelH.setValue(heights[snap]); /* re-fit on resize */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaH]);

  const pan = useMemo(() => {
    let start = 0;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => { start = curH.current; },
      onPanResponderMove: (_, g) => panelH.setValue(Math.min(heights.full, Math.max(heights.min, start - g.dy))),
      onPanResponderRelease: (_, g) => {
        const target = curH.current - g.vy * 120;
        const order: Snap[] = ['min', 'half', 'full'];
        const best = order.reduce((a, b) => (Math.abs(heights[b] - target) < Math.abs(heights[a] - target) ? b : a));
        h.tap();
        animateTo(best);
      },
    });
  }, [heights, panelH, animateTo, h]);

  // ---------- Keyboard ----------
  const snapBeforeKb = useRef<Snap>('min');
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(showEvt, () => setKb(true));
    const b = Keyboard.addListener(hideEvt, () => setKb(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  const [editorFocused, setEditorFocused] = useState(false);
  const editorTyping = kb && editorFocused;
  useEffect(() => {
    if (editorTyping) {
      snapBeforeKb.current = snap;
      if (snap !== 'min') animateTo('min');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTyping]);

  // ---------- Timer while running ----------
  useEffect(() => {
    if (run.s !== 'running') return;
    const i = setInterval(() => setElapsed(Date.now() - run.startedAt), 100);
    return () => clearInterval(i);
  }, [run]);

  // ---------- Edits ----------
  const onChange = useCallback((code: string) => { if (id) updateProject(id, { code }); }, [id, updateProject]);

  // ---------- Running ----------
  const pushEvents = useCallback((evs: OutputEvent[]) => {
    for (const e of evs) {
      if (e.kind === 'clear') pendingEvents.current = [{ kind: 'system', text: 'Console was cleared' }];
      else pendingEvents.current.push(e);
    }
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        const batch = pendingEvents.current;
        pendingEvents.current = [];
        setEvents((prev) => {
          const cleared = batch.findIndex((x) => x.kind === 'system' && x.text === 'Console was cleared') === 0;
          const next = cleared ? batch : prev.concat(batch);
          return next.length > MAX_EVENTS ? [{ kind: 'warn', text: `… showing the last ${MAX_EVENTS} entries` } as OutputEvent].concat(next.slice(-MAX_EVENTS)) : next;
        });
      }, 50);
    }
  }, []);

  const execute = useCallback(async (stdinOverride?: string) => {
    if (!project) return;
    const code = (await editor.current?.getDoc()) ?? project.code;
    if (code !== project.code) updateProject(project.id, { code });
    const stdin = stdinOverride ?? project.stdin;
    editor.current?.clearError();
    editor.current?.blur();
    Keyboard.dismiss();
    h.impact();
    if (settings.clearOnRun) { pendingEvents.current = []; setEvents([]); }
    else pushEvents([{ kind: 'system', text: `— run at ${new Date().toLocaleTimeString()} —` }]);
    setTab('console');
    if (snap === 'min') animateTo('half');
    setElapsed(0);
    setRun({ s: 'running', startedAt: Date.now() });
    passedRef.current = false;
    tailRef.current = '';
    const program = challenge ? withHarness(challenge, project.language, code) : code;
    runner.run(project.language, program, stdin, {
      onEvents: (evs) => {
        if (challenge && !passedRef.current) {
          // output can arrive in chunks, so look across event boundaries
          tailRef.current = (tailRef.current + evs.map((e) => e.text).join('\n')).slice(-400);
          if (tailRef.current.includes(PASS_SENTINEL)) passedRef.current = true;
        }
        pushEvents(evs);
      },
      onDone: (result) => {
        setRun({ s: 'done', result });
        if (challenge && result.ok && passedRef.current) { markSolved(challenge.id); show('Challenge solved! 🎉'); }
        if (result.ok) h.success(); else if (result.reason !== 'stopped') h.error();
        if (result.line) setTimeout(() => editor.current?.gotoLine(result.line!, true), 150);
        if (result.reason === 'crashed') pushEvents([{ kind: 'error', text: 'The runtime ran out of memory and was restarted. Try again with smaller data.' }]);
      },
    });
  }, [project, updateProject, settings.clearOnRun, pushEvents, snap, animateTo, runner, h, challenge, markSolved, show]);

  const onRunPress = useCallback(async () => {
    if (run.s === 'running') { h.tap(); runner.stop(); return; }
    if (!project) return;
    const code = (await editor.current?.getDoc()) ?? project.code;
    if (usesInput(project.language, code) && !project.stdin.trim()) {
      setStdinDraft('');
      setAskInput(true);
      return;
    }
    execute();
  }, [run.s, project, execute, runner, h]);

  // ---------- Actions ----------
  const shareFile = async () => {
    if (!project) return;
    const code = (await editor.current?.getDoc()) ?? project.code;
    const filename = `${project.name}.${langMeta[project.language].ext}`;
    try {
      if (await Sharing.isAvailableAsync()) {
        const f = new File(Paths.cache, filename);
        if (f.exists) f.delete();
        f.create();
        await f.write(code);
        await Sharing.shareAsync(f.uri, { mimeType: project.language === 'python' ? 'text/x-python' : 'text/javascript', dialogTitle: filename, UTI: 'public.plain-text' });
        return;
      }
    } catch { /* fall through */ }
    Share.share({ message: code, title: filename });
  };
  const copyOutput = () => {
    const text = eventsToText(events);
    if (!text.trim()) { show('Nothing to copy yet'); return; }
    Clipboard.setStringAsync(text);
    h.success();
    show('Output copied');
  };

  if (!project) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.textDim }}>This file no longer exists.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: t.accent, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }

  const meta = langMeta[project.language];
  const running = run.s === 'running';
  const pyBooting = project.language === 'python' && running && runner.py.status === 'loading';
  const status = (() => {
    if (running) return { icon: 'ellipse' as const, color: t.warn, text: pyBooting ? (runner.py.message || 'Starting Python…') : `Running… ${(elapsed / 1000).toFixed(1)}s` };
    if (run.s === 'done') {
      const r = run.result;
      if (r.reason === 'timeout') return { icon: 'time-outline' as const, color: t.danger, text: 'Timed out' };
      if (r.reason === 'stopped') return { icon: 'stop-circle-outline' as const, color: t.warn, text: 'Stopped' };
      if (r.ok) return { icon: 'checkmark-circle' as const, color: t.success, text: `Finished · ${r.ms < 1000 ? r.ms + ' ms' : (r.ms / 1000).toFixed(2) + ' s'}` };
      return { icon: 'close-circle' as const, color: t.danger, text: r.line ? `Error · line ${r.line}` : 'Error' };
    }
    return { icon: 'terminal-outline' as const, color: t.textFaint, text: 'Ready' };
  })();

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <IconButton name="chevron-back" label="Back" onPress={() => router.back()} size={26} />
        <Pressable style={styles.titleWrap} onPress={() => setRenaming(true)} accessibilityLabel="Rename file">
          <View style={[styles.langDot, { backgroundColor: meta.color }]} />
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.fileName, { color: t.text }]} numberOfLines={1}>
              {project.name}<Text style={{ color: t.textFaint }}>.{meta.ext}</Text>
            </Text>
            <Text style={{ color: t.textFaint, fontSize: 11, fontFamily: mono }} numberOfLines={1}>
              {meta.label} · Ln {cursor.line}, Col {cursor.col} · {cursor.lines} lines
            </Text>
          </View>
        </Pressable>
        <IconButton name="share-outline" label="Share file" onPress={shareFile} />
        <IconButton name="ellipsis-horizontal-circle-outline" label="More" onPress={() => { h.tap(); setMenu(true); }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <View style={{ flex: 1 }} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
          <CodeEditor
            ref={editor}
            initialDoc={initial?.code ?? ''}
            language={project.language}
            theme={t}
            settings={settings}
            onChange={onChange}
            onCursor={setCursor}
            onFocusChange={setEditorFocused}
          />

          {/* Floating run button while typing */}
          {editorTyping && (
            <Pressable onPress={onRunPress} accessibilityLabel={running ? 'Stop' : 'Run'}
              style={({ pressed }) => [styles.miniRun, { backgroundColor: running ? t.danger : t.accent, opacity: pressed ? 0.85 : 1 }]}>
              <Ionicons name={running ? 'stop' : 'play'} size={18} color={running ? '#fff' : t.accentInk} />
            </Pressable>
          )}

          {/* Console panel */}
          <Animated.View style={[styles.panel, { height: panelH, backgroundColor: t.consoleBg, borderColor: t.border, display: editorTyping ? 'none' : 'flex' }]}>
            <View {...pan.panHandlers} style={[styles.panelBar, { borderBottomColor: snap === 'min' ? 'transparent' : t.border }]}>
              <Pressable onPress={() => animateTo(snap === 'min' ? 'half' : snap === 'half' ? 'full' : 'min')} hitSlop={10} style={styles.grabArea} accessibilityLabel="Resize console">
                <View style={[styles.grabber, { backgroundColor: t.border }]} />
              </Pressable>
              <View style={styles.tabs}>
                {(['console', 'input'] as Tab[]).map((k) => (
                  <Pressable key={k} onPress={() => { h.tap(); setTab(k); if (snap === 'min') animateTo('half'); }}
                    style={[styles.tab, tab === k && snap !== 'min' && { backgroundColor: t.surface2 }]}>
                    <Ionicons name={k === 'console' ? 'terminal' : 'enter-outline'} size={14} color={tab === k && snap !== 'min' ? t.text : t.textDim} />
                    <Text style={{ color: tab === k && snap !== 'min' ? t.text : t.textDim, fontWeight: '700', fontSize: 13 }}>{k === 'console' ? 'Console' : 'Input'}</Text>
                    {k === 'input' && project.stdin.trim() ? <View style={[styles.inputDot, { backgroundColor: t.accent }]} /> : null}
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => { if (snap === 'min') animateTo('half'); setTab('console'); }} style={styles.statusWrap}>
                {running ? <ActivityIndicator size="small" color={status.color} style={{ transform: [{ scale: 0.7 }] }} /> : <Ionicons name={status.icon} size={14} color={status.color} />}
                <Text style={{ color: status.color, fontSize: 12, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>{status.text}</Text>
              </Pressable>
              <Pressable onPress={onRunPress} accessibilityLabel={running ? 'Stop program' : 'Run program'}
                style={({ pressed }) => [styles.runBtn, { backgroundColor: running ? t.danger : t.accent, transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
                <Ionicons name={running ? 'stop' : 'play'} size={16} color={running ? '#fff' : t.accentInk} />
                <Text style={{ color: running ? '#fff' : t.accentInk, fontWeight: '800', fontSize: 15 }}>{running ? 'Stop' : 'Run'}</Text>
              </Pressable>
            </View>

            {snap !== 'min' && (
              <View style={{ flex: 1 }}>
                {tab === 'console' ? (
                  <>
                    <ConsoleView
                      events={events}
                      theme={t}
                      fontSize={settings.fontSize}
                      onLineTap={(line) => { editor.current?.gotoLine(line, true); animateTo('min'); }}
                      emptyHint={pyBooting ? 'Loading the Python runtime. This happens once per launch.' : 'Output appears here.\nTap Run to execute your code.'}
                    />
                    {events.length > 0 && (
                      <View style={styles.consoleTools}>
                        <IconButton name="copy-outline" label="Copy output" size={18} color={t.textDim} onPress={copyOutput} style={[styles.toolBtn, { backgroundColor: t.surface }]} />
                        <IconButton name="trash-outline" label="Clear console" size={18} color={t.textDim} onPress={() => { h.tap(); setEvents([]); setRun({ s: 'idle' }); }} style={[styles.toolBtn, { backgroundColor: t.surface }]} />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={{ flex: 1, padding: 14 }}>
                    <Text style={{ color: t.textDim, fontSize: 13, marginBottom: 8, lineHeight: 18 }}>
                      Standard input for <Text style={{ fontFamily: mono, color: t.text }}>{project.language === 'python' ? 'input()' : 'input() / prompt()'}</Text> — one value per line, read in order.
                    </Text>
                    <TextInput
                      value={project.stdin}
                      onChangeText={(v) => updateProject(project.id, { stdin: v })}
                      multiline
                      placeholder={'Ada\n36'}
                      placeholderTextColor={t.textFaint}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textAlignVertical="top"
                      style={[styles.stdin, { color: t.text, backgroundColor: t.surface, borderColor: t.border }]}
                    />
                    {project.stdin ? (
                      <Pressable onPress={() => updateProject(project.id, { stdin: '' })} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                        <Text style={{ color: t.danger, fontWeight: '600' }}>Clear input</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </View>

        {editorTyping && settings.keyBar && (
          <KeyBar language={project.language} editor={editor} onDismiss={() => { editor.current?.blur(); Keyboard.dismiss(); }} />
        )}
        {!kb && <View style={{ height: insets.bottom, backgroundColor: t.consoleBg }} />}
      </KeyboardAvoidingView>

      {/* Menus & dialogs */}
      <ActionSheet
        visible={menu} onClose={() => setMenu(false)} title={`${project.name}.${meta.ext}`} subtitle={`${meta.label} · ${cursor.lines} lines`}
        actions={[
          ...(challenge ? [{ label: 'View challenge', icon: 'trophy-outline' as const, onPress: () => router.push({ pathname: '/challenges/problem/[id]', params: { id: challenge.id } }) }] : []),
          { label: 'Find & replace', icon: 'search-outline', onPress: () => editor.current?.command('search') },
          { label: 'Rename', icon: 'create-outline', onPress: () => setRenaming(true) },
          { label: 'Duplicate', icon: 'copy-outline', onPress: () => { const d = duplicateProject(project.id); if (d) router.replace({ pathname: '/editor/[id]', params: { id: d.id } }); } },
          { label: 'Copy all code', icon: 'clipboard-outline', onPress: async () => { await Clipboard.setStringAsync((await editor.current?.getDoc()) ?? project.code); show('Code copied'); } },
          { label: 'Paste & replace all', icon: 'document-text-outline', onPress: async () => { const c = await Clipboard.getStringAsync(); if (c) { editor.current?.setDoc(c); updateProject(project.id, { code: c }); show('Replaced with clipboard'); } } },
          ...(project.language === 'python' ? [{ label: 'Restart Python', icon: 'refresh-outline' as const, onPress: () => { runner.restartPython(); show('Restarting Python…'); } }] : []),
          { label: 'Settings', icon: 'settings-outline', onPress: () => router.push('/settings') },
          { label: 'Delete file', icon: 'trash-outline', destructive: true, onPress: () => setConfirmDel(true) },
        ]}
      />
      <TextPrompt visible={renaming} title="Rename file" initial={project.name} suffix={'.' + meta.ext}
        onCancel={() => setRenaming(false)}
        onSubmit={(v) => { updateProject(project.id, { name: v.replace(/\.(py|js)$/i, '').replace(/[\\/]/g, '_') }); setRenaming(false); }} />
      <TextPrompt visible={confirmDel} title="Delete file?" destructive confirmLabel="Delete" message={`“${project.name}.${meta.ext}” will be permanently removed.`}
        onCancel={() => setConfirmDel(false)}
        onSubmit={() => { setConfirmDel(false); router.back(); setTimeout(() => deleteProject(project.id), 300); }} />

      <Modal visible={askInput} transparent animationType="fade" onRequestClose={() => setAskInput(false)} statusBarTranslucent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalCenter}>
          <Pressable style={styles.backdrop} onPress={() => setAskInput(false)} />
          <View style={[styles.dialog, { backgroundColor: t.elevated, borderColor: t.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.dlgIcon, { backgroundColor: t.accent + '22' }]}><Ionicons name="enter-outline" size={20} color={t.accent} /></View>
              <Text style={{ color: t.text, fontSize: 18, fontWeight: '700', flex: 1 }}>This program reads input</Text>
            </View>
            <Text style={{ color: t.textDim, marginTop: 10, lineHeight: 20 }}>Enter the values it will ask for — one per line. They're saved in the Input tab for next time.</Text>
            <TextInput value={stdinDraft} onChangeText={setStdinDraft} multiline autoFocus placeholder={'value 1\nvalue 2'} placeholderTextColor={t.textFaint}
              autoCapitalize="none" autoCorrect={false} textAlignVertical="top"
              style={[styles.stdin, { color: t.text, backgroundColor: t.surface2, borderColor: t.border, marginTop: 14, minHeight: 110, flex: 0 }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Pressable onPress={() => { setAskInput(false); execute(''); }} style={styles.dlgBtn}><Text style={{ color: t.textDim, fontWeight: '600' }}>Run without</Text></Pressable>
              <Pressable onPress={() => { setAskInput(false); updateProject(project.id, { stdin: stdinDraft }); execute(stdinDraft); }}
                style={[styles.dlgBtn, { backgroundColor: t.accent, flexDirection: 'row', gap: 6, alignItems: 'center' }]}>
                <Ionicons name="play" size={14} color={t.accentInk} />
                <Text style={{ color: t.accentInk, fontWeight: '800' }}>Run</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  langDot: { width: 8, height: 8, borderRadius: 4 },
  fileName: { fontSize: 16, fontWeight: '700' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0, overflow: 'hidden', elevation: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } },
  panelBar: { height: BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 8, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  grabArea: { position: 'absolute', top: 0, left: 0, right: 0, height: 14, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 36, height: 4, borderRadius: 2 },
  tabs: { flexDirection: 'row', gap: 2 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  inputDot: { width: 6, height: 6, borderRadius: 3 },
  statusWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', paddingRight: 4 },
  runBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 38, borderRadius: 19 },
  miniRun: { position: 'absolute', right: 14, bottom: 14, width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  consoleTools: { position: 'absolute', right: 10, top: 8, flexDirection: 'row', gap: 6 },
  toolBtn: { width: 34, height: 34, borderRadius: 10 },
  stdin: { flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12, fontFamily: mono, fontSize: 15, lineHeight: 22 },
  modalCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  dialog: { width: '100%', maxWidth: 440, borderRadius: 22, padding: 20, borderWidth: StyleSheet.hairlineWidth },
  dlgIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dlgBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
});

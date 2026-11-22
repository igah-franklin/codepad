import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { Settings } from '../store';
import type { Language, Theme } from '../theme';
import { EDITOR_HTML } from '../web/editorHtml';

export type CodeEditorHandle = {
  insert: (text: string) => void;
  command: (name: 'undo' | 'redo' | 'comment' | 'indent' | 'outdent' | 'search' | 'selectAll' | 'left' | 'right' | 'home' | 'end') => void;
  focus: () => void;
  blur: () => void;
  gotoLine: (line: number, error?: boolean) => void;
  clearError: () => void;
  setDoc: (doc: string) => void;
  getDoc: () => Promise<string>;
};

type Props = {
  initialDoc: string;
  language: Language;
  theme: Theme;
  settings: Settings;
  onChange: (doc: string) => void;
  onCursor?: (c: { line: number; col: number; lines: number }) => void;
  onFocusChange?: (focused: boolean) => void;
};

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { initialDoc, language, theme, settings, onChange, onCursor, onFocusChange }, ref,
) {
  const web = useRef<React.ComponentRef<typeof WebView>>(null);
  const [loaded, setLoaded] = useState(false);
  const readyRef = useRef(false);
  const docRef = useRef(initialDoc);
  const pending = useRef<Map<string, (d: string) => void>>(new Map());

  const send = useCallback((msg: object) => {
    if (!readyRef.current) return;
    web.current?.injectJavaScript(`window.__cmHandle && window.__cmHandle(${JSON.stringify(msg)});true;`);
  }, []);

  const options = {
    language,
    theme: theme.mode,
    fontSize: settings.fontSize,
    wrap: settings.wrap,
    autocomplete: settings.autocomplete,
    lineNumbers: settings.lineNumbers,
    tabSize: settings.tabSize,
  };
  const optsKey = JSON.stringify(options);
  useEffect(() => { send({ type: 'setOptions', options }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [optsKey, send]);

  useImperativeHandle(ref, () => ({
    insert: (text) => send({ type: 'insert', text }),
    command: (name) => send({ type: 'command', name }),
    focus: () => { web.current?.requestFocus(); send({ type: 'focus' }); },
    blur: () => send({ type: 'blur' }),
    gotoLine: (line, error) => send({ type: 'gotoLine', line, error }),
    clearError: () => send({ type: 'clearError' }),
    setDoc: (doc) => { docRef.current = doc; send({ type: 'setDoc', doc }); },
    getDoc: () => new Promise<string>((resolve) => {
      if (!readyRef.current) return resolve(docRef.current);
      const requestId = Math.random().toString(36).slice(2);
      const timer = setTimeout(() => { pending.current.delete(requestId); resolve(docRef.current); }, 400);
      pending.current.set(requestId, (d) => { clearTimeout(timer); resolve(d); });
      send({ type: 'getDoc', requestId });
    }),
  }), [send]);
  const onMessage = useCallback((e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'ready') {
      readyRef.current = true;
      send({ type: 'init', doc: docRef.current, options: JSON.parse(optsKey) });
      setLoaded(true);
    } else if (msg.type === 'change') {
      const changed = msg.doc !== docRef.current;
      docRef.current = msg.doc;
      if (msg.requestId && pending.current.has(msg.requestId)) {
        pending.current.get(msg.requestId)!(msg.doc);
        pending.current.delete(msg.requestId);
      }
      if (changed) onChange(msg.doc);
    } else if (msg.type === 'cursor') onCursor?.(msg);
    else if (msg.type === 'focus') onFocusChange?.(true);
    else if (msg.type === 'blur') onFocusChange?.(false);
  }, [onChange, onCursor, onFocusChange, send, optsKey]);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.editorBg }]}>
      <WebView
        ref={web}
        source={{ html: EDITOR_HTML, baseUrl: 'https://editor.codepad.app/' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        textZoom={100}
        setSupportMultipleWindows={false}
        style={{ backgroundColor: theme.editorBg, opacity: loaded ? 1 : 0 }}
        onContentProcessDidTerminate={() => { readyRef.current = false; setLoaded(false); web.current?.reload(); }}
        onRenderProcessGone={() => { readyRef.current = false; setLoaded(false); web.current?.reload(); }}
      />
      {!loaded && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={theme.accent} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});

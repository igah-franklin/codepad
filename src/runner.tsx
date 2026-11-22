import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useStore } from './store';
import type { Language } from './theme';
import { RUNNER_HTML } from './web/runnerHtml';

export type OutputKind = 'stdout' | 'stderr' | 'stdin' | 'log' | 'info' | 'warn' | 'error' | 'result' | 'system' | 'image' | 'table' | 'clear';
export type OutputEvent = { kind: OutputKind; text: string; data?: string; table?: { header: string[]; body: string[][] }; line?: number | null };
export type RunResult = { ok: boolean; ms: number; line: number | null; reason: string | null };
export type PyStatus = { status: 'idle' | 'loading' | 'ready' | 'error'; message?: string };

type RunHandlers = { onEvents: (e: OutputEvent[]) => void; onDone: (r: RunResult) => void };

type Runner = {
  ready: boolean;
  py: PyStatus;
  run: (language: Language, code: string, stdin: string, handlers: RunHandlers) => string;
  stop: () => void;
  preloadPython: () => void;
  restartPython: () => void;
};

const Ctx = createContext<Runner | null>(null);

export function RunnerProvider({ children }: { children: React.ReactNode }) {
  const { settings, ready: storeReady } = useStore();
  const ref = useRef<React.ComponentRef<typeof WebView>>(null);
  const [ready, setReady] = useState(false);
  const [py, setPy] = useState<PyStatus>({ status: 'idle' });
  const handlers = useRef<Map<string, RunHandlers>>(new Map());
  const queue = useRef<object[]>([]);
  const readyRef = useRef(false);

  const send = useCallback((msg: object) => {
    if (!readyRef.current) { queue.current.push(msg); return; }
    ref.current?.injectJavaScript(`window.__runnerHandle && window.__runnerHandle(${JSON.stringify(msg)});true;`);
  }, []);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    switch (msg.type) {
      case 'runnerReady':
        readyRef.current = true;
        setReady(true);
        queue.current.splice(0).forEach((m) => send(m));
        break;
      case 'pyStatus':
        setPy({ status: msg.status, message: msg.message });
        break;
      case 'event':
        handlers.current.get(msg.id)?.onEvents([{ kind: msg.kind, text: msg.text ?? '', data: msg.data, table: msg.table, line: msg.line }]);
        break;
      case 'events':
        handlers.current.get(msg.id)?.onEvents((msg.events as any[]).map((ev) => ({ kind: ev.kind, text: ev.text ?? '', data: ev.data, table: ev.table, line: ev.line })));
        break;
      case 'done': {
        const h = handlers.current.get(msg.id);
        handlers.current.delete(msg.id);
        h?.onDone({ ok: !!msg.ok, ms: msg.ms ?? 0, line: msg.line ?? null, reason: msg.reason ?? null });
        break;
      }
    }
  }, [send]);

  // Warm up Python in the background so the first run is fast.
  useEffect(() => {
    if (ready && storeReady && settings.preloadPython) send({ type: 'preload', language: 'python' });
  }, [ready, storeReady, settings.preloadPython, send]);

  const run = useCallback<Runner['run']>((language, code, stdin, h) => {
    const id = 'run_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    handlers.current.set(id, h);
    send({ type: 'run', id, language, code, stdin, timeoutMs: settings.timeoutSec * 1000 });
    return id;
  }, [send, settings.timeoutSec]);

  const stop = useCallback(() => send({ type: 'stop' }), [send]);
  const preloadPython = useCallback(() => send({ type: 'preload', language: 'python' }), [send]);
  const restartPython = useCallback(() => send({ type: 'restartPython' }), [send]);

  // If the web process dies (Android memory pressure / iOS content process), reload it.
  const onCrash = useCallback(() => {
    readyRef.current = false;
    setReady(false);
    setPy({ status: 'idle' });
    handlers.current.forEach((h) => h.onDone({ ok: false, ms: 0, line: null, reason: 'crashed' }));
    handlers.current.clear();
    ref.current?.reload();
  }, []);

  const value = useMemo(() => ({ ready, py, run, stop, preloadPython, restartPython }), [ready, py, run, stop, preloadPython, restartPython]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <View style={styles.hidden} pointerEvents="none">
        <WebView
          ref={ref}
          source={{ html: RUNNER_HTML, baseUrl: 'https://runner.codepad.app/' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          onMessage={onMessage}
          onContentProcessDidTerminate={onCrash}
          onRenderProcessGone={onCrash}
          style={styles.web}
        />
      </View>
    </Ctx.Provider>
  );
}

export function useRunner() {
  const r = useContext(Ctx);
  if (!r) throw new Error('useRunner outside provider');
  return r;
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 2, height: 2, left: -10, top: -10, opacity: 0, overflow: 'hidden' },
  web: { width: 2, height: 2, backgroundColor: 'transparent' },
});

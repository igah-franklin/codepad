import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { langMeta, mono, useTheme, type Language } from '../theme';

export function useHaptics() {
  const { settings } = useStore();
  return {
    tap: () => settings.haptics && Haptics.selectionAsync().catch(() => {}),
    impact: () => settings.haptics && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
    success: () => settings.haptics && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
    error: () => settings.haptics && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
  };
}

export function LangBadge({ language, size = 34 }: { language: Language; size?: number }) {
  const m = langMeta[language];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: mono, fontWeight: '800', fontSize: size * 0.36, color: m.ink, letterSpacing: -0.5 }}>{m.short}</Text>
    </View>
  );
}

export function IconButton({ name, onPress, size = 22, color, style, label, disabled }: {
  name: keyof typeof Ionicons.glyphMap; onPress: () => void; size?: number; color?: string; style?: StyleProp<ViewStyle>; label: string; disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={disabled} hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, { backgroundColor: pressed ? t.surface2 : 'transparent', opacity: disabled ? 0.4 : 1 }, style]}
    >
      <Ionicons name={name} size={size} color={color || t.text} />
    </Pressable>
  );
}

export type SheetAction = { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; destructive?: boolean; hint?: string };

export function ActionSheet({ visible, title, subtitle, actions, onClose }: {
  visible: boolean; title?: string; subtitle?: string; actions: SheetAction[]; onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const h = useHaptics();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={[styles.sheet, { backgroundColor: t.elevated, paddingBottom: insets.bottom + 12, borderColor: t.border }]}>
        <View style={[styles.grabber, { backgroundColor: t.border }]} />
        {title ? <Text style={[styles.sheetTitle, { color: t.text }]} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={[styles.sheetSub, { color: t.textDim }]}>{subtitle}</Text> : null}
        <View style={{ marginTop: 6 }}>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => { h.tap(); onClose(); setTimeout(a.onPress, Platform.OS === 'ios' ? 280 : 50); }}
              style={({ pressed }) => [styles.sheetRow, { backgroundColor: pressed ? t.surface2 : 'transparent' }]}
            >
              <Ionicons name={a.icon} size={21} color={a.destructive ? t.danger : t.text} style={{ width: 30 }} />
              <Text style={[styles.sheetLabel, { color: a.destructive ? t.danger : t.text }]}>{a.label}</Text>
              {a.hint ? <Text style={{ color: t.textFaint, fontSize: 13 }}>{a.hint}</Text> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export function TextPrompt({ visible, title, message, initial, placeholder, confirmLabel = 'Save', suffix, onCancel, onSubmit, destructive }: {
  visible: boolean; title: string; message?: string; initial?: string; placeholder?: string; confirmLabel?: string; suffix?: string;
  onCancel: () => void; onSubmit: (v: string) => void; destructive?: boolean;
}) {
  const t = useTheme();
  const [v, setV] = useState(initial || '');
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const hasInput = initial !== undefined;
  useEffect(() => { if (visible) { setV(initial || ''); setTimeout(() => input.current?.focus(), 250); } }, [visible, initial]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.center}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.dialog, { backgroundColor: t.elevated, borderColor: t.border }]}>
          <Text style={[styles.dialogTitle, { color: t.text }]}>{title}</Text>
          {message ? <Text style={{ color: t.textDim, fontSize: 14, marginTop: 6, lineHeight: 20 }}>{message}</Text> : null}
          {hasInput && (
            <View style={[styles.inputRow, { backgroundColor: t.surface2, borderColor: t.border }]}>
              <TextInput
                ref={input} value={v} onChangeText={setV} placeholder={placeholder} placeholderTextColor={t.textFaint}
                autoCapitalize="none" autoCorrect={false} selectTextOnFocus returnKeyType="done"
                onSubmitEditing={() => v.trim() && onSubmit(v.trim())}
                style={[styles.input, { color: t.text }]}
              />
              {suffix ? <Text style={{ color: t.textFaint, fontFamily: mono, fontSize: 15 }}>{suffix}</Text> : null}
            </View>
          )}
          <View style={styles.dialogBtns}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.dlgBtn, { backgroundColor: pressed ? t.surface2 : 'transparent' }]}>
              <Text style={{ color: t.textDim, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => (hasInput ? v.trim() && onSubmit(v.trim()) : onSubmit(''))}
              style={({ pressed }) => [styles.dlgBtn, { backgroundColor: destructive ? t.danger : t.accent, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={{ color: destructive ? '#fff' : t.accentInk, fontWeight: '700', fontSize: 16 }}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Toast({ message }: { message: string | null }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  if (!message) return null;
  return (
    <View pointerEvents="none" style={[styles.toast, { top: insets.top + 60, backgroundColor: t.mode === 'dark' ? '#E8EDF4' : '#141821' }]}>
      <Text style={{ color: t.mode === 'dark' ? '#0B0D12' : '#fff', fontWeight: '600' }}>{message}</Text>
    </View>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1800);
  };
  return { toast: msg, show };
}

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 10, paddingTop: 8, borderWidth: StyleSheet.hairlineWidth },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10 },
  sheetTitle: { fontSize: 17, fontWeight: '700', paddingHorizontal: 14 },
  sheetSub: { fontSize: 13, paddingHorizontal: 14, marginTop: 2 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14 },
  sheetLabel: { fontSize: 16, fontWeight: '500', flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 420, borderRadius: 22, padding: 20, borderWidth: StyleSheet.hairlineWidth },
  dialogTitle: { fontSize: 19, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, paddingVertical: 13, fontFamily: mono },
  dialogBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  dlgBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
  toast: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, zIndex: 100, elevation: 10 },
});

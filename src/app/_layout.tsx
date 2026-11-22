import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RunnerProvider } from '@/runner';
import { StoreProvider, useStore } from '@/store';
import { useTheme } from '@/theme';

function Shell() {
  const t = useTheme();
  const { ready } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.mode === 'dark' ? 'light' : 'dark'} />
      {ready && (
        <RunnerProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="editor/[id]" options={{ gestureEnabled: true }} />
            <Stack.Screen name="templates" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </RunnerProvider>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

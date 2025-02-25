import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export default function TranslationLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ title: 'Camera' }} />
      </Stack>
    </ThemeProvider>
  );
}
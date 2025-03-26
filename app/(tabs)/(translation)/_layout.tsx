import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6';

export default function TranslationLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ title: t('camera'), 
          headerRight: () => (
            <Link href="/camerahelp" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome6
                    name="question-circle"
                    size={25}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
        )}} />
        <Stack.Screen name="camerahelp" options={{ title: t('help') }} />
      </Stack>
    </ThemeProvider>
  );
}
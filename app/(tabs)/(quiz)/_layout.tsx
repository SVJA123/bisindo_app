import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6';
import { useTranslation } from 'react-i18next';

// just to add category help screen on this tab
export default function QuizLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="category" options={{ title: 'Category', 
          headerRight: () => (
            <Link href="/categoryhelp" asChild>
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
        <Stack.Screen name="categoryhelp" options={{ title: t('help') }} />
      </Stack>
    </ThemeProvider>
  );
}
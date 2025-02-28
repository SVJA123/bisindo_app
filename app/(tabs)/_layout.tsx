import React from 'react';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerLeft: () => <LanguageSelector />,
        headerRight: () => (
          <Link href="/information" asChild>
            <Pressable>
              {({ pressed }) => (
                <FontAwesome
                  name="info-circle"
                  size={25}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
        headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="(translation)"
        options={{
          title: t('translate'),
          tabBarIcon: ({ color }) => <TabBarIcon name="sign-language" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(quiz)"
        options={{
          title: t('quiz'),
          tabBarIcon: ({ color }) => <TabBarIcon name="leanpub" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alphabet"
        options={{
          title: t('alphabet'),
          tabBarIcon: ({ color }) => <TabBarIcon name="sort-alpha-desc" color={color} />,
        }}
      />
    </Tabs>
  );
}

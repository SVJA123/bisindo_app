import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// page to change the language of the app (flag icon)
const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === 'en' ? 'id' : 'en';
    await i18n.changeLanguage(newLanguage);
    await AsyncStorage.setItem('language', newLanguage);
  };

  // flags
  const flag = currentLanguage === 'en' ? '🇬🇧' : '🇮🇩';

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.button}>
      <Text style={styles.flag}>{flag}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginLeft: 15,
  },
  flag: {
    fontSize: 24,
  },
});

export default LanguageSelector;
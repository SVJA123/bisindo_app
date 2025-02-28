import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/locales/en.json';
import id from '@/locales/id.json';

// Function to load the saved language
const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('language');
  return savedLanguage || 'en'; // Default to English if no language is saved
};

// Initialize i18next
loadLanguage().then((lng) => {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      id: { translation: id },
    },
    lng: lng, // Use the saved language
    fallbackLng: 'en', // Fallback language 
    interpolation: {
      escapeValue: false, 
    },
  });
});

export default i18n;
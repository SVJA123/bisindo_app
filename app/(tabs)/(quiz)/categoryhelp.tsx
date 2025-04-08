import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

// page to show the help for the quiz
const CategoryhelpScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('help')}</Text>
      <Text style={styles.text}>{t('quizHelpDescription')}</Text>
      <Text style={styles.text}>1. {t('quizHelpStep1')}</Text>
      <Text style={styles.text}>2. {t('quizHelpStep2')}</Text>
      <Text style={styles.text}>3. {t('quizHelpStep3')}</Text>
      <Text style={styles.text}>4. {t('quizHelpStep4')}</Text>
      <Text style={styles.text}>5. {t('quizHelpStep5')}</Text>
      <Text style={styles.text}>6. {t('quizHelpStep6')}</Text>
      <Text style={styles.text}>7. {t('quizHelpStep7')}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'flex-start', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left', 
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left', 
  },
});

export default CategoryhelpScreen;
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

const CamerahelpScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('help')}</Text>
      <Text style={styles.text}>{t('helpDescription')}</Text>
      <Text style={styles.text}>1. {t('helpStep1')}</Text>
      <Text style={styles.text}>2. {t('helpStep2')}</Text>
      <Text style={styles.text}>3. {t('helpStep3')}</Text>
      <Text style={styles.text}>4. {t('helpStep4')}</Text>
      <Text style={styles.text}>5. {t('helpStep5')}</Text>
      <Text style={styles.text}>6. {t('helpStep6')}</Text>
      <Text style={styles.text}>7. {t('helpStep7')}</Text>
      <Text style={styles.text}>8. {t('helpStep8')}</Text>
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

export default CamerahelpScreen;
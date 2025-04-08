import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTranslation } from 'react-i18next';

// page to show information about the app
export default function InformationScreen() {
  const { t } = useTranslation(); 

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Text style={styles.sectionTitle}>{t('aboutApp')}</Text>
      <Text style={styles.text}>{t('aboutAppDescription')}</Text>

      <Text style={styles.sectionTitle}>{t('features')}</Text>
      <Text style={styles.subTitle}>{t('fingerspellingTranslation')}</Text>
      <Text style={styles.text}>{t('fingerspellingTranslationDescription')}</Text>

      <Text style={styles.subTitle}>{t('alphabetSection')}</Text>
      <Text style={styles.text}>{t('alphabetSectionDescription')}</Text>

      <Text style={styles.subTitle}>{t('quizSection')}</Text>
      <Text style={styles.text}>{t('quizSectionDescription')}</Text>

      <Text style={styles.sectionTitle}>{t('howToUse')}</Text>
      <Text style={styles.text}>{t('howToUseDescription')}</Text>

      <Text style={styles.sectionTitle}>{t('contactUs')}</Text>
      <Text style={styles.text}>
        {t('contactUsDescription', { email: t('email') })}
        <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${t('email')}`)}>
          {t('email')}
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start', 
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left', 
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'left', 
  },
  text: {
    fontSize: 16,
    textAlign: 'left', 
    marginBottom: 15,
    lineHeight: 24,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
});
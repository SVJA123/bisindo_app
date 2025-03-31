import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, Linking } from 'react-native';
import InformationScreen from '../app/information';
import i18n from 'i18next';

describe('InformationScreen', () => {
  it('renders the welcome title correctly', () => {
    const { getByText } = render(<InformationScreen />);
    expect(getByText(i18n.t('welcome'))).toBeTruthy();
  });

  it('renders the about app section correctly', () => {
    const { getByText } = render(<InformationScreen />);
    expect(getByText(i18n.t('aboutApp'))).toBeTruthy();
    expect(getByText(i18n.t('aboutAppDescription'))).toBeTruthy();
  });

  it('renders the features section correctly', () => {
    const { getByText } = render(<InformationScreen />);
    expect(getByText(i18n.t('features'))).toBeTruthy();
    expect(getByText(i18n.t('fingerspellingTranslation'))).toBeTruthy();
    expect(getByText(i18n.t('fingerspellingTranslationDescription'))).toBeTruthy();
    expect(getByText(i18n.t('alphabetSection'))).toBeTruthy();
    expect(getByText(i18n.t('alphabetSectionDescription'))).toBeTruthy();
    expect(getByText(i18n.t('quizSection'))).toBeTruthy();
    expect(getByText(i18n.t('quizSectionDescription'))).toBeTruthy();
  });

  it('renders the how to use section correctly', () => {
    const { getByText } = render(<InformationScreen />);
    expect(getByText(i18n.t('howToUse'))).toBeTruthy();
    expect(getByText(i18n.t('howToUseDescription'))).toBeTruthy();
  });

  it('renders the contact us section correctly', () => {
    const { getByText } = render(<InformationScreen />);
    expect(getByText(i18n.t('contactUs'))).toBeTruthy();
    
    const emailText = i18n.t('email');
    expect(getByText(emailText)).toBeTruthy();
    
    const description = i18n.t('contactUsDescription', { email: emailText });
    expect(getByText(/Have questions or feedback\?/i)).toBeTruthy();
    expect(getByText(new RegExp(emailText))).toBeTruthy();
  });

  it('opens the email link when pressed', () => {
    const { getByText } = render(<InformationScreen />);
    const emailLink = getByText(i18n.t('email'));

    const openURLSpy = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

    emailLink.props.onPress();

    expect(openURLSpy).toHaveBeenCalledWith(`mailto:${i18n.t('email')}`);

    openURLSpy.mockRestore();
  });

  it('applies the correct styles to the title', () => {
    const { getByText } = render(<InformationScreen />);
    const title = getByText(i18n.t('welcome'));
    const flattenedStyle = StyleSheet.flatten(title.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: 10,
    });
  });

  it('applies the correct styles to the section titles', () => {
    const { getByText } = render(<InformationScreen />);
    const sectionTitle = getByText(i18n.t('aboutApp'));
    const flattenedStyle = StyleSheet.flatten(sectionTitle.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'left',
    });
  });

  it('applies the correct styles to the text', () => {
    const { getByText } = render(<InformationScreen />);
    const text = getByText(i18n.t('aboutAppDescription'));
    const flattenedStyle = StyleSheet.flatten(text.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 16,
      textAlign: 'left',
      marginBottom: 15,
      lineHeight: 24,
    });
  });

  it('applies the correct styles to the email link', () => {
    const { getByText } = render(<InformationScreen />);
    const emailLink = getByText(i18n.t('email'));
    const flattenedStyle = StyleSheet.flatten(emailLink.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      color: '#007BFF',
      textDecorationLine: 'underline',
    });
  });
});
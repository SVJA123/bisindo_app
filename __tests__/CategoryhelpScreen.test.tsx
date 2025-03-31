import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import CategoryhelpScreen from '../app/(tabs)/(quiz)/categoryhelp';
import i18n from 'i18next';

describe('CategoryhelpScreen', () => {
  it('renders the help page title correctly', () => {
    const { getByText } = render(<CategoryhelpScreen />);
    expect(getByText(i18n.t('help'))).toBeTruthy();
  });

  it('renders the help description correctly', () => {
    const { getByText } = render(<CategoryhelpScreen />);
    expect(getByText(i18n.t('quizHelpDescription'))).toBeTruthy();
  });

  it('renders all the help steps correctly', () => {
    const { getByText } = render(<CategoryhelpScreen />);

    expect(getByText(`1. ${i18n.t('quizHelpStep1')}`)).toBeTruthy();
    expect(getByText(`2. ${i18n.t('quizHelpStep2')}`)).toBeTruthy();
    expect(getByText(`3. ${i18n.t('quizHelpStep3')}`)).toBeTruthy();
    expect(getByText(`4. ${i18n.t('quizHelpStep4')}`)).toBeTruthy();
    expect(getByText(`5. ${i18n.t('quizHelpStep5')}`)).toBeTruthy();
    expect(getByText(`6. ${i18n.t('quizHelpStep6')}`)).toBeTruthy();
    expect(getByText(`7. ${i18n.t('quizHelpStep7')}`)).toBeTruthy();
  });

  it('applies the correct styles to the title', () => {
    const { getByText } = render(<CategoryhelpScreen />);
    const title = getByText(i18n.t('help'));
    const flattenedStyle = StyleSheet.flatten(title.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'left',
    });
  });

  it('applies the correct styles to the text', () => {
    const { getByText } = render(<CategoryhelpScreen />);
    const text = getByText(i18n.t('quizHelpDescription'));
    const flattenedStyle = StyleSheet.flatten(text.props.style); // Flatten the style array
    expect(flattenedStyle).toMatchObject({
      fontSize: 16,
      marginBottom: 10,
      textAlign: 'left',
    });
  });
});
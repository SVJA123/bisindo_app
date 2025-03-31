import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import QuizScreen from '../app/(tabs)/(quiz)/index';

jest.mock('expo-router', () => ({
  Link: jest.fn(({ children }) => children),
  useFocusEffect: jest.fn(),
}));

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('@react-native-async-storage/async-storage').getItem.mockImplementation((key: string) => {
      const scores: Record<string, string> = {
        'score-0': '75',
        'score-1': '50',
        'score-2': '25',
        'score-3': '100',
        'score-4': '0',
        'score-5': '10',
        'score-6': '90',
      };
      return Promise.resolve(scores[key] || '0');
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with all categories', async () => {
    const { findByText } = render(<QuizScreen />);

    expect(await findByText("Letters")).toBeTruthy();
    expect(await findByText("Animals")).toBeTruthy();
    expect(await findByText("Places")).toBeTruthy();
    expect(await findByText("Greetings")).toBeTruthy();
    expect(await findByText("Numbers")).toBeTruthy();
    expect(await findByText("Colors")).toBeTruthy();
    expect(await findByText("Test")).toBeTruthy();
  });

  it('displays correct high scores', async () => {
    const { findByText } = render(<QuizScreen />);

    expect(await findByText("75%")).toBeTruthy();
    expect(await findByText("50%")).toBeTruthy();
    expect(await findByText("25%")).toBeTruthy();
    expect(await findByText("100%")).toBeTruthy();
    expect(await findByText("0%")).toBeTruthy();
    expect(await findByText("10%")).toBeTruthy();
    expect(await findByText("90%")).toBeTruthy();
  });

  it('loads high scores on focus', async () => {
    const mockFocusEffect = require('expo-router').useFocusEffect;
    render(<QuizScreen />);

    await waitFor(() => expect(require('@react-native-async-storage/async-storage').getItem).toHaveBeenCalledTimes(7));

    mockFocusEffect.mock.calls[0][0]();
    await waitFor(() => expect(require('@react-native-async-storage/async-storage').getItem).toHaveBeenCalledTimes(14));
  });

  it('renders high score bars with correct widths', async () => {
    const { findAllByTestId } = render(<QuizScreen />);

    const highScoreBars = await waitFor(() => findAllByTestId("high-score-bar"));

    expect(StyleSheet.flatten(highScoreBars[0].props.style)).toMatchObject({ width: "75%" });
    expect(StyleSheet.flatten(highScoreBars[1].props.style)).toMatchObject({ width: "50%" });
    expect(StyleSheet.flatten(highScoreBars[2].props.style)).toMatchObject({ width: "25%" });
    expect(StyleSheet.flatten(highScoreBars[3].props.style)).toMatchObject({ width: "100%" });
    expect(StyleSheet.flatten(highScoreBars[4].props.style)).toMatchObject({ width: "0%" });
    expect(StyleSheet.flatten(highScoreBars[5].props.style)).toMatchObject({ width: "10%" });
    expect(StyleSheet.flatten(highScoreBars[6].props.style)).toMatchObject({ width: "90%" });
  });

  it('navigates to category screen when pressed', async () => {
    const { getByText } = render(<QuizScreen />);

    fireEvent.press(await waitFor(() => getByText('Letters')));

    const Link = require('expo-router').Link;
    await waitFor(() => expect(Link).toHaveBeenCalled());
  });
});
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import IndexScreen from "../app/(tabs)/(translation)/index";
import * as Speech from "expo-speech";
import * as SpeechRecognition from "expo-speech-recognition";
import { FontAwesome } from "@expo/vector-icons";
import i18n from "i18next";

const mockSpeechCallbacks: Record<string, Function> = {};

jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    start: jest.fn(),
    stop: jest.fn(),
  },
  useSpeechRecognitionEvent: jest.fn(
    (eventType: string, callback: Function) => {
      if (eventType === "result") {
        mockSpeechCallbacks["result"] = callback;
      } else if (eventType === "end") {
        mockSpeechCallbacks["end"] = callback;
      } else if (eventType === "start") {
        mockSpeechCallbacks["start"] = callback;
      } else if (eventType === "error") {
        mockSpeechCallbacks["error"] = callback;
      }
    }
  ),
}));

describe("IndexScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockSpeechCallbacks).forEach(
      (key) => delete mockSpeechCallbacks[key]
    );
  });

  it("renders correctly", () => {
    const { getByPlaceholderText, queryAllByTestId } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));
    expect(input).toBeTruthy();
    expect(input.props.value).toBe("");

    expect(queryAllByTestId(/^translated-image-/)).toHaveLength(0);
  });

  it("renders buttons correctly", () => {
    const { getByTestId } = render(<IndexScreen />);

    const microphoneButton = getByTestId("microphone-button");
    expect(microphoneButton).toBeTruthy();

    const cameraButton = getByTestId("camera-button");
    expect(cameraButton).toBeTruthy();

    const speechButton = getByTestId("speak-button");
    expect(speechButton).toBeTruthy();
  });

  it("updates text input and displays images", () => {
    const { getByPlaceholderText, getAllByTestId } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));

    fireEvent.changeText(input, "abc");
    const images = getAllByTestId(/^translated-image-/);
    expect(images.length).toBe(3);
  });

  it("renders correct images for specific letters", () => {
    const { getByPlaceholderText, getAllByTestId } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));

    fireEvent.changeText(input, "a");
    const image = getAllByTestId("translated-image-0");
    expect(image.length).toBe(1);
  });

  it("renders space images for spaces", () => {
    const { getByPlaceholderText, getAllByTestId } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));

    fireEvent.changeText(input, "a b c");
    const images = getAllByTestId(/^translated-image-/);
    const spaces = getAllByTestId("space-element");
    expect(images.length).toBe(3);
    expect(spaces.length).toBe(2);
  });

  it("calls Speech.speak when capturedText is not empty", () => {
    const { getByTestId, getByPlaceholderText } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));
    const speechButton = getByTestId("speak-button");

    fireEvent.changeText(input, "hello");

    fireEvent.press(speechButton);

    expect(Speech.speak).toHaveBeenCalledWith("hello", {
      language: i18n.t("languageCodeTTS"),
      pitch: 1.0,
      rate: 1.0,
    });
  });

  it("shows an alert when capturedText is empty", () => {
    const { getByTestId } = render(<IndexScreen />);
    const speechButton = getByTestId("speak-button");

    fireEvent.press(speechButton);

    expect(global.alert).toHaveBeenCalledWith(i18n.t("missingText"));
  });

  it("handles permission denial gracefully", async () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    (
      SpeechRecognition.ExpoSpeechRecognitionModule
        .requestPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({
      granted: false,
    });

    const { getByTestId } = render(<IndexScreen />);
    const microphoneButton = getByTestId("microphone-button");

    fireEvent.press(microphoneButton);

    await waitFor(() => {
      expect(
        SpeechRecognition.ExpoSpeechRecognitionModule.requestPermissionsAsync
      ).toHaveBeenCalled();
      expect(
        SpeechRecognition.ExpoSpeechRecognitionModule.start
      ).not.toHaveBeenCalled();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith("Permissions not granted", {
      granted: false,
    });
    consoleWarnSpy.mockRestore();
  });

  it("starts speech recognition when handleStart is called", async () => {
    const { getByTestId } = render(<IndexScreen />);
    const microphoneButton = getByTestId("microphone-button");

    fireEvent.press(microphoneButton);

    await waitFor(() =>
      expect(
        SpeechRecognition.ExpoSpeechRecognitionModule.requestPermissionsAsync
      ).toHaveBeenCalled()
    );
    expect(
      SpeechRecognition.ExpoSpeechRecognitionModule.start
    ).toHaveBeenCalledWith({
      lang: i18n.t("languageCodeSpeech"),
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
    });
  });

  it("stops speech recognition when handleStop is called", async () => {
    const { getByTestId } = render(<IndexScreen />);
    const microphoneButton = getByTestId("microphone-button");

    fireEvent.press(microphoneButton);
    act(() => {
      if (mockSpeechCallbacks["start"]) {
        mockSpeechCallbacks["start"]();
      }
    });
    await waitFor(() =>
      expect(
        SpeechRecognition.ExpoSpeechRecognitionModule.start
      ).toHaveBeenCalled()
    );

    fireEvent.press(microphoneButton);
    act(() => {
      if (mockSpeechCallbacks["end"]) {
        mockSpeechCallbacks["end"]();
      }
    });
    await waitFor(() =>
      expect(
        SpeechRecognition.ExpoSpeechRecognitionModule.stop
      ).toHaveBeenCalled()
    );
  });

  it("changes button icon from microphone to stop when speech recognition starts", async () => {
    const { getByTestId } = render(<IndexScreen />);
    const microphoneButton = getByTestId("microphone-button");

    const microphoneIcon =
      getByTestId("microphone-button").findByType(FontAwesome);
    expect(microphoneIcon.props.name).toBe("microphone");

    fireEvent.press(microphoneButton);

    act(() => {
      if (mockSpeechCallbacks["start"]) {
        mockSpeechCallbacks["start"]();
      }
    });

    await waitFor(() => {
      const stopIcon = getByTestId("microphone-button").findByType(FontAwesome);
      expect(stopIcon.props.name).toBe("stop");
    });
  });

  it("updates text state when speech recognition results are received", async () => {
    const { getByPlaceholderText, getByTestId } = render(<IndexScreen />);
    const input = getByPlaceholderText(i18n.t("placeholder"));

    fireEvent.press(getByTestId("microphone-button"));

    await waitFor(() => {
      expect(mockSpeechCallbacks["result"]).toBeDefined();
    });

    act(() => {
      mockSpeechCallbacks["result"]({
        results: [{ transcript: "hello world" }],
      });
    });

    expect(input.props.value).toBe("hello world");
  });

  it("logs an error when speech recognition fails", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const mockErrorEvent = {
      error: "network",
      message: "Network error occurred",
    };

    render(<IndexScreen />);

    if (mockSpeechCallbacks["error"]) {
      mockSpeechCallbacks["error"](mockErrorEvent);
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "error code:",
      "network",
      "error message:",
      "Network error occurred"
    );

    consoleSpy.mockRestore();
  });

  it("camera button is wrapped in Link with correct href", () => {
    const { getByTestId } = render(<IndexScreen />);
    const cameraButton = getByTestId("camera-button");

    expect(cameraButton).toBeTruthy();
    expect(cameraButton.parent.props.href).toBe("/camera");
  });
});

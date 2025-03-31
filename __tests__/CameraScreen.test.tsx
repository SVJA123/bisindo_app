import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import CameraScreen from "../app/(tabs)/(translation)/camera";
import { NativeModules, NativeEventEmitter, View, Text } from "react-native";
import * as Speech from "expo-speech";
import i18n from "i18next";

describe("CameraScreen", () => {
  let visionCameraMock: any;
  let eventEmitter: NativeEventEmitter;

  async function simulateLetterDetection(eventEmitter: NativeEventEmitter, mockLandmarks: number[], letters: string[], consecutiveCount: number = 8) {
    for (const letter of letters) {
      NativeModules.TFLiteModule.runModel.mockResolvedValue(letter);
      for (let i = 0; i < consecutiveCount; i++) {
        await act(async () => {
          eventEmitter.emit("onHandLandmarksDetected", {
            landmarks: mockLandmarks,
          });
          await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state updates
        });
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks();

    NativeModules.HandLandmarks.initModel.mockResolvedValue(null);
    NativeModules.TFLiteModule.runModel.mockResolvedValue(null);
    (global.alert as jest.Mock).mockClear();

    visionCameraMock = require("react-native-vision-camera");
    visionCameraMock.useCameraDevice.mockImplementation(() => ({
      id: "mock-device",
      position: "front",
    }));
    visionCameraMock.useCameraPermission.mockImplementation(() => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    }));

    eventEmitter = new NativeEventEmitter(NativeModules.HandLandmarks);
  });

    afterEach(() => {
        eventEmitter.removeAllListeners('OnHandLandmarksDetected');
    });

  it("renders correctly", async () => {
    const { getByTestId } = render(<CameraScreen />);

    expect(getByTestId("camera")).toBeTruthy();
    expect(getByTestId("detected-letter")).toBeTruthy();
    expect(getByTestId("current-word")).toBeTruthy();
    expect(getByTestId("sentences")).toBeTruthy();
    expect(getByTestId("slider")).toBeTruthy();
  });

  it("handles camera permission denied", async () => {
    visionCameraMock.useCameraPermission.mockImplementation(() => ({
      hasPermission: false,
      requestPermission: jest.fn().mockResolvedValue(false),
    }));

    const { getByText } = render(<CameraScreen />);
    expect(getByText("No permission")).toBeTruthy();
  });

  it("handles no camera device available", async () => {
    visionCameraMock.useCameraDevice.mockImplementation(() => null);

    const { getByText } = render(<CameraScreen />);
    expect(getByText("No device")).toBeTruthy();
  });

  it("detecting letters", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);


   await simulateLetterDetection(eventEmitter, mockLandmarks, ["A"]);

    expect(NativeModules.TFLiteModule.runModel).toHaveBeenCalledWith(
      mockLandmarks
    );
    expect(getByTestId("detected-letter").props.children).toBe("A");
  });

  it("not forming words", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    NativeModules.TFLiteModule.runModel.mockResolvedValue("A");
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        eventEmitter.emit("onHandLandmarksDetected", {
          landmarks: mockLandmarks,
        });
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state updates
      });
    }
    expect(getByTestId("detected-letter").props.children).toBe("A");
    expect(getByTestId("current-word").props.children).toBe("");
  });

  it("forming words", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    NativeModules.TFLiteModule.runModel.mockResolvedValue("H");
    for (let i = 0; i < 8; i++) {
      await act(async () => {
        eventEmitter.emit("onHandLandmarksDetected", {
          landmarks: mockLandmarks,
        });
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state updates
      });
    }

    expect(NativeModules.TFLiteModule.runModel).toHaveBeenCalledWith(
      mockLandmarks
    );
    expect(getByTestId("detected-letter").props.children).toBe("H");

    NativeModules.TFLiteModule.runModel.mockResolvedValue("I");
    for (let i = 0; i < 8; i++) {
      await act(async () => {
        eventEmitter.emit("onHandLandmarksDetected", {
          landmarks: mockLandmarks,
        });
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state updates
      });
    }

    expect(getByTestId("detected-letter").props.children).toBe("I");
    expect(getByTestId("current-word").props.children).toBe("HI");
  });

  it("forming sentences", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    const letters = [
      "H",
      "E",
      "L",
      "L",
      "O",
      " ",
      "W",
      "O",
      "R",
      "L",
      "D",
      " ",
    ];

    await simulateLetterDetection(eventEmitter, mockLandmarks, letters);

    expect(getByTestId("sentences").props.children).toBe("HELLO WORLD");
  });

  it("handles speak button press with text", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    const letters = [
      "H",
      "E",
      "L",
      "L",
      "O",
      " ",
      "W",
      "O",
      "R",
      "L",
      "D",
      " ",
    ];

    await simulateLetterDetection(eventEmitter, mockLandmarks, letters);

    fireEvent.press(getByTestId("tts-button"));
    expect(Speech.speak).toHaveBeenCalledWith("HELLO,WORLD", {
      language: i18n.t("languageCodeTTS"),
      pitch: 1.0,
      rate: 1.0,
    });
  });

  it("handles speak button press without text", async () => {
    const { getByTestId } = render(<CameraScreen />);

    fireEvent.press(getByTestId("tts-button"));
    expect(global.alert).toHaveBeenCalledWith(i18n.t("missingText"));
  });

  it("handles delete letter button press", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    const letters = [
      "H", "I"
    ];

    await simulateLetterDetection(eventEmitter, mockLandmarks, letters);
    expect(getByTestId("current-word").props.children).toBe("HI");
    fireEvent.press(getByTestId("delete-letter-button"));
    expect(getByTestId("current-word").props.children).toBe("H");
  });

  it("handles delete word button press", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);

    const letters = [
      "H", "E", "L", "L", "O", " ", "W", "O", "R", "L", "D", " "
    ];

    await simulateLetterDetection(eventEmitter, mockLandmarks, letters);
    expect(getByTestId("sentences").props.children).toBe("HELLO WORLD");
    fireEvent.press(getByTestId("delete-word-button"));
    expect(getByTestId("sentences").props.children).toBe("HELLO");
});

  it("handles camera switch button press", async () => {
    const { getByTestId } = render(<CameraScreen />);

    fireEvent.press(getByTestId("switch-camera-button"));
  });

  it("updates slider value", async () => {
    const mockLandmarks = [0.1, 0.2, 0.3];
    const { getByTestId } = render(<CameraScreen />);
    const slider = getByTestId("slider");

    await simulateLetterDetection(eventEmitter, mockLandmarks, ['H']);
    expect(getByTestId("detected-letter").props.children).toBe("H");
    expect(getByTestId("current-word").props.children).toBe("H");

    await act(async () => {
        fireEvent(slider, "valueChange", 1.5);
    });
    expect(getByTestId("slider-label").props.children).toContain("1.5");
    expect(getByTestId("slider").props.value).toBe(1.5);

    await simulateLetterDetection(eventEmitter, mockLandmarks, ['O']);
    expect(getByTestId("detected-letter").props.children).toBe("O");
    expect(getByTestId("current-word").props.children).toContain("H");

    await simulateLetterDetection(eventEmitter, mockLandmarks, ['I'], 16);
    expect(getByTestId("detected-letter").props.children).toBe("I");
    expect(getByTestId("current-word").props.children).toContain("HI");

    await simulateLetterDetection(eventEmitter, mockLandmarks, [' '], 8);
    expect(getByTestId("current-word").props.children).toContain("HI");
    expect(getByTestId("sentences").props.children).toContain("");

    await simulateLetterDetection(eventEmitter, mockLandmarks, [' '], 8);
    expect(getByTestId("current-word").props.children).toContain("");
    expect(getByTestId("sentences").props.children).toContain("HI");
});

});

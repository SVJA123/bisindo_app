import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import CategoryScreen from "../app/(tabs)/(quiz)/category";
import { NativeModules, NativeEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGoBack = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({
    categoryId: "1",
    categoryName: "Test Category",
    items: JSON.stringify(["HELLO", "WORLD", "O P"]),
  })),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
    goBack: mockGoBack,
  })),
}));

describe("CategoryScreen", () => {
  let eventEmitter: NativeEventEmitter;
  let visionCameraMock: any;

  async function simulateLetterDetection(
    eventEmitter: NativeEventEmitter,
    mockLandmarks: number[],
    letters: string[],
    consecutiveCount: number = 8
  ) {
    for (const letter of letters) {
      NativeModules.TFLiteModule.runModel.mockResolvedValue(letter);
      for (let i = 0; i < consecutiveCount; i++) {
        await act(async () => {
          eventEmitter.emit("onHandLandmarksDetected", {
            landmarks: mockLandmarks,
          });
          await new Promise((resolve) => setTimeout(resolve, 0));
        });
      }
    }
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    NativeModules.HandLandmarks.initModel.mockResolvedValue(null);
    NativeModules.TFLiteModule.runModel.mockResolvedValue(null);
    mockedAsyncStorage.getItem.mockResolvedValue("0");
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

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
    eventEmitter.removeAllListeners("onHandLandmarksDetected");
  });

  it("renders correctly", async () => {
    const { getByText, getByTestId } = render(<CategoryScreen />);

    await waitFor(() => {
      expect(getByTestId("camera")).toBeTruthy();
      expect(getByText("Score: 0%")).toBeTruthy();
      expect(getByText("High Score: 0%")).toBeTruthy();
      expect(getByTestId("slider")).toBeTruthy();
      expect(getByTestId("slider-label")).toBeTruthy();
      expect(getByTestId("delete-letter-button")).toBeTruthy();
      expect(getByTestId("switch-camera-button")).toBeTruthy();
    });
  });

  it("handles camera permission denied", async () => {
    visionCameraMock.useCameraPermission.mockImplementation(() => ({
      hasPermission: false,
      requestPermission: jest.fn().mockResolvedValue(false),
    }));

    const { getByText } = render(<CategoryScreen />);
    
    await waitFor(() => {
      expect(getByText("No permission")).toBeTruthy();
    });
  });

  it("handles no camera device available", async () => {
    visionCameraMock.useCameraDevice.mockImplementation(() => null);

    const { getByText } = render(<CategoryScreen />);
    
    await waitFor(() => {
      expect(getByText("No device")).toBeTruthy();
    });
  });

  it("detects letters and forms words correctly", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H"]);
    expect(getByTestId("letter-0").props.children).toBe("H");

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["E"]);
    expect(getByTestId("letter-1").props.children).toBe("E");

    await waitFor(() => {
      const correctLetterStyle0 = getByTestId("letter-0").props.style;
      expect(correctLetterStyle0).toEqual(
        expect.arrayContaining([{ color: "green" }])
      );

      const correctLetterStyle1 = getByTestId("letter-1").props.style;
      expect(correctLetterStyle1).toEqual(
        expect.arrayContaining([{ color: "green" }])
      );

      const incorrectLetterStyle = getByTestId("letter-2").props.style;
      expect(incorrectLetterStyle).toEqual(
        expect.arrayContaining([false])
      );
    });
  });

  it("doesn't add letters if not detected consecutively", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ['H'], 3);

    await waitFor(() => {
        expect(getByTestId("letter-0").props.children).toBe("H");
        const correctLetterStyle0 = getByTestId("letter-0").props.style;
        expect(correctLetterStyle0).toEqual(
            expect.arrayContaining([false])
        );
    });
  });

  it("updates score when word is completed and moves to next word", async () => {
    const { getByText, getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H", "E", "L", "L", "O"]);
    
    await waitFor(() => {
      expect(getByText("Score: 33%")).toBeTruthy();
    });

    await waitFor(() => {
      const letters = ["W", "O", "R", "L", "D"];
      for (let i = 0; i < letters.length; i++) {
        expect(getByTestId(`letter-${i}`)).toBeTruthy();
        expect(getByTestId(`letter-${i}`).props.children).toBe(letters[i]);
      }
    });
  });

  it("handles quiz completion state", async () => {
    const { getByText, queryByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H", "E", "L", "L", "O"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["W", "O", "R", "L", "D"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["O", "P"]);

    await waitFor(() => {
      expect(getByText("Quiz Complete!")).toBeTruthy();
      expect(getByText("Your Score: 100%")).toBeTruthy();
      expect(queryByTestId("camera")).toBeNull(); 
    });
  });

  it("restarts quiz when restart button is pressed", async () => {
    const { getByText, getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H", "E", "L", "L", "O"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["W", "O", "R", "L", "D"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["O", "P"]);

    await act(async () => {
      fireEvent.press(getByTestId("restart-quiz-button"));
    });

    await waitFor(() => {
      expect(getByText("Score: 0%")).toBeTruthy();
      expect(getByTestId("camera")).toBeTruthy(); 
    });
  });

  it("navigates back when the go back button is pressed", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H", "E", "L", "L", "O"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["W", "O", "R", "L", "D"]);
    await simulateLetterDetection(eventEmitter, mockLandmarks, ["O", "P"]);
  
    await act(async () => {
        fireEvent.press(getByTestId("go-back-button"));
    });
    
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("clears current word when delete button is pressed", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    const correctLetters = ["H", "E"];
    await simulateLetterDetection(eventEmitter, mockLandmarks, correctLetters);

    await waitFor(() => {
      for (let i = 0; i < correctLetters.length; i++) {
        let letterStyle = getByTestId("letter-" + i.toString()).props.style;
        expect(letterStyle).toEqual(
          expect.arrayContaining([{ color: "green" }])
        );
      }
    });

    await act(async () => {
      fireEvent.press(getByTestId("delete-letter-button"));
    });

    await waitFor(() => {
      const letters = ["H", "E", "L", "L", "O"];
      for (let i = 0; i < letters.length; i++) {
        let letterStyle = getByTestId("letter-" + i.toString()).props.style;
        expect(letterStyle).toEqual(
          expect.arrayContaining([false])
        );
      }
    });
  });

  it("switches camera when switch button is pressed", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    
    await waitFor(() => {
        fireEvent.press(getByTestId("switch-camera-button"));
    });
  });

  it("updates slider value and label", async () => {
    const { getByTestId } = render(<CategoryScreen />);
    const slider = getByTestId("slider");

    await act(async () => {
      fireEvent(slider, "valueChange", 1.5);
    });

    expect(getByTestId("slider-label").props.children).toContain("1.5");
  });

  it("updates high score when current score exceeds it", async () => {
    mockedAsyncStorage.getItem.mockResolvedValueOnce("33"); 
    const { getByText } = render(<CategoryScreen />);
    const mockLandmarks = [0.1, 0.2, 0.3];

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["H", "E", "L", "L", "O"]);
    
    await waitFor(() => {
      expect(getByText("High Score: 33%")).toBeTruthy();
    });

    await simulateLetterDetection(eventEmitter, mockLandmarks, ["W", "O", "R", "L", "D"]);
    
    await waitFor(() => {
      expect(getByText("High Score: 67%")).toBeTruthy();
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith("score-1", "67");
    });
  });
});
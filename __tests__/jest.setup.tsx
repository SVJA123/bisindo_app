import React from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../locales/en.json";
import { View } from "react-native";

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native");
  
    class MockNativeEventEmitter {
      listeners: { [event: string]: Array<(...args: any[]) => void> } = {};
  
      addListener(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return {
          remove: () => {
            this.listeners[event] = this.listeners[event].filter(
              (cb) => cb !== callback
            );
          },
        };
      }
  
      removeListener(event: string, callback: (...args: any[]) => void) {
        if (this.listeners[event]) {
          this.listeners[event] = this.listeners[event].filter(
            (cb) => cb !== callback
          );
        }
      }
  
      removeAllListeners(event?: string) {
        if (event) {
          delete this.listeners[event];
        } else {
          this.listeners = {};
        }
      }
  
      emit(event: string, ...args: any[]) {
        if (this.listeners[event]) {
          this.listeners[event].forEach((callback) => callback(...args));
        }
      }
    }
  
    RN.NativeEventEmitter = MockNativeEventEmitter;
  
    RN.NativeModules.HandLandmarks = {
      initModel: jest.fn().mockResolvedValue(null),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    RN.NativeModules.TFLiteModule = {
      runModel: jest.fn().mockResolvedValue(null),
    };
  
    return RN;
  });
  
  const mockCameraView = <View testID="camera" />;
  
  jest.mock("react-native-vision-camera", () => ({
    useCameraDevice: jest.fn(() => ({ id: "mock-device", position: "front" })),
    useCameraPermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })),
    Camera: jest.fn(() => mockCameraView),
    useFrameProcessor: jest.fn(() => jest.fn()),
    VisionCameraProxy: {
      initFrameProcessorPlugin: jest.fn(() => ({
        call: jest.fn(),
      })),
    },
  }));

  jest.mock("expo-speech", () => ({
    speak: jest.fn(),
  }));
  
  jest.mock("expo-font", () => ({
    ...jest.requireActual("expo-font"),
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
  }));
  
  global.alert = jest.fn(() => {});
  
  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          ...enTranslations,
          languageCodeTTS: "en-US",
        },
      },
    },
  });

describe("setup", () => {
  it("passes", () => {
    expect(true).toBe(true);
  });
});
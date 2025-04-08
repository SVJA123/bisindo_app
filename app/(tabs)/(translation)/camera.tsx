import React, { useState, useEffect } from 'react';
import { Dimensions, NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View, LogBox } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated'
import { FontAwesome6 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import Slider from '@react-native-community/slider';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  runAtTargetFps,
  VisionCameraProxy,
  Frame,
  useFrameProcessor
} from 'react-native-vision-camera';

const { HandLandmarks, TFLiteModule } = NativeModules;

// has to have argument for testing purposes
const handLandmarksEmitter = new NativeEventEmitter(HandLandmarks);

// initialize frame processor plugin 'handLandmarks'
const handLandMarkPlugin = VisionCameraProxy.initFrameProcessorPlugin(
  'handLandmarks',
  {},
);

// call the plugin function
function handLandmarks(frame: Frame) {
  'worklet';
  if (handLandMarkPlugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  const args = { 'orientation': String(frame.orientation || "portrait") };
  return handLandMarkPlugin.call(frame, args);
}

// page to show the camera screen
// this page is used to detect hand landmarks and run the model to get the letter
// and also show the current word and sentences
export default function CameraScreen() {
  const { t } = useTranslation();
  const landmarks = useSharedValue<Number[]>([]);
  const [detectedLetter, setDetectedLetter] = useState<string>('');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [lastDetectedLetter, setLastDetectedLetter] = useState<string>('');
  const [consecutiveLetterCount, setConsecutiveLetterCount] = useState<number>(0);
  const [consecutiveSpaceCount, setConsecutiveSpaceCount] = useState<number>(0);
  const [didModelRun, setDidModelRun] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0.7);
  const [minConsecutiveCount, setMinConsecutiveCount] = useState<number>(7); // minimum number of frames to consider a letter (1.5s)
  type CameraType = 'front' | 'back';
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();

  HandLandmarks.initModel();

  // const iconSize = screenWidth / 16; 
  // const fontSize = screenWidth / 36; 

  const handleSpeak = () => {
      // console.log("sentence", sentences.join());
      if (sentences.join().trim()) {
        const languageCodeTTS = t('languageCodeTTS'); 
    
        Speech.speak(sentences.join(), {
          language: languageCodeTTS, 
          pitch: 1.0,
          rate: 1.0,
        });
      } 
      else {
        alert(t('missingText'));
      }
    };

  useEffect(() => {
    // set up event listener to listen for hand landmarks detection results
    const subscription = handLandmarksEmitter.addListener(
      'onHandLandmarksDetected',
      event => {
        runOnJS(() => {
          landmarks.value = event.landmarks;
          // console.log("landmarks: ", landmarks.value);
          // console.log("onHandLandmarksDetected: ", event.landmarks);
          // console.log("landmarks size: ", event.landmarks.length);

          TFLiteModule.runModel(event.landmarks)
          .then((outputLetter: string) => {
            setDetectedLetter(outputLetter);
            setDidModelRun(Math.random());
            // console.log('Output letter:', outputLetter);
          })
          .catch((error: unknown) => {
            console.error('Error running model:', error);
          });

        })();
      },

    );
    
    return () => {
      subscription.remove();
    };

    
  }, []);

  useEffect(() => {
    // update the current word and sentences
    // console.log("detectedLetter: ", detectedLetter);
    // console.log("word: ", currentWord);
    // console.log("sentences: ", sentences);
    if (detectedLetter === ' ') {
      if (detectedLetter === lastDetectedLetter) {
        setConsecutiveSpaceCount(consecutiveSpaceCount => consecutiveSpaceCount + 1);
        if (consecutiveSpaceCount >= minConsecutiveCount && currentWord.length > 0) {
          setSentences(prev => [...prev, currentWord]);
          setCurrentWord('');
          setConsecutiveSpaceCount(0); 
        }
      } 
      else {
        setConsecutiveSpaceCount(1); 
      }
    } 
    else {
      if (detectedLetter === lastDetectedLetter) {
        setConsecutiveLetterCount(consecutiveLetterCount => consecutiveLetterCount + 1);
        if (consecutiveLetterCount >= minConsecutiveCount) {
          setCurrentWord(word => word + detectedLetter);
          setConsecutiveLetterCount(0);
        }
      } 
      else {
        setConsecutiveLetterCount(1); 
      }
    }

    setLastDetectedLetter(detectedLetter);
  }, [didModelRun]);

  useEffect(() => {
    setMinConsecutiveCount(Math.round(seconds * 10));
  }
, [seconds]);

  useEffect(() => {
    requestPermission().catch(error => console.log(error));
  }, [requestPermission]);


  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    
    // so that the result is not too flickery (runs at 10 fps)
    runAtTargetFps(10, () => {
      handLandmarks(frame)
    })
  }, []);

  if (!hasPermission) {
    return <Text>No permission</Text>;
  }

  if (device == null) {
    return <Text>No device</Text>;
  }

  const pixelFormat = Platform.OS === 'ios' ? 'rgb' : 'yuv';

  return (
    <View style={styles.container}>
      <Camera
        testID="camera"
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat={pixelFormat}
        outputOrientation="device"
      />
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text testID="detected-letter" style={styles.letterText}>{detectedLetter}</Text>
          <Text testID="current-word" style={styles.wordText}>{currentWord}</Text>
          <Text testID="sentences" style={styles.sentenceText}>{sentences.join(' ')}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text testID="slider-label" style={styles.sliderLabel}>{t('seconds')}: {seconds.toFixed(1)}</Text>
          <Slider
            testID="slider"
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={3.0}
            step={0.1}
            value={seconds}
            onValueChange={setSeconds}
            minimumTrackTintColor="#4caf50"
            maximumTrackTintColor="white"
          />
        </View>
      </View>

      <View style={styles.iconButtonContainer}>
        <TouchableOpacity testID="delete-letter-button" onPress={() => setCurrentWord(currentWord.slice(0, -1))} style={styles.iconButton}>
          <FontAwesome6 name="eraser" size={24} color="white" />
          <Text style={[styles.iconButtonText]}>{t('deleteLetter')}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="delete-word-button" onPress={() => setSentences(sentences.slice(0, -1))} style={styles.iconButton}>
          <FontAwesome6 name="trash" size={24} color="white" />
          <Text style={[styles.iconButtonText]}>{t('deleteWord')}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="tts-button" onPress={handleSpeak} style={styles.iconButton}>
          <FontAwesome6 name="volume-high" size={24} color="white" />
          <Text style={[styles.iconButtonText]}>{t('tts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="switch-camera-button" onPress={() => setCameraType(cameraType === 'front' ? 'back' : 'front')} style={styles.iconButton}>
          <FontAwesome6 name="repeat" size={24} color="white" />
          <Text style={[styles.iconButtonText]}>{t('switchCamera')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  letterText: {
    fontSize: 40, 
    fontWeight: 'bold',
    color: 'black',
  },
  wordText: {
    fontSize: 30, 
    fontWeight: 'bold',
    color: 'black',
  },
  sentenceText: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: 'black',
  },
  camera: {
    flex: 2,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconButtonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  sliderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 70,
  },
  sliderLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
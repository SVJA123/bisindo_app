import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions, NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated'
import { FontAwesome6 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';

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

const handLandmarksEmitter = new NativeEventEmitter();

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
  const minConsecutiveCount = 7; // minimum number of frames to consider a letter (1.5s)
  type CameraType = 'front' | 'back';
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();
  HandLandmarks.initModel();

  const screenWidth = Dimensions.get('window').width;
  const iconSize = screenWidth / 16; 
  const fontSize = screenWidth / 36; 

  const handleSpeak = () => {
      console.log("sentence", sentences.join());
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
    // Update the current word and sentences
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
    requestPermission().catch(error => console.log(error));
  }, [requestPermission]);


  const frameProcessor = useFrameProcessor(frame => {
    'worklet';

    // console.log("frame orientation: ", frame.orientation);

    // so that the result is not too flickery
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
      <View style={styles.topContainer}>
        <Text style={styles.letterText}>{detectedLetter}</Text>
        <Text style={styles.wordText}>{currentWord}</Text>
        <Text style={styles.sentenceText}>{sentences.join(' ')}</Text>
      </View>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat={pixelFormat}
        outputOrientation="device"
      />
      <View style={styles.iconButtonContainer}>
        <TouchableOpacity onPress={() => setCurrentWord('')} style={styles.iconButton}>
          <FontAwesome6 name="eraser" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>{t('clearWord')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSentences([])} style={styles.iconButton}>
          <FontAwesome6 name="trash" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>{t('clearSentence')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSpeak} style={styles.iconButton}>
          <FontAwesome6 name="volume-high" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>{t('tts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCameraType(cameraType === 'front' ? 'back' : 'front')} style={styles.iconButton}>
          <FontAwesome6 name="repeat" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>{t('switchCamera')}</Text>
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
});
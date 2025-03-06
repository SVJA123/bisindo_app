import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, NativeEventEmitter, NativeModules, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { runOnJS } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  runAtTargetFps,
  VisionCameraProxy,
  Frame,
  useFrameProcessor
} from 'react-native-vision-camera';

const getScoreKey = (categoryID: string): string => {
  return `score-${categoryID}`;
}

const loadHighScore = async (categoryID: string): Promise<number> => {
  const scoreKey = getScoreKey(categoryID);
  const score = await AsyncStorage.getItem(scoreKey);
  return score ? parseInt(score) : 0;
}

const updateHighScore = async (categoryID: string, score: number): Promise<void> => {
  const scoreKey = getScoreKey(categoryID);
  await AsyncStorage.setItem(scoreKey, score.toString());
}

const { HandLandmarks, TFLiteModule } = NativeModules;
const handLandmarksEmitter = new NativeEventEmitter();

// Initialize the frame processor plugin 'handLandmarks'
const handLandMarkPlugin = VisionCameraProxy.initFrameProcessorPlugin(
  'handLandmarks',
  {},
);

// Create a worklet function 'handLandmarks' that will call the plugin function
function handLandmarks(frame: Frame) {
  'worklet';
  if (handLandMarkPlugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  const args = { 'orientation': String(frame.orientation || "portrait") };
  return handLandMarkPlugin.call(frame, args);
}

export default function CategoryScreen() {
  const { categoryId, categoryName, items } = useLocalSearchParams();
  const categoryIdString = categoryId.toString();
  const itemsArray = JSON.parse(items as string);

  const landmarks = useSharedValue<Number[]>([]);
  const [detectedLetter, setDetectedLetter] = useState<string>('');
  const [lastDetectedLetter, setLastDetectedLetter] = useState<string>('');
  const [consecutiveLetterCount, setConsecutiveLetterCount] = useState<number>(0);
  const [didModelRun, setDidModelRun] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctLetters, setCorrectLetters] = useState<string[]>([]);
  const minConsecutiveCount = 5; // Minimum number of frames to consider a letter
  type CameraType = 'front' | 'back';
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();

  const [highScore, setHighScore] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    loadHighScore(categoryIdString).then((score) => {
      setHighScore(score);
    });
  }, [categoryIdString]);

  HandLandmarks.initModel();

  const screenWidth = Dimensions.get('window').width;
  const iconSize = screenWidth / 16;
  const fontSize = screenWidth / 36;
  const navigation = useNavigation();

  useEffect(() => {
    // Set up the event listener to listen for hand landmarks detection results
    const subscription = handLandmarksEmitter.addListener(
      'onHandLandmarksDetected',
      event => {
        runOnJS(() => {
          landmarks.value = event.landmarks;
          TFLiteModule.runModel(event.landmarks)
            .then((outputLetter: string) => {
              setDetectedLetter(outputLetter);
              setDidModelRun(Math.random());
              console.log('Output letter:', outputLetter);
            })
            .catch((error: unknown) => {
              console.error('Error running model:', error);
            });
        })();
      },
    );

    // Clean up the event listener when the component is unmounted
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: categoryName });
  }, [navigation, categoryName]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      updateHighScore(categoryIdString, score);
    }
  }, [score]);

  useEffect(() => {
    if (currentIndex >= itemsArray.length) {
      // Handle the end of the quiz
      return;
    }

    const currentWord = itemsArray[currentIndex].toUpperCase();

    if (correctLetters.length < currentWord.length && currentWord[correctLetters.length] === ' ') {
      setCorrectLetters(prevLetters => [...prevLetters, ' ']);
    }
    if (detectedLetter === lastDetectedLetter) {
      setConsecutiveLetterCount(consecutiveLetterCount => consecutiveLetterCount + 1);
      if (consecutiveLetterCount >= minConsecutiveCount) {
        if (detectedLetter === currentWord[correctLetters.length]) {
          setCorrectLetters([...correctLetters, detectedLetter]);
          if (correctLetters.length + 1 === currentWord.length) {
            setScore(Math.round((currentIndex + 1) / itemsArray.length * 100));
            setCurrentIndex(currentIndex + 1);
            setCorrectLetters([]);
          }
        }
        setConsecutiveLetterCount(0); // Reset counter
      }
    } else {
      setConsecutiveLetterCount(1); // Reset and start for new letter
    }
    setLastDetectedLetter(detectedLetter);
  }, [didModelRun]);

  useEffect(() => {
    requestPermission().catch(error => console.log(error));
  }, [requestPermission]);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    runAtTargetFps(10, () => {
      handLandmarks(frame);
    });
  }, []);

  if (!hasPermission) {
    return <Text>No permission</Text>;
  }

  if (device == null) {
    return <Text>No device</Text>;
  }

  const pixelFormat = Platform.OS === 'ios' ? 'rgb' : 'yuv';

  const currentWord = itemsArray[currentIndex];

  if (currentIndex >= itemsArray.length) {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.subtitle}>Your Score: {score}%</Text>
          <Text style={styles.subtitle}>High Score: {highScore}%</Text>
          <TouchableOpacity onPress={() => {
            setCurrentIndex(0);
            setCorrectLetters([]);
            setScore(0);
          }} style={styles.button}>
            <Text style={styles.buttonText}>Restart Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.scoreContainer}>
          <Text style={styles.subtitle}>Score: {score}%</Text>
          <Text style={styles.subtitle}>High Score: {highScore}%</Text>
        </View>
        <View style={styles.wordContainer}>
          {currentWord.split('').map((letter: string, index: number) => (
            <Text
              key={index}
              style={[
                styles.letter,
                correctLetters[index] === letter.toUpperCase() && styles.correctLetter,
              ]}
            >
              {letter}
            </Text>
          ))}
        </View>
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
        <TouchableOpacity onPress={() => setCorrectLetters([])} style={styles.iconButton}>
          <FontAwesome6 name="eraser" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>Clear Word</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCameraType(cameraType === 'front' ? 'back' : 'front')} style={styles.iconButton}>
          <FontAwesome6 name="repeat" size={iconSize} color="white" />
          <Text style={[styles.iconButtonText, { fontSize }]}>Switch Camera</Text>
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  wordContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  letter: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 5,
  },
  correctLetter: {
    color: 'green',
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
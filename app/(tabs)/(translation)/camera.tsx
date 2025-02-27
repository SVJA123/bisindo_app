import { PaintStyle, Skia } from '@shopify/react-native-skia';
import React, { useState, useEffect } from 'react';
import { Button, NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated'
// import { useSharedValue } from 'react-native-worklets-core';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useSkiaFrameProcessor,
  VisionCameraProxy,
  Frame,
  useFrameProcessor
} from 'react-native-vision-camera';

const lines = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9],
  [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

// const paint = Skia.Paint();
// paint.setStyle(PaintStyle.Fill);
// paint.setStrokeWidth(2);
// paint.setColor(Skia.Color('red'));

// const linePaint = Skia.Paint();
// linePaint.setStyle(PaintStyle.Fill);
// linePaint.setStrokeWidth(4);
// linePaint.setColor(Skia.Color('lime'));

const { HandLandmarks, TFLiteModule } = NativeModules;

const handLandmarksEmitter = new NativeEventEmitter(HandLandmarks);

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
  return handLandMarkPlugin.call(frame);
}

export default function CameraScreen() {
  const landmarks = useSharedValue<Number[]>([]);
  const [detectedLetter, setDetectedLetter] = useState<string>('');
  type CameraType = 'front' | 'back';
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();
  HandLandmarks.initModel();

  useEffect(() => {
    // Set up the event listener to listen for hand landmarks detection results
    const subscription = handLandmarksEmitter.addListener(
      'onHandLandmarksDetected',
      event => {
        runOnJS(() => {
          landmarks.value = event.landmarks;
          console.log("landmarks: ", landmarks.value);
          console.log("onHandLandmarksDetected: ", event.landmarks);
          console.log("landmarks size: ", event.landmarks.length);

          TFLiteModule.runModel(event.landmarks)
          .then((outputLetter: string) => {
            setDetectedLetter(outputLetter);
            console.log('Model output letter:', outputLetter);
          })
          .catch((error: unknown) => {
            console.error('Error running model:', error);
          });

        })();

        /*
          This is where you can handle converting the data into commands
          for further processing.
        */
      },
    );

    // Clean up the event listener when the component is unmounted
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    requestPermission().catch(error => console.log(error));
  }, [requestPermission]);


  const frameProcessor = useFrameProcessor(frame => {
    'worklet';

    // Process the frame using the 'handLandmarks' function
    handLandmarks(frame);
    

    // Update the landmarks shared value within the worklet context
    /* 
      Paint landmarks on the screen.
      Note: This paints landmarks from the previous frame since
      frame processing is not synchronous.
    */
    
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
      </View>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat={pixelFormat}
        outputOrientation="device"
      />
      <Button title="Switch Camera" onPress={() => setCameraType(cameraType === 'front' ? 'back' : 'front')} />
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
    fontSize: 100, // Large font size for the detected letter
    fontWeight: 'bold',
    color: 'black',
  },
  camera: {
    flex: 2,
  },
});
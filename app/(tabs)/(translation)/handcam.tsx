import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, NativeModules } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';


export default function HandcamScreen() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission().catch(error => console.log(error));
  }, [requestPermission]);

  const frameProcessor = useSkiaFrameProcessor(frame => {
    'worklet';
    frame.render();
  }, []);

  if (!hasPermission) {
    return <Text>No permission</Text>;
  }

  if (device == null) {
    return <Text>No device</Text>;
  }

  const pixelFormat = Platform.OS === 'ios' ? 'rgb' : 'yuv';

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      pixelFormat={pixelFormat}
    />
  );
}
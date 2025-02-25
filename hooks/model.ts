// // utils/modelUtils.ts
// import * as tf from '@tensorflow/tfjs';
// import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
// import { HandLandmarks } from '../types';

// // Load the TensorFlow.js model
// export const loadModel = async () => {
//   const modelJson = require('../assets/model/model.json');
//   const modelWeights = require('../assets/model/group1-shard1of1.bin');
//   const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
//   return model;
// };

// // Process hand landmarks and run inference
// export const processHandLandmarks = async (landmarks: HandLandmarks[][], model: tf.LayersModel) => {
//   // Ensure landmarks array has exactly 2 hands (pad with zeros if necessary)
//   const paddedLandmarks = padLandmarks(landmarks);

//   // Flatten the landmarks array and convert to a tensor
//   const inputTensor = tf.tensor2d(
//     landmarks.flatMap((hand) => hand.map((landmark) => [landmark.x, landmark.y, landmark.z])),
//     [1, 126] // Adjust shape based on your model
//   );
//   // Run inference
//   const predictions = await model.predict(inputTensor) as tf.Tensor;
//   const predictedClass = predictions.argMax(1).dataSync()[0];
//   return predictedClass;
// };

// // Helper function to pad landmarks if one hand is missing
// const padLandmarks = (landmarks: HandLandmarks[][]): HandLandmarks[][] => {
//   const defaultLandmarks = Array(63).fill({ x: 0, y: 0, z: 0 }); // Default landmarks for a missing hand

//   if (landmarks.length === 0) {
//     // No hands detected
//     return [defaultLandmarks, defaultLandmarks];
//   } else if (landmarks.length === 1) {
//     // Only one hand detected
//     return [landmarks[0], defaultLandmarks];
//   } else {
//     // Two hands detected
//     return landmarks.slice(0, 2); // Ensure only two hands are used
//   }
// };
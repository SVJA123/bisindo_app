// // utils/setupHandTracking.ts
// import { Hands } from '@mediapipe/hands';
// import { Camera } from '@mediapipe/camera_utils';
// import { HandResults } from '../types';

// export const setupHandTracking = (onResults: (results: HandResults) => void) => {
//   const hands = new Hands({
//     locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
//   });

//   hands.setOptions({
//     maxNumHands: 2,
//     modelComplexity: 1,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence: 0.5,
//   });

//   hands.onResults(onResults);

//   return hands;
// };
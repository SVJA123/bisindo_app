// import React, { useState, useRef } from "react";
// import { View, Text, Button, StyleSheet } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import * as FileSystem from "expo-file-system";
// import * as ImageManipulator from "expo-image-manipulator";

// const API_URL = "http://10.202.135.131:5000/predict"; // Replace with your backend URL

// export default function CameraScreen() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const cameraRef = useRef<CameraView>(null);
//   const [prediction, setPrediction] = useState<string | null>(null);

//   const takePictureAndPredict = async () => {
//     if (cameraRef.current) {
//       // Step 1: Take a picture
//       const photo = await cameraRef.current.takePictureAsync({ base64: true });
  
//       // Check if photo is defined
//       if (!photo) {
//         console.error("Failed to capture photo");
//         return;
//       }
  
//       // Step 2: Compress the image (optional but recommended)
//       const compressedPhoto = await ImageManipulator.manipulateAsync(
//         photo.uri,
//         [{ resize: { width: 224, height: 224 } }], // Resize to model input size
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//       );
  

//       console.log('photo')

//       // Step 3: Send the image to the backend API
//       const response = await FileSystem.uploadAsync(API_URL, compressedPhoto.uri, {
//         httpMethod: "POST",
//         uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
//         headers: {
//           "Content-Type": "image/jpeg",
//         },
//       });

//       console.log('response')
  
//       // Step 4: Parse the response
//       const result = JSON.parse(response.body);
//       setPrediction(result.prediction); // Update the prediction state
//     }
//   };

//   const testBackend = async () => {
//     try {
//       const response = await fetch(`${API_URL}/test`);
//       const result = await response.json();
//       console.log("Test Response:", result);
//     } catch (error) {
//       console.error("Test Error:", error);
//     }
//   };
  
//   // Call this function somewhere in your app
//   testBackend();

//   if (!permission) {
//     return <View />; // Handle loading state
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text>No access to camera</Text>
//         <Button title="Request Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Step 5: Render the CameraView */}
//       <CameraView
//         ref={cameraRef}
//         style={StyleSheet.absoluteFill}
//         facing="back"
//       />

//       {/* Step 6: Add a button to capture and predict */}
//       <Button title="Capture and Predict" onPress={testBackend} />

//       {/* Step 7: Display the prediction */}
//       {prediction && <Text style={styles.predictionText}>Prediction: {prediction}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   predictionText: {
//     marginTop: 20,
//     fontSize: 18,
//   },
// });
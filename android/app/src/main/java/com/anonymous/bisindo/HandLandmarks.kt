package com.anonymous.bisindo

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.OutputHandler
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.mrousavy.camera.frameprocessors.Frame

class HandLandmarks(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "HandLandmarks" // The name used to access the module from JavaScript
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }

    @ReactMethod
    fun initModel() {
        // Check if the HandLandmarker has already been initialized
        if (HandLandmarkerHolder.handLandmarker != null) {
            // Model is already initialized, send a status update to JavaScript
            val alreadyInitializedParams = Arguments.createMap()
            alreadyInitializedParams.putString("status", "Model already initialized")
            sendEvent("onHandLandmarksStatus", alreadyInitializedParams)
            return
        }


        // Define the result listener
        val resultListener = OutputHandler.ResultListener { result: HandLandmarkerResult, inputImage: MPImage ->
            Log.d("HandLandmarksFrameProcessor", "Detected ${result.landmarks().size} hands")

            // Prepare the data to be sent back to JavaScript
            val landmarks = FloatArray(84)  // Initialize a 84-float array for up to 2 hands
            result.landmarks().take(2).forEachIndexed { idx, handLandmarks ->
                val offset = idx * 42  // 42 floats per hand
                handLandmarks.forEachIndexed { index, landmark ->
                    val base = offset + index * 2
                    landmarks[base] = landmark.x().toFloat()
                    landmarks[base + 1] = landmark.y().toFloat()
                }
            }

            val landmarksArray = Arguments.createArray()
            landmarks.forEach { landmarksArray.pushDouble(it.toDouble()) }

            val params = Arguments.createMap()
            params.putArray("landmarks", landmarksArray)
            sendEvent("onHandLandmarksDetected", params)       
        }

        // Initialize the Hand Landmarker
        try {
            val context: Context = reactApplicationContext
            val baseOptions = BaseOptions.builder()
                    .setModelAssetPath("hand_landmarker.task")
                    .build()

            val handLandmarkerOptions = HandLandmarker.HandLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setNumHands(2)
                    .setRunningMode(RunningMode.LIVE_STREAM)
                    .setResultListener(resultListener)
                    .build()

            HandLandmarkerHolder.handLandmarker = HandLandmarker.createFromOptions(context, handLandmarkerOptions)

            // Send success event to JS
            val successParams = Arguments.createMap()
            successParams.putString("status", "Model initialized successfully")
            sendEvent("onHandLandmarksStatus", successParams)

        } catch (e: Exception) {
            Log.e("HandLandmarksFrameProcessor", "Error initializing HandLandmarker", e)

            // Send error event to JS
            val errorParams = Arguments.createMap()
            errorParams.putString("error", e.message)
            sendEvent("onHandLandmarksError", errorParams)
        }
    }
}
package com.anonymous.bisindo.tflitemodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer
import java.nio.ByteOrder

class TFLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var interpreter: Interpreter? = null

    init {
        // Load your TFLite model
        val modelFile = loadModelFile("hand_gesture_model.tflite")
        interpreter = Interpreter(modelFile)
    }

    override fun getName(): String {
        return "TFLiteModule"
    }

    @ReactMethod
    fun runModel(landmarks: ReadableArray, promise: Promise) {
        Thread {
            try {
                // Convert ReadableArray to FloatArray
                val floatArray = convertReadableArrayToFloatArray(landmarks)

                // Normalize and reshape landmarks into (42, 2, 1)
                val reshapedInput = normalizeAndReshapeLandmarks(floatArray)

                // Prepare input buffer
                val inputBuffer = ByteBuffer.allocateDirect(42 * 2 * 1 * 4) // 4 bytes per float
                inputBuffer.order(ByteOrder.nativeOrder())

                // Copy the 3D array into the ByteBuffer
                for (i in 0 until 42) {
                    for (j in 0 until 2) {
                        inputBuffer.putFloat(reshapedInput[i][j][0])
                    }
                }

                // Run the model
                val output = Array(1) { FloatArray(26) } // Output shape: [1, 26]
                interpreter?.run(inputBuffer, output)

                // Find the index of the highest probability (argmax)
                val outputArray = output[0]
                val maxIndex = outputArray.indices.maxByOrNull { outputArray[it] } ?: -1

                // Convert the index to a corresponding letter (A-Z)
                val outputLetter = if (maxIndex in 0..25) {
                    ('A'.code + maxIndex).toChar().toString()
                } else {
                    "Unknown"
                }

                // Resolve the promise with the output letter
                promise.resolve(outputLetter)
            } catch (e: Exception) {
                promise.reject("MODEL_ERROR", e.message)
            }
        }.start()
    }
    
    private fun convertReadableArrayToFloatArray(landmarks: ReadableArray): FloatArray {
        val floatArray = FloatArray(landmarks.size())
        for (i in 0 until landmarks.size()) {
            if (landmarks.getType(i) == ReadableType.Number) {
                floatArray[i] = landmarks.getDouble(i).toFloat()
            } else {
                throw IllegalArgumentException("Landmarks array must contain numbers")
            }
        }
        return floatArray
    }

    private fun normalizeAndReshapeLandmarks(landmarks: FloatArray): Array<Array<FloatArray>> {
        // Reshape into (42, 2) where first 21 keypoints = Hand 1, next 21 keypoints = Hand 2
        val reshapedLandmarks = landmarks.toList().chunked(2)

        // Check if second hand exists
        val secondHandExists = reshapedLandmarks.subList(21, 42).any { (x, y) -> x != 0f || y != 0f }

        // Compute min and max across BOTH hands
        val xCoords = reshapedLandmarks.map { it[0] }
        val yCoords = reshapedLandmarks.map { it[1] }
        val minX = xCoords.minOrNull() ?: 0f
        val maxX = xCoords.maxOrNull() ?: 0f
        val minY = yCoords.minOrNull() ?: 0f
        val maxY = yCoords.maxOrNull() ?: 0f

        // Normalize x and y coordinates using global min/max
        val normalizedLandmarks = reshapedLandmarks.map { (x, y) ->
            val normalizedX = if (maxX - minX != 0f) (x - minX) / (maxX - minX) else x
            val normalizedY = if (maxY - minY != 0f) (y - minY) / (maxY - minY) else y
            floatArrayOf(normalizedX, normalizedY)
        }

        // If second hand is missing, don't normalize those coordinates
        if (!secondHandExists) {
            for (i in 21 until 42) {
                normalizedLandmarks[i][0] = 0f
                normalizedLandmarks[i][1] = 0f
            }
        }

        // Reshape into (42, 2, 1)
        val reshapedInput = Array(42) { Array(2) { FloatArray(1) } } // Shape: (42, 2, 1)
        for (i in normalizedLandmarks.indices) {
            reshapedInput[i][0][0] = normalizedLandmarks[i][0] // x coordinate
            reshapedInput[i][1][0] = normalizedLandmarks[i][1] // y coordinate
        }

        return reshapedInput
    }

    private fun adjustLandmarksForOrientation(landmarks: FloatArray, frameOrientation: String): FloatArray {
        return when (frameOrientation) {
            "landscape-right" -> {
                // Rotate landmarks 90° clockwise
                landmarks.mapIndexed { index, value ->
                    if (index % 2 == 0) 1f - value else value // Swap x and y, invert x
                }.toFloatArray()
            }
            "landscape-left" -> {
                // Rotate landmarks 90° counter-clockwise
                landmarks.mapIndexed { index, value ->
                    if (index % 2 == 0) value else 1f - value // Swap x and y, invert y
                }.toFloatArray()
            }
            else -> {
                // No adjustment needed for portrait or unknown orientation
                landmarks
            }
        }
    }

    private fun loadModelFile(modelName: String): ByteBuffer {
        val assetManager = reactApplicationContext.assets
        val fileDescriptor = assetManager.openFd(modelName)
        val inputStream = fileDescriptor.createInputStream()
        val modelBytes = inputStream.readBytes()
        return ByteBuffer.allocateDirect(modelBytes.size).apply {
            order(ByteOrder.nativeOrder())
            put(modelBytes)
        }
    }
}
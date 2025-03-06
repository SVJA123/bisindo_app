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
import kotlin.math.acos
import kotlin.math.sqrt

class TFLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var interpreter: Interpreter? = null

    init {
        // Load your TFLite model
        val modelFile = loadModelFile("hand_gesture_hybrid_j.tflite")
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

                if (areAllLandmarksZero(floatArray)) {
                    promise.resolve(" ")
                    return@Thread
                }

                val reshapedLandmarks = normalizeAndReshapeLandmarks(floatArray)

                val angles = calculateAdjacentAngles(floatArray)

                // prepare input buffers for landmarks and angles
                val landmarkBuffer = ByteBuffer.allocateDirect(42 * 2 * 1 * 4) // 4 bytes per float
                landmarkBuffer.order(ByteOrder.nativeOrder())

                val angleBuffer = ByteBuffer.allocateDirect(8 * 4) // 8 angles * 4 bytes per float
                angleBuffer.order(ByteOrder.nativeOrder())

                // Copy the 3D array into the ByteBuffer for landmarks
                for (i in 0 until 42) {
                    for (j in 0 until 2) {
                        landmarkBuffer.putFloat(reshapedLandmarks[i][j][0])
                    }
                }

                // Copy the angles into the ByteBuffer
                for (angle in angles) {
                    angleBuffer.putFloat(angle)
                }

                // angle first
                val inputs = arrayOf(angleBuffer, landmarkBuffer)

                // run the model
                val output = Array(1) { FloatArray(26) } // Output shape: [1, 26]
                interpreter?.runForMultipleInputsOutputs(inputs, mapOf(0 to output))

                // find the index of the highest probability (argmax)
                val outputArray = output[0]
                val maxIndex = outputArray.indices.maxByOrNull { outputArray[it] } ?: -1

                // convert the index to a corresponding letter (A-Z)
                val outputLetter = if (maxIndex in 0..25) {
                    ('A'.code + maxIndex).toChar().toString()
                } else {
                    "Unknown"
                }

                // resolve the promise with the output letter
                promise.resolve(outputLetter)
            } catch (e: Exception) {
                promise.reject("MODEL_ERROR", e.message)
            }
        }.start()
    }

    private fun areAllLandmarksZero(landmarks: FloatArray): Boolean {
        return landmarks.all { it == 0f }
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

    private fun calculateAdjacentAngles(landmarks: FloatArray): FloatArray {
        // Split landmarks into two hands
        val hand1 = landmarks.take(42).chunked(2) // First hand (landmarks 0 to 20)
        val hand2 = landmarks.drop(42).chunked(2) // Second hand (landmarks 21 to 41)

        // Calculate angles for both hands
        val anglesHand1 = calculateAdjacentAnglesForHand(hand1)
        val anglesHand2 = calculateAdjacentAnglesForHand(hand2)

        // Combine angles from both hands
        return anglesHand1 + anglesHand2
    }

    private fun calculateAdjacentAnglesForHand(handLandmarks: List<List<Float>>): FloatArray {
        // Define keypoints
        val wrist = handLandmarks[0]
        val thumbTip = handLandmarks[4]
        val indexTip = handLandmarks[8]
        val middleTip = handLandmarks[12]
        val ringTip = handLandmarks[16]
        val pinkyTip = handLandmarks[20]

        // Check for invalid landmarks
        if (wrist.all { it == 0f } || thumbTip.all { it == 0f } || indexTip.all { it == 0f } ||
            middleTip.all { it == 0f } || ringTip.all { it == 0f } || pinkyTip.all { it == 0f }
        ) {
            return FloatArray(4) { 0f } // Return zeros if any landmark is missing
        }

        // Compute vectors from wrist to finger tips
        val vectors = listOf(
            thumbTip.zip(wrist) { a, b -> a - b },
            indexTip.zip(wrist) { a, b -> a - b },
            middleTip.zip(wrist) { a, b -> a - b },
            ringTip.zip(wrist) { a, b -> a - b },
            pinkyTip.zip(wrist) { a, b -> a - b }
        )

        // Calculate angles between adjacent vectors
        val angles = mutableListOf<Float>()
        for (i in 0 until vectors.size - 1) {
            val v1 = vectors[i]
            val v2 = vectors[i + 1]

            // Compute the dot product and magnitudes
            val dotProduct = v1.zip(v2) { a, b -> a * b }.sum()
            val norm1 = sqrt(v1.map { it * it }.sum())
            val norm2 = sqrt(v2.map { it * it }.sum())

            // Check for zero magnitude to avoid division by zero
            if (norm1 == 0f || norm2 == 0f) {
                angles.add(0f)
            } else {
                val cosTheta = (dotProduct / (norm1 * norm2)).coerceIn(-1f, 1f)
                val angle = acos(cosTheta) // Angle in radians
                angles.add(Math.toDegrees(angle.toDouble()).toFloat() / 180f) // Normalized to [0, 1]
            }
        }

        return angles.toFloatArray()
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
package com.anonymous.bisindo.handlandmarksframeprocessor

import android.graphics.Bitmap
import android.graphics.Matrix

import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import android.util.Log
import com.anonymous.bisindo.HandLandmarkerHolder

class HandLandmarksFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
    Log.d("HandLandmarksFrameProcessor", "Plugin callback called") // Add logging

    if (HandLandmarkerHolder.handLandmarker == null) {
      Log.e("HandLandmarksFrameProcessor", "HandLandmarker is not initialized") // Add logging
      return "HandLandmarker is not initialized" // Return early if initialization failed
    }

    try {      
      val timestamp = frame.timestamp ?: System.currentTimeMillis()

      val orientation = arguments?.get("orientation") as? String ?: "portrait"

      val bitmap = frame.imageProxy.toBitmap()

      //rotating bitmap based on frame orientation
      val rotatedBitmap = when (orientation) {
        "landscape-right" -> rotateBitmap(bitmap, 90f)
        "portrait-upside-down" -> rotateBitmap(bitmap, 180f)
        "landscape-left" -> rotateBitmap(bitmap, 270f)
        else -> bitmap // No rotation needed
      }

      val mpImage: MPImage = BitmapImageBuilder(rotatedBitmap).build()

      HandLandmarkerHolder.handLandmarker?.detectAsync(mpImage, timestamp)
      Log.d("HandLandmarksFrameProcessor", "Frame processed successfully") // Add logging
      return "Frame processed successfully"
    } catch (e: Exception) {
      e.printStackTrace()
      Log.e("HandLandmarksFrameProcessor", "Error processing frame: ${e.message}")
      return "Error processing frame: ${e.message}"
    }

  }

  private fun rotateBitmap(source: Bitmap, angle: Float): Bitmap {
    val matrix = Matrix()
    matrix.postRotate(angle)
    return Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
  }
}
// this package was done following a guide from this link: https://medium.com/@dev-john-nguyen/integrating-mediapipe-hand-detection-in-react-native-f57c46aaab3a

package com.anonymous.bisindo

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HandLandmarksPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(HandLandmarks(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
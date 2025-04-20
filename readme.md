# Application Manual

This application is built using React Native with native modules developed in Kotlin for Android. It features quizzes, translation capabilities, and real-time camera-based functionalities. Navigation within the application is managed via Expo Router, while TensorFlow Lite handles the machine learning tasks.

## Downloading the Application

To download and install the built application APK file on your Android device:

1. Visit the provided download link: [Download here](https://www.dropbox.com/scl/fi/cikwwt1fx75mrch95la0r/bisindo.apk?rlkey=yq6xe62qp6f9m78e5wo8n62b9&st=69308me9&dl=0).
2. Download the APK file onto your Android device.
3. Navigate to the downloaded file and select it to initiate installation.
4. Follow the prompts to complete the installation process.

## Project Structure

The application follows a modular structure, with key directories organized as follows:

- **app**: Contains primary React Native components.
  - **(tabs)**: Tab-based navigation components.
    - **(quiz)**: Pages related to quiz functionality.
    - **(translation)**: Pages handling translation functionalities.
    - **alphabet**: Page displaying the BISINDO alphabet.
    - **information**: Application information and usage guide page.

- **android**: Contains Android-specific native Kotlin code.
  - `app/src/main/java/com/anonymous`: Directory for Android native modules.

- **__tests__**: Contains unit tests for React Native components.

## Installation and Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/SVJA123/bisindo_app.git
   ```

2. Ensure Node.js is installed, then install project dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Deploy the application onto an Android device or emulator:
   ```bash
   npx expo run:android
   ```

5. Run unit tests with coverage reports:
   ```bash
   npm test -- --coverage
   ```

6. To run specific tests:
   ```bash
   npx jest __tests__/TestFile.test.tsx
   ```

7. To build the APK for release:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Image, ScrollView, Pressable, View, Text } from 'react-native';
import * as SpeechRecognition from 'expo-speech-recognition';
import * as Speech from 'expo-speech'; 
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';



const images: { [key: string]: any } = {
  'a': require('../../../assets/images/bisindo/a.jpg'),
  'b': require('../../../assets/images/bisindo/b.jpg'),
  'c': require('../../../assets/images/bisindo/c.jpg'),
  'd': require('../../../assets/images/bisindo/d.jpg'),
  'e': require('../../../assets/images/bisindo/e.jpg'),
  'f': require('../../../assets/images/bisindo/f.jpg'),
  'g': require('../../../assets/images/bisindo/g.jpg'),
  'h': require('../../../assets/images/bisindo/h.jpg'),
  'i': require('../../../assets/images/bisindo/i.jpg'),
  'j': require('../../../assets/images/bisindo/j.jpg'),
  'k': require('../../../assets/images/bisindo/k.jpg'),
  'l': require('../../../assets/images/bisindo/l.jpg'),
  'm': require('../../../assets/images/bisindo/m.jpg'),
  'n': require('../../../assets/images/bisindo/n.jpg'),
  'o': require('../../../assets/images/bisindo/o.jpg'),
  'p': require('../../../assets/images/bisindo/p.jpg'),
  'q': require('../../../assets/images/bisindo/q.jpg'),
  'r': require('../../../assets/images/bisindo/r.jpg'),
  's': require('../../../assets/images/bisindo/s.jpg'),
  't': require('../../../assets/images/bisindo/t.jpg'),
  'u': require('../../../assets/images/bisindo/u.jpg'),
  'v': require('../../../assets/images/bisindo/v.jpg'),
  'w': require('../../../assets/images/bisindo/w.jpg'),
  'x': require('../../../assets/images/bisindo/x.jpg'),
  'y': require('../../../assets/images/bisindo/y.jpg'),
  'z': require('../../../assets/images/bisindo/z.jpg'),
};

export default function IndexScreen() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [translatedImages, setTranslatedImages] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [capturedText, setCapturedText] = useState('');

  useEffect(() => {
    const imageArray = text.toLowerCase().split('').map(char => images[char] || 'space');
    setTranslatedImages(imageArray);
  }, [text]);

  SpeechRecognition.useSpeechRecognitionEvent("start", () => setIsListening(true));
  SpeechRecognition.useSpeechRecognitionEvent("end", () => setIsListening(false));
  SpeechRecognition.useSpeechRecognitionEvent("result", (event) => {
    setText(event.results[0]?.transcript);
  });
  SpeechRecognition.useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async () => {
    const result = await SpeechRecognition.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }

    const languageSpeech = t('languageCodeSpeech');

    // Start speech recognition
    SpeechRecognition.ExpoSpeechRecognitionModule.start({
      lang: languageSpeech,
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
    });
  };

  const handleStop = async () => {
    await SpeechRecognition.ExpoSpeechRecognitionModule.stop();
  };

  const handleSpeak = () => {
    if (text.trim()) {
      const languageCodeTTS = t('languageCodeTTS'); 
  
      Speech.speak(text, {
        language: languageCodeTTS, 
        pitch: 1.0,
        rate: 1.0,
      });
    } 
    else {
      alert(t('missingText'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('placeholder')}
          value={text}
          onChangeText={setText}
        />
        <ScrollView contentContainerStyle={styles.imageContainer}>
          {translatedImages.map((item, index) => (
            item === 'space' ? (
              <View key={index} style={styles.space} />
            ) : (
              <Image key={index} source={item} style={styles.image} />
            )
          ))}
        </ScrollView>
      </View>

      <View style={styles.iconContainer}>
        {/* Microphone Button*/}
        <Pressable onPress={isListening ? handleStop : handleStart} style={styles.defButton}>
          <View style={styles.defIconContainer}>
            <FontAwesome name={isListening ? "stop" : "microphone"} size={30} color="white" />
          </View>
        </Pressable>

        {/* Camera Button*/}
        <Link href='/camera' asChild>
          <Pressable style={styles.cameraButton}>
            <View style={styles.cameraIconContainer}>
              <FontAwesome name="camera" size={40} color="white" />
            </View>
          </Pressable>
        </Link>

        {/* Speech Button*/}
        <Pressable onPress={handleSpeak} style={styles.defButton}>
          <View style={styles.defIconContainer}>
            <FontAwesome name="volume-up" size={30} color="white" />
          </View>
        </Pressable>
      </View>
      {capturedText ? <Text style={styles.capturedText}>{capturedText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 60,
    width: '70%',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    fontSize: 24,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    width: 50,
    height: 50,
    margin: 5,
  },
  space: {
    width: 20,
    height: 50,
    margin: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'royalblue',
    backgroundColor: 'royalblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'royalblue',
    backgroundColor: 'royalblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});
import { StyleSheet, ScrollView, Dimensions, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';

const images: { [key: string]: any } = {
  'a': require('../../assets/images/bisindo/a.jpg'),
  'b': require('../../assets/images/bisindo/b.jpg'),
  'c': require('../../assets/images/bisindo/c.jpg'),
  'd': require('../../assets/images/bisindo/d.jpg'),
  'e': require('../../assets/images/bisindo/e.jpg'),
  'f': require('../../assets/images/bisindo/f.jpg'),
  'g': require('../../assets/images/bisindo/g.jpg'),
  'h': require('../../assets/images/bisindo/h.jpg'),
  'i': require('../../assets/images/bisindo/i.jpg'),
  'j': require('../../assets/images/bisindo/j.jpg'),
  'k': require('../../assets/images/bisindo/k.jpg'),
  'l': require('../../assets/images/bisindo/l.jpg'),
  'm': require('../../assets/images/bisindo/m.jpg'),
  'n': require('../../assets/images/bisindo/n.jpg'),
  'o': require('../../assets/images/bisindo/o.jpg'),
  'p': require('../../assets/images/bisindo/p.jpg'),
  'q': require('../../assets/images/bisindo/q.jpg'),
  'r': require('../../assets/images/bisindo/r.jpg'),
  's': require('../../assets/images/bisindo/s.jpg'),
  't': require('../../assets/images/bisindo/t.jpg'),
  'u': require('../../assets/images/bisindo/u.jpg'),
  'v': require('../../assets/images/bisindo/v.jpg'),
  'w': require('../../assets/images/bisindo/w.jpg'),
  'x': require('../../assets/images/bisindo/x.jpg'),
  'y': require('../../assets/images/bisindo/y.jpg'),
  'z': require('../../assets/images/bisindo/z.jpg'),
}

export default function AlphabetScreen() {
  const [expandedImage, setExpandedImage] = useState<string | null>(null); 
  const screenWidth = Dimensions.get('window').width;
  const imageSize = Dimensions.get('window').width * 0.4;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.gridContainer}>
        {Object.keys(images).map((letter, index) => (
          <Pressable
            key={index}
            onPress={() => setExpandedImage(letter)} 
            style={({ pressed }) => [
              styles.gridItem,
              pressed && styles.pressedItem, 
            ]}
            testID={`alphabet-image-${letter}`}
          >
            <View>
              <Image
                source={images[letter]}
                style={{ width: imageSize, height: imageSize, resizeMode: 'contain' }}
              />
            </View>
          </Pressable>
        ))}
      </View>

      {/* Modal for Expanded View */}
      <Modal
        visible={!!expandedImage} 
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedImage(null)} 
      >
        <View style={styles.modalOverlay} testID="modal-overlay">
          <Pressable
            style={styles.modalContent}
            onPress={() => setExpandedImage(null)} 
          >
            {expandedImage && (
              <>
                <Text style={styles.expandedLetterText}>{expandedImage.toUpperCase()}</Text>
                <Image
                  source={images[expandedImage]}
                  style={styles.expandedImage}
                  testID="expanded-image"
                />
              </>
            )}
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  gridItem: {
    width: '45%',
    alignItems: 'center',
    margin: 5,
    padding: 10,
    backgroundColor: 'white', 
    borderRadius: 10, 
  },
  pressedItem: {
    opacity: 0.6,
  },
  letterText: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333', 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
  },
  modalContent: {
    width: '90%',
    maxWidth: 400, 
    backgroundColor: 'white',
    borderRadius: 20, 
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  expandedLetterText: {
    fontSize: 32,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333', 
  },
  expandedImage: {
    width: '100%', 
    height: undefined, 
    aspectRatio: 1, 
    resizeMode: 'contain',
    borderRadius: 10, 
  },
});
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

const getScoreKey = (categoryID: string): string => {
  return `score-${categoryID}`;
}

const loadHighScore = async (categoryID: string): Promise<number> => {
  const scoreKey = getScoreKey(categoryID);
  const score = await AsyncStorage.getItem(scoreKey);
  return score ? parseInt(score) : 0;
}

const icons: { [key: string]: 'pets' | 'place' | 'chat' | 'format-list-numbered' | 'palette' | 'quiz' } = {
  animals: 'pets',
  places: 'place',
  greetings: 'chat',
  numbers: 'format-list-numbered',
  colors: 'palette',
  test: 'quiz'
};

export default function QuizScreen() {
  const { t } = useTranslation();

  // Define categories
  // To add categories, please add a new object to the categories array
  // The object should have the following properties:
  // - id: a unique number to identify the category
  // - name: the name of the category
  // - items: an array of items in the category'
  // - icon: the name of the icon to use for the category
  // Each new category needs to be defined in the translation files except for the icons which is above


  const categories = [
    {
      id: 1,
      name: t('categories.animals.name'),
      items: t('categories.animals.items', { returnObjects: true }),
      icon: icons.animals,
    },
    {
      id: 2,
      name: t('categories.places.name'),
      items: t('categories.places.items', { returnObjects: true }),
      icon: icons.places,
    },
    {
      id: 3,
      name: t('categories.greetings.name'),
      items: t('categories.greetings.items', { returnObjects: true }),
      icon: icons.greetings,
    },
    {
      id: 4,
      name: t('categories.numbers.name'),
      items: t('categories.numbers.items', { returnObjects: true }),
      icon: icons.numbers,
    },
    {
      id: 5,
      name: t('categories.colors.name'),
      items: t('categories.colors.items', { returnObjects: true }),
      icon: icons.colors,
    },
    {
      id: 6,
      name: t('categories.test.name'),
      items: t('categories.test.items', { returnObjects: true }),
      icon: icons.test,
    },
  ];


  const [highScores, setHighScores] = useState<{ [key: string]: number }>({});

  const fetchHighScores = async () => {
    const scores: { [key: string]: number } = {};
    for (const category of categories) {
      const score = await loadHighScore(category.id.toString());
      scores[category.id] = score;
    }
    setHighScores(scores);
  }

  useEffect(() => {
    fetchHighScores();
  }, []);

  useFocusEffect(() => {
    fetchHighScores();
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('quizCategories')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* Category Containers */}
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={{
              pathname: '/category', // Navigate to the CategoryScreen
              params: { categoryId: category.id, categoryName: category.name, items: JSON.stringify(category.items) }, // Pass category data as params
            }}
            asChild
          >
            <Pressable style={styles.categoryButton}>
              <View style={styles.categoryContent}>
                <MaterialIcons name={category.icon} size={24} color="#333" style={styles.icon} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
              <View style={styles.highScoreContainer}>
                <View style={[styles.highScoreBar, { width: `${highScores[category.id] || 0}%` }]} />
                <Text style={styles.highScoreText}>{highScores[category.id] || 0}%</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  categoriesContainer: {
    width: '80%',
    alignItems: 'center',
  },
  categoryButton: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#e0e0e0', 
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  icon: {
    marginRight: 10,
  },
  highScoreContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  highScoreBar: {
    height: '100%',
    backgroundColor: '#4caf50', // Green color for the high score bar
    borderRadius: 10,
  },
  highScoreText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
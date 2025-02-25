// components/LoadingView.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="white" />
      <Text style={{ color: 'white', marginTop: 10 }}>Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
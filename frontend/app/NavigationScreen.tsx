import React from 'react';
import { View } from 'react-native';
import OpenStreetMapNavigation from '@/components/OpenStreetMapNavigation';

const NavigationScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', height: 400 }}>
      <OpenStreetMapNavigation />
    </View>
  );
};

export default NavigationScreen;

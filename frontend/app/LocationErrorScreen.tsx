import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/Utils/CustomButton';

const LocationErrorScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <LottieView source={require('@/assets/images/Location.json')} autoPlay loop style={{ width: 300, height: 300 }} />
        <Text style={styles.Text}>Location access is required to proceed.</Text>
        <CustomButton onPress={() => navigation.navigate('HomeScreen')} mode="contained">
          Go back
        </CustomButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  Text: {
    fontSize: 16,
    color: '#000',
    marginVertical: 20,
    textAlign: 'center'
  }
});

export default LocationErrorScreen;

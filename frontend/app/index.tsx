import { StyleSheet, ImageBackground } from 'react-native';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import SignInScreen from './SignInScreen';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

//main landing or entry file
export default function Index() {
  const navigation = useNavigation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.navigate('(tabs)');
    }
  }, [isAuthenticated, user, navigation]);

  const handleGetStarted = () => {
    navigation.navigate('SignInScreen');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/HomeScreen.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.textContainer}>
        <Text style={[styles.textPrimary, { color: '#FEFBFF' }]}>
          Small Urban Park Environments & Residents
        </Text>
        <Text style={[styles.textSecondary, { color: '#FEFBFF' }]}>
          Your ultimate guide to finding green spaces and parks in Leeds
        </Text>
      </View>
      <View style={styles.container}>
        <CustomButton
          mode="outlined"
          onPress={handleGetStarted}
          style={styles.button}
          color="white"
        >
          Get Started
        </CustomButton>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 160
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40
  },
  textPrimary: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 8,
    lineHeight: 20
  },
  textSecondary: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 18,
    paddingHorizontal: 36,
    lineHeight: 20
  },
  button: {
    width: '80%',
    borderRadius: 40
  }
});

import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Link } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';

const { width, height } = Dimensions.get('window');

// Convert pixel values to percentages
const IMAGE_WIDTH_PERCENTAGE = (80.29 / width) * 100;
const IMAGE_HEIGHT_PERCENTAGE = (135.05 / height) * 100;

const OnboardingScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to SUPER!</Text>
          <Text style={styles.subtitle}>Create an account to continue</Text>

          <TextInput
            // label="Email Address"
            mode="outlined"
            style={styles.input}
            outlineStyle={{
              borderColor: '#E2E1EC',
              borderWidth: 1,
              borderRadius: 12
            }}
            textColor="#000"
            selectionColor="#000"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            secureTextEntry={!passwordVisible}
            mode="outlined"
            style={styles.input}
            outlineStyle={{
              borderColor: '#E2E1EC',
              borderWidth: 1,
              borderRadius: 12
            }}
            right={
              <TextInput.Icon
                icon={passwordVisible ? 'eye-off' : 'eye'}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
            textColor="#000"
            selectionColor="#000"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <CustomButton
            mode="contained"
            onPress={() => {
              //trim whitespace and convert to lowercase
              const processedEmail = email.trim().toLowerCase();
              navigation.navigate('LetsKnowYouScreen', { email: processedEmail, password })
            }}
          >
            Create Account
          </CustomButton>

          <CustomButton
            mode="outlined"
            onPress={() => navigation.navigate('(tabs)')}
            rippleColor="#f1f1f1"
            style={styles.skipButton}
          >
            Skip
          </CustomButton>

          <Text style={styles.orText}>OR</Text>

          <CustomButton
            mode="outlined"
            onPress={() => navigation.navigate('(tabs)')}
            rippleColor="#f1f1f1"
          >
            Continue with Google
          </CustomButton>

          <View style={styles.signInContainer}>
            <Text style={styles.signInTextNormal}>
              Already have an account?{' '}
            </Text>
            <Text style={styles.signInText}>
              <Link to="/SignInScreen">Sign In</Link>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  logo: {
    width: `${IMAGE_WIDTH_PERCENTAGE}%`, // Dynamic percentage width
    height: `${IMAGE_HEIGHT_PERCENTAGE}%`, // Dynamic percentage height
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    textAlign: 'left',
    marginBottom: 4,
    width: '50%',
    lineHeight: 43.2,
    letterSpacing: -1,
    color: '#001B3C'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 20,
    fontWeight: 400,
    lineHeight: 20,
    color: '#909090'
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white'
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  createAccountButton: {
    marginTop: 5,
    backgroundColor: 'green',
    borderRadius: 40
  },
  skipButton: {
    marginTop: 15,
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 40
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'gray'
  },
  googleButton: {
    marginTop: 4,
    borderColor: 'lightgray',
    borderRadius: 40
  },
  googleButtonLabel: {
    fontSize: 16,
    color: 'black'
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30
  },
  signInText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16
  },
  signInTextNormal: {
    color: 'black',
    fontSize: 16
  }
});

export default OnboardingScreen;

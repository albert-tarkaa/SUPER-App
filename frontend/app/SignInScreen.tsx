import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import { login } from '@/components/ReduxStore/Slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const IMAGE_WIDTH_PERCENTAGE = (80.29 / width) * 100;
const IMAGE_HEIGHT_PERCENTAGE = (135.05 / height) * 100;

const SignInScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    const processedUsername = username.trim().toLowerCase();
    await dispatch(login({ username: processedUsername, password }));
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.navigate('(tabs)');
    }
  }, [isAuthenticated, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Sign In</Text>

        <TextInput
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          textColor="#000"
          selectionColor="#000"
          placeholder="Email Address"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          secureTextEntry={!passwordVisible}
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
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

        {error && (
          <HelperText type="error" visible>
            * {error.errorMessage}
          </HelperText>
        )}

        <Link to="/ForgotPasswordScreen" style={styles.forgotPasswordLink}>
          Forgot Password?
        </Link>

        <CustomButton
          mode="contained"
          onPress={handleLogin}
          rippleColor="#f1f1f1"
          labelStyle={styles.buttonLabel}
        >
          Sign In
        </CustomButton>

        <Text style={styles.orText}>OR</Text>

        <CustomButton
          mode="outlined"
          onPress={() => navigation.navigate('(tabs)')}
          rippleColor="#f1f1f1"
        >
          Continue with Google
        </CustomButton>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpTextNormal}>Don't have an account? </Text>
          <Link to="/OnboardingScreen" style={styles.signUpLink}>
            Sign Up
          </Link>
        </View>
      </View>
    </View>
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
    width: `${IMAGE_WIDTH_PERCENTAGE}%`,
    height: `${IMAGE_HEIGHT_PERCENTAGE}%`,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 80
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 20,
    width: '50%',
    lineHeight: 43.2,
    letterSpacing: -1,
    color: '#001B3C'
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white'
  },
  inputOutline: {
    borderColor: '#E2E1EC',
    borderWidth: 1,
    borderRadius: 12
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
  forgotPasswordLink: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30
  },
  signUpLink: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16
  },
  signUpTextNormal: {
    color: 'black',
    fontSize: 16
  }
});

export default SignInScreen;

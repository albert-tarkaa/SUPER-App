import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import { login, loginWithGoogle } from '@/components/ReduxStore/Slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useAuth, useUser } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import PasswordValidation from '@/components/Utils/PasswordValidation';

const { width, height } = Dimensions.get('window');

const IMAGE_WIDTH_PERCENTAGE = (80.29 / width) * 100;
const IMAGE_HEIGHT_PERCENTAGE = (135.05 / height) * 100;

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = () => {
  useWarmUpBrowser();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = Linking.createURL('/HomeScreen', { scheme: 'myapp' });

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    const processedUsername = username.trim().toLowerCase();
    await dispatch(login({ username: processedUsername, password }));
  };

  const onPressGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      } else {
        console.log('OAuth flow did not complete');
      }
    } catch (err) {
      console.error('OAuth error', err);
      console.error('OAuth error details:', JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, redirectUrl]);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (isLoaded) {
        if (isSignedIn) {
          const userData = {
            email: user?.primaryEmailAddress?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName
          };
          if (userData) {
            const result = await dispatch(loginWithGoogle(userData));
            try {
              const result = await dispatch(loginWithGoogle(userData));
              if (loginWithGoogle.fulfilled.match(result)) {
                navigation.navigate('(tabs)');
              } else {
                console.error('Failed to update application state:', result.payload);
              }
            } catch (error) {
              console.error('Error during loginWithGoogle dispatch:', error);
            }
          } else {
            console.log('User is not signed in');
          }
        }
      }
    };
    checkAuthAndNavigate();
  }, [isSignedIn, isLoaded, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
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
              icon={({ size, color }) => <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={size} color={color} />}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
          textColor="#000"
          selectionColor="#000"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <PasswordValidation password={password} onValidationChange={setIsPasswordValid} />

        {error && (
          <HelperText type="error" visible>
            * {error.errorMessage}
          </HelperText>
        )}

        <Link to="/ForgotPasswordScreen" style={styles.forgotPasswordLink}>
          Forgot Password?
        </Link>

        <CustomButton mode="contained" rippleColor="#f1f1f1" onPress={handleLogin} disabled={!isPasswordValid} labelStyle={styles.buttonLabel} style={styles.button}>
          Sign In
        </CustomButton>

        <CustomButton mode="outlined" onPress={onPressGoogle} rippleColor="#f1f1f1" style={styles.button}>
          <MaterialCommunityIcons name="google" size={20} color="black" /> Continue with Google
        </CustomButton>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpTextNormal}>Don't have an account? </Text>
          <Link to="/OnboardingScreen" style={styles.signUpLink}>
            Sign Up
          </Link>
        </View>
        {/* Touchable Text for Privacy Policy */}
        <View style={styles.policyContainer}>
          <Text style={styles.policyText}>
            By signing up, you agree to the{' '}
            <Text style={styles.policyLink} onPress={() => Linking.openURL('https://albert-tarkaa.github.io/super-app-user-policy/')}>
              Privacy policy
            </Text>
          </Text>
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
  button: {
    marginVertical: 15
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
    marginVertical: 8
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
  },
  policyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  policyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555'
  },
  policyLink: {
    color: '#007AFF',
    textDecorationLine: 'underline'
  }
});

export default SignInScreen;

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useNavigation } from 'expo-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '@/components/ReduxStore';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';

const publishableKey = "pk_test_Y29tcG9zZWQtbXVkZmlzaC02OC5jbGVyay5hY2NvdW50cy5kZXYk";

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set the publishableKey in your .env');
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Inter-Regular.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="OnboardingScreen" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="SignInScreen"
                    options={{
                      headerShown: false,
                      headerTitle: '',
                      headerBackTitleVisible: false,
                      headerTransparent: true
                    }}
                  />
                  <Stack.Screen
                    name="LetsKnowYouScreen"
                    options={{
                      headerTitle: 'Let’s get to know you.',
                      headerBackTitleVisible: false,
                      headerTitleAlign: 'center',
                      headerTransparent: true,
                      headerStyle: {
                        backgroundColor: '#009933'
                      },
                      headerLeft: () => <Ionicons name="chevron-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
                    }}
                  />
                  <Stack.Screen
                    name="ForgotPasswordScreen"
                    options={{
                      headerTitle: '',
                      headerBackTitleVisible: false,
                      headerTransparent: true
                    }}
                  />
                  <Stack.Screen
                    name="ResetPasswordScreen"
                    options={{
                      headerTitle: '',
                      headerBackTitleVisible: false,
                      headerTransparent: true
                    }}
                  />

                  <Stack.Screen
                    name="ParkDetailsScreen"
                    options={{
                      headerTitle: '',
                      headerBackTitleVisible: true,
                      headerTransparent: true,
                      headerLeft: () => <Ionicons name="chevron-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
                    }}
                  />
                  <Stack.Screen
                    name="LocationErrorScreen"
                    options={{
                      headerTitle: '',
                      headerBackTitleVisible: false,
                      headerTransparent: true,
                      headerStyle: {
                        backgroundColor: '#009933'
                      }
                    }}
                  />

                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ThemeProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </Provider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

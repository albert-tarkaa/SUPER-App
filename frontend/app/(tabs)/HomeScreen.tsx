import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ParksCard from '@/components/ParksCard';
import { fetchWeatherData } from '@/components/Utils/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchparkData = async () => {
  try {
    const response = await axios.get(`${API_URL}/parks/list-parks`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 500) {
        throw new Error('Internal server error');
      }
      if (error.response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw new Error('An error occurred. Please try again later');
  }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const onChangeSearch = (query) => setSearchQuery(query);

  useEffect(() => {
    let watchId = null; // To keep track of the watchPositionAsync subscription

    const fetchLocation = async () => {
      try {
        // Request foreground permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get the current position
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);

        // Watch for location updates
        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10 // Distance in meters
          },
          (location) => {
            setCurrentLocation(location.coords);
          }
        );
      } catch (error) {
        setErrorMsg('An error occurred while fetching location.');
        console.error(error);
      }
    };

    fetchLocation();

    // Cleanup function to stop watching location when the component unmounts
    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, []);

  const {
    data: parkData,
    error: ParkError,
    isLoading: isParkLoading
  } = useQuery({
    queryKey: ['parkData'],
    queryFn: fetchparkData,
    refetchInterval: 100000, // 24hrs
    staleTime: 100000 // 24hrs
  });

  const {
    data: weatherData,
    error: weatherError,
    isLoading: isWeatherLoading
  } = useQuery({
    queryKey: ['weatherData'],
    queryFn: fetchWeatherData,
    refetchInterval: 86400000, //24hrs
    staleTime: 86400000 //24hrs
  });

  const handleParkPress = (data) => {
    navigation.navigate('ParkDetailsScreen', { parkDetails: data.parkDetails });
  };

  console.log('isParkLoading', isParkLoading);
  console.log('isWeatherLoading', isWeatherLoading);

  if (isParkLoading || isWeatherLoading)
    return (
      <LottieView
        source={require('@/assets/images/SUPER.json')}
        autoPlay
        loop
      />
    );
  if (ParkError) return <Text>An error occurred: {ParkError.message}</Text>;
  if (weatherError)
    return <Text>An error occurred: {weatherError.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Let's find the best places and events for you
      </Text>

      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Popular nearby places</Text>
          {Array.isArray(parkData) && parkData.length > 0 ? (
            parkData.map((park) => (
              <ParksCard
                key={park.id}
                park={park}
                weatherData={weatherData}
                isLoading={isParkLoading || isWeatherLoading}
                error={null}
                onPress={handleParkPress}
              />
            ))
          ) : (
            <Text>No parks found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  scrollViewContent: {
    paddingBottom: 0
  },
  avatar: {
    backgroundColor: '#E8F5E9',
    marginRight: 16,
    resizeMode: 'cover'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    padding: 10,
    lineHeight: 32,
    color: '#001B3C'
  },
  searchbar: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderColor: '#E2E1EC',
    borderWidth: 1,
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    lineHeight: 28
  }
});

export default HomeScreen;

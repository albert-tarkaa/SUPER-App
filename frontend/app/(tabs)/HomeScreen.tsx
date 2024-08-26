import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ParksCard from '@/components/ParkDetails/ParksCard';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserLocation, updateUserLocation } from '@/components/ReduxStore/Slices/locationSlice';
import ApiService from '@/components/Utils/ProxyAPICalls';
import { debounce } from 'lodash';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredParks, setFilteredParks] = useState([]);

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { weatherData } = useSelector((state) => state.parkDetails);

  useEffect(() => {
    let watchId = null;

    const setupLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get initial location
        dispatch(getUserLocation());

        // Watch for location updates
        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10 // Distance in meters
          },
          (location) => {
            dispatch(updateUserLocation(location.coords));
          }
        );
      } catch (error) {
        setErrorMsg('An error occurred while fetching location.');
        console.error(error);
      }
    };

    setupLocation();

    // Cleanup function
    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, [dispatch]);

  const {
    data: parkData,
    error: ParkError,
    isLoading: isParkLoading
  } = useQuery({
    queryKey: ['parkData'],
    queryFn: ApiService.fetchParkData,
    refetchInterval: 3 * 60 * 60 * 1000, // 3hrs
    staleTime: 3 * 60 * 60 * 1000 // 3hrs
  });

  const handleParkPress = () => {
    navigation.navigate('ParkDetailsScreen');
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (parkData) {
        const filtered = parkData.filter((park) => park.name.toLowerCase().includes(query.toLowerCase()));
        setFilteredParks(filtered);
      }
    }, 300),
    [parkData]
  );

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  if (isParkLoading) return <LottieView source={require('@/assets/images/SUPER.json')} autoPlay loop />;
  if (ParkError) return <Text>An error occurred while fetching park data: {parkError.message}</Text>;
  // if (!weatherData) return <Text>Weather data is not available at the moment. Please try again later.</Text>;

  const parksToDisplay = searchQuery ? filteredParks : parkData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's find the best places and events for you to explore {isAuthenticated && `, ${user?.firstName} 🌴🌻`}</Text>

      <Searchbar placeholder="Search" onChangeText={onChangeSearch} value={searchQuery} style={styles.searchbar} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Popular nearby places</Text>
          {Array.isArray(parksToDisplay) && parksToDisplay.length > 0 ? (
            parksToDisplay.map((park) => <ParksCard key={park.id} park={park} isLoading={isParkLoading} error={ParkError} onPress={() => handleParkPress(park)} />)
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
    fontSize: 20,
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

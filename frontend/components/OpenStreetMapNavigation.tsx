import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Text } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserLocation } from '@/components/ReduxStore/Slices/locationSlice';
import { debounce, isEqual } from 'lodash';
import { Button, Modal, Portal, Provider } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';

type Location = {
  latitude: number;
  longitude: number;
};

const transportModes = {
  driving: 'driving-car',
  cycling: 'cycling-regular',
  walking: 'foot-walking'
};

const transportStyles = {
  driving: {
    strokeColor: '#4285F4',
    strokeWidth: 5,
    lineDashPattern: null
  },
  cycling: {
    strokeColor: '#DE3C07',
    strokeWidth: 5,
    lineDashPattern: [1, 2]
  },
  walking: {
    strokeColor: '#8BC954',
    strokeWidth: 7,
    lineDashPattern: [1, 7]
  }
};

const OpenStreetMapNavigation = () => {
  const { latitude, longitude, destinationLatitude, destinationLongitude } =
    useSelector((state) => state.location);
  const dispatch = useDispatch();

  const defaultLocation = { latitude: 53.7995746, longitude: -1.5471022 };
  const destination = useMemo(
    () => ({ latitude: destinationLatitude, longitude: destinationLongitude }),
    [destinationLatitude, destinationLongitude]
  );

  const currentLocation = useMemo(
    () => (latitude && longitude ? { latitude, longitude } : null),
    [latitude, longitude]
  );

  const [errorMsg, setErrorMsg] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [route, setRoute] = useState(null);
  const [transportMode, setTransportMode] = useState('driving');
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const mapRef = useRef(null);
  const soundObject = useRef(new Audio.Sound());
  const bottomSheetRef = useRef(null);
  const getRouteRef = useRef(null);
  const locationSubscriptionRef = useRef(null);

  const snapPoints = useMemo(() => ['20%', '50%', '75%'], []);
  const previousRequestRef = useRef({
    currentLocation: null,
    transportMode: null,
    destination: null
  });

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setModalVisible(true);
    }
  }, [latitude, longitude]);

  const hideModal = () => {
    router.push('(tabs)');

    setModalVisible(false);
  };

  const debouncedGetRoute = useCallback(
    debounce((location) => {
      if (location) {
        getRoute(location);
      }
    }, 1000),
    [transportMode, destination]
  );

  useEffect(() => {
    let isMounted = true;

    const setupLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          dispatch(updateUserLocation(location.coords));
          debouncedGetRoute(location.coords);
        }

        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 20,
            timeInterval: 10000
          },
          (newLocation) => {
            if (isMounted) {
              dispatch(updateUserLocation(newLocation.coords));
              debouncedGetRoute(newLocation.coords);
              if (isNavigating) {
                updateCurrentInstruction(newLocation.coords);
              }
            }
          }
        );
      } catch (err) {
        console.error('Error setting up location tracking:', err);
      }
    };

    setupLocationTracking();

    return () => {
      isMounted = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
      debouncedGetRoute.cancel();
    };
  }, [dispatch, isNavigating, debouncedGetRoute]);

  const getRoute = useCallback(
    async (currentLocation) => {
      if (!currentLocation) return;

      if (
        isEqual(previousRequestRef.current.currentLocation, currentLocation) &&
        previousRequestRef.current.transportMode === transportMode &&
        isEqual(previousRequestRef.current.destination, destination)
      ) {
        console.log('Skipping API call - no changes in parameters');
        return;
      }

      try {
        const OPENROUTE_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_API_KEY;

        if (!OPENROUTE_API_KEY) {
          throw new Error('Missing OpenRoute API key');
        }

        if (getRouteRef.current) {
          getRouteRef.current.cancel('New request initiated');
        }

        console.log({ currentLocation });

        getRouteRef.current = axios.CancelToken.source();

        console.log('Fetching new route...');
        const response = await axios.get(
          `https://api.openrouteservice.org/v2/directions/${transportModes[transportMode]}`,
          {
            params: {
              api_key: OPENROUTE_API_KEY,
              start: `${currentLocation.longitude},${currentLocation.latitude}`,
              end: `${destinationLatitude.longitude},${destinationLongitude.latitude}`
            },
            cancelToken: getRouteRef.current.token
          }
        );

        

        if (
          !response.data ||
          !response.data.features ||
          !response.data.features[0]
        ) {
          throw new Error('Unexpected API response structure');
        }

        const feature = response.data.features[0];

        if (!feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
          throw new Error('Invalid or missing route coordinates');
        }

        const points = feature.geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        setRoute(points);

        if (
          feature.properties &&
          feature.properties.segments &&
          Array.isArray(feature.properties.segments)
        ) {
          const segment = feature.properties.segments[0];
          const steps = segment.steps;
          if (Array.isArray(steps)) {
            setInstructions(
              steps.map((step) => ({
                instruction: step.instruction || 'No instruction available',
                distance: step.distance || 0,
                duration: step.duration || 0,
                type: step.type,
                name: step.name,
                way_points: step.way_points
              }))
            );
            setTotalDistance(segment.distance);
            setTotalDuration(segment.duration);
          } else {
            console.warn('No valid steps found in the route');
            setInstructions([]);
          }
        } else {
          console.warn('No valid segments found in the route');
          setInstructions([]);
        }
        previousRequestRef.current = {
          currentLocation,
          transportMode,
          destination
        };
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching route:', error);
          setRoute(null);
          setInstructions([]);
        }
      }
    },
    [transportMode, destination]
  );

  const updateCurrentInstruction = (location) => {
    if (instructions.length === 0) return;

    const nextInstruction = instructions[currentInstructionIndex + 1];

    if (nextInstruction) {
      const nextWaypoint = route[nextInstruction.way_points[0]];
      const distanceToNextWaypoint = calculateDistance(location, nextWaypoint);

      if (distanceToNextWaypoint < 0.0124) {
        setCurrentInstructionIndex(currentInstructionIndex + 1);
        if (isAudioEnabled) {
          speakInstruction(nextInstruction.instruction);
        }
      }
    }
  };

  const speakInstruction = async (instruction) => {
    try {
      const VOICE_API_KEY = process.env.EXPO_PUBLIC_VOICE_API_KEY;
      if (!VOICE_API_KEY) {
        throw new Error('Missing Voice API key');
      }
      await soundObject.current.unloadAsync();
      await soundObject.current.loadAsync({
        uri: `http://api.voicerss.org/?key=${VOICE_API_KEY}&hl=en-us&src=${encodeURIComponent(instruction)}`
      });
      await soundObject.current.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const TransportModeSelector = useCallback(
    () => (
      <View style={styles.selectorContainer}>
        {Object.keys(transportModes).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              transportMode === mode && styles.selectedModeButton
            ]}
            onPress={() => setTransportMode(mode)}
          >
            <Text
              style={[
                styles.modeButtonText,
                transportMode === mode && styles.selectedModeButtonText
              ]}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [transportMode]
  );

  const AudioToggle = useCallback(
    () => (
      <TouchableOpacity
        style={styles.audioButton}
        onPress={() => setIsAudioEnabled((prev) => !prev)}
      >
        <MaterialIcons
          name={isAudioEnabled ? 'volume-up' : 'volume-off'}
          size={24}
          color={isAudioEnabled ? '#007AFF' : '#000'}
        />
      </TouchableOpacity>
    ),
    [isAudioEnabled]
  );

  const renderBottomSheetContent = useCallback(() => {
    return (
      <View style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetControls}>
          {!isNavigating && <TransportModeSelector />}
          {isNavigating ? (
            <TouchableOpacity style={styles.endButton} onPress={endNavigation}>
              <Feather name="x" size={24} color="white" />
              <Text style={styles.endButtonText}>End Navigation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startNavigation}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bottomSheetInstructions}>
          <View style={styles.bottomSheetDivider} />
          <BottomSheetScrollView
            style={styles.bottomSheetInstructions}
            contentContainerStyle={styles.instructionsContainer}
            showsVerticalScrollIndicator={true}
          >
            {instructions.map((instruction, index) => (
              <View
                key={index}
                style={[
                  styles.instructionItem,
                  index === currentInstructionIndex && styles.currentInstruction
                ]}
              >
                <Text style={styles.instructionText}>
                  {instruction.instruction}
                </Text>
                <Text style={styles.instructionDetails}>
                  Distance: {instruction.distance.toFixed(2)} m | Duration:{' '}
                  {(instruction.duration / 60).toFixed(2)} min
                </Text>
                {index === currentInstructionIndex && (
                  <MaterialIcons
                    name="arrow-forward"
                    size={24}
                    color="#007AFF"
                  />
                )}
              </View>
            ))}
          </BottomSheetScrollView>
        </View>
      </View>
    );
  }, [
    instructions,
    currentInstructionIndex,
    isNavigating,
    TransportModeSelector
  ]);

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              showsUserLocation={true}
            >
              <Marker
                coordinate={currentLocation}
                pinColor="blue"
                title="Your Location"
              />
              <Marker
                coordinate={destination}
                pinColor="red"
                title="Destination"
              />
              {route && (
                <Polyline
                  coordinates={route}
                  strokeColor={transportStyles[transportMode].strokeColor}
                  strokeWidth={transportStyles[transportMode].strokeWidth}
                />
              )}
            </MapView>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Distance: {(totalDistance / 1000).toFixed(2)} km
            </Text>
            <Text style={styles.infoText}>
              Duration: {(totalDuration / 60).toFixed(0)} min
            </Text>
          </View>
          <AudioToggle />
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetHandle}
        >
          {renderBottomSheetContent()}
        </BottomSheet>
      </View>
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.Modalcontainer}
        >
          <LottieView
            source={require('@/assets/images/Location.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          <Text style={styles.modalText}>
            Location access is required to proceed.
          </Text>
          <Button
            mode="contained"
            onPress={hideModal}
            style={styles.Modalbutton}
          >
            <Text style={styles.ModalButtonText}>Go back</Text>
          </Button>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  Modalcontainer: {
    flex: 1,
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    maxHeight: '100%',
    alignContent: 'center',
    marginVertical: 0
  },
  ModalButtonText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26.63,
    letterSpacing: 0.25,
    marginTop: 1,
    color: '#fff'
  },
  Modalbutton: {
    margin: 25,
    backgroundColor: 'green',
    borderRadius: 40,
    width: '65%',
    alignSelf: 'center',
    marginBottom: 50,
    padding: 2
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.9
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  infoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 10
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16
  },
  bottomSheetControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  bottomSheetInstructions: {
    flex: 1
  },
  instructionsContainer: {
    paddingBottom: 20 // Add some padding at the bottom for better scrolling
  },
  selectorContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#cfebc3',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-between'
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15
  },
  selectedModeButton: {
    backgroundColor: '#007AFF'
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  selectedModeButtonText: {
    color: '#fff'
  },
  audioButton: {
    position: 'absolute',
    top: 70,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10
  },
  startButton: {
    backgroundColor: '#009933',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginLeft: 10
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  endButton: {
    backgroundColor: '#009933',
    borderRadius: 20,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 'auto'
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 8
  },
  instructionItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  currentInstruction: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
    borderWidth: 1
  },
  instructionText: {
    fontSize: 16
  },
  instructionDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  bottomSheetHandle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    height: 4,
    width: 60,
    alignSelf: 'center',
    marginVertical: 10
  },
  bottomSheetDivider: {
    height: 5,
    backgroundColor: '#f0f0f0',
    alignSelf: 'stretch',
    marginBottom: 10
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    padding: 5
  }
});

export default React.memo(OpenStreetMapNavigation);

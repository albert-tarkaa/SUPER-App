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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDestinationLocation,
  getUserLocationSelector,
  updateUserLocation
} from '@/components/ReduxStore/Slices/locationSlice';
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

const defaultParkDestination: Location = {
  latitude: 53.798889, // Default latitude
  longitude: -1.551944 // Default longitude
};

const OpenStreetMapNavigation = () => {
  const userLocation = useSelector(getUserLocationSelector);
  const destinationLocation = useSelector(getDestinationLocation);

  const dispatch = useDispatch();

  // Initialize currentLocation with a default value or null
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [route, setRoute] = useState(null);
  const [transportMode, setTransportMode] = useState('driving');
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const mapRef = useRef(null);
  const soundObject = useRef(new Audio.Sound());
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['20%', '50%', '75%'], []);

  useEffect(() => {
    if (userLocation) {
      getRoute();
    }
  }, [userLocation, transportMode]);

  useEffect(() => {
    if (!userLocation.latitude || !userLocation.longitude) {
      setModalVisible(true);
    }
  }, [userLocation]);

  const hideModal = () => {
    router.push('(tabs)');
    setModalVisible(false);
  };

  const getRoute = async () => {
    if (!userLocation) return;

    try {
      const OPENROUTE_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_API_KEY;

      if (!OPENROUTE_API_KEY) {
        throw new Error('Missing OpenRoute API key');
      }
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/${transportModes[transportMode]}?api_key=${OPENROUTE_API_KEY}&start=${userLocation.longitude},${userLocation.latitude}&end=${destinationLocation.longitude},${destinationLocation.latitude}`
      );
      console.log(response.data.features);
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
    } catch (error) {
      console.error('Error fetching route:', error);
      setRoute(null);
      setInstructions([]);
    }
  };

  const updateCurrentInstruction = (userLocation) => {
    if (instructions.length === 0) return;

    const nextInstruction = instructions[currentInstructionIndex + 1];

    if (nextInstruction) {
      const nextWaypoint = route[nextInstruction.way_points[0]];
      const distanceToNextWaypoint = calculateDistance(
        userLocation,
        nextWaypoint
      );

      if (distanceToNextWaypoint < 0.0124) {
        setCurrentInstructionIndex(currentInstructionIndex + 1);
        if (isAudioEnabled) {
          speakInstruction(nextInstruction.instruction);
        }
      }
    }
  };

  const calculateDistance = (point1, point2) => {
    const earthRadiusMeters = 6371e3;
    const latitude1Radians = (point1.latitude * Math.PI) / 180;
    const latitude2Radians = (point2.latitude * Math.PI) / 180;
    const latitudeDifferenceRadians =
      ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const longitudeDifferenceRadians =
      ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(latitudeDifferenceRadians / 2) *
        Math.sin(latitudeDifferenceRadians / 2) +
      Math.cos(latitude1Radians) *
        Math.cos(latitude2Radians) *
        Math.sin(longitudeDifferenceRadians / 2) *
        Math.sin(longitudeDifferenceRadians / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInMeters = earthRadiusMeters * c;
    const metersToMilesConversionFactor = 0.000621371;
    const distanceInMiles = distanceInMeters * metersToMilesConversionFactor;

    return distanceInMiles;
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
              {mode === 'walking' && (
                <MaterialCommunityIcons
                  name="walk"
                  size={24}
                  color={transportMode === mode ? '#fff' : '#000'}
                />
              )}{' '}
              {mode === 'cycling' && (
                <MaterialCommunityIcons
                  name="bike"
                  size={24}
                  color={transportMode === mode ? '#fff' : '#000'}
                />
              )}{' '}
              {mode === 'driving' && (
                <MaterialCommunityIcons
                  name="car"
                  size={24}
                  color={transportMode === mode ? '#fff' : '#000'}
                />
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [transportMode]
  );

  const AudioToggle = () => (
    <TouchableOpacity
      style={styles.audioButton}
      onPress={() => setIsAudioEnabled(!isAudioEnabled)}
    >
      <MaterialIcons
        name={isAudioEnabled ? 'volume-up' : 'volume-off'}
        size={24}
        color={isAudioEnabled ? '#007AFF' : '#000'}
      />
    </TouchableOpacity>
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
              <MaterialCommunityIcons
                name="navigation-outline"
                size={24}
                color="white"
              />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bottomSheetInstructions}>
          <View
            style={{
              height: 5,
              backgroundColor: '#f0f0f0',
              alignSelf: 'stretch',
              marginBottom: 10
            }}
          />
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
                  Distance: {instruction.distance.toFixed(2)} m  | Duration:{' '}
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
    transportMode,
    isAudioEnabled
  ]);

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          {userLocation && (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              showsUserLocation={true}
            >
              <Marker
                coordinate={userLocation}
                pinColor="blue"
                title="Your Location"
              />
              <Marker
                coordinate={destinationLocation}
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
  Modalcontainer: {
    flex: 1,
    backgroundColor: 'white', // White background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#000', // Adjust color if needed
    marginVertical: 20,
    textAlign: 'center',
  },
  Modalbutton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  ModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#cfebc3',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
    elevation: 3
  },
  modeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  icon: {
    marginBottom: 5
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  endButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  }
});

export default OpenStreetMapNavigation;

import axios from 'axios';
import { useEffect, useState } from 'react';

//Replace this with your backend API URL
export const API_URL = 'https://3b0a-86-187-235-184.ngrok-free.app/api/v1';

const handleApiError = (error) => {
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
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

interface EventsResponse {
  results: Event[];
}

const ApiService = {
  fetchParkData: async () => {
    try {
      const response = await axios.get(`${API_URL}/parks/list-parks`);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  fetchWeatherData: async () => {
    try {
      const response = await axios.get(`${API_URL}/proxy/weather`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null; // Return null instead of undefined
    }
  },

  getAirQuality: async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(`${API_URL}/proxy/air-quality`, {
        params: { lat: latitude, lon: longitude }
      });
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getDirections: async (start, end, profile) => {
    try {
      const response = await axios.get(`${API_URL}/proxy/directions`, {
        params: { start, end, profile }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  speakInstruction: async (instruction) => {
    try {
      const response = await axios.get(`${API_URL}/proxy/speak`, {
        params: { instruction },
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  fetchEvents: async (): Promise<Event[]> => {
    const now = new Date();
    const nowFormatted = formatDate(now);

    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 7);
    const futureFormatted = formatDate(futureDate);

    const params = {
      category:
        'expos,concerts,festivals,performing-arts,community,sports,public-holidays,observances,daylight-savings,airport-delays,severe-weather,disasters,terror,health-warnings',
      'active.gte': nowFormatted,
      'active.lte': futureFormatted,
      state: 'active',
      sort: 'start',
      limit: 5,
      within: '1.5mi@53.7995746,-1.5471022',
      t: Date.now()
    };

    try {
      const response = await axios.get<EventsResponse>(`${API_URL}/proxy/events`, { params });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching events:', error);
      handleApiError(error);
    }

    throw new Error('An error occurred while fetching events');
  },

  //Points of Interest
  fetchPOIs: async (latitude: number, longitude: number) => {
    try {
      const response = await axios.post(`${API_URL}/proxy/points-of-interest`, null, {
        params: {
          latitude,
          longitude
        }
      });

      console.log('POIs:', JSON.stringify(response.data.features, null, 2));
      return response.data.features;
    } catch (error) {
      console.error('Error fetching POIs:', error);
      throw error;
    }
  }
};

export const transportModes = {
  driving: 'driving-car',
  cycling: 'cycling-regular',
  walking: 'foot-walking'
};

export const RouteService = (userLocation, destinationLocation, transportMode) => {
  const [route, setRoute] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLocation && destinationLocation) {
      getRoute();
    }
  }, [userLocation, destinationLocation, transportMode]);

  const getRoute = async () => {
    if (!userLocation) return;
    try {
      const start = `${userLocation.longitude},${userLocation.latitude}`;
      const end = `${destinationLocation.longitude},${destinationLocation.latitude}`;
      const profile = transportModes[transportMode];

      const response = await ApiService.getDirections(start, end, profile);
      if (!response || !response?.features || !response?.features[0]) {
        throw new Error('Unexpected API response structure');
      }

      const feature = response?.features[0];
      if (!feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
        throw new Error('Invalid or missing route coordinates');
      }

      const points = feature.geometry.coordinates.map((coord) => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      setRoute(points);

      if (feature.properties && feature.properties.segments && Array.isArray(feature.properties.segments)) {
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
      setError(null);
    } catch (error) {
      console.error('Error fetching route:', error);
      setRoute(null);
      setInstructions([]);
      setError(error.message);
    }
  };

  const speakInstruction = async (instruction) => {
    try {
      await soundObject.current.unloadAsync();
      const response = await ApiService.speakInstruction(instruction);
      const audioBuffer = response.data;
      await soundObject.current.loadAsync({ uri: Audio.Sound.createAsync(audioBuffer) });
      await soundObject.current.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return {
    route,
    instructions,
    totalDistance,
    totalDuration,
    error,
    speakInstruction
  };
};

export default ApiService;

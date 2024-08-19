import React, { useEffect, useState } from 'react';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Icon,
  ActivityIndicator
} from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import LottieView from 'lottie-react-native';
import getAirQualityInfo from './Utils/AQIColorCode';
import { SafeAreaView } from 'react-native-safe-area-context';

const apiKey = process.env.EXPO_PUBLIC_AIR_QUALITY_OPEN_DATA_PLATFORM_API_KEY;

const ParksCard = ({ weatherData, isLoading, error, onPress, park }) => {
  const [AQIData, setAQIData] = useState(null);
  const [color, setColor] = useState('#009933');
  const [AQIReading, setAQIReading] = useState('');

  const hexToRgba = (hex, alpha = 1) => {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r / 255, g / 255, b / 255, alpha];
  };

  const modifyColorInLottie = (animationData, newHexColor) => {
    const newColor = hexToRgba(newHexColor);

    const traverse = (obj) => {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key === 'c' && Array.isArray(obj[key].k)) {
            obj[key].k = newColor; // Replace color with new color
          } else if (typeof obj[key] === 'object') {
            traverse(obj[key]);
          }
        }
      }
    };

    traverse(animationData);
    return animationData;
  };

  const modifiedAnimationData = modifyColorInLottie(
    JSON.parse(JSON.stringify(require('@/assets/images/AQI.json'))), // Deep copy the JSON object
    color // Pass the new hex color here
  );

  const fetchAQIData = async () => {
    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/geo:${park.latitude};${park.longitude}/?token=${apiKey}`
      );
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

  const {
    data: AQIInfo,
    error: AQIError,
    isLoading: AQILoading
  } = useQuery({
    queryKey: ['AQIData'],
    queryFn: fetchAQIData,
    refetchInterval: 1800000, // 30mins
    staleTime: 1800000 // 30mins
  });

  useEffect(() => {
    if (AQIInfo) {
      setAQIData(AQIInfo);
      const { color, text } = getAirQualityInfo(AQIInfo.aqi);
      setAQIReading(text);
      setColor(color);
    }
  }, [AQIInfo]);

  const renderWeatherInfo = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#009933" />;
    }

    if (error) {
      return <Text style={styles.errorText}>Weather data unavailable</Text>;
    }

    if (weatherData) {
      const temperature = Math.round(weatherData.main.temp - 273.15); // Convert from Kelvin to Celsius
      const windSpeed = weatherData.wind.speed;
      const humidity = weatherData.main.humidity;

      return (
        <>
          <View style={styles.infoItem}>
            <Icon source="thermometer" size={16} color="#FF5733" />
            <Text style={styles.infoText}>{temperature}°C</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon source="weather-windy" size={16} color="#3498DB" />
            <Text style={styles.infoText}>{windSpeed}m/h</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon source="water-percent" size={16} color="#3498DB" />
            <Text style={styles.infoText}>{humidity}%</Text>
          </View>
        </>
      );
    }

    return null;
  };

  const handlePress = () => {
    const parkDetailsWithAQI = {
      ...park,
      weatherData,
      AQIData: {
        aqi: AQIInfo?.aqi,
        color,
        reading: AQIReading
      }
    };
    onPress({ parkDetails: parkDetailsWithAQI });
  };

  const renderSkeletonCards = () => {
    return Array(3)
      .fill()
      .map((_, index) => (
        <Card key={index} style={styles.skeletonCard}>
          <Card.Content>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
          </Card.Content>
        </Card>
      ));
  };

  if (AQILoading) {
    return <SafeAreaView>{renderSkeletonCards()}</SafeAreaView>;
  }
  if (AQIError) return <Text>An error occurred: {AQIError.message}</Text>;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: park.imageUrl }} />
        <View style={styles.ratingContainer}>
          <Icon source="star" size={16} color="#FCBE01" />
          <Text style={styles.ratingText}>{park.rating}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <LottieView
              source={modifiedAnimationData}
              autoPlay
              loop
              style={{ width: 35, height: 35 }}
            />
            <Text style={styles.infoText}>{AQIInfo?.aqi}</Text>
          </View>
          {renderWeatherInfo()}
        </View>
        <Card.Content style={{ padding: 12 }}>
          <Title style={styles.title}>{park.name}</Title>
          <Paragraph>{park.postcode}</Paragraph>
          <Paragraph>{park.address}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 0
  },
  skeletonCard: {
    marginBottom: 10,
    elevation: 4
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    borderRadius: 4
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    borderRadius: 4,
    width: '80%'
  },

  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 16
  },
  ratingText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 4
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 18
  },
  infoContainer: {
    position: 'absolute',
    bottom: 98,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    color: '#001B3C',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 4
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12
  }
});

export default ParksCard;

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
import AQIColorCode from './AQIColorCode';

const apiKey = process.env.EXPO_PUBLIC_AIR_QUALITY_OPEN_DATA_PLATFORM_API_KEY;

const ParksCard = ({ weatherData, isLoading, error, onPress, park }) => {
  const [AQIData, setAQIData] = useState(null);
  const [color, setColor] = useState('#009933');

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
      setColor(AQIColorCode(AQIInfo.aqi));
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

  if (AQIError) return <Text>An error occurred: {AQIError.message}</Text>;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: park.imageUrl }} />
        <View style={styles.ratingContainer}>
          <Icon source="star" size={16} color="#FCBE01" />
          <Text style={styles.ratingText}>{park.rating}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon source="leaf" size={16} color={color} />
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
    bottom: 100,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 10
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    color: '#001B3C',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12
  }
});

export default ParksCard;

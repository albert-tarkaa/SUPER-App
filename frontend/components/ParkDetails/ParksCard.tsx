import React, { useEffect, useState } from 'react';
import { Text, Card, Title, Paragraph, Icon, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import LottieView from 'lottie-react-native';
import getAirQualityInfo from '../Utils/AQIColorCode';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../Utils/ProxyAPICalls';
import { setParkDetails } from '../ReduxStore/Slices/parkDetailsSlice';
import { useDispatch } from 'react-redux';

const ParksCard = ({ isLoading, error, onPress, park }) => {
  const [AQIData, setAQIData] = useState(null);
  const [color, setColor] = useState('#009933');
  const [AQIReading, setAQIReading] = useState('');
  const dispatch = useDispatch();

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

  const {
    data: AQIInfo,
    error: AQIError,
    isLoading: AQILoading
  } = useQuery({
    queryKey: ['AQIInfo', park.id],
    queryFn: () => ApiService.getAirQuality(park.latitude, park.longitude),
    refetchInterval: 30 * 60 * 1000, // 30mins
    staleTime: 30 * 60 * 1000 // 30mins
  });

  const {
    data: weatherData,
    error: weatherError,
    isLoading: isWeatherLoading
  } = useQuery({
    queryKey: ['weatherData', park.id],
    queryFn: () => ApiService.fetchWeatherData(park.latitude, park.longitude),
    refetchInterval: 3 * 60 * 60 * 1000, //3hrs
    staleTime: 3 * 60 * 60 * 1000 //3hrs
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
      const temperature = Math.round(weatherData.current.temp_c); // Temperature in Celsius
      const windSpeed = weatherData.current.wind_kph; // Wind speed in kph
      const uvIndex = weatherData.current.uv; // UV Index

      return (
        <>
          <View style={styles.infoItem}>
            <Icon source="thermometer" size={16} color="#FF5733" />
            <Text style={styles.infoText}>{temperature}°C</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon source="weather-windy" size={16} color="#3498DB" />
            <Text style={styles.infoText}>{windSpeed} kph</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon source="weather-sunny" size={16} color="#FFD700" />
            <Text style={styles.infoText}>UV: {uvIndex}</Text>
          </View>
        </>
      );
    }

    return null;
  };

  const handlePress = () => {
    const parkDetailsWithAQI = {
      park,
      weatherData,
      AQIData: {
        aqi: AQIInfo?.aqi,
        color,
        reading: AQIReading
      }
    };
    dispatch(setParkDetails(parkDetailsWithAQI));
    onPress();
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
            <LottieView source={modifiedAnimationData} autoPlay loop style={{ width: 35, height: 35 }} />
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

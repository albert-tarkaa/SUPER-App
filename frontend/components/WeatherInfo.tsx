import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherIcon, getWeatherColor } from './Utils/weatherUtlis';

const AnimatedChip = Animated.createAnimatedComponent(Chip);

const WeatherInfo = ({ weatherData, error, isLoading }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (weatherData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [weatherData]);

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading weather data...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (weatherData) {
    const tempCelsius = Math.round(weatherData.main.temp - 273.15);
    const windSpeedKmh = Math.round(weatherData.wind.speed * 3.6);
    const weatherColor = getWeatherColor(weatherData.weather[0].main);

    return (
      <Animated.View style={[styles.weatherInfo, { opacity: fadeAnim }]}>
        <AnimatedChip
          icon={() => (
            <Ionicons
              name={getWeatherIcon(weatherData.weather[0].icon)}
              size={20}
              color={weatherColor}
            />
          )}
          style={[styles.chip, { backgroundColor: weatherColor + '20' }]}
          textStyle={{ color: weatherColor }}
        >
          {weatherData.weather[0].main}
        </AnimatedChip>
        <AnimatedChip
          icon="thermometer"
          style={[
            styles.chip,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {tempCelsius}°C
        </AnimatedChip>
        <AnimatedChip icon="weather-windy" style={styles.chip}>
          {windSpeedKmh} mph
        </AnimatedChip>
        <AnimatedChip icon="water-percent" style={styles.chip}>
          {weatherData.main.humidity}%
        </AnimatedChip>
      </Animated.View>
    );
  }

  return null;
};

export default WeatherInfo;

const styles = StyleSheet.create({
  chip: {
    marginRight: 8,
    marginBottom: 8
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 10
  },
  weatherInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8
  }
});

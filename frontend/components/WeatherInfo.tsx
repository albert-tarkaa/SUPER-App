import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getWeatherIcon, getWeatherColor } from './Utils/weatherUtlis';

const WeatherInfo = ({ weatherData, error, isLoading }) => {
  if (isLoading) {
    return <Text style={styles.loadingText}>Loading weather data...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (weatherData) {
    const tempCelsius = Math.round(weatherData.main.temp - 273.15);
    const windSpeedKmh = Math.round(weatherData.wind.speed * 3.6);
    const weatherCondition = weatherData.weather[0].main;
    const weatherIcon = getWeatherIcon(weatherCondition);
    const weatherColor = getWeatherColor(weatherCondition);

    return (
      <View style={[styles.weatherInfo, { backgroundColor: weatherColor }]}>
        <View style={styles.weatherMain}>
          <Icon name={weatherIcon} size={40} color="#FFFFFF" />
          <Text style={styles.tempText}>{tempCelsius}°C</Text>
        </View>
        <View style={styles.chipContainer}>
          <Chip style={styles.chip}>{windSpeedKmh} mph</Chip>
          <Chip style={styles.chip}>{weatherData.main.humidity}%</Chip>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  weatherInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  loadingText: {
    fontSize: 16,
    color: '#888'
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000'
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  tempText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  chip: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5
  }
});

export default WeatherInfo;

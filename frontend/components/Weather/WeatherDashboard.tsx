import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';
import WeeklyForecast from './WeeklyForecast';

const primaryColor = '#007A33'; // Darker green for better contrast
const backgroundColor = '#FFFFFF'; // White background
const textColor = '#000000'; // Black text
const { width } = Dimensions.get('window');

const WeatherApp = ({ weatherData, AQIData, error, isLoading }) => {
  const [color, setColor] = useState('#009933');

  useEffect(() => {
    setColor(AQIData.color);
  }, [AQIData.color]);

  if (isLoading) {
    return <Text>Loading weather data...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (weatherData) {
    const weatherIconUrl = weatherData.current.condition.icon;

    const tempCelsius = Math.round(weatherData.current.temp_c);
    const tempMaxCelsius = Math.round(weatherData.forecast.forecastday[0].day.maxtemp_c);
    const tempMinCelsius = Math.round(weatherData.forecast.forecastday[0].day.mintemp_c);
    const tempFeelCelsius = Math.round(weatherData.current.feelslike_c);
    const description = weatherData.current.condition.text;
    const windSpeedmph = Math.round(weatherData.current.wind_mph);
    const pressure = weatherData.current.pressure_mb;
    const humidity = weatherData.current.humidity;
    const uvIndex = weatherData.current.uv;
    const visibility = weatherData.current.vis_miles;

    // Prepare data for WeeklyForecast
    const forecastData = weatherData.forecast.forecastday.map((day) => ({
      time: day.date,
      temp_c: day.day.avgtemp_c,
      condition: {
        icon: day.day.condition.icon,
        text: day.day.condition.text
      }
    }));

    return (
      <Card style={styles.container}>
        <View style={styles.temperatureReadingContainer}>
          <View style={styles.FeelRow}>
            <Image source={{ uri: `https:${weatherIconUrl}` }} style={styles.temperatureIcon} />
            <Text style={styles.temperature}>{tempCelsius}°C </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.realFeel}>
              Feels like {tempFeelCelsius}°C{'\n'}
              {description.charAt(0).toUpperCase() + description.slice(1)}
              {'\n'}
              Max: {tempMaxCelsius}
              °C {'\n'}
              Min: {tempMinCelsius}°C
            </Text>
          </View>
        </View>
        <View>
          <View style={styles.detailsHeader}></View>
          <View style={styles.detailsRow}>
            <View style={[styles.AQIchip, { backgroundColor: color }]}>
              <Text style={styles.detailTitle}>Air Quality Index</Text>
              <Text style={styles.detailValue}>{AQIData.reading}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Wind</Text>
              <Text style={styles.detailValue}>{windSpeedmph} mph</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Humidity</Text>
              <Text style={styles.detailValue}>{humidity}%</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Pressure</Text>
              <Text style={styles.detailValue}>{pressure} hpa</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>UV Index</Text>
              <Text style={styles.detailValue}>{uvIndex}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Pressure</Text>
              <Text style={styles.detailValue}>{visibility} miles</Text>
            </View>
          </View>
        </View>

        <WeeklyForecast forecast={forecastData} />
      </Card>
    );
  }
  return null;
};

export default WeatherApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: backgroundColor,
    padding: 20,
    borderRadius: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  weatherDescription: {
    fontSize: 18,
    color: textColor,
    marginBottom: 20
  },
  temperatureReadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%'
  },
  temperatureContainer: {
    flexDirection: 'row',
    marginBottom: 5
  },
  temperatureIcon: {
    width: 64,
    height: 64
  },
  temperature: {
    fontSize: 30,
    fontWeight: '500',
    color: textColor,
    lineHeight: 35
  },
  realFeel: {
    fontSize: 15,
    color: textColor,
    fontWeight: '500'
  },
  detailsContainer: {
    backgroundColor: '#E6F3E8',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  detailsLink: {
    color: primaryColor,
    textDecorationLine: 'underline'
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  FeelRow: {
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  detailBox: {
    backgroundColor: '#C8E6C9',
    borderRadius: 10,
    padding: 10,
    width: '48%',
    elevation: 3
  },
  AQIchip: {
    borderRadius: 10,
    padding: 10,
    width: '48%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  detailTitle: {
    color: textColor,
    marginBottom: 5
  },
  detailValue: {
    color: textColor,
    fontSize: 16,
    fontWeight: 'bold'
  }
});

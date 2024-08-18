import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

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
    const iconCode = weatherData.weather[0].icon;
    const weatherIconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Convert temperature from Kelvin to Celsius
    const tempCelsius = Math.round(weatherData.main.temp - 273.15);
    const tempMaxCelsius = Math.round(weatherData.main.temp_max - 273.15);
    const tempMinCelsius = Math.round(weatherData.main.temp_min - 273.15);
    const tempFeelCelsius = Math.round(weatherData.main.feels_like - 273.15);
    // Extract weather description
    const description = weatherData.weather[0].description;

    // Convert wind speed from m/s to mph
    const windSpeedMph = Math.round(weatherData.wind.speed * 2.23694);

    // Pressure in hPa (default)
    const pressure = weatherData.main.pressure;

    return (
      <Card style={styles.container}>
        <Image
          source={{ uri: weatherIconUrl }}
          style={styles.temperatureIcon}
        />
        <View style={styles.temperatureContainer}>
          <View style={styles.temperatureReadingContainer}>
            <Text style={styles.temperature}>{tempCelsius}°C </Text>
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
              <Text style={styles.detailValue}>{windSpeedMph} mph</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Humidity</Text>
              <Text style={styles.detailValue}>
                {weatherData.main.humidity}%
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailTitle}>Pressure</Text>
              <Text style={styles.detailValue}>{pressure}hpa</Text>
            </View>
          </View>
        </View>
        <LineChart
          data={{
            labels: ['Now', '22:00', '23:00', '00:00', '01:00'],
            datasets: [{ data: [10, 9, 8, 6, 6] }]
          }}
          width={width - 40}
          height={150}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: backgroundColor,
            backgroundGradientTo: backgroundColor,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 51, ${opacity})`, // Using primaryColor
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black labels
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: primaryColor
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
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
    width: 60,
    height: 50
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
    backgroundColor: '#E6F3E8', // Light green background
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
  detailBox: {
    backgroundColor: '#C8E6C9', // Slightly darker green for detail boxes
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

import React from 'react';
import { ScrollView, StyleSheet, Text, Image, View } from 'react-native';
import { Card } from 'react-native-paper';

interface ForecastDay {
  time: string;
  temp_c: number;
  condition: {
    icon: string;
    text: string;
  };
}

interface WeeklyForecastProps {
  forecast: ForecastDay[];
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecast }) => {
  return (
    <View style={styles.forecastCard}>
      <Text style={styles.sectionTitle}>7-Day Weather Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {forecast.map((day, index) => (
          <Card key={index} style={styles.dayCard}>
            <Card.Content>
              <Text style={styles.dayText}>{new Date(day.time).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Image source={{ uri: `https:${day.condition.icon}` }} style={styles.weatherIcon} />
              <Text style={styles.tempText}>{Math.round(day.temp_c)}°C</Text>
              <Text style={styles.conditionText}>{day.condition.text}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  forecastCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 2,
    paddingBottom: 0,
    margin: 0
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  dayCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    margin: 3
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center'
  },
  weatherIcon: {
    width: 40,
    height: 40
  },
  tempText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center'
  },
  conditionText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default WeeklyForecast;

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  Avatar,
  Button,
  Card,
  List,
  Paragraph,
  Title
} from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import WeatherDashboard from '@/components/WeatherDashboard';
import Events from '@/components/Events';

const ParkDetailsScreen = () => {
  const route = useRoute();
  const { parkDetails } = route.params;
  const [color, setColor] = useState('#009933');

  useEffect(() => {
    setColor(parkDetails.AQIData.color);
  }, [parkDetails.AQIData.color]);

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
    parkDetails.AQIData.color // Pass the new hex color here
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Park Info Card: Displays main information about the park */}
        <Card style={{ backgroundColor: '#fff', marginBottom: 8 }}>
          <Card.Cover
            source={{ uri: parkDetails.imageUrl }}
            style={styles.cover}
          />
          <Card.Content>
            <Title style={styles.title}>{parkDetails.name}</Title>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4].map((star) => (
                <Ionicons key={star} name="star" size={16} color="#FFC107" />
              ))}
              <Paragraph>
                {parkDetails.rating}{' '}
                <Text style={styles.reviewText}>
                  {parkDetails.reviewCount} reviews
                </Text>
              </Paragraph>
            </View>
            <Paragraph style={styles.parkAddress}>
              <Ionicons name="location" size={12} color="green" />
              {parkDetails.address} | {parkDetails.postcode}
            </Paragraph>
            <Title style={styles.parkInfoTitle}>Park Info</Title>
            <Paragraph style={styles.DescriptionText}>
              {parkDetails.description}
            </Paragraph>
            <View style={styles.infoRow}>
              <Paragraph>
                <Text style={styles.OpenText}>Open</Text>{' '}
                <Text style={styles.OpenTime}>{parkDetails.openingHours}</Text>
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
          
          {/* Weather Dashboard Card: Displays weather and air quality information */}
        <WeatherDashboard
          weatherData={parkDetails.weatherData}
          AQIData={parkDetails.AQIData}
          error={parkDetails.error}
          isLoading={parkDetails.isLoading}
        />

        {/* Accessibility Card: Lists accessibility features of the park */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.parkDetailsTitle}>Accessibility</Title>
            {parkDetails.accessibility.map((accessibility) => (
              <Text key={accessibility} style={styles.text}>
                {accessibility}
              </Text>
            ))}
          </Card.Content>
        </Card>

        {/* Children Card: Provides information about the park's suitability for children and pets */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.parkDetailsTitle}>Children</Title>
            {parkDetails.childrenFeatures.map((children) => (
              <Text key={children} style={styles.text}>
                {children}
              </Text>
            ))}
          </Card.Content>
        </Card>

        {/* Notice Card: Displays important notices or rules for the park */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.parkDetailsTitle}>Notice</Title>
            {parkDetails.notices.map((notice) => (
              <Text key={notice} style={styles.text}>
                {notice}
              </Text>
            ))}
          </Card.Content>
        </Card>

        {/* Nearby Places Card: Shows nearby attractions or points of interest */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Nearby Places</Title>
            <View style={styles.nearbyPlaces}>
              <Card style={styles.nearbyCard}>
                <Card.Cover source={require('@/assets/images/3.png')} />
                <Card.Content>
                  <Paragraph>Armley Cafe</Paragraph>
                  <Paragraph style={styles.smallText}>
                    Stanningley Rd, Armley, Leeds LS12 3LW
                  </Paragraph>
                </Card.Content>
              </Card>
              <Card style={styles.nearbyCard}>
                <Card.Cover source={require('@/assets/images/2.png')} />
                <Card.Content>
                  <Paragraph>Gotts Park</Paragraph>
                  <Paragraph style={styles.smallText}>
                    Armley Ridge Rd, Leeds LS12 2QX
                  </Paragraph>
                </Card.Content>
              </Card>
            </View>
          </Card.Content>
        </Card>

        {/* Events Nearby Card: Lists upcoming events near the park */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Events Nearby</Title>
            <Events />
          </Card.Content>
        </Card>

        {/* Get Direction Button: Allows users to navigate to a map view */}
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => router.push('/Map')}
        >
          Get Direction
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParkDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
    marginTop: 55
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chip: {
    marginRight: 8,
    marginBottom: 8
  },
  OpenText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20.3,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#009933'
  },
  OpenTime: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20.3,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#001B3C'
  },
  DescriptionText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18.9,
    color: '#909090'
  },
  AQIchip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10
  },
  animation: {
    width: 65,
    height: 65
  },
  textContainer: {
    marginLeft: 10,
    flex: 1
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555'
  },
  reading: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26.63,
    letterSpacing: 0.25,
    textAlign: 'left',
    marginTop: 8
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 18.9,
    marginVertical: 3,
    color: '#90909A'
  },
  weatherInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8
  },
  infoText: {
    marginVertical: 8
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  reviewText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center'
  },
  parkAddress: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 16,
    color: '#90909A',
    marginVertical: 8
  },
  button: {
    margin: 15,
    paddingVertical: 8,
    backgroundColor: 'green',
    borderRadius: 40,
    width: '95%',
    alignSelf: 'center'
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  cover: {
    height: 244,
    resizeMode: 'cover',
    borderRadius: 0
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
  sectionCard: {
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#FFFFFF'
  },
  nearbyPlaces: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  nearbyCard: {
    width: '48%'
  },
  smallText: {
    fontSize: 12
  },
  parkDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.25,
    color: '#0B1E4B'
  },
  parkInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.25,
    color: '#0B1E4B',
    marginVertical: 8
  }
});

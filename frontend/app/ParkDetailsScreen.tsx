import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  List,
  Paragraph,
  Title
} from 'react-native-paper';
import WeatherInfo from '../components/WeatherInfo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ParkDetailsScreen = () => {
  const route = useRoute();
  const { parkDetails } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Park Info Card: Displays main information about the park */}
        <Card style={{ backgroundColor: '#fff' }}>
          <Card.Cover
            source={require('@/assets/images/2.png')}
            style={styles.cover}
          />
          <Card.Content>
            <Title style={styles.title}>{parkDetails.name}</Title>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4].map((star) => (
                <Ionicons key={star} name="star" size={16} color="#FFC107" />
              ))}
              <Paragraph>
                4.5 <Text style={styles.reviewText}>130 reviews</Text>
              </Paragraph>
            </View>
            <Paragraph style={styles.parkAddress}>
              <Ionicons name="location" size={12} color="green" />
              {parkDetails.address}
            </Paragraph>
            <Chip icon="check" style={styles.chip}>
              Good Air Quality
            </Chip>
            <Paragraph style={styles.infoText}>
              Armley Park is two miles west of Leeds city centre and is
              approximately 14 hectares in area. It's the perfect location for
              people of all age ranges to enjoy a relaxing day out. The park
              gives residents and visitors amazing views over kirkstall valley.
            </Paragraph>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#4CAF50" />
              <Paragraph>1.1km • Open 7am - 12am</Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Weather Info Component: Shows current weather information for the park */}
        <WeatherInfo
          weatherData={parkDetails.weatherData}
          error={parkDetails.error}
          isLoading={parkDetails.isLoading}
        />

        {/* Accessibility Card: Lists accessibility features of the park */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Accessibility</Title>
            <List.Item
              title="Wheelchair-accessible car park"
              left={() => <List.Icon icon="check" />}
            />
            <List.Item
              title="Wheelchair-accessible entrance"
              left={() => <List.Icon icon="check" />}
            />
          </Card.Content>
        </Card>

        {/* Children Card: Provides information about the park's suitability for children and pets */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Children</Title>
            <List.Item
              title="Good for kids"
              left={() => <List.Icon icon="check" />}
            />
            <List.Item title="Pets" left={() => <List.Icon icon="check" />} />
          </Card.Content>
        </Card>

        {/* Notice Card: Displays important notices or rules for the park */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title>Notice</Title>
            <List.Item
              title="Dogs allowed"
              left={() => <List.Icon icon="information" />}
            />
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
            <List.Item
              title="Bird watching Club picnic"
              description="Mon 10th June | 10am - 5pm"
              left={() => <Avatar.Icon size={40} icon="bird" />}
            />
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
  title: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26.63,
    letterSpacing: 0.25,
    textAlign: 'left',
    marginTop: 8
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
    margin: 16,
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
  }
});

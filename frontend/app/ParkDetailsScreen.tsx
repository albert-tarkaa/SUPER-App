import React, { useEffect, useMemo, useRef, useState, Animated } from 'react';
import { StyleSheet, View, Text, SectionList } from 'react-native';
import { Card, Paragraph, Title, Modal, Portal, Button, Provider, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WeatherDashboard from '@/components/WeatherDashboard';
import Events from '@/components/Events';
import CustomButton from '@/components/CustomButton';
import BottomSheet from '@gorhom/bottom-sheet';
import { setDestinationLocation } from '@/components/ReduxStore/Slices/locationSlice';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';

const HEADER_HEIGHT = 340;

const ParkDetailsScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [color, setColor] = useState('#009933');
  const { parkDetails, isLoading } = useSelector((state) => state.parkDetails);
  const { park, weatherData, AQIData } = parkDetails || {};

  const { latitude, longitude } = park || {};
  const parkDestination = { latitude, longitude };

  useEffect(() => {
    if (AQIData && AQIData.color) {
      setColor(AQIData.color);
    }
  }, [AQIData]);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['13%'], []);

  const handleNavigation = async () => {
    if (!latitude || !longitude) {
      setModalVisible(true);
      return; // Prevent navigation
    }
    await dispatch(setDestinationLocation(parkDestination));
    router.push('/Map');
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  if (isLoading || !parkDetails) {
    return <Text>Loading...</Text>;
  }

  const sections = [
    {
      title: 'Park Info',
      data: [{ type: 'parkInfo' }]
    },
    {
      title: 'Weather',
      data: [{ type: 'weather' }]
    },
    {
      title: 'Accessibility',
      data: [{ type: 'accessibility' }]
    },
    {
      title: 'Children',
      data: [{ type: 'children' }]
    },
    {
      title: 'Notice',
      data: [{ type: 'notice' }]
    },
    {
      title: 'Nearby Places',
      data: [{ type: 'nearbyPlaces' }]
    },
    {
      title: 'Events Nearby',
      data: [{ type: 'events' }]
    }
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'parkInfo':
        return (
          <Card style={{ backgroundColor: '#fff', marginBottom: 8 }}>
            <Card.Content>
              <Title style={styles.title}>{park?.name}</Title>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#FFC107" />
                ))}
                <Paragraph style={{ color: '#0B1E4B' }}>
                  {park?.rating} <Text style={styles.reviewText}>{park?.reviewCount} reviews</Text>
                </Paragraph>
              </View>
              <Paragraph style={styles.parkAddress}>
                <Ionicons name="location" size={12} color="green" />
                {park?.address} | {park?.postcode}
              </Paragraph>
              <Title style={styles.parkInfoTitle}>Park Info</Title>
              <Paragraph style={styles.DescriptionText}>{park?.description}</Paragraph>
              <View style={styles.infoRow}>
                <Paragraph>
                  <Text style={styles.OpenText}>Open</Text> <Text style={styles.OpenTime}>{park?.openingHours}</Text>
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        );
      case 'weather':
        return <WeatherDashboard weatherData={weatherData} AQIData={AQIData || {}} error={park?.error} isLoading={park?.isLoading} />;
      case 'accessibility':
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.parkDetailsTitle}>Accessibility</Title>
              {park?.accessibility.map((accessibility) => (
                <Text key={accessibility} style={styles.text}>
                  {accessibility}
                </Text>
              ))}
            </Card.Content>
          </Card>
        );
      case 'children':
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.parkDetailsTitle}>Children</Title>
              {park?.childrenFeatures.map((children) => (
                <Text key={children} style={styles.text}>
                  {children}
                </Text>
              ))}
            </Card.Content>
          </Card>
        );
      case 'notice':
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.parkDetailsTitle}>Notice</Title>
              {park?.notices.map((notice) => (
                <Text key={notice} style={styles.text}>
                  {notice}
                </Text>
              ))}
            </Card.Content>
          </Card>
        );
      case 'nearbyPlaces':
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={{ color: '#0B1E4B' }}>Nearby Places</Title>
              <View style={styles.nearbyPlaces}>
                <Card style={styles.nearbyCard}>
                  <Card.Cover source={require('@/assets/images/3.png')} />
                  <Card.Content>
                    <Paragraph>Armley Cafe</Paragraph>
                    <Paragraph style={styles.smallText}>Stanningley Rd, Armley, Leeds LS12 3LW</Paragraph>
                  </Card.Content>
                </Card>
                <Card style={styles.nearbyCard}>
                  <Card.Cover source={require('@/assets/images/2.png')} />
                  <Card.Content>
                    <Paragraph>Gotts Park</Paragraph>
                    <Paragraph style={styles.smallText}>Armley Ridge Rd, Leeds LS12 2QX</Paragraph>
                  </Card.Content>
                </Card>
              </View>
            </Card.Content>
          </Card>
        );
      case 'events':
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={{ color: '#0B1E4B' }}>Events Nearby</Title>
              <Events />
            </Card.Content>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Card style={{ backgroundColor: '#fff', marginBottom: 8 }}>
          <Card.Cover source={{ uri: park?.imageUrl }} style={styles.cover} />
        </Card>
        <SectionList sections={sections} keyExtractor={(item, index) => item.type + index} renderItem={renderItem} contentContainerStyle={styles.scrollContent} />
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={styles.bottomSheetIndicator}
          handleStyle={styles.bottomSheetHandle}
          enablePanDownToClose={false}
          backgroundStyle={styles.bottomSheetBackground} // Add this line
        >
          <View style={styles.bottomSheetContent}>
            <CustomButton mode="contained" onPress={handleNavigation} labelStyle={styles.bottomSheetbuttonLabel} style={styles.bottomSheetbutton}>
              Get Directions
            </CustomButton>
          </View>
        </BottomSheet>
        <Portal>
          <Modal visible={isModalVisible} onDismiss={hideModal} contentContainerStyle={styles.Modalcontainer}>
            <LottieView source={require('@/assets/images/Location.json')} autoPlay loop style={{ width: 300, height: 300 }} />
            <Text style={{ marginBottom: 20, fontSize: 18, padding: 5 }}>Location access is required to proceed.</Text>
            <Button mode="contained" onPress={hideModal} style={styles.Modalbutton}>
              <Text style={styles.ModalButtonText}>Go back</Text>
            </Button>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default ParkDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8'
    //marginTop: 55
  },
  Modalcontainer: {
    flex: 1,
    backgroundColor: '#F7F7F8',
    alignItems: 'center'
  },
  scrollContent: {
    paddingBottom: 100 // Add some padding at the bottom to prevent content from being hidden behind the bottom sheet
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
    marginTop: 8,
    color: '#0B1E4B'
  },
  ModalButtonText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26.63,
    letterSpacing: 0.25,
    marginTop: 8,
    color: '#fff'
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
    textAlign: 'center',
    color: '#0B1E4B'
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
    backgroundColor: 'green',
    borderRadius: 40,
    width: '95%',
    alignSelf: 'center'
  },
  Modalbutton: {
    margin: 25,
    backgroundColor: 'green',
    borderRadius: 40,
    width: '65%',
    alignSelf: 'center',
    marginBottom: 50,
    padding: 2
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  cover: {
    height: 324,
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
  },
  bottomSheetHandle: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  bottomSheetIndicator: {
    backgroundColor: '#E0E0E0',
    width: 0,
    height: 4
  },
  bottomSheetBackground: {
    backgroundColor: ' rgba(255, 255, 255, 0.2);'
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'transparent'
  },
  bottomSheetbutton: {
    width: '70%',
    marginTop: 1,
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f4f4f4',
    padding: 5
  }
});

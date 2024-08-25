import React, { useEffect } from 'react';
import { View } from 'react-native';
import OpenStreetMapNavigation from '@/components/OpenStreetMapNavigation';
import { getUserLocationSelector } from '@/components/ReduxStore/Slices/locationSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Map() {
  const router = useRouter();
  const userLocation = useSelector(getUserLocationSelector);
  const { poisData } = useLocalSearchParams();
  const parsedPOIsData = poisData ? JSON.parse(poisData as string) : null;

  useEffect(() => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      router.push('LocationErrorScreen');
    }
  }, [userLocation, router]);

  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return null; // Return null to avoid rendering anything while redirecting
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <OpenStreetMapNavigation poisData={parsedPOIsData} />
    </View>
  );
}

import OpenStreetMapNavigation from '@/components/OpenStreetMapNavigation';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function TabTwoScreen() {
  const { poisData } = useLocalSearchParams();
  const parsedPOIsData = poisData ? JSON.parse(poisData as string) : null;


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <OpenStreetMapNavigation poisData={parsedPOIsData} />
    </View>
  );
}

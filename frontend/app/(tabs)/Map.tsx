import OpenStreetMapNavigation from '@/components/OpenStreetMapNavigation';
import { View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <OpenStreetMapNavigation />
    </View>
  );
}

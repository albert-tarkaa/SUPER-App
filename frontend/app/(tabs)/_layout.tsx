import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TabBarIcon } from '@/components/TabBarIcon';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#009933',
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#009933',
          height: 60
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#009933'
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Home',
          headerTitle: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Map"
        options={{
          title: 'Map',
          headerTitle: 'Navigation',
          headerLeft: () => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#fff"
              style={{ marginLeft: 10 }}
              onPress={() => navigation.goBack('HomeScreen')}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          headerLeft: () => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#fff"
              style={{ marginLeft: 10 }}
              onPress={() => navigation.goBack('HomeScreen')}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-sharp' : 'person-outline'} color={color} />
          )
        }}
      />
    </Tabs>
  );
}

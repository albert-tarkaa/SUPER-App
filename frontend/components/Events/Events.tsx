import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { formatDateToUK } from '../Utils/formatDate';
import ApiService from '../Utils/ProxyAPICalls';
const { useQuery, UseQueryResult } = require('@tanstack/react-query');

const useEvents = (): typeof UseQueryResult => {
  return useQuery({
    queryKey: ['events'],
    queryFn: ApiService.fetchEvents,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false
  });
};

const Events = () => {
  const { data, error, isLoading } = useEvents();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error fetching events: {error.message}</Text>;
  }

  const calculateDuration = (durationInSeconds: number) => {
    // Handle cases where the duration is zero or less
    if (durationInSeconds <= 0) {
      return null; // Return null if duration is zero or less
    }

    // Calculate the duration components
    const days = Math.floor(durationInSeconds / 86400);
    const hours = Math.floor((durationInSeconds % 86400) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    let result = '';

    // Append days if present
    if (days > 0) {
      result += `${days} day${days > 1 ? 's' : ''}`;
    } else {
      // Append hours if no days but hours are present
      if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`;
      }

      // Append minutes if no days or hours but minutes are present
      if (minutes > 0) {
        if (result) result += ', '; // Add comma if previous unit exists
        result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
      }

      // Append seconds if no days, hours, or minutes but seconds are present
      if (seconds > 0) {
        if (result) result += ', '; // Add comma if previous unit exists
        result += `${seconds} second${seconds > 1 ? 's' : ''}`;
      }
    }

    // Handle the case where no components are added
    if (!result) {
      result = 'less than a second';
    }

    return result;
  };

  const EventItem = ({ event }: { event: Event }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventDetails}>
        {formatDateToUK(event.start)} {calculateDuration(event.duration) ? `- ${formatDateToUK(event.end)} ` : ''}
      </Text>
      {event.geo.address.formatted_address ? (
        <Text style={styles.eventDetails}>
          {event.geo.address.formatted_address} {'\n'}
          {event.geo.address.postcode}
        </Text>
      ) : null}
      {calculateDuration(event.duration) ? <Text style={styles.eventDetails}>Duration: {calculateDuration(event.duration)}</Text> : null}
      <View style={styles.tagsContainer}>
        {event.labels.map((label) => (
          <View key={label} style={styles.tag}>
            <Text style={styles.tagText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View>
      <FlatList data={data} renderItem={({ item }) => <EventItem event={item} />} keyExtractor={(item) => item.id} style={styles.container} />
    </View>
  );
};

export default Events;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8
  },
  eventItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB'
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1
  },
  eventDetails: {
    fontSize: 14,
    color: '#6B7280'
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap'
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: 'bold'
  }
});

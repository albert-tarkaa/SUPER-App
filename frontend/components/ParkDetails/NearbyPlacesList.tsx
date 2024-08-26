import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

// Convert meters to miles
const metersToMiles = (meters) => {
  return (meters * 0.000621371).toFixed(2); // Convert meters to miles
};

const getCategoryName = (item) => {
  const categoryIds = item?.properties?.category_ids;
  if (categoryIds) {
    const firstCategory = Object.values(categoryIds)[0];
    if (firstCategory && firstCategory.category_name) {
      return firstCategory.category_name
        .split(/[_-]/) // Split on both underscore and hyphen
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  return '';
};

const NearbyPlacesList = ({ data }) => {
  const renderItem = ({ item }) => {
    const name = item?.properties?.osm_tags?.name;
    const fee = item?.properties.osm_tags?.fee || 'N/A';
    const distanceMiles = metersToMiles(item?.properties?.distance);
    const categoryName = getCategoryName(item);

    return (
      <View style={styles.listItem}>
        <Text style={styles.title}>{name || categoryName}</Text>
        <Text style={styles.detail}>Distance: {distanceMiles} miles</Text>
        <Text style={styles.detail}>Fee: {fee}</Text>
        <Text style={styles.CategoryDetail}>Category: {categoryName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => item.properties.osm_id.toString()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listItem: {
    paddingVertical: 5,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  detail: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold'
  },
  CategoryDetail: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold'
  }
});

export default NearbyPlacesList;

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CustomAvatar = ({
  size,
  source,
  style
}: {
  size: number;
  source: string;
  style: any;
}) => {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    >
      <Image
        source={source}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    resizeMode: 'contain'
  }
});

export default CustomAvatar;

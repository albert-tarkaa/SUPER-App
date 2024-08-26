import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const CustomButton = ({ mode = 'contained', style, labelStyle, onPress, contentStyle, rippleColor, children, disabled, color }) => {
  const buttonStyle = mode === 'contained' ? styles.containedButton : styles.outlinedButton;
  const buttonLabelStyle = mode === 'contained' ? [styles.containedLabel, { color: 'white' }] : [styles.outlinedLabel, { color: color }];

  return (
    <Button
      mode={mode}
      style={[buttonStyle, style]}
      labelStyle={[buttonLabelStyle, labelStyle]}
      onPress={onPress}
      contentStyle={[styles.buttonContent, contentStyle]}
      rippleColor={rippleColor}
      color={color}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  containedButton: {
    marginTop: 5,
    backgroundColor: 'green',
    borderRadius: 40
  },
  outlinedButton: {
    marginTop: 4,
    borderColor: 'lightgray',
    borderRadius: 40
  },
  containedLabel: {
    color: 'white'
  },
  outlinedLabel: {
    color: 'black'
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20
  }
});

export default CustomButton;

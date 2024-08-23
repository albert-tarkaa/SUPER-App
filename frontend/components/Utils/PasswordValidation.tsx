import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PasswordValidation = ({ password, onValidationChange }) => {
  const [validations, setValidations] = useState({
    length: false,
    digits: false
  });

  useEffect(() => {
    const newValidations = {
      length: password.length >= 8,
      digits: (password.match(/\d/g) || []).length >= 2
    };
    setValidations(newValidations);

    const isValid = Object.values(newValidations).every(Boolean);
    onValidationChange(isValid);
  }, [password, onValidationChange]);

  const renderValidationItem = (label, isValid) => (
    <View style={styles.validationItem}>
      <MaterialCommunityIcons name={isValid ? 'check-circle' : 'close-circle'} size={16} color={isValid ? '#4CAF50' : '#F44336'} />
      <HelperText type={isValid ? 'info' : 'error'} visible={true} style={[styles.helperText, isValid && styles.validText]}>
        {label}
      </HelperText>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderValidationItem('At least 8 characters long', validations.length)}
      {renderValidationItem('Contains at least 2 digits', validations.digits)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -5
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10
  },
  helperText: {
    marginLeft: 4
  },
  validText: {
    color: '#4CAF50'
  }
});

export default PasswordValidation;

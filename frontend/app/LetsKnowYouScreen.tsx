import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { set } from 'lodash';
import { signup } from '@/components/ReduxStore/Slices/authSlice';

const LetsKnowYouScreen = () => {
  const route = useRoute();
  const { email, password } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [date, setDate] = useState(new Date());
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const formattedDate = date.toISOString().split('T')[0];

  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    navigation.navigate('(tabs)');
  }

  const handleSignup = async () => {
    try {
      await dispatch(
        signup({
          username: email.trim().toLowerCase(), // username field
          password,
          firstName,
          lastName,
          dob: formattedDate,
          gender
        })
      );
      // Navigate to HomeScreen upon successful signup
      navigation.navigate('(tabs)');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          mode="outlined"
          style={styles.input}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          textColor="#000"
          selectionColor="#000"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          mode="outlined"
          style={styles.input}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          textColor="#000"
          selectionColor="#000"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          mode="outlined"
          style={styles.inputSplit}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          textColor="#000"
          selectionColor="#000"
          placeholder="Date of Birth"
          value={formattedDate}
          onChangeText={(text) => setDate(new Date(text))}
        />

        <TextInput
          mode="outlined"
          style={styles.inputSplit}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          textColor="#000"
          selectionColor="#000"
          placeholder="Gender"
          value={gender}
          onChangeText={setGender}
        />

        <CustomButton
          mode="contained"
          onPress={handleSignup}
          labelStyle={styles.buttonLabel}
          style={styles.createAccountButton}
        >
          Complete
        </CustomButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    alignContent: 'flex-start',
    columnGap: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 100
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 34,
    fontWeight: 600,
    textAlign: 'justify',
    lineHeight: 43.2,
    letterSpacing: -1,
    color: '#001B3C',
    marginTop: 200
  },
  input: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: 'white'
  },
  inputSplit: {
    marginBottom: 20,
    width: '46%',
    backgroundColor: 'white',
    alignItems: 'center'
  },
  createAccountButton: {
    marginTop: 45,
    width: '100%',
    borderRadius: 40
  }
});

export default LetsKnowYouScreen;

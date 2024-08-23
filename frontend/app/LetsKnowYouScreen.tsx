import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '@/components/ReduxStore/Slices/authSlice';
import DateTimePicker from '@react-native-community/datetimepicker';

const LetsKnowYouScreen = () => {
  const route = useRoute();
  const { email, password } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [gender, setGender] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to disclose'];

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.navigate('(tabs)');
    }
  }, [isAuthenticated, user, navigation]);

  const handleSignup = async () => {
    try {
      await dispatch(
        signup({
          username: email.trim().toLowerCase(), // username field
          password,
          firstName,
          lastName,
          dob: date,
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

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputSplit}>
          <TextInput
            mode="outlined"
            style={{ width: '100%' }}
            outlineStyle={{
              borderColor: '#E2E1EC',
              borderWidth: 1,
              borderRadius: 12
            }}
            textColor="#000"
            selectionColor="#000"
            placeholder="Date of Birth"
            value={formatDate(date)}
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker testID="dateTimePicker" value={date} mode={'date'} is24Hour={true} display="default" onChange={onDateChange} />}

        <TouchableOpacity onPress={() => setShowGenderDropdown(true)} style={styles.inputSplit}>
          <TextInput
            mode="outlined"
            style={{ width: '100%' }}
            outlineStyle={{
              borderColor: '#E2E1EC',
              borderWidth: 1,
              borderRadius: 12
            }}
            textColor="#000"
            selectionColor="#000"
            placeholder="Gender"
            value={gender}
            editable={false}
            right={<TextInput.Icon icon="chevron-down" />}
          />
        </TouchableOpacity>

        <Modal visible={showGenderDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowGenderDropdown(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowGenderDropdown(false)}>
            <View style={styles.dropdownContainer}>
              <FlatList
                data={genderOptions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender(item);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <CustomButton mode="contained" onPress={handleSignup} labelStyle={styles.buttonLabel} style={styles.createAccountButton}>
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
  inputSplit: {
    marginBottom: 20,
    width: '46%',
    backgroundColor: 'white'
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
  // inputSplit: {
  //   marginBottom: 20,
  //   width: '46%',
  //   backgroundColor: 'white',
  //   alignItems: 'center'
  // },
  createAccountButton: {
    marginTop: 45,
    width: '100%',
    borderRadius: 40
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '50%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 5
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E1EC'
  }
});

export default LetsKnowYouScreen;

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';

const LetsKnowYouScreen = () => {
  const route = useRoute();
 // const { email, password } = route.params;
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [Firstname, setFirstname] = useState('');
  const [Surname, setSurname] = useState('');
  const [Gender, setGender] = useState('');

 // console.log(email + ' ' + password);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* <Text style={styles.title}>Let’s get to know you.</Text> */}
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
          placeholder="Firstname"
          value="Firstname"
          onChangeText={setFirstname}
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
          placeholder="Surname"
          value="Surname"
          onChangeText={setSurname}
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
          value={date}
          onChangeText={setDate}
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
          value={Gender}
          onChangeText={setGender}
        />

        <CustomButton
          mode="contained"
          onPress={() => navigation.navigate('(tabs)')}
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

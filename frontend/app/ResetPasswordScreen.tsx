import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Please type in your new paasword </Text>
        <Text style={styles.subtitle}>and confirm it to reset your password.</Text>

        <TextInput
          // label="Password"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          right={<TextInput.Icon icon="eye" />}
          textColor="#000"
          selectionColor="#000"
          placeholder="Password"
        />

        <TextInput
          // label="Password"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineStyle={{
            borderColor: '#E2E1EC',
            borderWidth: 1,
            borderRadius: 12
          }}
          right={<TextInput.Icon icon="eye" />}
          textColor="#000"
          selectionColor="#000"
          placeholder="Confirm Password"
        />

        <Button mode="contained" style={styles.createAccountButton} labelStyle={styles.buttonLabel} onPress={() => navigation.navigate('LetsKnowYouScreen')}>
          Reset Password
        </Button>
      </View>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: 40,
    fontWeight: 600,
    textAlign: 'left',
    marginBottom: 4,
    lineHeight: 43.2,
    letterSpacing: -1,
    color: '#001B3C',
    marginTop: 250
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 5,
    fontWeight: 400,
    lineHeight: 20,
    color: '#001B3C'
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  input: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: 'white'
  },
  inputSplit: {
    marginBottom: 20,
    width: '47%',
    backgroundColor: 'white'
  },
  createAccountButton: {
    marginTop: 15,
    paddingVertical: 8,
    backgroundColor: 'green',
    width: '100%',
    borderRadius: 40
  }
});

export default ResetPasswordScreen;

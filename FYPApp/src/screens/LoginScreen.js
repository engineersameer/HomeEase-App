import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    cnic: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // CNIC validation
    const cnicRegex = /^[0-9]{13}$/;
    if (!cnicRegex.test(formData.cnic)) {
      tempErrors.cnic = 'Please enter a valid 13-digit CNIC';
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = 'Please enter a valid 11-digit phone number';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        // TODO: Add API call to verify credentials
        // For now, just show success message
        Alert.alert(
          'Success',
          'Login successful!',
          [
            {
              text: 'OK',
              onPress: () => {
                // TODO: Navigate to main app screen
                console.log('Navigate to main app');
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        
        <TextInput
          style={styles.input}
          placeholder="CNIC (13 digits)"
          value={formData.cnic}
          onChangeText={(text) => setFormData({ ...formData, cnic: text })}
          keyboardType="numeric"
          maxLength={13}
        />
        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          keyboardType="phone-pad"
          maxLength={11}
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupLinkText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default LoginScreen; 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';

const API_URL = 'http://192.168.10.15:5000/api/auth/signup';

export default function CustomerSignup() {
  const router = useRouter();
  const theme = Colors.light;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name,
        email,
        password,
        role: 'customer',
        address,
        phone,
        city,
      };

      const response = await axios.post(API_URL, userData);

      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/customer-signin');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: 80,
          paddingBottom: 40,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ 
              width: 80, 
              height: 80, 
              marginBottom: 24,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 24,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.heading,
            marginBottom: 8,
          }}>
            Create Account
          </Text>
          <Text style={{ 
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
          }}>
            Join us and start booking services
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          {/* Name */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={theme.textLight}
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Password (min 6 characters)"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor={theme.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Address */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Address"
              placeholderTextColor={theme.textLight}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                textAlignVertical: 'top',
                height: 80,
              }}
            />
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={theme.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{
                backgroundColor: theme.card,
                color: theme.textDark,
                fontFamily: Fonts.body,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* City */}
          <View style={{ marginBottom: 32 }}>
            <View style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
            }}>
              <Picker
                selectedValue={city}
                onValueChange={setCity}
                style={{
                  color: theme.textDark,
                  fontFamily: Fonts.body,
                  fontSize: 16,
                }}
              >
                <Picker.Item label="Select City" value="" />
                {cities.map((cityName) => (
                  <Picker.Item key={cityName} label={cityName} value={cityName} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              fontSize: 16,
              fontWeight: '600',
              color: '#fff',
              fontFamily: Fonts.subheading,
            }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ 
              fontSize: 14,
              color: theme.textLight,
              fontFamily: Fonts.body,
              marginBottom: 16,
            }}>
              Already have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/customer-signin')}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: theme.accent,
              }}
            >
              <Text style={{ 
                fontSize: 14,
                fontWeight: '500',
                color: '#fff',
                fontFamily: Fonts.body,
              }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.push('/')} 
            style={{
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            <Text style={{ 
              fontSize: 14,
              color: theme.textLight,
              fontFamily: Fonts.body,
            }}>
              ← Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';


const API_URL = 'http://192.168.100.5:5000/api/auth/signup';

export default function Signup() {
  const router = useRouter();
  const theme = Colors.dark;

  const [role, setRole] = useState('customer'); // default role
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // Service provider fields
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [pricing, setPricing] = useState('');

  const handleSignup = async () => {
    try {
      const userData = {
        name,
        email,
        password,
        role,
        address,
        profession,
        experience,
        city,
        pricing,
      };

      // Remove provider fields if customer
      if (role === 'customer') {
        delete userData.profession;
        delete userData.experience;
        delete userData.city;
        delete userData.pricing;
      }

      const response = await axios.post(API_URL, userData);

      if (response.status === 201) {
        Alert.alert('Success', 'Signup successful!');
        router.replace('/(auth)/signin'); 
      }
       else {
        Alert.alert('Error', 'Unexpected response');
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
      style={{ backgroundColor: theme.background }}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 240, height: 240, marginBottom: 24, marginLeft: 30 }}
        resizeMode="contain"
      />

      <Text
        className="text-2xl mb-6 text-center"
        style={{ color: theme.textDark, fontFamily: Fonts.heading }}
      >
        Create an Account
      </Text>

      {/* Name */}
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
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      {/* Email */}
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
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
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
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      {/* Role Dropdown */}
      <Text
        style={{
          color: theme.textLight,
          fontFamily: Fonts.caption,
          marginBottom: 6,
        }}
      >
        Select Role
      </Text>
      <View
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Picker
          selectedValue={role}
          onValueChange={(value) => setRole(value)}
          style={{ color: theme.textDark }}
          dropdownIconColor={theme.accent}
        >
          <Picker.Item label="Customer" value="customer" />
          <Picker.Item label="Service Provider" value="provider" />
        </Picker>
      </View>

      {/* Customer Address Field */}
      {role === 'customer' && (
        <TextInput
          placeholder="Address"
          placeholderTextColor={theme.textLight}
          value={address}
          onChangeText={setAddress}
          style={{
            backgroundColor: theme.card,
            color: theme.textDark,
            fontFamily: Fonts.body,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        />
      )}

      {/* Provider Fields */}
      {role === 'provider' && (
        <>
          <TextInput
            placeholder="Profession (e.g., Plumber)"
            placeholderTextColor={theme.textLight}
            value={profession}
            onChangeText={setProfession}
            style={{
              backgroundColor: theme.card,
              color: theme.textDark,
              fontFamily: Fonts.body,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <TextInput
            placeholder="Years of Experience"
            placeholderTextColor={theme.textLight}
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            style={{
              backgroundColor: theme.card,
              color: theme.textDark,
              fontFamily: Fonts.body,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <TextInput
            placeholder="City / Area"
            placeholderTextColor={theme.textLight}
            value={city}
            onChangeText={setCity}
            style={{
              backgroundColor: theme.card,
              color: theme.textDark,
              fontFamily: Fonts.body,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <TextInput
            placeholder="Expected Pricing (per hour)"
            placeholderTextColor={theme.textLight}
            value={pricing}
            onChangeText={setPricing}
            keyboardType="numeric"
            style={{
              backgroundColor: theme.card,
              color: theme.textDark,
              fontFamily: Fonts.body,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          />
        </>
      )}

      {/* Sign Up Button */}
      <TouchableOpacity
        onPress={handleSignup}
        style={{
          backgroundColor: theme.primary,
          borderRadius: 8,
          paddingVertical: 14,
        }}
      >
        <Text
          className="text-center text-lg"
          style={{ color: '#fff', fontFamily: Fonts.body }}
        >
          Sign Up
        </Text>
      </TouchableOpacity>

      {/* Switch to Sign In */}
      <Text
  className="text-center mt-4"
  style={{ color: theme.textLight, fontFamily: Fonts.caption }}
>
  Already have an account?
  <Text
    onPress={() => router.push('/(auth)/signin')} 
    style={{ color: theme.accent }}
  >
    {' '}Sign In
  </Text>
</Text>

    </ScrollView>
  );
}

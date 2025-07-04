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

export default function SellerSignup() {
  const router = useRouter();
  const theme = Colors.light;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [certifications, setCertifications] = useState('');
  const [cnic, setCnic] = useState('');
  const [city, setCity] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  const professions = [
    'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner',
    'AC Technician', 'Appliance Repair', 'Gardener', 'Security Guard',
    'Cook', 'Driver', 'Other'
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword || !profession || !experience || !pricing || !city) {
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
    
    if (isNaN(experience) || isNaN(pricing)) {
      Alert.alert('Error', 'Experience and pricing must be numbers');
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
        role: 'provider',
        profession,
        experience: parseInt(experience),
        pricing: parseInt(pricing),
        certifications,
        cnic,
        city,
        availability,
        bio,
      };

      const response = await axios.post(API_URL, userData);

      if (response.status === 201) {
        Alert.alert('Success', 'Seller account created successfully!');
        router.replace('/provider-signin');
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
            Become a Seller
          </Text>
          <Text style={{ 
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
          }}>
            Join our platform and start offering your services
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          {/* Personal Information */}
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 16,
          }}>
            Personal Information
          </Text>

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
          <View style={{ marginBottom: 24 }}>
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

          {/* Professional Information */}
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 16,
          }}>
            Professional Information
          </Text>

          {/* Profession */}
          <View style={{ marginBottom: 16 }}>
            <View style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
            }}>
              <Picker
                selectedValue={profession}
                onValueChange={setProfession}
                style={{
                  color: theme.textDark,
                  fontFamily: Fonts.body,
                  fontSize: 16,
                }}
              >
                <Picker.Item label="Select Profession" value="" />
                {professions.map((prof) => (
                  <Picker.Item key={prof} label={prof} value={prof} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Experience */}
          <View style={{ marginBottom: 16 }}>
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Pricing */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Hourly Rate (PKR)"
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* City */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Additional Information */}
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 16,
          }}>
            Additional Information
          </Text>

          {/* CNIC */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="CNIC Number"
              placeholderTextColor={theme.textLight}
              value={cnic}
              onChangeText={setCnic}
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

          {/* Bio */}
          <View style={{ marginBottom: 32 }}>
            <TextInput
              placeholder="Bio/Description"
              placeholderTextColor={theme.textLight}
              value={bio}
              onChangeText={setBio}
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

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: theme.accent,
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
              {loading ? 'Creating Account...' : 'Create Seller Account'}
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
              Already have a seller account?
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/provider-signin')}
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
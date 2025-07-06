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
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import FloatingInput from '../provider/shared/FloatingInput';
import Button from '../provider/shared/Button';

const API_URL = 'http://192.168.100.5:5000/api/auth/signup';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: 40,
          paddingBottom: 20,
          alignItems: 'center',
        }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ 
              width: 220, 
              height: 220, 
              marginBottom: 10,
              borderRadius: 110,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 28,
            fontWeight: '400',
            color: theme.textDark,
            fontFamily: Fonts.heading,
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: -0.5,
          }}>
            Become a Seller
          </Text>
          <Text style={{ 
            fontSize: 15,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
            fontWeight: '300',
          }}>
            Join our platform and start offering your services
          </Text>
        </View>

        {/* Minimal Form Area */}
        <View style={{
          padding: 0,
          marginHorizontal: 32,
          marginBottom: 32,
          backgroundColor: 'transparent',
        }}>
          <FloatingInput label="Full Name" value={name} onChangeText={setName} />
          <FloatingInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <FloatingInput label="Password (min 6 characters)" value={password} onChangeText={setPassword} secureTextEntry />
          <FloatingInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          <FloatingInput label="Profession" value={profession} onChangeText={setProfession} />
          <FloatingInput label="Experience (years)" value={experience} onChangeText={setExperience} keyboardType="numeric" />
          <FloatingInput label="Pricing (PKR)" value={pricing} onChangeText={setPricing} keyboardType="numeric" />
          <FloatingInput label="Certifications" value={certifications} onChangeText={setCertifications} />
          <FloatingInput label="CNIC" value={cnic} onChangeText={setCnic} />
          <FloatingInput label="City" value={city} onChangeText={setCity} />
          <FloatingInput label="Availability" value={availability} onChangeText={setAvailability} />
          <FloatingInput label="Bio" value={bio} onChangeText={setBio} />
        </View>

        {/* Minimal Buttons and Link */}
        <View style={{ marginHorizontal: 32, alignItems: 'center' }}>
          <Button
            title={loading ? 'Creating Seller Account...' : 'Create Account'}
            onPress={handleSignup}
            loading={loading}
            variant="primary"
            style={{ marginBottom: 10, width: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>Already a seller? </Text>
            <Text
              style={{ fontSize: 14, color: theme.accent, fontFamily: Fonts.body, textDecorationLine: 'underline' }}
              onPress={() => router.push('/provider-signin')}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
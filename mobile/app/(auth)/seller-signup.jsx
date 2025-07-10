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
import { Colors, Fonts } from '../../Color/Color';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import FloatingInput from '../provider/shared/FloatingInput';
import Button from '../provider/shared/Button';

export default function SellerSignup() {
  const router = useRouter();
  const theme = Colors.light;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword || !phone || !city) {
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
        role: 'provider',
        phone,
        address,
        city,
        bio,
        approvalStatus: 'pending'
      };

      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_SIGNUP), {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        Alert.alert('Success', 'Provider account created successfully! Please wait for admin approval.', [
          {
            text: 'OK',
            onPress: () => router.replace('/provider-signin')
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
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
            Become a Service Provider
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
          <FloatingInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <FloatingInput label="Address" value={address} onChangeText={setAddress} />
          <FloatingInput label="City" value={city} onChangeText={setCity} />
          <FloatingInput label="Bio (Optional)" value={bio} onChangeText={setBio} multiline />
        </View>

        {/* Minimal Buttons and Link */}
        <View style={{ marginHorizontal: 32, alignItems: 'center' }}>
          <Button
            title={loading ? 'Creating Account...' : 'Create Provider Account'}
            onPress={handleSignup}
            loading={loading}
            variant="primary"
            style={{ marginBottom: 10, width: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>Already a provider? </Text>
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
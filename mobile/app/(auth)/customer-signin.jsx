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
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import Button from '../customer/shared/Button';
import FloatingInput from '../customer/shared/FloatingInput';

export default function CustomerSignin() {
  const router = useRouter();
  const theme = Colors.light;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Debug: Check if API_CONFIG is available
    console.log('API_CONFIG:', API_CONFIG);
    console.log('API_CONFIG.ENDPOINTS:', API_CONFIG?.ENDPOINTS);

    if (!API_CONFIG || !API_CONFIG.ENDPOINTS) {
      Alert.alert('Error', 'API configuration not loaded');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_SIGNIN), {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        const { token, user } = response;
        
        // Store authentication data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userRole', 'customer');
        
        Alert.alert('Success', 'Welcome back!', [
          {
            text: 'OK',
            onPress: () => router.replace('/customer/customer-home')
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Signin failed');
      }
    } catch (error) {
      console.error('Signin error:', error);
      Alert.alert('Error', 'Invalid email or password. Please try again.');
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
            Welcome Back
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
            Sign in to your account
          </Text>
        </View>

        {/* Minimal Form Area */}
        <View style={{
          padding: 0,
          marginHorizontal: 32,
          marginBottom: 32,
          backgroundColor: 'transparent',
        }}>
          <View style={{ padding: 0, margin: 0 }}>
            {/* Email */}
            <FloatingInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {/* Password */}
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Minimal Buttons and Link */}
        <View style={{ marginHorizontal: 32, alignItems: 'center' }}>
          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleSignin}
            loading={loading}
            variant="primary"
            style={{ marginBottom: 10, width: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>Don't have an account? </Text>
            <Text
              style={{ fontSize: 14, color: theme.accent, fontFamily: Fonts.body, textDecorationLine: 'underline' }}
              onPress={() => router.push('/customer-signup')}
            >
              Create Account
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
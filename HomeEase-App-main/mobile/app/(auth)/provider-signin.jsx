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
import FloatingInput from '../provider/shared/FloatingInput';
import Button from '../provider/shared/Button';

export default function ProviderSignin() {
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

    setLoading(true);
    try {
      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_SIGNIN), {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        const { token, user } = response;
        
        // Store authentication data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userRole', 'provider');
        
        Alert.alert('Success', 'Welcome back!', [
          {
            text: 'OK',
            onPress: () => router.replace('/provider/welcome')
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
            Welcome Back, Provider
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
            Sign in to your service provider account
          </Text>
        </View>

        {/* Minimal Form Area */}
        <View style={{
          padding: 0,
          marginHorizontal: 32,
          marginBottom: 32,
          backgroundColor: 'transparent',
        }}>
          <FloatingInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FloatingInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Minimal Buttons and Link */}
        <View style={{ marginHorizontal: 32, alignItems: 'center' }}>
          <Button
            title={loading ? 'Signing In...' : 'Sign In as Provider'}
            onPress={handleSignin}
            loading={loading}
            variant="primary"
            style={{ marginBottom: 10, width: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>Don't have a provider account? </Text>
            <Text
              style={{ fontSize: 14, color: theme.accent, fontFamily: Fonts.body, textDecorationLine: 'underline' }}
              onPress={() => router.push('/seller-signup')}
            >
              Create Provider Account
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
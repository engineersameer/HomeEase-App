import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import FloatingInput from '../customer/shared/FloatingInput';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function AdminSignin() {
  const router = useRouter();
  const { theme } = useTheme();
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
      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_SIGNIN), {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        })
      });

      if (response.success) {
        // Store admin data
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.admin));
        await AsyncStorage.setItem('userRole', 'admin');
        
        console.log('Admin signin successful, navigating to admin home');
        router.replace('/admin/admin-home');
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Admin Sign In
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Welcome */}
        <View style={{
          alignItems: 'center',
          paddingTop: 40,
          paddingBottom: 40,
        }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ 
              width: 100, 
              height: 100, 
              marginBottom: 20,
              borderRadius: 50,
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
            Admin Access
          </Text>
          <Text style={{
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Sign in to access admin panel
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24 }}>
          <FloatingInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 20 }}
          />
          
          <FloatingInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 32 }}
          />

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignin}
            disabled={loading}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 20,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF',
              fontFamily: Fonts.body,
            }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Back to Welcome */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 12,
              alignItems: 'center',
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
    </SafeAreaView>
  );
} 
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
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.10.15:5000/api/auth/login';

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
      const response = await axios.post(API_URL, { email, password });

      if (response.status === 200) {
        const { token, role, user } = response.data;
        
        if (role === 'provider') {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('userRole', role);
          
          Alert.alert('Success', 'Welcome back!');
          router.replace('/provider/provider-home');
        } else {
          Alert.alert('Error', 'This account is not registered as a service provider');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Signin failed');
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
            Welcome Back, Seller
          </Text>
          <Text style={{ 
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
          }}>
            Sign in to your service provider account
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          {/* Email */}
          <View style={{ marginBottom: 20 }}>
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
          <View style={{ marginBottom: 32 }}>
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
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignin}
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
              {loading ? 'Signing In...' : 'Sign In as Seller'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ 
              fontSize: 14,
              color: theme.textLight,
              fontFamily: Fonts.body,
              marginBottom: 16,
            }}>
              Don't have a seller account?
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/seller-signup')}
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
                Create Seller Account
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
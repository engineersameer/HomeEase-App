import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Color/Color';
import { ActivityIndicator } from 'react-native';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';

export default function AdminLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRole = await AsyncStorage.getItem('userRole');
      const userData = await AsyncStorage.getItem('user');
      
      if (!token || userRole !== 'admin' || !userData) {
        console.log('No admin auth data found, redirecting to home');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        router.replace('/');
        return;
      }

      // Check if user data has admin role
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        console.log('User is not admin, redirecting to home');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        router.replace('/');
        return;
      }

      console.log('Admin auth check passed');
      setIsAuthenticated(true);
      setLoading(false);
      
    } catch (error) {
      console.log('Auth check error:', error);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userRole');
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('userRole');
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: Colors.light.textLight,
          fontFamily: 'System',
        }}>
          Loading Admin Panel...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false
      }}
    >
      <Stack.Screen name="admin-home" />
      <Stack.Screen name="admin-users" />
      <Stack.Screen name="admin-profile" />
      <Stack.Screen name="admin-complaints" />
      <Stack.Screen name="admin-reports" />
      <Stack.Screen name="admin-content" />
      <Stack.Screen name="admin-maintenance" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 
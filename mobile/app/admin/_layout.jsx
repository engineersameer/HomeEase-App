import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Color/Color';
import { ActivityIndicator } from 'react-native';
import AdminFooter from './shared/Footer';

export default function AdminLayout() {
  const router = useRouter();
  const segments = useSegments();
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
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        router.replace('/');
        return;
      }
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        router.replace('/');
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userRole');
      router.replace('/');
    } finally {
      setLoading(false);
    }
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

  // Determine current tab based on route segment
  const lastSegment = segments[segments.length - 1];
  let current = 'home';
  if (lastSegment === 'admin-users') current = 'users';
  else if (lastSegment === 'admin-reports') current = 'reports';
  else if (lastSegment === 'admin-profile') current = 'profile';
  else if (lastSegment === 'admin-home') current = 'home';

  // Only show footer on main admin tabs
  const showFooter = ['home', 'users', 'reports', 'profile'].includes(current);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showFooter && <AdminFooter theme={Colors.light} router={router} current={current} />}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 
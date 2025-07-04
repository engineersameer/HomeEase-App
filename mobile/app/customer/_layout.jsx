import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';

export default function CustomerLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="customer-home"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="customer-profile"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="service-search"
        options={{
          title: 'Search Services',
        }}
      />
      <Stack.Screen
        name="service-booking"
        options={{
          title: 'Book Service',
        }}
      />
      <Stack.Screen
        name="customer-bookings"
        options={{
          title: 'My Bookings',
        }}
      />
      <Stack.Screen
        name="customer-notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="customer-support"
        options={{
          title: 'Support',
        }}
      />
      <Stack.Screen
        name="booking-detail"
        options={{
          title: 'Booking Details',
        }}
      />
      <Stack.Screen
        name="review-booking"
        options={{
          title: 'Write Review',
        }}
      />
    </Stack>
  );
} 
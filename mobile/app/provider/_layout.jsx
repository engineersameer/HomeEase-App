import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';

export default function ProviderLayout() {
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
        name="provider-home"
        options={{
          title: 'Provider Home',
        }}
      />
    </Stack>
  );
} 
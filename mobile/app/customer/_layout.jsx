import React from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import Footer from '../customer/shared/Footer';

export default function CustomerLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  // Determine which tab is active based on the route
  const current =
    segments[segments.length - 1] === 'customer-home'
      ? 'home'
      : segments[segments.length - 1] === 'customer-bookings'
      ? 'orders'
      : segments[segments.length - 1] === 'customer-profile'
      ? 'profile'
      : '';

  // Only show footer on Home, Orders, and Profile
  const showFooter = ["home", "orders", "profile"].includes(current);
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showFooter && <Footer theme={theme} router={router} current={current} />}
    </View>
  );
} 
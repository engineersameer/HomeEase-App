import React from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import ProviderFooter from './shared/Footer';
import ProviderEarnings from './earnings';
import ProviderReviews from './reviews';

export default function ProviderLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  // Determine which tab is active based on the route
  const current =
    segments[segments.length - 1] === 'provider-home' || segments[segments.length - 1] === 'welcome'
      ? 'home'
      : segments[segments.length - 1] === 'provider-orders'
      ? 'orders'
      : segments[segments.length - 1] === 'provider-profile'
      ? 'profile'
      : segments[segments.length - 1] === 'terms'
      ? ''
      : '';

  // Only show footer on Home, Orders, and Profile
  const showFooter = ['home', 'orders', 'profile'].includes(current);
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showFooter && <ProviderFooter theme={theme} router={router} current={current} />}
    </View>
  );
} 
import React from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import ProviderFooter from './shared/Footer';
import ProviderEarnings from './earnings';
import ProviderReviews from './reviews';
import YourServices from './your-services';

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
      : segments[segments.length - 1] === 'provider-terms'
      ? 'terms'
      : segments[segments.length - 1] === 'provider-profile'
      ? 'profile'
      : segments[segments.length - 1] === 'your-services'
      ? 'your-services'
      : segments[segments.length - 1] === 'terms'
      ? ''
      : '';

  // Only show footer on Home, Orders, Terms, and Profile
  const showFooter = ['home', 'orders', 'terms', 'profile'].includes(current);
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showFooter && <ProviderFooter theme={theme} router={router} current={current} />}
    </View>
  );
} 
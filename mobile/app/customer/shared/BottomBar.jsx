import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../../Color/Color';

export default function BottomBar({ userRole = 'customer' }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const customerTabs = [
    {
      name: 'Home',
      icon: '🏠',
      route: '/customer/customer-home',
      active: pathname === '/customer/customer-home'
    },
    {
      name: 'Search',
      icon: '🔍',
      route: '/customer/service-search',
      active: pathname === '/customer/service-search'
    },
    {
      name: 'Bookings',
      icon: '📋',
      route: '/customer/customer-bookings',
      active: pathname === '/customer/customer-bookings'
    },
    {
      name: 'Profile',
      icon: '👤',
      route: '/customer/customer-profile',
      active: pathname === '/customer/customer-profile'
    }
  ];

  const providerTabs = [
    {
      name: 'Home',
      icon: '🏠',
      route: '/provider/provider-home',
      active: pathname === '/provider/provider-home'
    },
    {
      name: 'Orders',
      icon: '📦',
      route: '/provider/orders',
      active: pathname === '/provider/orders'
    },
    {
      name: 'Services',
      icon: '🔧',
      route: '/provider/services',
      active: pathname === '/provider/services'
    },
    {
      name: 'Profile',
      icon: '👤',
      route: '/provider/profile',
      active: pathname === '/provider/profile'
    }
  ];

  const tabs = userRole === 'customer' ? customerTabs : providerTabs;

  const handleTabPress = (tab) => {
    if (!tab.active) {
      router.push(tab.route);
    }
  };

  return (
    <View style={{
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingBottom: 20,
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      shadowColor: theme.textDark,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => handleTabPress(tab)}
          style={{
            alignItems: 'center',
            flex: 1,
            paddingVertical: 4,
          }}
        >
          <Text style={{
            fontSize: 20,
            marginBottom: 2,
            opacity: tab.active ? 1 : 0.6,
          }}>
            {tab.icon}
          </Text>
          <Text style={{
            fontSize: 10,
            color: tab.active ? theme.primary : theme.textLight,
            fontWeight: tab.active ? '600' : '400',
            fontFamily: Fonts.caption,
          }}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 
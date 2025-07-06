import React from 'react';
import { View, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import Button from './Button';

export default function Footer({ theme, router, current }) {
  const items = [
    { key: 'home', label: 'Home', icon: '🏠', route: '/customer/customer-home' },
    { key: 'orders', label: 'Orders', icon: '📦', route: '/customer/customer-bookings' },
    { key: 'profile', label: 'Profile', icon: '👤', route: '/customer/customer-profile' },
  ];
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.card }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 56,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.card,
        marginTop: 2,
        marginBottom: 35,
      }}>
        {items.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => {
              if (current !== item.key) router.push(item.route);
            }}
            style={{ alignItems: 'center', flex: 1 }}
          >
            <Text style={{
              fontSize: 22,
              color: current === item.key ? theme.primary : theme.textDark,
              fontWeight: current === item.key ? 'bold' : 'normal',
            }}>{item.icon}</Text>
            <Text style={{
              fontSize: 12,
              color: current === item.key ? theme.primary : theme.textLight,
              fontWeight: current === item.key ? 'bold' : 'normal',
            }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
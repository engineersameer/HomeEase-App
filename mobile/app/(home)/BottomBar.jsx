import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Fonts } from '../../Color/Color';
import { MaterialIcons } from '@expo/vector-icons';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = Colors.dark;

  const tabs = [
    {
      label: 'Home',
      icon: 'home',
      route: '/customer-home',
    },
    {
      label: 'Orders',
      icon: 'inventory',
      route: '/orders',
    },
    {
      label: 'Profile',
      icon: 'person',
      route: '/profile',
    },
  ];

  return (
    <View style={[styles.bottomBar, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      {tabs.map(tab => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.label}
            style={styles.navItem}
            onPress={() => router.push(tab.route)}
          >
            <MaterialIcons name={tab.icon} size={26} color={isActive ? theme.primary : theme.textLight} />
            <Text style={[styles.navText, { color: isActive ? theme.primary : theme.textLight }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 38,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 8,
    marginHorizontal: 10,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { fontSize: 11, marginTop: 2, fontFamily: Fonts.caption },
}); 
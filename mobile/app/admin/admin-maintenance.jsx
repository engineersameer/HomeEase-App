import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { Ionicons } from '@expo/vector-icons';

export default function AdminMaintenance() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 56,
        paddingBottom: 21,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          System Maintenance
        </Text>
      </View>
      {/* Main Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: theme.textLight, fontFamily: Fonts.subheading, fontWeight: 'bold' }}>
          Feature coming soon
              </Text>
            </View>
    </SafeAreaView>
  );
} 
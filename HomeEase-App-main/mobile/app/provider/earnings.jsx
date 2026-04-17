import React from 'react';
import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';

export default function ProviderEarnings() {
  const { theme, isDarkMode } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
        paddingBottom: 25,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Earnings
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body }}>
          This feature is coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
} 
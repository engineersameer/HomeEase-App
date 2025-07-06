import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProviderOrders() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(params.tab === 'requests' ? 'requests' : 'upcoming');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Orders
        </Text>
      </View>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 16, alignItems: 'center', borderBottomWidth: activeTab === 'upcoming' ? 3 : 0, borderBottomColor: theme.primary }}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={{ color: activeTab === 'upcoming' ? theme.primary : theme.textLight, fontWeight: 'bold', fontFamily: Fonts.subheading }}>
            Upcoming Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, padding: 16, alignItems: 'center', borderBottomWidth: activeTab === 'requests' ? 3 : 0, borderBottomColor: theme.primary }}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={{ color: activeTab === 'requests' ? theme.primary : theme.textLight, fontWeight: 'bold', fontFamily: Fonts.subheading }}>
            Bookings Requests
          </Text>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1, padding: 24 }}>
        {activeTab === 'upcoming' ? (
          <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 16 }}>Upcoming bookings will be shown here.</Text>
        ) : (
          <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 16 }}>Service requests will be shown here.</Text>
        )}
      </View>
    </SafeAreaView>
  );
} 
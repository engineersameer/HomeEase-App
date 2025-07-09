import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';

export default function ProviderOrders() {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51, // match provider-profile.jsx
        paddingBottom: 25, // match provider-profile.jsx
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // match provider-profile.jsx
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Orders
        </Text>
      </View>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          style={{
            backgroundColor: activeTab === 'requests' ? theme.primary : theme.card,
            borderRadius: 20,
            paddingHorizontal: 16, // reduced from 24
            paddingVertical: 8, // reduced from 10
            marginRight: 6, // reduced from 8
            borderWidth: 1,
            borderColor: activeTab === 'requests' ? theme.primary : theme.border,
            minWidth: 110,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'requests' ? '#fff' : theme.textDark, fontWeight: 'bold', fontSize: 15 }}>
            Booking Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('scheduled')}
          style={{
            backgroundColor: activeTab === 'scheduled' ? theme.primary : theme.card,
            borderRadius: 20,
            paddingHorizontal: 16, // reduced from 24
            paddingVertical: 8, // reduced from 10
            borderWidth: 1,
            borderColor: activeTab === 'scheduled' ? theme.primary : theme.border,
            minWidth: 110,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'scheduled' ? '#fff' : theme.textDark, fontWeight: 'bold', fontSize: 15 }}>
            Booking Scheduled
          </Text>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {activeTab === 'requests' ? (
          <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body }}>
            Booking Requests content coming soon.
          </Text>
        ) : (
          <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body }}>
            Booking Scheduled content coming soon.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
} 
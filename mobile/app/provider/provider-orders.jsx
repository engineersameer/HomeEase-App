import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProviderOrders() {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("data", data)
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        Alert.alert('Error', data.message || 'Failed to accept booking');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by provider' })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        Alert.alert('Error', data.message || 'Failed to reject booking');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to reject booking');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        Alert.alert('Error', data.message || 'Failed to complete booking');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to complete booking');
    }
  };

  const renderBooking = ({ item }) => (
    <View style={{ backgroundColor: theme.card, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}>
      <Text style={{ color: theme.textDark, fontWeight: 'bold', fontSize: 16 }}>{item.serviceId?.title || 'Service'}</Text>
      <Text style={{ color: theme.textLight, marginTop: 4 }}>Customer: {item.customerId?.name || 'N/A'}</Text>
      <Text style={{ color: theme.textLight, marginTop: 2 }}>Date: {new Date(item.bookingDate).toLocaleString()}</Text>
      <Text style={{ color: theme.textLight, marginTop: 2 }}>Location: {item.location}</Text>
      {item.status === 'pending' && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => handleAccept(item._id)}
            style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 8, marginRight: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReject(item._id)}
            style={{ backgroundColor: theme.error || '#e74c3c', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'accepted' && (
        <TouchableOpacity
          onPress={() => handleComplete(item._id)}
          style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, marginTop: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Complete Booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const requests = bookings.filter(b => b.status === 'pending');
  const scheduled = bookings.filter(b => b.status === 'accepted');

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
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 6,
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
            paddingHorizontal: 16,
            paddingVertical: 8,
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
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No booking requests.
            </Text>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={item => item._id}
              renderItem={renderBooking}
              refreshing={refreshing}
              onRefresh={fetchBookings}
            />
          )
        ) : (
          scheduled.length === 0 ? (
            <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No scheduled bookings.
            </Text>
          ) : (
            <FlatList
              data={scheduled}
              keyExtractor={item => item._id}
              renderItem={renderBooking}
              refreshing={refreshing}
              onRefresh={fetchBookings}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
} 
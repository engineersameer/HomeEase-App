import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';

const API_URL = 'http://192.168.10.15:5000/api/customer/bookings';

export default function CustomerBookings() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const statusColors = {
    pending: '#FFA500',
    accepted: '#2196F3',
    'in-progress': '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#F44336'
  };

  useEffect(() => {
    loadThemePreference();
    fetchBookings();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.log('Error fetching bookings:', error);
      // Use mock data for now
      setBookings([
        {
          _id: '1',
          provider: {
            name: 'Ahmed Electrician',
            image: 'https://via.placeholder.com/100'
          },
          service: {
            category: 'Electrical'
          },
          date: new Date(),
          status: 'pending',
          description: 'Fix electrical wiring in kitchen',
          estimatedCost: 800
        },
        {
          _id: '2',
          provider: {
            name: 'Ali Plumber',
            image: 'https://via.placeholder.com/100'
          },
          service: {
            category: 'Plumbing'
          },
          date: new Date(Date.now() - 86400000),
          status: 'completed',
          description: 'Fix leaking tap in bathroom',
          estimatedCost: 600
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Booking status updated successfully!');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleReview = (booking) => {
    if (booking.status === 'completed') {
      router.push({
        pathname: '/customer/review-booking',
        params: { bookingId: booking._id }
      });
    } else {
      Alert.alert('Info', 'You can only review completed bookings');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    selectedStatus === 'all' || booking.status === selectedStatus
  );

  const renderBookingCard = (booking) => (
    <View key={booking._id} style={{
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.textDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: booking.provider?.image || 'https://via.placeholder.com/100' }}
            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
          />
          <View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading
            }}>
              {booking.provider?.name || 'Provider Name'}
            </Text>
            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.caption
            }}>
              {booking.service?.category || 'Service Category'}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: statusColors[booking.status] || theme.textLight,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12
        }}>
          <Text style={{ 
            color: '#fff', 
            fontSize: 12,
            fontFamily: Fonts.caption,
            textTransform: 'capitalize'
          }}>
            {booking.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ 
          color: theme.textDark, 
          fontFamily: Fonts.body,
          marginBottom: 4
        }}>
          📅 {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString()}
        </Text>
        <Text style={{ 
          color: theme.textDark, 
          fontFamily: Fonts.body,
          marginBottom: 4
        }}>
          💬 {booking.description || 'No description provided'}
        </Text>
        <Text style={{ 
          color: theme.primary, 
          fontFamily: Fonts.body,
          fontWeight: 'bold'
        }}>
          💰 PKR {booking.estimatedCost || 0}
        </Text>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {booking.status === 'pending' && (
          <TouchableOpacity
            onPress={() => handleStatusUpdate(booking._id, 'cancelled')}
            style={{
              flex: 1,
              backgroundColor: theme.error,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontFamily: Fonts.body,
              fontSize: 12
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}

        {booking.status === 'completed' && (
          <TouchableOpacity
            onPress={() => handleReview(booking)}
            style={{
              flex: 1,
              backgroundColor: theme.accent,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontFamily: Fonts.body,
              fontSize: 12
            }}>
              Review
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/customer/booking-detail',
            params: { bookingId: booking._id }
          })}
          style={{
            flex: 1,
            backgroundColor: theme.primary,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ 
            color: '#fff', 
            fontFamily: Fonts.body,
            fontSize: 12
          }}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.primary, 
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#fff',
            fontFamily: Fonts.heading
          }}>
            My Bookings
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setSelectedStatus(filter.value)}
              style={{
                backgroundColor: selectedStatus === filter.value ? theme.primary : theme.card,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: 1,
                borderColor: theme.border
              }}
            >
              <Text style={{ 
                color: selectedStatus === filter.value ? '#fff' : theme.textDark,
                fontFamily: Fonts.body
              }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
              Loading bookings...
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginBottom: 10 }}>
              No bookings found
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/customer/service-search')}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: '#fff', fontFamily: Fonts.body }}>
                Book a Service
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
      </ScrollView>
    </View>
  );
} 
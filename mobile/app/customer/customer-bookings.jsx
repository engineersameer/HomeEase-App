import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import Footer from '../customer/shared/Footer';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.100.5:5000/api/customer/bookings';

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

export default function CustomerBookings() {
  const router = useRouter();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [selectedStatus, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKINGS);
      const data = await apiCall(url);
      setBookings(data.bookings || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
    setRefreshing(false);
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

  // Cancel booking immediately, no confirmation
  const handleCancelPress = async (bookingId) => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKINGS) + `/${bookingId}`;
      const response = await apiCall(url, { method: 'DELETE' });
      if (response.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        Alert.alert('Success', 'Your booking has been cancelled successfully.');
      } else {
        Alert.alert('Error', response.message || 'Failed to cancel booking.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel booking.');
    }
  };

  // Group bookings by status
  const getFilteredBookings = () => {
    if (selectedStatus === 'all') return bookings;
    if (selectedStatus === 'in-progress') {
      // Support both 'in-progress' and 'inProgress' for backend/frontend mismatch
      return bookings.filter(b => b.status === 'in-progress' || b.status === 'inProgress');
    }
    return bookings.filter(b => b.status === selectedStatus);
  };

  const cancelBooking = async (bookingId) => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKING_CANCEL) + `?bookingId=${bookingId}`;
      await apiCall(url, { method: 'PUT' });
      Alert.alert('Success', 'Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel booking');
    }
  };

  // Booking Card UI
  const BookingCard = ({ booking }) => {
    const provider = booking.serviceId?.provider;
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          marginBottom: 18,
          padding: 18,
          shadowColor: theme.textDark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: provider?.image || provider?.profileImage || 'https://via.placeholder.com/100' }}
          style={{ width: 54, height: 54, borderRadius: 27, marginRight: 16, backgroundColor: theme.background }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading }}>
            {provider?.name}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 2 }}>
            {booking.serviceId?.category} • {new Date(booking.bookingDate || booking.date).toLocaleDateString()} {booking.preferredTime ? `• ${booking.preferredTime}` : ''}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
            {booking.specialNote || booking.description}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
          <View style={{
            backgroundColor: statusColors[booking.status] || theme.primary,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 6,
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: Fonts.body, textTransform: 'capitalize' }}>
              {booking.status}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
            PKR {booking.serviceId?.price || booking.estimatedCost || '-'}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {booking.status === 'pending' && (
              <TouchableOpacity
                onPress={() => handleCancelPress(booking._id)}
                style={{ backgroundColor: '#dc2626', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: Fonts.body, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => { setDetailBooking(booking); setShowDetailModal(true); }}
              style={{ backgroundColor: theme.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontFamily: Fonts.body }}>View</Text>
            </TouchableOpacity>
            {booking.status === 'completed' && (
              <TouchableOpacity
                onPress={() => handleReview(booking)}
                style={{ backgroundColor: '#4CAF50', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: Fonts.body }}>Rebook</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Booking Details Modal
  const BookingDetailModal = () => {
    if (!detailBooking) return null;
    const provider = detailBooking.serviceId?.provider;
    return (
      <Modal
        visible={showDetailModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(240,240,240,0.10)' }}>
          <Animated.View
            style={{
              width: '90%',
              maxWidth: 420,
              backgroundColor: theme.card,
              borderRadius: 18,
              padding: 24,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 8,
              position: 'relative',
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
          >
            {/* Close Icon */}
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={26} color={theme.textLight} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.heading, marginBottom: 12, textAlign: 'center' }}>
              Booking Details
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <Image
                source={{ uri: provider?.image || provider?.profileImage || 'https://via.placeholder.com/100' }}
                style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 8, backgroundColor: theme.background }}
              />
              <Text style={{ fontSize: 17, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading }}>{provider?.name}</Text>
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>{detailBooking.serviceId?.category}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>Date & Time:</Text>
              <Text style={{ fontSize: 15, color: theme.textLight, fontFamily: Fonts.body }}>{new Date(detailBooking.bookingDate || detailBooking.date).toLocaleString()} {detailBooking.preferredTime ? `• ${detailBooking.preferredTime}` : ''}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>Status:</Text>
              <Text style={{ fontSize: 15, color: statusColors[detailBooking.status] || theme.primary, fontWeight: 'bold', fontFamily: Fonts.body, textTransform: 'capitalize' }}>{detailBooking.status}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>Address:</Text>
              <Text style={{ fontSize: 15, color: theme.textLight, fontFamily: Fonts.body }}>{detailBooking.location}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>Special Notes:</Text>
              <Text style={{ fontSize: 15, color: theme.textLight, fontFamily: Fonts.body }}>{detailBooking.specialNote || '-'}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>Contact Info:</Text>
              <Text style={{ fontSize: 15, color: theme.textLight, fontFamily: Fonts.body }}>{provider?.email || '-'} | {provider?.phone || '-'}</Text>
            </View>
            <Pressable
              onPress={() => setShowDetailModal(false)}
              style={{ marginTop: 18, backgroundColor: theme.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center', shadowColor: theme.primary, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: Fonts.body, fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
          My Orders
        </Text>
        <TouchableOpacity onPress={onRefresh} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
        </TouchableOpacity>
      </View>
      {/* Status Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10, paddingHorizontal: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setSelectedStatus(filter.value)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 18,
                borderRadius: 20,
                backgroundColor: selectedStatus === filter.value ? theme.primary : theme.card,
                borderWidth: 1,
                borderColor: selectedStatus === filter.value ? theme.primary : theme.border,
                marginRight: 10,
                marginLeft: filter.value === 'all' ? 0 : 0,
                shadowColor: selectedStatus === filter.value ? theme.primary : 'transparent',
                shadowOpacity: selectedStatus === filter.value ? 0.12 : 0,
                elevation: selectedStatus === filter.value ? 2 : 0,
                minWidth: 90,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: selectedStatus === filter.value ? '#fff' : theme.textDark, fontSize: 14, fontFamily: Fonts.body, textAlign: 'center' }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Bookings List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ paddingTop: 8 }}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : getFilteredBookings().length === 0 ? (
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No orders found.
            </Text>
          ) : (
            getFilteredBookings().map(booking => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <BookingDetailModal />
    </SafeAreaView>
  );
} 
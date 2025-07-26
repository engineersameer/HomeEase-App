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
  Animated,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import Footer from '../customer/shared/Footer';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

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
      let url = getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKINGS);
      const params = [];
      if (fromDate) params.push(`fromDate=${fromDate.toISOString()}`);
      if (toDate) params.push(`toDate=${toDate.toISOString()}`);
      if (serviceType) params.push(`serviceType=${serviceType}`);
      if (params.length) url += '?' + params.join('&');
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
      setReviewBooking(booking);
      setShowReviewModal(true);
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
                style={{ backgroundColor: booking.review ? '#34B7F1' : '#4CAF50', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: Fonts.body }}>{booking.review ? 'View Review' : 'Write Review'}</Text>
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
    console.log('detailBooking:', detailBooking);
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
            {detailBooking.review && (
              <View style={{ marginTop: 16, backgroundColor: theme.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.subheading, marginBottom: 4 }}>Your Review</Text>
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, marginBottom: 2 }}>Rating: {detailBooking.review.rating} / 5</Text>
                <Text style={{ color: theme.textLight, fontFamily: Fonts.body, fontSize: 14 }}>{detailBooking.review.reviewText}</Text>
              </View>
            )}
            {/* Review Button */}
            {detailBooking.status?.toLowerCase() === 'completed' && (
              <TouchableOpacity
                onPress={() => {
                  setShowDetailModal(false);
                  setReviewBooking(detailBooking);
                  setShowReviewModal(true);
                }}
                style={{
                  backgroundColor: detailBooking.review ? '#34B7F1' : '#4CAF50',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginTop: 18,
                  marginBottom: 4,
                  shadowColor: theme.primary,
                  shadowOpacity: 0.10,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontFamily: Fonts.body, fontWeight: 'bold' }}>
                  {detailBooking.review ? 'View Review' : 'Give Review'}
                </Text>
              </TouchableOpacity>
            )}
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

  // Review Modal Component
  const ReviewModal = ({ visible, booking, onClose, onReviewSubmitted }) => {
    const { theme } = useTheme();
    const [rating, setRating] = useState(booking?.review?.rating || 0);
    const [comment, setComment] = useState(booking?.review?.reviewText || '');
    const [submitting, setSubmitting] = useState(false);
    const existingReview = !!booking?.review;

    const renderStars = () => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <TouchableOpacity
            key={i}
            onPress={() => setRating(i)}
            style={{ marginHorizontal: 4 }}
            disabled={existingReview}
          >
            <Text style={{ fontSize: 32, color: i <= rating ? '#FFD700' : '#E0E0E0' }}>
              {i <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      }
      return stars;
    };

    const submitReview = async () => {
      if (!rating || !comment.trim()) {
        Alert.alert('Error', 'Please provide both rating and comment');
        return;
      }
      if (existingReview) {
        Alert.alert('Info', 'You have already reviewed this booking.');
        return;
      }
      setSubmitting(true);
      try {
        await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_REVIEWS), {
          method: 'POST',
          body: JSON.stringify({
            bookingId: booking._id,
            rating,
            reviewText: comment
          })
        });
        Alert.alert('Success', 'Review submitted successfully');
        onClose();
        if (onReviewSubmitted) onReviewSubmitted();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit review');
      } finally {
        setSubmitting(false);
      }
    };

    if (!booking) return null;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.heading, marginBottom: 12, textAlign: 'center' }}>
              {existingReview ? 'Your Review' : 'Write a Review'}
            </Text>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 4 }}>
                {booking.serviceId?.title || booking.serviceId?.category}
              </Text>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                Provider: {booking.providerId?.name}
              </Text>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                Date: {new Date(booking.bookingDate || booking.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
                Rate your experience
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>{renderStars()}</View>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginBottom: 8 }}>
                {rating === 0 && 'Tap to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
              {existingReview && (
                <Text style={{ color: theme.primary, fontFamily: Fonts.body, marginTop: 8 }}>
                  You have already reviewed this booking.
                </Text>
              )}
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
                Share your experience
              </Text>
              <TextInput
                placeholder="Tell us about your experience with this service..."
                placeholderTextColor={theme.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  backgroundColor: theme.background,
                  color: theme.textDark,
                  fontFamily: Fonts.body,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 15,
                  minHeight: 80,
                }}
                editable={!existingReview}
              />
              <Text style={{ color: theme.textLight, fontSize: 12, fontFamily: Fonts.caption, marginTop: 8, textAlign: 'right' }}>
                {comment.length}/500 characters
              </Text>
            </View>
            <TouchableOpacity
              onPress={submitReview}
              style={{
                backgroundColor: existingReview ? theme.card : theme.primary,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
                marginBottom: 10,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 6,
              }}
              disabled={!!existingReview || submitting}
            >
              <Text style={{ color: existingReview ? theme.textLight : '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: Fonts.subheading }}>
                {existingReview ? 'Review Submitted' : submitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: theme.primary, fontSize: 16, fontFamily: Fonts.body }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      {/* Add filter UI above bookings list */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8, marginBottom: 4 }}>
        <TouchableOpacity onPress={() => setShowFromDate(true)} style={{ marginRight: 8, backgroundColor: theme.card, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>{fromDate ? fromDate.toLocaleDateString() : 'From Date'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowToDate(true)} style={{ marginRight: 8, backgroundColor: theme.card, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>{toDate ? toDate.toLocaleDateString() : 'To Date'}</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Service Type"
          placeholderTextColor={theme.textLight}
          value={serviceType}
          onChangeText={setServiceType}
          style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: theme.border, color: theme.textDark, fontFamily: Fonts.body, flex: 1 }}
        />
        {showFromDate && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => { setShowFromDate(false); if (date) setFromDate(date); }}
          />
        )}
        {showToDate && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => { setShowToDate(false); if (date) setToDate(date); }}
          />
        )}
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
      {showReviewModal && (
        <ReviewModal
          visible={showReviewModal}
          booking={reviewBooking}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={fetchBookings}
        />
      )}
    </SafeAreaView>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';

const API_URL = 'http://192.168.100.5:5000/api/customer/reviews';

export default function ReviewBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKING_DETAIL, { bookingId: params.bookingId });
      console.log('Fetching booking details from:', url);
      const data = await apiCall(url);
      console.log('Booking details response:', data);
      setBooking(data.booking);
      if (data.booking?.review) {
        setExistingReview(data.booking.review);
        setRating(data.booking.review.rating);
        setComment(data.booking.review.reviewText);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch booking details');
    } finally {
      setLoading(false); // Ensure loading is stopped
    }
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
    try {
      await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_REVIEWS), {
        method: 'POST',
        body: JSON.stringify({
          bookingId: params.bookingId,
          rating,
          reviewText: comment
        })
      });
      Alert.alert('Success', 'Review submitted successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={{ marginHorizontal: 4 }}
        >
          <Text style={{ fontSize: 32, color: i <= rating ? '#FFD700' : '#E0E0E0' }}>
            {i <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
          Loading booking details...
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
          Booking not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.primary,
        paddingTop: Dimensions.get('window').height * 0.06,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: Fonts.heading
          }}>
            Write a Review
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Service Info */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginTop: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 8,
            fontFamily: Fonts.subheading
          }}>
            {booking.service?.title || booking.service?.category}
          </Text>
          <Text style={{
            color: theme.textLight,
            fontFamily: Fonts.body
          }}>
            Provider: {booking.provider?.name}
          </Text>
          <Text style={{
            color: theme.textLight,
            fontFamily: Fonts.body
          }}>
            Date: {new Date(booking.date).toLocaleDateString()}
          </Text>
        </View>

        {/* Rating Section */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 16,
            fontFamily: Fonts.subheading
          }}>
            Rate your experience
          </Text>
          
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {renderStars()}
          </View>
          
          <Text style={{
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            marginBottom: 8
          }}>
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

        {/* Comment Section */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 12,
            fontFamily: Fonts.subheading
          }}>
            Share your experience
          </Text>
          
          <TextInput
            placeholder="Tell us about your experience with this service..."
            placeholderTextColor={theme.textLight}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              backgroundColor: theme.background,
              color: theme.textDark,
              fontFamily: Fonts.body,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              minHeight: 120,
            }}
          />
          
          <Text style={{
            color: theme.textLight,
            fontSize: 12,
            fontFamily: Fonts.caption,
            marginTop: 8,
            textAlign: 'right'
          }}>
            {comment.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={submitReview}
          style={{
            backgroundColor: existingReview ? theme.card : theme.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          disabled={!!existingReview}
        >
          <Text style={{
            color: existingReview ? theme.textLight : '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: Fonts.subheading
          }}>
            {existingReview ? 'Review Submitted' : 'Submit Review'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
} 
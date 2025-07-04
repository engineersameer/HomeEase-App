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
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'http://192.168.10.16:5000/api/customer/reviews';

export default function ReviewBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://192.168.10.15:5000/api/customer/bookings/${params.bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
    } catch (error) {
      console.log('Error fetching booking details:', error);
      // Use mock data for now
      setBooking({
        _id: params.bookingId,
        provider: {
          name: 'Ahmed Electrician',
          image: 'https://via.placeholder.com/100'
        },
        service: {
          category: 'Electrical',
          title: 'Electrical Wiring Repair'
        },
        date: new Date(),
        estimatedCost: 800
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const reviewData = {
        bookingId: params.bookingId,
        rating,
        comment: comment.trim(),
        providerId: booking.provider._id
      };

      await axios.post(API_URL, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Review submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.log('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
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
            textAlign: 'center'
          }}>
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
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
          onPress={handleSubmitReview}
          style={{
            backgroundColor: theme.primary,
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
        >
          <Text style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: Fonts.subheading
          }}>
            Submit Review
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
      <Footer theme={theme} router={router} current="orders" />
    </View>
  );
} 
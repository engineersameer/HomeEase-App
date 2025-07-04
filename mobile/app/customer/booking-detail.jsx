import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';

const API_URL = 'http://192.168.10.15:5000/api/customer/bookings';

export default function BookingDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
    fetchBookingDetails();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${params.bookingId}`, {
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
          image: 'https://via.placeholder.com/100',
          phone: '+92 300 1234567',
          email: 'ahmed@example.com',
          rating: 4.5
        },
        service: {
          category: 'Electrical',
          title: 'Electrical Wiring Repair'
        },
        date: new Date(),
        status: 'pending',
        description: 'Fix electrical wiring in kitchen',
        estimatedCost: 800,
        location: 'Lahore, Pakistan',
        notes: 'Please bring necessary tools and arrive on time.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/${params.bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Booking status updated successfully!');
      fetchBookingDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleContactProvider = () => {
    Alert.alert(
      'Contact Provider',
      `Call ${booking?.provider?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Alert.alert('Call', `Calling ${booking?.provider?.phone}`);
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#2196F3';
      case 'in-progress':
        return '#9C27B0';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
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
        paddingTop: 60,
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
            Booking Details
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Status Card */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginTop: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: getStatusColor(booking.status),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginBottom: 8
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: Fonts.body,
              textTransform: 'capitalize'
            }}>
              {booking.status}
            </Text>
          </View>
          <Text style={{
            color: theme.textLight,
            fontFamily: Fonts.caption
          }}>
            Booking ID: {booking._id}
          </Text>
        </View>

        {/* Provider Info */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
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
            Service Provider
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={{ uri: booking.provider?.image || 'https://via.placeholder.com/100' }}
              style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.textDark,
                fontFamily: Fonts.subheading
              }}>
                {booking.provider?.name}
              </Text>
              <Text style={{
                color: theme.textLight,
                fontFamily: Fonts.body
              }}>
                ⭐ {booking.provider?.rating} rating
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleContactProvider}
            style={{
              backgroundColor: theme.accent,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontFamily: Fonts.body }}>
              Contact Provider
            </Text>
          </TouchableOpacity>
        </View>

        {/* Service Details */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
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
            Service Details
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.textDark,
              fontFamily: Fonts.subheading
            }}>
              {booking.service?.title || booking.service?.category}
            </Text>
            <Text style={{
              color: theme.textLight,
              fontFamily: Fonts.body
            }}>
              Category: {booking.service?.category}
            </Text>
          </View>
          <Text style={{
            color: theme.textDark,
            fontFamily: Fonts.body,
            marginBottom: 8
          }}>
            💬 {booking.description}
          </Text>
          <Text style={{
            color: theme.primary,
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: Fonts.subheading
          }}>
            💰 PKR {booking.estimatedCost}
          </Text>
        </View>

        {/* Booking Information */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
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
            Booking Information
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{
              color: theme.textDark,
              fontFamily: Fonts.body
            }}>
              📅 Date: {new Date(booking.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{
              color: theme.textDark,
              fontFamily: Fonts.body
            }}>
              🕐 Time: {new Date(booking.date).toLocaleTimeString()}
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{
              color: theme.textDark,
              fontFamily: Fonts.body
            }}>
              📍 Location: {booking.location}
            </Text>
          </View>
          {booking.notes && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{
                color: theme.textDark,
                fontFamily: Fonts.body
              }}>
                📝 Notes: {booking.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {booking.status === 'pending' && (
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => handleStatusUpdate('cancelled')}
              style={{
                backgroundColor: theme.error,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontFamily: Fonts.body, fontWeight: '600' }}>
                Cancel Booking
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'completed' && (
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/customer/review-booking',
                params: { bookingId: booking._id }
              })}
              style={{
                backgroundColor: theme.accent,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontFamily: Fonts.body, fontWeight: '600' }}>
                Leave Review
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
} 
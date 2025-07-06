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
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'http://192.168.100.5:5000/api/customer/bookings';

export default function BookingDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${params.bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
    } catch (error) {
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
      {/* Minimalist Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Booking Details
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22, color: theme.textDark }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Status */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              backgroundColor: getStatusColor(booking.status),
              paddingHorizontal: 16,
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
            <Text style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
              {booking.service?.category} • {new Date(booking.date).toLocaleDateString()}
            </Text>
          </View>
          {/* Provider Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={{ uri: booking.provider?.image || 'https://via.placeholder.com/100' }}
              style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: theme.card }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading }}>
                {booking.provider?.name}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                {booking.provider?.email}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                {booking.provider?.phone}
              </Text>
            </View>
          </View>
          {/* Service Info */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 6 }}>
              {booking.service?.title}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 4 }}>
              {booking.location}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>
              {booking.description}
            </Text>
          </View>
          {/* Cost & Notes */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 2 }}>
              Estimated Cost: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>PKR {booking.estimatedCost}</Text>
            </Text>
            {booking.notes && (
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginTop: 4 }}>
                Notes: {booking.notes}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 
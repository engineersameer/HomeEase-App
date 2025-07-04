import React, { useEffect, useState } from 'react';
import { View, Text,Image, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProviderHome() {
  const theme = Colors.dark;
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProviderDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://192.168.10.15:5000/api/provider/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data.bookings);
      setEarnings(res.data.earnings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProviderDashboard();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background, padding: 16 }}>
     <Image
        source={require('../../assets/logo.png')}
        style={{ width: 340, height: 340, marginBottom: 24 }}
        resizeMode="contain"
      />
      <Text style={{ color: theme.textDark, fontSize: 24, fontFamily: Fonts.heading, marginBottom: 16 }}>
        Bookings Assigned to You
      </Text>

      {bookings.map((booking) => (
        <View
          key={booking._id}
          style={{
            backgroundColor: theme.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderColor: theme.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontFamily: Fonts.subheading, color: theme.textDark }}>
            {booking.service?.category} booked by {booking.customer?.name}
          </Text>
          <Text style={{ color: theme.textLight }}>Date: {new Date(booking.date).toLocaleString()}</Text>
          <Text style={{ color: theme.textLight }}>Status: {booking.status}</Text>
        </View>
      ))}

      <Text style={{ color: theme.textDark, fontSize: 24, fontFamily: Fonts.heading, marginTop: 24 }}>
        Total Earnings: PKR {earnings}
      </Text>
    </ScrollView>
  );
}

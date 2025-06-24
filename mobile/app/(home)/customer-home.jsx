import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView,Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomerHome() {
  const theme = Colors.dark;
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token)
      const res = await axios.get('http://192.168.216.105:5000/api/customer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setServices(res.data.services);
      setBookings(res.data.bookings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDashboard();
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
        Available Services
      </Text>

      {services.map((service) => (
        <View
          key={service._id}
          style={{
            backgroundColor: theme.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderColor: theme.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 18, fontFamily: Fonts.body, color: theme.textDark }}>{service.category}</Text>
          <Text style={{ color: theme.textLight }}>{service.description}</Text>
          <Text style={{ color: theme.textLight, marginTop: 4 }}>{service.city}</Text>
        </View>
      ))}

      <Text style={{ color: theme.textDark, fontSize: 24, fontFamily: Fonts.heading, marginVertical: 16 }}>
        Your Bookings
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
            {booking.service?.category} with {booking.provider?.name}
          </Text>
          <Text style={{ color: theme.textLight }}>Date: {new Date(booking.date).toLocaleString()}</Text>
          <Text style={{ color: theme.textLight }}>Status: {booking.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

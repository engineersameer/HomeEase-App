import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Dimensions, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
const { width } = Dimensions.get('window');

export default function CustomerHome({ navigation }) {
  const theme = Colors.dark;
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const fetchCustomerDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://192.168.100.5:5000/api/customer/dashboard', {
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
    const fetchName = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await fetch('http://192.168.100.5:5000/api/customer/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data && data.name) setUserName(data.name);
        }
      } catch (e) {
        setUserName('');
      }
    };
    fetchName();
  }, []);

  const trendingServices = [
    { name: 'AC Installation', orders: 120, rating: 4.8, topProviders: 5 },
    { name: 'Carpenter', orders: 80, rating: 4.7, topProviders: 3 },
    { name: 'Electrician', orders: 95, rating: 4.9, topProviders: 4 },
    { name: 'Handyman', orders: 60, rating: 4.6, topProviders: 2 },
    { name: 'Plumber', orders: 110, rating: 4.8, topProviders: 6 },
    { name: 'Geyser', orders: 70, rating: 4.7, topProviders: 2 },
    { name: 'Home Appliances', orders: 90, rating: 4.8, topProviders: 3 },
    { name: 'Cleaning', orders: 130, rating: 4.9, topProviders: 7 },
  ];

  const mainServices = [
    { name: 'AC Services', icon: '❄️' },
    { name: 'Carpenter', icon: '🪚' },
    { name: 'Electrician', icon: '💡' },
    { name: 'Handyman', icon: '🛠️' },
    { name: 'Plumber', icon: '🔧' },
    { name: 'Geyser', icon: '🔥' },
    { name: 'Home Appliances', icon: '📺' },
    { name: 'Cleaning', icon: '🧹' },
  ];

  const safeAreaTop = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  function getServiceRows(services, perRow = 3) {
    const rows = [];
    for (let i = 0; i < services.length; i += perRow) {
      const row = services.slice(i, i + perRow);
      if (row.length < perRow) {
        const blanks = Array(perRow - row.length).fill({ blank: true, key: `blank-${i}` });
        rows.push([...row, ...blanks]);
      } else {
        rows.push(row);
      }
    }
    return rows;
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { paddingTop: safeAreaTop + 12 }]}>
        <Animated.View entering={FadeIn.duration(1200)}>
          <Text style={[styles.headerTitle, { fontWeight: 'bold', fontFamily: Fonts.heading, fontSize: 22, color: '#fff', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 }]}>Welcome back, Mr{userName ? ` ${userName}` : ''}!</Text>
        </Animated.View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>🔥 Trending Services</Text>
        <FlatList
          data={trendingServices}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <View style={styles.trendingCard}>
              <Text style={styles.trendingServiceName}>{item.name}</Text>
              <Text style={styles.trendingStat}>{item.orders} orders in last 2 months</Text>
              <Text style={styles.trendingStat}>⭐ {item.rating} avg rating</Text>
              <Text style={styles.trendingStat}>{item.topProviders} providers with 5/5</Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
        <Text style={[styles.availableServicesTitle, { color: theme.textDark }]}>🛠 Available Services</Text>
        <View style={styles.servicesGrid}>
          {getServiceRows(mainServices, 3).map((row, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              {row.map((service, idx) =>
                service.blank ? (
                  <View key={service.key || idx} style={{ width: (width - 48) / 3 }} />
                ) : (
                  <TouchableOpacity
                    key={service.name}
                    style={[styles.serviceCard, { width: (width - 48) / 3 }]}
                    onPress={() => router.push({ pathname: '/service-detail', params: { service: service.name } })}
                  >
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <Text style={[styles.serviceText, { color: theme.textDark }]}>{service.name}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: '#181818',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    letterSpacing: 0.4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  trendingCard: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'flex-start',
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingServiceName: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  trendingStat: {
    fontSize: 12,
    color: '#AAAAAA',
    fontFamily: Fonts.caption,
    marginBottom: 2,
  },
  availableServicesTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    marginLeft: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  servicesGrid: {
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  serviceCard: {
    backgroundColor: '#232323',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  serviceText: {
    fontSize: 13,
    fontFamily: Fonts.body,
    textAlign: 'center',
  },
});

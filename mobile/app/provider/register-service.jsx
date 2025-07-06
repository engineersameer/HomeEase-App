import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Image, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProviderFooter from './shared/Footer';

export default function RegisterService() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    })();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://192.168.100.5:5000/api/provider/services');
      setServices(res.data);
    } catch (err) {
      setServices([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Custom Header for Register for Service */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: theme.textDark }}>{'←'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Register for Service
          </Text>
          <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
            Browse and register for available services
          </Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.textDark,
          fontFamily: Fonts.heading,
          marginBottom: 24,
        }}>
          Register for a Service
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : services.length === 0 ? (
          <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
            No services available at the moment.
          </Text>
        ) : (
          services.map(service => (
            <View
              key={service._id}
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                padding: 20,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: theme.border,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 6 }}>
                {service.category}
              </Text>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginBottom: 10 }}>
                {service.description}
              </Text>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 12, marginBottom: 10 }}>
                Service ID: {service._id}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 4,
                }}
                onPress={() => alert('Registration flow coming soon!')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>
                  Register for this Service
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <ProviderFooter theme={theme} router={router} current={null} />
    </SafeAreaView>
  );
} 
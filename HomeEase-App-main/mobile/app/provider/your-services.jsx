import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl, apiCall } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function YourServices() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // serviceId for delete

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      fetchServices();
    })();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(getApiUrl('/api/provider/services'), { method: 'GET' });
      if (res.success) {
        setServices(res.services);
      } else {
        setError(res.message || 'Failed to load services');
      }
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (serviceId) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setActionLoading(serviceId);
        try {
          const res = await apiCall(getApiUrl(`/api/provider/services/${serviceId}`), { method: 'DELETE' });
          if (res.success) {
            fetchServices();
          } else {
            Alert.alert('Error', res.message || 'Failed to delete service');
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to delete service');
        } finally {
          setActionLoading(null);
        }
      }}
    ]);
  };

  // Placeholder for edit functionality
  const handleEdit = (serviceId) => {
    Alert.alert('Edit Service', 'Edit functionality coming soon!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8, padding: 6 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.textDark,
          fontFamily: Fonts.heading,
          flex: 1,
          textAlign: 'center',
        }}>
          Your Services
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 32 }}>{error}</Text>
        ) : services.length === 0 ? (
          <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 32 }}>You have not registered any services yet.</Text>
        ) : (
          services.map(service => (
            <View key={service._id} style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
                  {service.title}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => handleEdit(service._id)} style={{ marginRight: 12 }}>
                    <Ionicons name="pencil" size={22} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(service._id)}>
                    {actionLoading === service._id ? <ActivityIndicator size={20} color={theme.primary} /> : <Ionicons name="trash" size={22} color="#EF4444" />}
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 4 }}>
                Category: {service.category}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 4 }}>
                Location: {service.location}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 4 }}>
                Price: PKR {service.price}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>
                {service.description}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 
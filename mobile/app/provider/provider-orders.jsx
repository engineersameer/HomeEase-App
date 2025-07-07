import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ProviderFooter from './shared/Footer';

export default function ProviderOrders() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'provider') {
          Alert.alert('Access Denied', 'You do not have provider privileges.');
          router.replace('/');
          return;
        }
        setUser(parsedUser);
        fetchDashboardData();
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchServices(),
        fetchBookings(),
        fetchStats()
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_SERVICES));
      setServices(data.services || []);
    } catch (error) {
      console.log('Error fetching services:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_BOOKINGS));
      setBookings(data.bookings || []);
    } catch (error) {
      console.log('Error fetching bookings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD));
      setStats(data.stats || {
        totalServices: services.length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalEarnings: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)
      });
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      let endpoint;
      switch (action) {
        case 'accept':
          endpoint = API_CONFIG.ENDPOINTS.PROVIDER_BOOKING_ACCEPT;
          break;
        case 'reject':
          endpoint = API_CONFIG.ENDPOINTS.PROVIDER_BOOKING_REJECT;
          break;
        case 'complete':
          endpoint = API_CONFIG.ENDPOINTS.PROVIDER_BOOKING_COMPLETE;
          break;
        default:
          return;
      }

      const url = getApiUrlWithParams(endpoint, { bookingId });
      await apiCall(url, { method: 'PUT' });
      
      Alert.alert('Success', `Booking ${action}ed successfully`);
      fetchBookings();
      fetchStats();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} booking`);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F59E0B';
      case 'active':
      case 'accepted':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.textDark, fontFamily: Fonts.body }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
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
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Provider Dashboard
          </Text>
          <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
            Welcome, {user?.name || 'Provider'}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={24} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 16 }}>
            Overview
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.heading }}>
                {stats.totalServices}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
                Total Services
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6', fontFamily: Fonts.heading }}>
                {stats.activeBookings}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
                Active Bookings
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: Fonts.heading }}>
                {stats.completedBookings}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
                Completed
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              width: '48%',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B', fontFamily: Fonts.heading }}>
                {formatCurrency(stats.totalEarnings)}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
                Total Earnings
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 16 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                padding: 16,
                width: '48%',
                marginBottom: 12,
                alignItems: 'center'
              }}
              onPress={() => router.push('/provider/register-service')}
            >
              <Ionicons name="add-circle" size={32} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body, marginTop: 8 }}>
                Create Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                padding: 16,
                width: '48%',
                marginBottom: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border
              }}
              onPress={() => router.push('/provider/provider-profile')}
            >
              <Ionicons name="person" size={32} color={theme.textDark} />
              <Text style={{ color: theme.textDark, fontWeight: 'bold', fontFamily: Fonts.body, marginTop: 8 }}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Services */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
              My Services
            </Text>
            <TouchableOpacity onPress={() => router.push('/provider/register-service')}>
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {services.length === 0 ? (
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="briefcase-outline" size={48} color={theme.textLight} />
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginTop: 12, textAlign: 'center' }}>
                No services created yet.{'\n'}Create your first service to start receiving bookings.
              </Text>
            </View>
          ) : (
            services.slice(0, 3).map((service) => (
              <View
                key={service._id}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 4 }}>
                      {service.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 8 }}>
                      {service.category} • {service.location}
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.textDark, fontFamily: Fonts.body, marginBottom: 8 }}>
                      {service.description}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.heading }}>
                      {formatCurrency(service.price)}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: service.isActive ? '#10B981' : '#6B7280',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontFamily: Fonts.caption }}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          {services.length > 3 && (
            <TouchableOpacity
              style={{
                backgroundColor: theme.card,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border
              }}
            >
              <Text style={{ color: theme.primary, fontWeight: 'bold', fontFamily: Fonts.body }}>
                View All Services ({services.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Bookings */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 16 }}>
            Recent Bookings
          </Text>
          {bookings.length === 0 ? (
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="calendar-outline" size={48} color={theme.textLight} />
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginTop: 12, textAlign: 'center' }}>
                No bookings yet.{'\n'}Your bookings will appear here.
              </Text>
            </View>
          ) : (
            bookings.slice(0, 5).map((booking) => (
              <View
                key={booking._id}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 4 }}>
                      {booking.service?.title || 'Service'}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
                      {booking.customer?.name || 'Customer'} • {formatDate(booking.date)}
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.textDark, fontFamily: Fonts.body, marginTop: 4 }}>
                      {booking.address}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: getStatusColor(booking.status),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontFamily: Fonts.caption, textTransform: 'capitalize' }}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.heading }}>
                    {formatCurrency(booking.amount)}
                  </Text>
                  
                  {booking.status === 'pending' && (
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#10B981',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          marginRight: 8
                        }}
                        onPress={() => handleBookingAction(booking._id, 'accept')}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: Fonts.body }}>
                          Accept
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#EF4444',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8
                        }}
                        onPress={() => handleBookingAction(booking._id, 'reject')}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: Fonts.body }}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {booking.status === 'active' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8
                      }}
                      onPress={() => handleBookingAction(booking._id, 'complete')}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: Fonts.body }}>
                        Complete
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ProviderFooter theme={theme} router={router} current="orders" />
    </SafeAreaView>
  );
} 
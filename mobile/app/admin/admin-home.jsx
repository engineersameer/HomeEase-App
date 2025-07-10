import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import AdminFooter from './shared/Footer';
import { Ionicons } from '@expo/vector-icons';

export default function AdminHome() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingComplaints: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
          Alert.alert('Access Denied', 'You do not have admin privileges.');
          router.replace('/');
          return;
        }
        setUser(parsedUser);
        fetchDashboardData();
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD));
      if (result.success) {
        setStats({
          totalUsers: result.stats?.totalUsers || 0,
          totalProviders: result.stats?.totalProviders || 0,
          totalBookings: result.stats?.totalBookings || 0,
          totalRevenue: result.stats?.totalRevenue || 0,
          pendingComplaints: result.stats?.pendingComplaints || 0,
          activeServices: result.stats?.activeServices || 0
        });
        console.log('Dashboard stats fetched:', result.stats);
      } else {
        console.log('Failed to fetch dashboard data:', result.message);
        setStats({
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingComplaints: 0,
          activeServices: 0
        });
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingComplaints: 0,
        activeServices: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ 
            marginTop: 16, 
            color: theme.textDark, 
            fontFamily: Fonts.body,
            fontSize: 16
          }}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header (consistent with customer) */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ 
              width: 40, 
              height: 40, 
              marginRight: 12,
            }}
            resizeMode="contain"
          />
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.textDark,
              fontFamily: Fonts.heading,
            }}>
              HomeEase
            </Text>
            <Text style={{
              fontSize: 12,
              color: theme.textLight,
              fontFamily: Fonts.caption,
            }}>
              Welcome, {user?.name || 'Admin'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Minimalist Refresh Button */}
          <TouchableOpacity onPress={onRefresh} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
          </TouchableOpacity>
          {/* Minimalist Dark Mode Toggle */}
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20, color: theme.textDark }}>
              {isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Stats (2-column grid, compact cards) */}
        <View style={{
          paddingHorizontal: 24,
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.textDark,
            marginTop: 16,
            marginBottom: 16,
            fontFamily: Fonts.subheading,
          }}>
            Platform Overview
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#3B82F6',
                marginBottom: 4,
              }}>
                {formatNumber(stats.totalUsers)}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Total Users
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#10B981',
                marginBottom: 4,
              }}>
                {formatNumber(stats.totalProviders)}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Service Providers
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#F59E0B',
                marginBottom: 4,
              }}>
                {formatNumber(stats.totalBookings)}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Total Bookings
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#8B5CF6',
                marginBottom: 4,
              }}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Total Revenue
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#EF4444',
                marginBottom: 4,
              }}>
                {stats.pendingComplaints}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Pending Complaints
              </Text>
            </View>
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 16,
              flex: 1,
              minWidth: '45%',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#10B981',
                marginBottom: 4,
              }}>
                {formatNumber(stats.activeServices)}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Active Services
              </Text>
            </View>
          </View>
        </View>
        {/* Quick Actions (2-column grid, compact cards) */}
        <View style={{
          paddingHorizontal: 24,
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.textDark,
            marginBottom: 16,
            fontFamily: Fonts.subheading,
          }}>
            Quick Actions
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            {[
              { icon: '👥', title: 'Manage Users', action: () => router.push('/admin/admin-users'), color: '#3B82F6' },
              { icon: '⚠️', title: 'View Complaints', action: () => router.push('/admin/admin-complaints'), color: '#EF4444' },
              { icon: '📊', title: 'Generate Reports', action: () => router.push('/admin/admin-reports'), color: '#8B5CF6' },
              { icon: '📝', title: 'Manage Content', action: () => router.push('/admin/admin-content'), color: '#F59E0B' },
              { icon: '🔧', title: 'System Maintenance', action: () => router.push('/admin/admin-maintenance'), color: '#10B981' },
              { icon: '📈', title: 'Analytics', action: () => router.push('/admin/admin-reports'), color: '#06B6D4' },
              { icon: '➕', title: 'Add Service Category', action: () => router.push('/admin/admin-add-service'), color: '#6366F1' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.action}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  flex: 1,
                  minWidth: '45%',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>
                  {item.icon}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: theme.textDark,
                  textAlign: 'center',
                  fontFamily: Fonts.caption,
                }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
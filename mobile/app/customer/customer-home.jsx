import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import Footer from '../shared/Footer';

export default function CustomerHome() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        fetchCustomerStats();
        fetchRecentBookings();
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.100:3000/api/customer/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.100:3000/api/customer/bookings?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentBookings(data.bookings || []);
      }
    } catch (error) {
      console.log('Error fetching recent bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCustomerStats(),
      fetchRecentBookings()
    ]);
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search':
        router.push('/customer/service-search');
        break;
      case 'bookings':
        router.push('/customer/customer-bookings');
        break;
      case 'support':
        router.push('/customer/customer-support');
        break;
      case 'notifications':
        router.push('/customer/customer-notifications');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'active':
      case 'in-progress':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
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
              Welcome, {user?.name || 'Customer'}
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
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Stats */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.textDark,
            marginBottom: 16,
            fontFamily: Fonts.subheading,
          }}>
            Dashboard Overview
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
                color: theme.primary,
                marginBottom: 4,
              }}>
                {stats.totalBookings}
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
                color: '#3B82F6',
                marginBottom: 4,
              }}>
                {stats.activeBookings}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Active Bookings
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
                {stats.completedBookings}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Completed
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
                ${stats.totalSpent}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Total Spent
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
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
              { icon: '🔍', title: 'Search Services', action: 'search' },
              { icon: '📋', title: 'My Bookings', action: 'bookings' },
              { icon: '💬', title: 'Support', action: 'support' },
              { icon: '🔔', title: 'Notifications', action: 'notifications' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickAction(item.action)}
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

        {/* Service Categories */}
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
            Popular Categories
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {[
              { icon: '🏠', name: 'Cleaning', color: '#3B82F6' },
              { icon: '🔧', name: 'Repairs', color: '#10B981' },
              { icon: '🎨', name: 'Painting', color: '#F59E0B' },
              { icon: '🌿', name: 'Gardening', color: '#8B5CF6' },
              { icon: '🚚', name: 'Moving', color: '#EF4444' },
              { icon: '🔌', name: 'Electrical', color: '#06B6D4' },
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(`/customer/service-search?category=${category.name}`)}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  marginRight: 12,
                  alignItems: 'center',
                  minWidth: 80,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>
                  {category.icon}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: theme.textDark,
                  textAlign: 'center',
                  fontFamily: Fonts.caption,
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Bookings */}
        <View style={{
          paddingHorizontal: 24,
          marginBottom: 24,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.textDark,
              fontFamily: Fonts.subheading,
            }}>
              Recent Bookings
            </Text>
            <TouchableOpacity onPress={() => router.push('/customer/customer-bookings')}>
              <Text style={{
                fontSize: 14,
                color: theme.primary,
                fontWeight: '500',
                fontFamily: Fonts.body,
              }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {recentBookings.length > 0 ? (
            recentBookings.map((booking, index) => (
              <TouchableOpacity
                key={booking._id || index}
                onPress={() => router.push(`/customer/booking-detail?id=${booking._id}`)}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.textDark,
                    fontFamily: Fonts.body,
                  }}>
                    {booking.service?.name || 'Service'}
                  </Text>
                  <View style={{
                    backgroundColor: getStatusColor(booking.status) + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: getStatusColor(booking.status),
                      fontFamily: Fonts.caption,
                    }}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={{
                  fontSize: 14,
                  color: theme.textLight,
                  marginBottom: 4,
                  fontFamily: Fonts.body,
                }}>
                  {booking.provider?.name || 'Provider'}
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: theme.textLight,
                  fontFamily: Fonts.body,
                }}>
                  {formatDate(booking.scheduledDate)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{
                fontSize: 48,
                marginBottom: 12,
              }}>
                📋
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: theme.textDark,
                marginBottom: 8,
                fontFamily: Fonts.body,
              }}>
                No bookings yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.textLight,
                textAlign: 'center',
                fontFamily: Fonts.body,
              }}>
                Start by searching for services you need
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/customer/service-search')}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '500',
                  fontFamily: Fonts.body,
                }}>
                  Search Services
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Minimalist Footer */}
      <Footer theme={theme} router={router} current="home" />
    </View>
  );
}

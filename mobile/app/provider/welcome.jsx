import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';

export default function ProviderWelcome() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    upcomingBookings: 2,
    serviceRequests: 3,
    totalEarnings: 12000,
    pendingPayouts: 2000,
    reviews: 5,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      // TODO: Fetch real stats and notifications here
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch real stats and notifications here
    setRefreshing(false);
  };

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 40, height: 40, marginRight: 12 }}
            resizeMode="contain"
          />
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
              HomeEase
            </Text>
            <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
              Welcome, {user?.name || 'Seller'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onRefresh} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20, color: theme.textDark }}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
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
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.primary,
                marginBottom: 4,
              }}>
                PKR {stats.totalEarnings}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Total Earnings
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
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#3B82F6',
                marginBottom: 4,
              }}>
                {stats.upcomingBookings}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Upcoming Bookings
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
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#F59E0B',
                marginBottom: 4,
              }}>
                {stats.serviceRequests}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Service Requests
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
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#10B981',
                marginBottom: 4,
              }}>
                {stats.reviews}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.textLight,
                fontFamily: Fonts.caption,
              }}>
                Reviews
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
              { icon: '📝', title: 'Register for Service', onPress: () => router.push('/provider/register-service') },
              { icon: '📅', title: 'Availability', onPress: () => router.push('/provider/availability') },
              { icon: '📋', title: 'Bookings', onPress: () => router.push('/provider/provider-orders') },
              { icon: '🛎️', title: 'Requests', onPress: () => router.push({ pathname: '/provider/provider-orders', params: { tab: 'requests' } }) },
              { icon: '💸', title: 'Earnings', onPress: () => router.push('/provider/earnings') },
              { icon: '⭐', title: 'Reviews', onPress: () => router.push('/provider/reviews') },
              { icon: '📝', title: 'Complaint to Admin', onPress: () => router.push('/provider/complaint') },
              { icon: '📄', title: 'Terms and Conditions', onPress: () => router.push('/provider/terms') },
              { icon: '❄️', title: 'Freeze Account', onPress: () => router.push('/provider/freeze-account') },
              { icon: '🛠️', title: 'Your Services', onPress: () => router.push('/provider/your-services') },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
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
                <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: theme.textDark,
                  textAlign: 'center',
                  fontFamily: Fonts.caption,
                }}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
            <TouchableOpacity onPress={() => router.push('/provider/provider-orders')}>
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
          {/* Example recent bookings, replace with real data */}
          {[1, 2].map((booking, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push('/provider/provider-orders')}
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
                  Service Name
                </Text>
                <View style={{
                  backgroundColor: '#3B82F620',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#3B82F6',
                    fontFamily: Fonts.caption,
                  }}>
                    Active
                  </Text>
                </View>
              </View>
              <Text style={{
                fontSize: 14,
                color: theme.textLight,
                marginBottom: 4,
                fontFamily: Fonts.body,
              }}>
                Customer Name
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.textLight,
                fontFamily: Fonts.body,
              }}>
                2024-06-01
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
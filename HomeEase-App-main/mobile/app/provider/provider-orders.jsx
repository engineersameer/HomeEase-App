import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Alert, ActivityIndicator, Animated, Dimensions, Modal, Image, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProviderOrders() {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);

  const TAB_TITLES = {
    requests: 'Booking Requests',
    scheduled: 'Booking Scheduled',
    completed: 'Booking Completed',
  };
  const TAB_KEYS = ['requests', 'scheduled', 'completed'];
  const TAB_WIDTH = Dimensions.get('window').width / 3;
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: TAB_KEYS.indexOf(activeTab) * TAB_WIDTH,
      useNativeDriver: false,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("data", data)
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        Alert.alert('Error', data.message || 'Failed to accept booking');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by provider' })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        Alert.alert('Error', data.message || 'Failed to reject booking');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to reject booking');
    }
  };

  const handleComplete = async (bookingId) => {
    Alert.alert(
      'Complete Booking',
      'Are you sure you want to mark this booking as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'default',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`${API_BASE_URL}/api/provider/bookings/${bookingId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                setShowSuccess(true);
                fetchBookings();
                setTimeout(() => setShowSuccess(false), 2000);
              } else {
                Alert.alert('Error', data.message || 'Failed to complete booking');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to complete booking');
            }
          }
        }
      ]
    );
  };

  const openBookingDetail = (booking) => {
    console.log('Booking tapped', booking);
    setDetailBooking(booking);
    setShowDetailModal(true);
  };
  const closeBookingDetail = () => {
    setShowDetailModal(false);
    setDetailBooking(null);
  };
  const handleMessageUser = () => {
    if (detailBooking && detailBooking.customerId?._id) {
      router.push({ pathname: '/provider/provider-chat', params: { userId: detailBooking.customerId._id } });
      closeBookingDetail();
    }
  };

  const renderBooking = ({ item }) => (
    <View style={{ backgroundColor: theme.card, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}>
      <Text style={{ color: theme.textDark, fontWeight: 'bold', fontSize: 16 }}>{item.serviceId?.title || 'Service'}</Text>
      <Text style={{ color: theme.textLight, marginTop: 4 }}>Customer: {item.customerId?.name || 'N/A'}</Text>
      <Text style={{ color: theme.textLight, marginTop: 2 }}>Date: {new Date(item.bookingDate).toLocaleString()}</Text>
      <Text style={{ color: theme.textLight, marginTop: 2 }}>Location: {item.location}</Text>
      <TouchableOpacity
        onPress={() => openBookingDetail(item)}
        style={{ marginTop: 12, backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, alignSelf: 'flex-end' }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>View Details ✓</Text>
      </TouchableOpacity>
      {item.status === 'pending' && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => handleAccept(item._id)}
            style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 8, marginRight: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReject(item._id)}
            style={{ backgroundColor: theme.error || '#e74c3c', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'accepted' && (
        <TouchableOpacity
          onPress={() => handleComplete(item._id)}
          style={{
            backgroundColor: '#4CAF50',
            padding: 10,
            borderRadius: 8,
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#4CAF50',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="checkmark-done-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Booking Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const requests = bookings.filter(b => b.status === 'pending');
  const scheduled = bookings.filter(b => b.status === 'accepted');
  const completed = bookings.filter(b => b.status === 'completed');

  // If bookings list is empty, show a dummy booking for testing
  const displayBookings = bookings.length > 0 ? bookings : [
    {
      _id: 'dummy1',
      serviceId: { title: 'Test Service' },
      customerId: { name: 'Test User' },
      bookingDate: new Date().toISOString(),
      location: 'Test Location',
      status: 'pending'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 54,
        paddingBottom: 32,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, letterSpacing: 0.5 }}>
          {TAB_TITLES[activeTab]}
        </Text>
      </View>
      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 0,
        borderWidth: 1,
        borderColor: theme.border,
        position: 'relative',
      }}>
        {TAB_KEYS.map((key, idx) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={{
              flex: 1,
              borderRadius: 18,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              backgroundColor: 'transparent',
            }}
            activeOpacity={0.85}
          >
            <Text style={{
              color: activeTab === key ? theme.primary : theme.textLight,
              fontWeight: activeTab === key ? 'bold' : '500',
              fontSize: 16,
              letterSpacing: 0.2,
            }}>
              {TAB_TITLES[key]}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Animated underline indicator */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: TAB_WIDTH,
            height: 3,
            borderRadius: 2,
            backgroundColor: theme.primary,
            transform: [{ translateX: indicatorAnim }],
            zIndex: 2,
          }}
        />
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No booking requests.
            </Text>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={item => item._id}
              renderItem={renderBooking}
              refreshing={refreshing}
              onRefresh={fetchBookings}
            />
          )
        ) : activeTab === 'scheduled' ? (
          scheduled.length === 0 ? (
            <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No scheduled bookings.
            </Text>
          ) : (
            <FlatList
              data={scheduled}
              keyExtractor={item => item._id}
              renderItem={renderBooking}
              refreshing={refreshing}
              onRefresh={fetchBookings}
            />
          )
        ) : (
          completed.length === 0 ? (
            <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No completed bookings.
            </Text>
          ) : (
            <FlatList
              data={completed}
              keyExtractor={item => item._id}
              renderItem={renderBooking}
              refreshing={refreshing}
              onRefresh={fetchBookings}
            />
          )
        )}
      </View>
      {/* Success Snackbar */}
      {showSuccess && (
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Booking marked as completed!</Text>
          </View>
        </View>
      )}
      {/* Booking Detail Modal (moved outside of SafeAreaView for proper overlay) */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBookingDetail}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 24, width: '90%', maxHeight: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, marginBottom: 12 }}>Booking Details</Text>
            {detailBooking && (
              <ScrollView style={{ maxHeight: 400 }}>
                <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Service:</Text>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>{detailBooking.serviceId?.title || 'N/A'}</Text>
                <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Customer:</Text>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>{detailBooking.customerId?.name || 'N/A'}</Text>
                <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Date:</Text>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>{new Date(detailBooking.bookingDate).toLocaleString()}</Text>
                <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Location:</Text>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>{detailBooking.location}</Text>
                <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Requirements:</Text>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>{detailBooking.specialNote || detailBooking.description || 'N/A'}</Text>
                {/* Uploaded Media */}
                {detailBooking.media && detailBooking.media.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: theme.textDark, fontWeight: 'bold', marginBottom: 4 }}>Uploaded Photos:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {detailBooking.media.map((mediaUrl, idx) => (
                        <Image key={idx} source={{ uri: mediaUrl }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity onPress={closeBookingDetail} style={{ marginRight: 16 }}>
                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
              {detailBooking && detailBooking.customerId?._id && (
                <TouchableOpacity onPress={handleMessageUser} style={{ backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Message User</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 
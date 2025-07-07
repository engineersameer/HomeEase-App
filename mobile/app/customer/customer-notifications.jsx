import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';

const API_URL = 'http://192.168.100.5:5000/api/customer/notifications';

export default function CustomerNotifications() {
  const router = useRouter();
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_NOTIFICATIONS));
      setNotifications(data.notifications || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_NOTIFICATION_READ, { notificationId });
      await apiCall(url, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.bookingId) {
      router.push({
        pathname: '/customer/booking-detail',
        params: { bookingId: notification.bookingId }
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_update':
        return '📋';
      case 'payment_success':
        return '💰';
      case 'service_completed':
        return '✅';
      case 'booking_cancelled':
        return '❌';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_update':
        return '#2196F3';
      case 'payment_success':
        return '#4CAF50';
      case 'service_completed':
        return '#4CAF50';
      case 'booking_cancelled':
        return '#F44336';
      case 'reminder':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const renderNotificationCard = (notification) => (
    <TouchableOpacity
      key={notification._id}
      onPress={() => handleNotificationPress(notification)}
      style={{
        backgroundColor: notification.read ? theme.card : theme.primary + '10',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: notification.read ? theme.border : theme.primary,
        borderLeftWidth: 4,
        borderLeftColor: getNotificationColor(notification.type),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>
          {getNotificationIcon(notification.type)}
        </Text>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: notification.read ? 'normal' : 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading
            }}>
              {notification.title}
            </Text>
            {!notification.read && (
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.primary
              }} />
            )}
          </View>
          
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.body,
            marginBottom: 8,
            lineHeight: 20
          }}>
            {notification.message}
          </Text>
          
          <Text style={{ 
            color: theme.textLight, 
            fontSize: 12,
            fontFamily: Fonts.caption
          }}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Consistent Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: theme.textDark }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Notifications
        </Text>
        <TouchableOpacity onPress={onRefresh} style={{ marginLeft: 'auto', padding: 8 }}>
          <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.body,
              textAlign: 'center',
              marginBottom: 8
            }}>
              No notifications yet
            </Text>
            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.caption,
              textAlign: 'center'
            }}>
              You'll see booking updates and important messages here
            </Text>
          </View>
        ) : (
          <>
            {notifications.map(renderNotificationCard)}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 
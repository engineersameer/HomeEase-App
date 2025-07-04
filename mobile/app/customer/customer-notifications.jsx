import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';

const API_URL = 'http://192.168.10.15:5000/api/customer/notifications';

export default function CustomerNotifications() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadThemePreference();
    fetchNotifications();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
      // Use mock data for now
      setNotifications([
        {
          _id: '1',
          type: 'booking_update',
          title: 'Booking Accepted',
          message: 'Your electrical service booking has been accepted by Ahmed Electrician',
          timestamp: new Date(),
          read: false,
          bookingId: '1'
        },
        {
          _id: '2',
          type: 'payment_success',
          title: 'Payment Successful',
          message: 'Payment of PKR 800 has been processed successfully',
          timestamp: new Date(Date.now() - 3600000),
          read: true,
          bookingId: '1'
        },
        {
          _id: '3',
          type: 'service_completed',
          title: 'Service Completed',
          message: 'Your plumbing service has been completed. Please leave a review!',
          timestamp: new Date(Date.now() - 86400000),
          read: false,
          bookingId: '2'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.log('Error marking notification as read:', error);
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.primary, 
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#fff',
              fontFamily: Fonts.heading
            }}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text style={{ 
                color: '#fff', 
                fontFamily: Fonts.caption,
                marginTop: 4
              }}>
                {unreadCount} unread
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
    </View>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import FloatingInput from './shared/FloatingInput';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { MaterialIcons } from '@expo/vector-icons';
import AdminFooter from './shared/Footer';

export default function AdminProfile() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [originalValues, setOriginalValues] = useState({ name: '', phone: '' });
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setOriginalValues({
          name: user.name || '',
          phone: user.phone || '',
        });
      }
      setLoading(false);
    } catch (error) {
      console.log('Error loading user data:', error);
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PROFILE), {
        method: 'PUT',
        body: JSON.stringify({
          name,
          phone,
          notificationPreferences
        })
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setOriginalValues({ name, phone });
        // Update the stored user data
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.name = name;
          userData.phone = phone;
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    await updateProfile();
  };

  const handleCancelEdit = () => {
    setName(originalValues.name);
    setPhone(originalValues.phone);
    setEditingField(null);
  };

  const toggleNotification = (key) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('userRole');
            router.replace('/');
          }
        }
      ]
    );
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
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header (fixed at top) */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Profile
        </Text>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ padding: 24 }}>
          {/* Profile Image Section */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.background,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: theme.border,
              marginBottom: 15
            }}>
              <Text style={{ fontSize: 40, color: theme.textLight }}>👤</Text>
            </View>
          </View>
          {/* Profile Form */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Personal Information
            </Text>
            {/* Name */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Name" value={name} onChangeText={setName} theme={theme} editable={editingField === 'name'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('name')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'name'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'name' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Email (locked) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Email" value={email} theme={theme} editable={false} inputStyle={{ color: theme.textDark }} />
              </View>
              <MaterialIcons name="lock" size={22} color={theme.textLight} style={{ marginLeft: 8 }} />
            </View>
            {/* Phone */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Phone" value={phone} onChangeText={setPhone} theme={theme} editable={editingField === 'phone'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('phone')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'phone'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'phone' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Save/Cancel Buttons for the field being edited */}
          {editingField && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 20,
                  paddingVertical: 10,
                  flex: 1,
                  alignItems: 'center',
                }}
                onPress={handleUpdateProfile}
              >
                <Text style={{ color: '#fff', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 20,
                  paddingVertical: 10,
                  flex: 1,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={handleCancelEdit}
              >
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.background,
              borderRadius: 20,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
              marginTop: 32,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading, fontWeight: '600' }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
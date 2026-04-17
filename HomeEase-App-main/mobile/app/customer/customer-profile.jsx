import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import Footer from '../customer/shared/Footer';
import FloatingInput from '../customer/shared/FloatingInput';
import { MaterialIcons } from '@expo/vector-icons';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';

export default function CustomerProfile() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'name', 'phone', 'address', 'city', or null
  const [originalValues, setOriginalValues] = useState({ name: '', phone: '', address: '', city: '' });
  const [savedField, setSavedField] = useState(null); // for green icon feedback
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_PROFILE));
      
      // The API returns the user object directly, not nested under 'user'
      const userData = data.success ? data.user : data; // Handle both response formats
      
      setUser(userData);
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setCity(userData.city || '');
      setProfileImage(userData.profileImage);
      setOriginalValues({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
      });
      setLoading(false);
    } catch (error) {
      console.log('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_PROFILE), {
        method: 'PUT',
        body: JSON.stringify({
          name,
          phone,
          address,
          city
        })
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setOriginalValues({ name, phone, address, city });
        // Update the stored user data
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.name = name;
          userData.phone = phone;
          userData.address = address;
          userData.city = city;
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleUpdateProfile = async () => {
    await updateProfile();
  };

  const handleCancelEdit = () => {
    setName(originalValues.name);
    setPhone(originalValues.phone);
    setAddress(originalValues.address);
    setCity(originalValues.city);
    setEditingField(null);
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
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header (fixed at top) */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
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
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <Text style={{ fontSize: 40, color: theme.textLight }}>👤</Text>
              )}
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
            {/* Address */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Address" value={address} onChangeText={setAddress} theme={theme} editable={editingField === 'address'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('address')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'address'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'address' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* City */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="City" value={city} onChangeText={setCity} theme={theme} editable={editingField === 'city'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('city')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'city'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'city' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Save/Cancel Buttons for the field being edited */}
          {editingField && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 5 }}>
              <TouchableOpacity
                style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 8, flex: 1, marginRight: 8 }}
                onPress={handleUpdateProfile}
              >
                <Text style={{ color: '#fff', fontFamily: Fonts.body, textAlign: 'center' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: theme.card, padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, borderWidth: 1, borderColor: theme.border }}
                onPress={handleCancelEdit}
              >
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
              marginTop: 32,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
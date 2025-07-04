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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import Footer from '../shared/Footer';
import FloatingInput from '../shared/FloatingInput';

const API_URL = 'http://192.168.10.16:5000/api/auth/profile';

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data;
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setProfileImage(user.profileImage);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(API_URL, {
        name,
        phone,
        address,
        city,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Profile
          </Text>
        </View>
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
            <FloatingInput label="Name" value={name} onChangeText={setName} theme={theme} />
            <FloatingInput label="Email" value={email} onChangeText={setEmail} editable={false} theme={theme} />
            <FloatingInput label="Phone" value={phone} onChangeText={setPhone} theme={theme} />
            <FloatingInput label="Address" value={address} onChangeText={setAddress} theme={theme} />
            <FloatingInput label="City" value={city} onChangeText={setCity} theme={theme} />
          </View>
          <TouchableOpacity
            onPress={handleUpdateProfile}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, color: '#fff', fontFamily: Fonts.subheading }}>
              Update Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.textDark, fontFamily: Fonts.subheading }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer theme={theme} router={router} current="profile" />
    </View>
  );
} 
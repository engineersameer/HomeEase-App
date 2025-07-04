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

const API_URL = 'http://192.168.10.15:5000/api/auth/profile';

export default function CustomerProfile() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

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
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

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
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.primary, 
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#fff',
            fontFamily: Fonts.heading
          }}>
            Profile
          </Text>
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={{ fontSize: 24, color: '#fff' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {/* Profile Image Section */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: theme.primary,
            marginBottom: 15
          }}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={{ width: 114, height: 114, borderRadius: 57 }}
              />
            ) : (
              <Text style={{ fontSize: 48, color: theme.textLight }}>👤</Text>
            )}
          </View>
          <TouchableOpacity style={{
            backgroundColor: theme.accent,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20
          }}>
            <Text style={{ color: '#fff', fontFamily: Fonts.body }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Form */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 15
          }}>
            Personal Information
          </Text>

          {/* Name */}
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 5 }}>
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={isEditing}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 16
            }}
          />

          {/* Email */}
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 5 }}>
            Email Address
          </Text>
          <TextInput
            value={email}
            editable={false}
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              color: theme.textLight,
              fontFamily: Fonts.body,
              fontSize: 16
            }}
          />

          {/* Phone */}
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 5 }}>
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            keyboardType="phone-pad"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 16
            }}
          />

          {/* Address */}
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 5 }}>
            Address
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            editable={isEditing}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 16,
              minHeight: 80
            }}
          />

          {/* City */}
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, marginBottom: 5 }}>
            City
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            editable={isEditing}
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 16
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 30 }}>
          {isEditing ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.background,
                  borderWidth: 2,
                  borderColor: theme.border,
                  paddingVertical: 15,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: theme.textDark, 
                  fontFamily: Fonts.body,
                  fontWeight: '600'
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  paddingVertical: 15,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: '#fff', 
                  fontFamily: Fonts.body,
                  fontWeight: '600'
                }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={{
                backgroundColor: theme.accent,
                paddingVertical: 15,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ 
                color: '#fff', 
                fontFamily: Fonts.body,
                fontWeight: '600'
              }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Section */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 15
          }}>
            Settings
          </Text>

          {/* Theme Toggle */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 12,
            marginBottom: 10
          }}>
            <Text style={{ 
              color: theme.textDark, 
              fontFamily: Fonts.body,
              fontSize: 16
            }}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDarkMode ? '#fff' : theme.textLight}
            />
          </View>

          {/* Notifications */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 12,
            marginBottom: 10
          }}>
            <Text style={{ 
              color: theme.textDark, 
              fontFamily: Fonts.body,
              fontSize: 16
            }}>
              Push Notifications
            </Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: theme.error,
            paddingVertical: 15,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ 
            color: '#fff', 
            fontFamily: Fonts.body,
            fontWeight: '600'
          }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 
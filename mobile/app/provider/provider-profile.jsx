import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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
import FloatingInput from './shared/FloatingInput';
import { MaterialIcons } from '@expo/vector-icons';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';

const API_URL = 'http://192.168.100.5:5000/api/auth/profile';

export default function ProviderProfile() {
  const router = useRouter();
  const { theme } = useTheme();

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [certifications, setCertifications] = useState('');
  const [cnic, setCnic] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [editingField, setEditingField] = useState(null); // which field is being edited
  const [originalValues, setOriginalValues] = useState({});
  const [savedField, setSavedField] = useState(null); // for green icon feedback
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_PROFILE));
      
      // The API returns the user object directly, not nested under 'user'
      const userData = data.success ? data : data; // Handle both response formats
      
      setUser(userData);
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setCity(userData.city || '');
      setProfession(userData.profession || '');
      setExperience(userData.experience ? String(userData.experience) : '');
      setPricing(userData.pricing ? String(userData.pricing) : '');
      setCertifications(userData.certifications || '');
      setCnic(userData.cnic || '');
      setAvailability(userData.availability || '');
      setBio(userData.bio || '');
      setProfileImage(userData.profileImage);
      setOriginalValues({
        name: userData.name || '',
        phone: userData.phone || '',
        city: userData.city || '',
        profession: userData.profession || '',
        experience: userData.experience ? String(userData.experience) : '',
        pricing: userData.pricing ? String(userData.pricing) : '',
        certifications: userData.certifications || '',
        cnic: userData.cnic || '',
        availability: userData.availability || '',
        bio: userData.bio || '',
      });
      setLoading(false);
    } catch (error) {
      console.log('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user.name.trim() || !user.email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    try {
      await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_PROFILE), {
        method: 'PUT',
        body: JSON.stringify(user)
      });
      Alert.alert('Success', 'Profile updated successfully');
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(API_URL, {
        name,
        phone,
        city,
        profession,
        experience,
        pricing,
        certifications,
        cnic,
        availability,
        bio,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setSavedField(editingField); // show green icon
      setEditingField(null);
      setOriginalValues({
        name, phone, city, profession, experience, pricing, certifications, cnic, availability, bio
      });
      setTimeout(() => setSavedField(null), 1500);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setName(originalValues.name);
    setPhone(originalValues.phone);
    setCity(originalValues.city);
    setProfession(originalValues.profession);
    setExperience(originalValues.experience);
    setPricing(originalValues.pricing);
    setCertifications(originalValues.certifications);
    setCnic(originalValues.cnic);
    setAvailability(originalValues.availability);
    setBio(originalValues.bio);
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
                <Text style={{ fontSize: 40, color: theme.textDark }}>👤</Text>
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
              Provider Information
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
                <FloatingInput label="Phone" value={phone} onChangeText={setPhone} theme={theme} keyboardType="phone-pad" editable={editingField === 'phone'} inputStyle={{ color: theme.textDark }} />
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
            {/* Profession */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Profession" value={profession} onChangeText={setProfession} theme={theme} editable={editingField === 'profession'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('profession')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'profession'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'profession' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Experience */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Experience (years)" value={experience} onChangeText={setExperience} theme={theme} keyboardType="numeric" editable={editingField === 'experience'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('experience')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'experience'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'experience' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Pricing */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Pricing" value={pricing} onChangeText={setPricing} theme={theme} keyboardType="numeric" editable={editingField === 'pricing'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('pricing')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'pricing'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'pricing' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Certifications */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Certifications" value={certifications} onChangeText={setCertifications} theme={theme} editable={editingField === 'certifications'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('certifications')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'certifications'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'certifications' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* CNIC */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="CNIC" value={cnic} onChangeText={setCnic} theme={theme} editable={editingField === 'cnic'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('cnic')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'cnic'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'cnic' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Availability */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Availability" value={availability} onChangeText={setAvailability} theme={theme} editable={editingField === 'availability'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('availability')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'availability'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'availability' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
            {/* Bio */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <FloatingInput label="Bio" value={bio} onChangeText={setBio} theme={theme} editable={editingField === 'bio'} inputStyle={{ color: theme.textDark }} />
              </View>
              <TouchableOpacity
                onPress={() => setEditingField('bio')}
                style={{ marginLeft: 8 }}
                disabled={editingField === 'bio'}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={editingField === 'bio' ? theme.primary : theme.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Save/Cancel Buttons for the field being edited */}
          {editingField && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
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
          {/* Logout Button */}
          <TouchableOpacity
            style={{ marginTop: 32, backgroundColor: theme.accent, padding: 14, borderRadius: 8 }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#fff', fontFamily: Fonts.body, textAlign: 'center', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
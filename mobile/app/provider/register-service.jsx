import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ProviderFooter from './shared/Footer';

export default function RegisterService() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [serviceData, setServiceData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' },
      saturday: { available: true, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    },
    tags: [],
    images: []
  });

  const categories = [
    'Electrical',
    'Plumbing',
    'Cleaning',
    'Carpentry',
    'Painting',
    'Gardening',
    'Moving',
    'Repair',
    'Installation',
    'Maintenance',
    'Other'
  ];

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'provider') {
          Alert.alert('Access Denied', 'You do not have provider privileges.');
          router.replace('/');
          return;
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const createService = async () => {
    if (!serviceData.title.trim() || !serviceData.category || !serviceData.description.trim() || !serviceData.price || !serviceData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(serviceData.price) || parseFloat(serviceData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const servicePayload = {
        ...serviceData,
        price: parseFloat(serviceData.price),
        providerId: user._id
      };

      await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_SERVICE_CREATE), {
        method: 'POST',
        body: JSON.stringify(servicePayload)
      });

      Alert.alert('Success', 'Service created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/provider/provider-orders')
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateServiceData = (field, value) => {
    setServiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateAvailability = (day, field, value) => {
    setServiceData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
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
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={theme.textDark} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Create Service
          </Text>
          <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
            Register your service to start receiving bookings
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Service Information */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 16 }}>
            Service Information
          </Text>

          {/* Service Title */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Service Title *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                padding: 12,
                color: theme.textDark,
                fontFamily: Fonts.body
              }}
              placeholder="e.g., Professional Electrical Repair"
              placeholderTextColor={theme.textLight}
              value={serviceData.title}
              onChangeText={(text) => updateServiceData('title', text)}
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Category *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={{
                    backgroundColor: serviceData.category === category ? theme.primary : theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                  onPress={() => updateServiceData('category', category)}
                >
                  <Text style={{
                    color: serviceData.category === category ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 12
                  }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Description *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                padding: 12,
                color: theme.textDark,
                fontFamily: Fonts.body,
                height: 100,
                textAlignVertical: 'top'
              }}
              placeholder="Describe your service in detail..."
              placeholderTextColor={theme.textLight}
              value={serviceData.description}
              onChangeText={(text) => updateServiceData('description', text)}
              multiline
            />
          </View>

          {/* Price */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Price (PKR) *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                padding: 12,
                color: theme.textDark,
                fontFamily: Fonts.body
              }}
              placeholder="Enter your service price"
              placeholderTextColor={theme.textLight}
              value={serviceData.price}
              onChangeText={(text) => updateServiceData('price', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Service Location *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={{
                    backgroundColor: serviceData.location === city ? theme.primary : theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                  onPress={() => updateServiceData('location', city)}
                >
                  <Text style={{
                    color: serviceData.location === city ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 12
                  }}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Availability */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 16 }}>
            Availability
          </Text>
          {Object.keys(serviceData.availability).map((day) => (
            <View key={day} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.border,
                    backgroundColor: serviceData.availability[day].available ? theme.primary : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => updateAvailability(day, 'available', !serviceData.availability[day].available)}
                >
                  {serviceData.availability[day].available && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, textTransform: 'capitalize' }}>
                  {day}
                </Text>
              </View>
              {serviceData.availability[day].available && (
                <View style={{ flexDirection: 'row', marginLeft: 32 }}>
                  <TextInput
                    style={{
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 8,
                      padding: 8,
                      color: theme.textDark,
                      fontFamily: Fonts.body,
                      flex: 1,
                      marginRight: 8
                    }}
                    value={serviceData.availability[day].startTime}
                    onChangeText={(text) => updateAvailability(day, 'startTime', text)}
                    placeholder="09:00"
                  />
                  <Text style={{ alignSelf: 'center', marginHorizontal: 8, color: theme.textLight }}>to</Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 8,
                      padding: 8,
                      color: theme.textDark,
                      fontFamily: Fonts.body,
                      flex: 1,
                      marginLeft: 8
                    }}
                    value={serviceData.availability[day].endTime}
                    onChangeText={(text) => updateAvailability(day, 'endTime', text)}
                    placeholder="17:00"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Create Service Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16
          }}
          onPress={createService}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body, fontSize: 16 }}>
              Create Service
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ProviderFooter theme={theme} router={router} current="register" />
    </SafeAreaView>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';

export default function ServiceBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Booking state
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data
  const [providers, setProviders] = useState([
    {
      id: 1,
      name: 'Ahmed Electrician',
      rating: 4.8,
      reviews: 127,
      price: 800,
      available: true,
      image: 'https://via.placeholder.com/100',
      specialties: ['Wiring', 'Installation', 'Repair'],
      experience: '5 years'
    },
    {
      id: 2,
      name: 'Ali Electrician',
      rating: 4.6,
      reviews: 89,
      price: 700,
      available: true,
      image: 'https://via.placeholder.com/100',
      specialties: ['Maintenance', 'Troubleshooting'],
      experience: '3 years'
    }
  ]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const dates = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'Day After', value: 'day-after' }
  ];

  useEffect(() => {
    loadThemePreference();
    if (params.serviceId) {
      // Load service details
      fetchServiceDetails();
    }
  }, [params.serviceId]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_SERVICE_DETAIL, { serviceId: params.serviceId });
      const data = await apiCall(url);
      setEstimatedCost(data.service.price);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch service details');
    }
  };

  const handleBooking = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime || !serviceDescription) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKINGS), {
        method: 'POST',
        body: JSON.stringify({
          serviceId: params.serviceId,
          providerId: selectedProvider.id,
          date: selectedDate,
          time: selectedTime,
          address: '',
          description: serviceDescription.trim(),
          estimatedCost: estimatedCost
        })
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your booking has been confirmed with ${selectedProvider.name} for ${selectedDate} at ${selectedTime}`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/customer-bookings')
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProviderCard = (provider) => (
    <TouchableOpacity
      onPress={() => setSelectedProvider(provider)}
      style={{
        backgroundColor: selectedProvider?.id === provider.id ? theme.primary : theme.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: selectedProvider?.id === provider.id ? theme.primary : theme.border,
        shadowColor: theme.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: provider.image }}
          style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: selectedProvider?.id === provider.id ? '#fff' : theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 4
          }}>
            {provider.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ color: '#FFD700', marginRight: 4 }}>⭐</Text>
            <Text style={{ 
              color: selectedProvider?.id === provider.id ? '#fff' : theme.textDark, 
              fontFamily: Fonts.body,
              marginRight: 8
            }}>
              {provider.rating} ({provider.reviews} reviews)
            </Text>
          </View>
          <Text style={{ 
            color: selectedProvider?.id === provider.id ? '#fff' : theme.textLight, 
            fontFamily: Fonts.caption
          }}>
            {provider.experience} experience
          </Text>
          <Text style={{ 
            color: selectedProvider?.id === provider.id ? '#fff' : theme.primary, 
            fontFamily: Fonts.body,
            fontWeight: 'bold',
            marginTop: 4
          }}>
            PKR {provider.price}/hour
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            backgroundColor: provider.available ? '#4CAF50' : theme.error,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12
          }}>
            <Text style={{ 
              color: '#fff', 
              fontSize: 12,
              fontFamily: Fonts.caption
            }}>
              {provider.available ? 'Available' : 'Busy'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#fff',
            fontFamily: Fonts.heading
          }}>
            Book Service
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Service Description */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Service Description
            </Text>
            <TextInput
              value={serviceDescription}
              onChangeText={setServiceDescription}
              placeholder="Describe the service you need..."
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 15,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Select Provider */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Select Provider
            </Text>
            {providers.map(renderProviderCard)}
          </View>

          {/* Select Date */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Select Date
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {dates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  onPress={() => setSelectedDate(date.value)}
                  style={{
                    flex: 1,
                    backgroundColor: selectedDate === date.value ? theme.primary : theme.card,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                >
                  <Text style={{ 
                    color: selectedDate === date.value ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontWeight: '600'
                  }}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Select Time */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Select Time
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  style={{
                    backgroundColor: selectedTime === time ? theme.accent : theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                >
                  <Text style={{ 
                    color: selectedTime === time ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body
                  }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cost Estimate */}
          <View style={{ 
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 15
            }}>
              Cost Estimate
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                Service Fee
              </Text>
              <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>
                PKR {selectedProvider?.price || 0}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                Platform Fee
              </Text>
              <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>
                PKR 100
              </Text>
            </View>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              borderTopWidth: 1,
              borderTopColor: theme.border,
              paddingTop: 10
            }}>
              <Text style={{ 
                color: theme.textDark, 
                fontFamily: Fonts.subheading,
                fontWeight: 'bold',
                fontSize: 16
              }}>
                Total
              </Text>
              <Text style={{ 
                color: theme.primary, 
                fontFamily: Fonts.subheading,
                fontWeight: 'bold',
                fontSize: 16
              }}>
                PKR {(selectedProvider?.price || 0) + 100}
              </Text>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity
            onPress={handleBooking}
            disabled={loading}
            style={{
              backgroundColor: loading ? theme.textLight : theme.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontFamily: Fonts.body,
              fontWeight: '600',
              fontSize: 16
            }}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 
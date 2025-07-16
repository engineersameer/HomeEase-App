import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import Button from './shared/Button';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

export default function ServiceBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Booking form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [focusAnim] = useState(new Animated.Value(1));
  const [mapRegion, setMapRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [mapPin, setMapPin] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [pageAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadThemePreference();
      fetchServiceDetails();
    fetchUserProfile();
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [params.serviceId]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch {}
  };

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_SERVICE_DETAIL, { serviceId: params.serviceId });
      const data = await apiCall(url);
      setService(data.service);
    } catch {
      setError('Failed to load service details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setFullName(user.name || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');
      }
    } catch {}
  };

  const validate = () => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!phone.trim()) return 'Phone Number is required.';
    if (!preferredDate.trim()) return 'Preferred Date is required.';
    if (!preferredTime.trim()) return 'Preferred Time is required.';
    if (!location.trim()) return 'Location is required.';
    return '';
  };

  const isFormValid = () => {
    return (
      fullName.trim() &&
      phone.trim() &&
      preferredDate.trim() &&
      preferredTime.trim() &&
      location.trim()
    );
  };

  const handleBooking = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiCall(API_CONFIG.ENDPOINTS.CUSTOMER_BOOKINGS, {
        method: 'POST',
        body: JSON.stringify({
          serviceId: params.serviceId,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date: preferredDate,
          time: preferredTime,
          notes: notes.trim(),
          location: location.trim(),
        })
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/customer/customer-bookings');
      }, 1500);
    } catch {
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMapPin({ latitude, longitude });
    setMapLoading(true);
    try {
      let [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      let address = [place.name, place.street, place.city, place.region, place.country].filter(Boolean).join(', ');
      setLocation(address);
    } catch {
      setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
    setMapLoading(false);
  };

  const handleUseMyLocation = async () => {
    setMapLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setMapLoading(false);
      Alert.alert('Permission Denied', 'Location permission is required to use map.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    setMapPin({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    try {
      let [place] = await Location.reverseGeocodeAsync(loc.coords);
      let address = [place.name, place.street, place.city, place.region, place.country].filter(Boolean).join(', ');
      setLocation(address);
    } catch {
      setLocation(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
    }
    setMapLoading(false);
    setShowMapModal(true);
  };

  const handleFocus = () => {
    Animated.spring(focusAnim, {
      toValue: 1.04,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };
  const handleBlur = () => {
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textDark, marginTop: 16 }}>Loading service details...</Text>
      </View>
  );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header with Back Navigation */}
      <View style={{ 
        backgroundColor: theme.card,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Book Service
          </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* Booking Summary Card */}
        {service && (
          <Animated.View style={{
            width: '100%',
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 22,
            marginBottom: 28,
            shadowColor: theme.textDark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 10,
            elevation: 3,
            transform: [{ scale: focusAnim }],
          }}>
            <Text style={{ fontSize: 19, fontWeight: '700', color: theme.primary, fontFamily: Fonts.subheading, marginBottom: 6 }}>
              {service.title}
            </Text>
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginBottom: 4 }}>
              {service.category} • {service.location || service.city}
            </Text>
            <Text style={{ color: theme.textDark, fontFamily: Fonts.body, marginBottom: 4 }}>
              {service.description}
            </Text>
            {service.price && (
              <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
                Estimated Price: PKR {service.price}
                  </Text>
            )}
            {/* Booking summary details */}
            <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <View style={{ marginRight: 18 }}>
                <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, marginLeft: 4, fontSize: 14 }}> {preferredDate || '--'}</Text>
              </View>
              <View style={{ marginRight: 18 }}>
                <Ionicons name="time-outline" size={18} color={theme.primary} />
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, marginLeft: 4, fontSize: 14 }}> {preferredTime || '--'}</Text>
              </View>
              <View>
                <Ionicons name="location-outline" size={18} color={theme.primary} />
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, marginLeft: 4, fontSize: 14 }}> {location || '--'}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Booking Form */}
        <Animated.View style={{ width: '100%', maxWidth: 440, backgroundColor: theme.card, borderRadius: 18, padding: 26, shadowColor: theme.textDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 3, marginBottom: 32, transform: [{ scale: focusAnim }] }}>
          {error ? (
            <Text style={{ color: theme.error, marginBottom: 12, fontFamily: Fonts.body }}>{error}</Text>
          ) : null}

          {/* Contact Info Section */}
          <Text style={sectionTitle(theme)}>Contact Info</Text>
          <TextInput
            style={inputStyle(theme)}
            placeholder="Full Name"
            placeholderTextColor={theme.textLight}
            value={fullName}
            onChangeText={setFullName}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TextInput
            style={inputStyle(theme)}
            placeholder="Phone Number"
            placeholderTextColor={theme.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TextInput
            style={inputStyle(theme)}
            placeholder="Email (optional)"
            placeholderTextColor={theme.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Booking Details Section */}
          <Text style={sectionTitle(theme)}>Booking Details</Text>
          <TextInput
            style={inputStyle(theme)}
            placeholder="Preferred Date (e.g. 2024-07-20)"
            placeholderTextColor={theme.textLight}
            value={preferredDate}
            onChangeText={setPreferredDate}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Time Slot Selection */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginBottom: 6, fontSize: 15 }}>Preferred Time</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TIME_SLOTS.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setPreferredTime(slot)}
                  style={{
                    backgroundColor: preferredTime === slot ? theme.primary : theme.background,
                    borderColor: preferredTime === slot ? theme.primary : theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    marginBottom: 8,
                    marginRight: 8,
                    shadowColor: preferredTime === slot ? theme.primary : 'transparent',
                    shadowOpacity: preferredTime === slot ? 0.15 : 0,
                    elevation: preferredTime === slot ? 2 : 0,
                  }}
                >
                  <Text style={{ color: preferredTime === slot ? '#fff' : theme.textDark, fontFamily: Fonts.body, fontWeight: '600' }}>{slot}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <TextInput
            style={[inputStyle(theme), { minHeight: 60 } ]}
            placeholder="Notes or special request (optional)"
            placeholderTextColor={theme.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Location Section */}
          <Text style={sectionTitle(theme)}>Location</Text>
          <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginBottom: 6, fontSize: 15 }}>Enter your address or select on map</Text>
          <View style={{ marginBottom: 10 }}>
            <TextInput
              style={[
                inputStyle(theme),
                {
                  minHeight: 100,
                  maxHeight: 140,
                  textAlignVertical: 'top',
                  marginBottom: 0,
                  fontSize: 16,
                  padding: 14,
                }
              ]}
              placeholder="Complete Address"
              placeholderTextColor={theme.textLight}
              value={location}
              onChangeText={setLocation}
              onFocus={handleFocus}
              onBlur={handleBlur}
              multiline
              numberOfLines={5}
            />
            <Button
              title="📍 Select on Map"
              onPress={handleUseMyLocation}
              variant="card"
              style={{ marginTop: 10, width: '100%', paddingVertical: 14 }}
              textStyle={{ color: theme.primary, fontSize: 15 }}
            />
          </View>

          {/* Confirm Button */}
          <Button
            title={submitting ? 'Booking...' : 'Confirm Booking'}
            onPress={handleBooking}
            loading={submitting}
            disabled={!isFormValid() || submitting}
            style={{ marginTop: 18, marginBottom: 0, borderRadius: 12, width: '100%' }}
          />
          {success && (
            <Text style={{ color: theme.primary, marginTop: 16, fontWeight: 'bold', fontFamily: Fonts.body }}>
              Booking Confirmed! Redirecting...
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* Map Modal with real map */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={{ width: '95%', backgroundColor: theme.card, borderRadius: 18, padding: 18, alignItems: 'center', shadowColor: theme.textDark, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4, opacity: pageAnim, transform: [{ scale: pageAnim }] }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary, marginBottom: 12 }}>Select Location</Text>
            <View style={{ width: '100%', height: 240, backgroundColor: theme.background, borderRadius: 12, overflow: 'hidden', marginBottom: 18, borderWidth: 1, borderColor: theme.border }}>
              <MapView
                style={{ flex: 1 }}
                region={mapRegion}
                onPress={handleMapPress}
              >
                {mapPin && <Marker coordinate={mapPin} />}
              </MapView>
              {mapLoading && <ActivityIndicator style={{ position: 'absolute', top: 10, right: 10 }} color={theme.primary} />}
            </View>
            <Text style={{ color: theme.textDark, marginBottom: 8, fontFamily: Fonts.body, fontSize: 15, textAlign: 'center' }}>{location || 'Tap on map to select address'}</Text>
            <Button title="Use This Location" onPress={() => setShowMapModal(false)} style={{ width: '100%' }} disabled={!location} />
            <Button title="Cancel" onPress={() => setShowMapModal(false)} variant="card" style={{ width: '100%' }} textStyle={{ color: theme.primary }} />
          </Animated.View>
    </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const inputStyle = (theme) => ({
  backgroundColor: theme.background,
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 10,
  padding: 14,
  color: theme.textDark,
  fontFamily: Fonts.body,
  fontSize: 15,
  marginBottom: 14,
  shadowColor: theme.textDark,
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
});

const sectionTitle = (theme) => ({
  fontSize: 16,
  fontWeight: '700',
  color: theme.primary,
  fontFamily: Fonts.subheading,
  marginBottom: 8,
  marginTop: 10,
}); 
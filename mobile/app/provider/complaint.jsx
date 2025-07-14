import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import ProviderFooter from './shared/Footer';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProviderComplaint() {
  const router = useRouter();
  const { theme } = useTheme();

  // Form state
  const [bookingId, setBookingId] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(''); // '', 'sent', 'under_action', 'resolved'
  const [refreshing, setRefreshing] = useState(false);
  // Dummy booking options
  const [bookingOptions] = useState([
    { id: 'DUMMY-BOOK-001', label: 'DUMMY-BOOK-001' },
    { id: 'DUMMY-BOOK-002', label: 'DUMMY-BOOK-002' },
    { id: 'DUMMY-BOOK-003', label: 'DUMMY-BOOK-003' },
  ]);
  const [loadingBookings] = useState(false);
  const [noBookings] = useState(false);

  // Remove fetchBookings and useEffect for bookings

  const pickEvidence = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEvidence(result.assets[0]);
    }
  };

  const handleSend = async () => {
    if (!bookingId || !description) return;
    setSending(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('description', description);
      if (evidence) {
        formData.append('evidence', {
          uri: evidence.uri,
          name: evidence.fileName || evidence.name || 'evidence',
          type: evidence.mimeType || evidence.type || 'application/octet-stream',
        });
      }
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_COMPLAINTS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // isko bilkul mat likho!
        },
        body: formData,
      });
      if (response.ok) {
        setStatus('sent');
        Alert.alert('Success', 'Complaint sent successfully!');
      } else {
        setStatus('failed');
        Alert.alert('Error', 'Failed to send complaint.');
      }
    } catch (err) {
      setStatus('failed');
      Alert.alert('Error', 'Failed to send complaint.');
    }
      setSending(false);
  };

  // Refresh handler (reset form)
  const onRefresh = async () => {
    setRefreshing(true);
    setBookingId('');
    setDescription('');
    setEvidence(null);
    setStatus('');
    setSending(false);
    setTimeout(() => setRefreshing(false), 500); // Simulate refresh
  };

  // Status label and color
  const statusMap = {
    'neutral': { label: 'Neutral', color: theme.textLight },
    'sent': { label: 'Sent', color: theme.primary },
    'under_action': { label: 'Under Action', color: '#F59E0B' },
    'resolved': { label: 'Resolved', color: '#10B981' },
  };

  const isDarkMode = (theme.isDarkMode !== undefined) ? theme.isDarkMode : (theme.background === '#18181B' || theme.background === '#000');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 22, color: theme.textDark }}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Complaint to Admin
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          {/* Booking ID */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 8, fontFamily: Fonts.subheading }}>
            Booking ID
          </Text>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}>
            {loadingBookings ? (
              <Text style={{ color: theme.textLight, fontStyle: 'italic', paddingVertical: 8 }}>Loading bookings...</Text>
            ) : noBookings ? (
              <Text style={{ color: theme.textLight, fontStyle: 'italic', paddingVertical: 8 }}>No bookings exist in the system.</Text>
            ) : bookingOptions.length > 0 ? (
              bookingOptions.map(opt => (
                <TouchableOpacity key={opt.id} onPress={() => setBookingId(opt.id)} style={{ paddingVertical: 6 }}>
                  <Text style={{ color: bookingId === opt.id ? theme.primary : theme.textDark, fontWeight: bookingId === opt.id ? 'bold' : 'normal' }}>{opt.label}</Text>
                </TouchableOpacity>
              ))
            ) : null}
          </View>

          {/* Complaint Description */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 8, fontFamily: Fonts.subheading }}>
            Complaint Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your complaint..."
            placeholderTextColor={theme.textLight}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: theme.card,
              color: theme.textDark,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 12,
              marginBottom: 16,
              fontFamily: Fonts.body,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />

          {/* Evidence Upload */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 8, fontFamily: Fonts.subheading }}>
            Evidence (Document or Image)
          </Text>
          <TouchableOpacity
            onPress={pickEvidence}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.subheading }}>
              {evidence ? 'Change Evidence' : 'Upload Evidence'}
            </Text>
          </TouchableOpacity>
          {evidence && (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              {evidence.uri && (
                <Image source={{ uri: evidence.uri }} style={{ width: 120, height: 120, borderRadius: 10 }} />
              )}
              <Text style={{ color: theme.textLight, marginTop: 6 }}>{evidence.fileName || 'Selected Evidence'}</Text>
            </View>
          )}

          {/* Status Heading and Box */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 8, fontFamily: Fonts.subheading }}>
            Status
          </Text>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: statusMap[status || 'neutral']?.color || theme.textDark, fontFamily: Fonts.subheading }}>
              {statusMap[status || 'neutral']?.label || 'Neutral'}
            </Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !bookingId || !description}
            style={{
              backgroundColor: '#3498DB',
              borderRadius: 10,
              padding: 16,
              alignItems: 'center',
              marginBottom: 20,
              opacity: sending || !bookingId || !description ? 0.6 : 1,
              marginTop: 24,
            }}
          >
            {sending ? (
              <ActivityIndicator color={'#fff'} />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.subheading }}>
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ProviderFooter theme={theme} router={router} current={''} />
    </SafeAreaView>
  );
} 
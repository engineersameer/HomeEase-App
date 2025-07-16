import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl, apiCall } from '../../config/api';

export default function AdminCities() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('');
  const [editId, setEditId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await apiCall(getApiUrl('/api/admin/cities'), { method: 'GET' });
      if (res.success) {
        setCities(res.data);
      } else {
        setError(res.message || 'Failed to load cities');
      }
    } catch (err) {
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddOrEdit = async () => {
    if (!cityName.trim()) {
      setError('City name is required.');
      return;
    }
    setFormLoading(true);
    setError('');
    try {
      if (editId) {
        const res = await apiCall(getApiUrl(`/api/admin/cities/${editId}`), {
          method: 'PUT',
          body: JSON.stringify({ cityName: cityName.trim() })
        });
        if (res.success) {
          fetchCities();
          setEditId(null);
          setCityName('');
          Alert.alert('Success', 'City updated successfully!');
        } else {
          setError(res.message || 'Failed to update city');
        }
      } else {
        const res = await apiCall(getApiUrl('/api/admin/cities'), {
          method: 'POST',
          body: JSON.stringify({ cityName: cityName.trim() })
        });
        if (res.success) {
          fetchCities();
          setCityName('');
          Alert.alert('Success', 'City added successfully!');
        } else {
          setError(res.message || 'Failed to add city');
        }
      }
    } catch (err) {
      setError('Failed to save city');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (city) => {
    setEditId(city._id);
    setCityName(city.cityName);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setFormLoading(true);
    try {
      const res = await apiCall(getApiUrl(`/api/admin/cities/${deleteId}`), { method: 'DELETE' });
      if (res.success) {
        fetchCities();
        setDeleteId(null);
        setModalVisible(false);
        Alert.alert('Success', 'City deleted successfully!');
      } else {
        Alert.alert('Error', res.message || 'Failed to delete city');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete city');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={{ backgroundColor: theme.card, paddingTop: 45, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8, padding: 6 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, flex: 1, textAlign: 'center' }}>Manage Cities</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={{ flex: 1, padding: 24 }} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 18 }}>{editId ? 'Edit City' : 'Add New City'}</Text>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>City Name *</Text>
            <TextInput
              style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.textDark, fontFamily: Fonts.body, fontSize: 15 }}
              placeholder="Enter city name"
              placeholderTextColor={theme.textLight}
              value={cityName}
              onChangeText={setCityName}
            />
          </View>
          {error ? <Text style={{ color: '#EF4444', marginBottom: 10, fontFamily: Fonts.body }}>{error}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            {editId && (
              <TouchableOpacity onPress={() => { setEditId(null); setCityName(''); setError(''); }} style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, marginRight: 8 }}>
                <Text style={{ color: theme.primary, fontWeight: 'bold', fontFamily: Fonts.body }}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAddOrEdit} disabled={formLoading} style={{ backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, opacity: formLoading ? 0.7 : 1 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>{formLoading ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add City')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 12 }}>All Cities</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
        ) : cities.length === 0 ? (
          <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 32 }}>No cities found.</Text>
        ) : (
          <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
            {cities.map((item, idx) => (
              <View key={item._id} style={{ opacity: editId === item._id ? 0.5 : 1, borderBottomWidth: idx === cities.length - 1 ? 0 : 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: theme.card }}>
                <View style={{ flex: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.body }}>{item.cityName}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginLeft: 'auto' }}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 }}>
                    <Ionicons name="pencil" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDeleteId(item._id); setModalVisible(true); }} style={{ backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 }}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.12)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 18, paddingVertical: 32, paddingHorizontal: 24, width: '92%', maxWidth: 420, alignItems: 'center', borderWidth: 0, elevation: 0 }}>
            <Text style={{ fontSize: 19, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 22, letterSpacing: 0.2 }}>Delete City</Text>
            <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, marginBottom: 18 }}>Are you sure you want to delete this city?</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                <Text style={{ color: theme.primary, fontWeight: 'bold', fontFamily: Fonts.body }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={formLoading} style={{ backgroundColor: '#EF4444', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, opacity: formLoading ? 0.7 : 1 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 
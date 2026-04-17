import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, ScrollView, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl, apiCall } from '../../config/api';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
];

function ServiceForm({
  mode = 'create',
  initialData = {},
  onSubmit,
  onCancel,
  loading
}) {
  const { theme } = useTheme();
  const [serviceName, setServiceName] = useState(initialData.serviceName || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setServiceName(initialData.serviceName || '');
    setError('');
  }, [initialData, mode]);

  const handleSubmit = () => {
    if (!serviceName.trim()) {
      setError('Service name is required.');
      return;
    }
    setError('');
    onSubmit({ serviceName: serviceName.trim() });
  };

  return (
    <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 18 }}>{mode === 'edit' ? 'Edit Service' : 'Add New Service'}</Text>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>Service Name *</Text>
        <TextInput
          style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.textDark, fontFamily: Fonts.body, fontSize: 15 }}
          placeholder="Enter service name"
          placeholderTextColor={theme.textLight}
          value={serviceName}
          onChangeText={setServiceName}
        />
      </View>
      {error ? <Text style={{ color: '#EF4444', marginBottom: 10, fontFamily: Fonts.body }}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
        {mode === 'edit' && (
          <TouchableOpacity onPress={onCancel} style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, marginRight: 8 }}>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontFamily: Fonts.body }}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18, opacity: loading ? 0.7 : 1 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>{loading ? (mode === 'edit' ? 'Saving...' : 'Adding...') : (mode === 'edit' ? 'Save Changes' : 'Add Service')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ServiceList({ services, onEdit, onDelete, loading, editingId }) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 12 }}>All Services</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
      ) : services.length === 0 ? (
        <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 32 }}>No services found.</Text>
      ) : (
        <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
          {services.map((item, idx) => (
            <Animated.View key={item._id} style={{ opacity: editingId === item._id ? 0.5 : 1, borderBottomWidth: idx === services.length - 1 ? 0 : 1, borderBottomColor: theme.border }}>
              <View style={{ flexDirection: screenWidth < 500 ? 'column' : 'row', alignItems: screenWidth < 500 ? 'flex-start' : 'center', padding: 18, backgroundColor: theme.card }}>
                <View style={{ flex: 2, marginBottom: screenWidth < 500 ? 8 : 0 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.body }}>{item.serviceName}</Text>
                  <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body, marginTop: 2 }}>{item.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginLeft: 'auto' }}>
                  <TouchableOpacity onPress={() => onEdit(item)} style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 }}>
                    <Ionicons name="pencil" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item)} style={{ backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 }}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AdminAddService() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('create');
  const [formInitial, setFormInitial] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(getApiUrl('/api/admin/service-categories'), { method: 'GET' });
      if (res.success) {
        setServices(res.data);
      } else {
        setError(res.message || 'Failed to load services');
      }
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Create or update service
  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (formMode === 'edit' && editingId) {
        const res = await apiCall(getApiUrl(`/api/admin/service-categories/${editingId}`), {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res.success) {
          setFormMode('create');
          setFormInitial({});
          setEditingId(null);
          fetchServices();
          Alert.alert('Success', 'Service updated successfully!');
        } else {
          Alert.alert('Error', res.message || 'Failed to update service');
        }
      } else {
        const res = await apiCall(getApiUrl('/api/admin/service-categories'), {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.success) {
          setFormInitial({}); // Reset form fields after successful add
          setFormMode('create');
          fetchServices();
          Alert.alert('Success', 'Service added successfully!');
        } else {
          Alert.alert('Error', res.message || 'Failed to add service');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit service
  const handleEdit = (item) => {
    setFormMode('edit');
    setFormInitial({ serviceName: item.serviceName });
    setEditingId(item._id);
  };

  // Delete service
  const handleDelete = (item) => {
    Alert.alert('Delete Service', `Are you sure you want to delete "${item.serviceName}" in ${item.location}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setFormLoading(true);
        try {
          const res = await apiCall(getApiUrl(`/api/admin/service-categories/${item._id}`), { method: 'DELETE' });
          if (res.success) {
            fetchServices();
            setFormMode('create');
            setFormInitial({});
            setEditingId(null);
            Alert.alert('Success', 'Service deleted successfully!');
          } else {
            Alert.alert('Error', res.message || 'Failed to delete service');
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to delete service');
        } finally {
          setFormLoading(false);
        }
      }}
    ]);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormMode('create');
    setFormInitial({});
    setEditingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={{ backgroundColor: theme.card, paddingTop: 45, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8, padding: 6 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, flex: 1, textAlign: 'center' }}>Manage Services</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={{ flex: 1, padding: 24 }} contentContainerStyle={{ paddingBottom: 60 }}>
        <ServiceForm
          mode={formMode}
          initialData={formInitial}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          loading={formLoading}
        />
        <ServiceList
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          editingId={editingId}
        />
      </ScrollView>
    </SafeAreaView>
  );
} 
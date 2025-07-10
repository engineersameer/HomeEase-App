import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl, apiCall } from '../../config/api';

export default function AdminAddService() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id or 'add'

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(getApiUrl('/api/admin/service-categories'), { method: 'GET' });
      if (res.success) {
        setCategories(res.data);
      } else {
        setError(res.message || 'Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    setActionLoading('add');
    try {
      const res = await apiCall(getApiUrl('/api/admin/service-categories'), {
        method: 'POST',
        body: JSON.stringify({ serviceCategory: newCategory.trim() })
      });
      if (res.success) {
        setNewCategory('');
        fetchCategories();
      } else {
        Alert.alert('Error', res.message || 'Failed to add category');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setActionLoading(null);
    }
  };

  // Start editing
  const startEdit = (id, value) => {
    setEditingId(id);
    setEditingValue(value);
  };

  // Save edit
  const handleEdit = async (id) => {
    if (!editingValue.trim()) return;
    setActionLoading(id);
    try {
      const res = await apiCall(getApiUrl(`/api/admin/service-categories/${id}`), {
        method: 'PUT',
        body: JSON.stringify({ serviceCategory: editingValue.trim() })
      });
      if (res.success) {
        setEditingId(null);
        setEditingValue('');
        fetchCategories();
      } else {
        Alert.alert('Error', res.message || 'Failed to update category');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update category');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete
  const handleDelete = (id) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setActionLoading(id);
        try {
          const res = await apiCall(getApiUrl(`/api/admin/service-categories/${id}`), { method: 'DELETE' });
          if (res.success) {
            fetchCategories();
          } else {
            Alert.alert('Error', res.message || 'Failed to delete category');
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to delete category');
        } finally {
          setActionLoading(null);
        }
      }}
    ]);
  };

  // Render category item
  const renderItem = ({ item }) => (
    <View style={{
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }}>
      {editingId === item._id ? (
        <TextInput
          value={editingValue}
          onChangeText={setEditingValue}
          style={{
            flex: 1,
            fontSize: 16,
            color: theme.textDark,
            fontFamily: Fonts.body,
            backgroundColor: theme.background,
            borderRadius: 8,
            paddingHorizontal: 8,
            marginRight: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
          autoFocus
          onSubmitEditing={() => handleEdit(item._id)}
        />
      ) : (
        <Text style={{
          flex: 1,
          fontSize: 16,
          color: theme.textDark,
          fontFamily: Fonts.body,
        }}>{item.serviceCategory}</Text>
      )}
      {editingId === item._id ? (
        <TouchableOpacity onPress={() => handleEdit(item._id)} disabled={actionLoading === item._id} style={{ marginLeft: 8 }}>
          {actionLoading === item._id ? <ActivityIndicator size={20} color={theme.primary} /> : <Ionicons name="checkmark" size={24} color={theme.primary} />}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => startEdit(item._id, item.serviceCategory)} style={{ marginLeft: 8 }}>
          <Ionicons name="pencil" size={22} color={theme.textLight} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => handleDelete(item._id)} disabled={actionLoading === item._id} style={{ marginLeft: 8 }}>
        {actionLoading === item._id ? <ActivityIndicator size={20} color={theme.primary} /> : <Ionicons name="trash" size={22} color="#EF4444" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header (consistent with Manage Users page) */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8, padding: 6 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.textDark,
          fontFamily: Fonts.heading,
          flex: 1,
          textAlign: 'center',
        }}>
          Add Service
        </Text>
        <View style={{ width: 32 }} />
      </View>
      {/* Add Category Input */}
      <View style={{ padding: 24, backgroundColor: theme.background }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 12,
        }}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} style={{ marginRight: 8 }} />
          <TextInput
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Add new service category..."
            placeholderTextColor={theme.textLight}
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.textDark,
              fontFamily: Fonts.body,
              backgroundColor: 'transparent',
              paddingVertical: 4,
            }}
            onSubmitEditing={handleAdd}
            editable={!adding && !actionLoading}
          />
          <TouchableOpacity onPress={handleAdd} disabled={!newCategory.trim() || actionLoading === 'add'} style={{ marginLeft: 8 }}>
            {actionLoading === 'add' ? <ActivityIndicator size={20} color={theme.primary} /> : <Ionicons name="send" size={22} color={theme.primary} />}
          </TouchableOpacity>
        </View>
        {/* List of Categories */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 32 }}>{error}</Text>
        ) : categories.length === 0 ? (
          <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 32 }}>No service categories found.</Text>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
} 
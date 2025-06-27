import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Profile() {
  const theme = Colors.dark;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('http://192.168.100.5:5000/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({ name: res.data.name, address: res.data.address });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        Alert.alert('Error', 'Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      await axios.put('http://192.168.100.5:5000/api/customer/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, ...form });
      setEditMode(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.push('/signin');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/customer-home')}>
          <MaterialIcons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textDark, fontFamily: Fonts.heading }]}>Profile</Text>
      </View>

      {/* Profile Content */}
      <View style={styles.profileBox}>
        {/* Name */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Name</Text>
            {editMode ? (
              <TextInput
                value={form.name}
                onChangeText={val => setForm({ ...form, name: val })}
                style={[styles.input, { color: theme.textDark, borderColor: theme.border }]}
                placeholder="Enter name"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={[styles.value, { color: theme.textDark }]}>{user.name}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.iconBtn}>
            <MaterialIcons name={editMode ? 'close' : 'edit'} size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Email */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Email</Text>
            <Text style={[styles.value, { color: theme.textLight }]}>{user.email}</Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Address</Text>
            {editMode ? (
              <TextInput
                value={form.address}
                onChangeText={val => setForm({ ...form, address: val })}
                style={[styles.input, { color: theme.textDark, borderColor: theme.border }]}
                placeholder="Enter address"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={[styles.value, { color: theme.textDark }]}>{user.address}</Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        {editMode && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
  },
  profileBox: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#AAAAAA',
    fontFamily: Fonts.caption,
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    fontFamily: Fonts.body,
  },
  input: {
    fontSize: 16,
    fontFamily: Fonts.body,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#181818',
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: '#181818',
    marginLeft: 10,
  },
  saveBtn: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontFamily: Fonts.heading,
    fontSize: 16,
    marginLeft: 8,
  },
});

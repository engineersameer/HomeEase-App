import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AdminMaintenance() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    title: '',
    description: '',
    type: 'scheduled',
  });

  // Animations for maintenance
  const fadeAnims = useMemo(() => maintenance.map(() => new Animated.Value(0)), [maintenance.length]);
  const slideAnims = useMemo(() => maintenance.map(() => new Animated.Value(20)), [maintenance.length]);

  useEffect(() => {
    fetchMaintenance();
    maintenance.forEach((_, idx) => {
      Animated.parallel([
        Animated.timing(fadeAnims[idx], {
          toValue: 1,
          duration: 400,
          delay: idx * 60,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[idx], {
          toValue: 0,
          duration: 400,
          delay: idx * 60,
          useNativeDriver: true,
        })
      ]).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenance.length]);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_MAINTENANCE));
      if (result.success) {
        setMaintenance(result.maintenance || []);
        console.log('Maintenance fetched:', result.maintenance?.length || 0);
      } else {
        console.log('Failed to fetch maintenance:', result.message);
        setMaintenance([]);
      }
    } catch (error) {
      console.log('Error fetching maintenance:', error);
      setMaintenance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = async () => {
    if (!newMaintenance.title.trim() || !newMaintenance.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_MAINTENANCE), {
        method: 'POST',
        body: JSON.stringify(newMaintenance)
      });
      if (result.success) {
        Alert.alert('Success', 'Maintenance task created successfully');
        setNewMaintenance({ title: '', description: '', type: 'scheduled' });
        setShowCreateForm(false);
        fetchMaintenance();
      } else {
        Alert.alert('Error', result.message || 'Failed to create maintenance task');
      }
    } catch (error) {
      console.error('Create maintenance error:', error);
      Alert.alert('Error', 'Failed to create maintenance task');
    }
  };

  const handleStartMaintenance = async (maintenanceId) => {
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_MAINTENANCE_START.replace(':maintenanceId', maintenanceId)), {
        method: 'PATCH'
      });
      
      if (result.success) {
        Alert.alert('Success', 'Maintenance started successfully');
        fetchMaintenance();
      } else {
        Alert.alert('Error', result.message || 'Failed to start maintenance');
      }
    } catch (error) {
      console.error('Start maintenance error:', error);
      Alert.alert('Error', 'Failed to start maintenance');
    }
  };

  const handleCompleteMaintenance = async (maintenanceId) => {
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_MAINTENANCE_COMPLETE.replace(':maintenanceId', maintenanceId)), {
        method: 'PATCH'
      });
      
      if (result.success) {
        Alert.alert('Success', 'Maintenance completed successfully');
        fetchMaintenance();
      } else {
        Alert.alert('Error', result.message || 'Failed to complete maintenance');
      }
    } catch (error) {
      console.error('Complete maintenance error:', error);
      Alert.alert('Error', 'Failed to complete maintenance');
    }
  };

  const handleDeleteMaintenance = (maintenanceId, title) => {
    Alert.alert(
      'Delete Maintenance',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_MAINTENANCE.replace(':id', maintenanceId)), {
                method: 'DELETE'
              });
              
              if (result.success) {
                Alert.alert('Success', 'Maintenance task deleted successfully');
                fetchMaintenance();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete maintenance task');
              }
            } catch (error) {
              console.error('Delete maintenance error:', error);
              Alert.alert('Error', 'Failed to delete maintenance task');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'scheduled':
        return '#10B981';
      case 'emergency':
        return '#EF4444';
      case 'routine':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'scheduled':
        return '📅';
      case 'emergency':
        return '🚨';
      case 'routine':
        return '🔧';
      default:
        return '⚙️';
    }
  };

  // Filter maintenance based on status
  const filteredMaintenance = maintenance.filter(item => {
    return selectedStatus === 'all' || item.status === selectedStatus;
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ 
            marginTop: 16, 
            color: theme.textDark, 
            fontFamily: Fonts.body,
            fontSize: 16
          }}>
            Loading maintenance tasks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 50,
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
          Maintenance
        </Text>
        <TouchableOpacity onPress={() => setShowCreateForm(true)} style={{ padding: 6 }}>
          <Ionicons name="add" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Create Maintenance Modal Dialog */}
      <Modal visible={showCreateForm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.12)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 18, paddingVertical: 32, paddingHorizontal: 24, width: '92%', maxWidth: 420, alignItems: 'center', borderWidth: 0, elevation: 0 }}>
            <Text style={{ fontSize: 19, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 22, letterSpacing: 0.2 }}>Create Maintenance Task</Text>
            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 15,
                width: '100%',
              }}
              placeholder="Task title..."
              placeholderTextColor={theme.textLight}
              value={newMaintenance.title}
              onChangeText={(text) => setNewMaintenance({...newMaintenance, title: text})}
            />
            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 15,
                minHeight: 80,
                textAlignVertical: 'top',
                width: '100%',
              }}
              placeholder="Task description..."
              placeholderTextColor={theme.textLight}
              value={newMaintenance.description}
              onChangeText={(text) => setNewMaintenance({...newMaintenance, description: text})}
              multiline
            />
            {/* Type Dropdown */}
            <View style={{ width: '100%', marginBottom: 18, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, overflow: 'hidden' }}>
              <Picker
                selectedValue={newMaintenance.type}
                onValueChange={value => setNewMaintenance({ ...newMaintenance, type: value })}
                style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, width: '100%' }}
                dropdownIconColor={theme.textLight}
                mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
              >
                <Picker.Item label="Select type..." value="" color={theme.textLight} />
                <Picker.Item label="Scheduled" value="scheduled" />
                <Picker.Item label="Emergency" value="emergency" />
                <Picker.Item label="Routine" value="routine" />
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 6 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 22,
                  paddingVertical: 11,
                  flex: 1,
                  alignItems: 'center',
                }}
                onPress={handleCreateMaintenance}
              >
                <Text style={{ color: '#fff', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 }}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 22,
                  paddingVertical: 11,
                  flex: 1,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Status Filter */}
          <View style={{ marginBottom: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { key: 'all', label: `All (${maintenance.length})` },
                { key: 'pending', label: `Pending (${maintenance.filter(m => m.status === 'pending').length})` },
                { key: 'in_progress', label: `In Progress (${maintenance.filter(m => m.status === 'in_progress').length})` },
                { key: 'completed', label: `Completed (${maintenance.filter(m => m.status === 'completed').length})` },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={{
                    backgroundColor: selectedStatus === item.key ? theme.primary : theme.card,
                    borderRadius: 20,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selectedStatus === item.key ? theme.primary : theme.border,
                    minWidth: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setSelectedStatus(item.key)}
                >
                  <Text style={{
                    color: selectedStatus === item.key ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Section Heading */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 12
          }}>
            Maintenance Tasks ({filteredMaintenance.length})
          </Text>
          {/* Maintenance List */}
          {filteredMaintenance.map((item, idx) => (
            <Animated.View
              key={item._id}
              style={{
                opacity: fadeAnims[idx],
                transform: [{ translateY: slideAnims[idx] }],
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.border,
                  flexDirection: 'column',
                  marginBottom: 0,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>
                        {getTypeIcon(item.type)}
                      </Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.textDark,
                        fontFamily: Fonts.subheading,
                        flex: 1,
                      }}>
                        {item.title}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: theme.textLight,
                      fontFamily: Fonts.body,
                      marginBottom: 8,
                      lineHeight: 20,
                    }}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                    <View style={{
                      backgroundColor: getTypeColor(item.type),
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 12,
                      marginBottom: 4,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#fff',
                        fontFamily: Fonts.body,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                      }}>
                        {item.type}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: getStatusColor(item.status),
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 12,
                      marginBottom: 4,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#fff',
                        fontFamily: Fonts.body,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                      }}>
                        {item.status.replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: getPriorityColor(item.priority),
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#fff',
                        fontFamily: Fonts.body,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                      }}>
                        {item.priority}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.card,
                        borderRadius: 20,
                        paddingVertical: 10,
                        flex: 1,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#3B82F6',
                      }}
                      onPress={() => handleStartMaintenance(item._id)}
                    >
                      <Text style={{ color: '#3B82F6', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' }}>Start</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'in_progress' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.card,
                        borderRadius: 20,
                        paddingVertical: 10,
                        flex: 1,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#10B981',
                      }}
                      onPress={() => handleCompleteMaintenance(item._id)}
                    >
                      <Text style={{ color: '#10B981', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' }}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 20,
                      paddingVertical: 10,
                      flex: 1,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#EF4444',
                    }}
                    onPress={() => handleDeleteMaintenance(item._id, item.title)}
                  >
                    <Text style={{ color: '#EF4444', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
          {filteredMaintenance.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{
                fontSize: 16,
                color: theme.textLight,
                fontFamily: Fonts.body,
              }}>
                No maintenance tasks found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

export default function AdminComplaints() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Animations for complaints
  const fadeAnims = useMemo(() => complaints.map(() => new Animated.Value(0)), [complaints.length]);
  const slideAnims = useMemo(() => complaints.map(() => new Animated.Value(20)), [complaints.length]);

  useEffect(() => {
    fetchComplaints();
    complaints.forEach((_, idx) => {
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
  }, [complaints.length]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_COMPLAINTS));
      if (result.success) {
        setComplaints(result.complaints || []);
        console.log('Complaints fetched:', result.complaints?.length || 0);
      } else {
        console.log('Failed to fetch complaints:', result.message);
        setComplaints([]);
      }
    } catch (error) {
      console.log('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_COMPLAINTS_STATUS.replace(':complaintId', complaintId)), {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (result.success) {
        Alert.alert('Success', `Complaint status updated to ${newStatus}`);
        fetchComplaints();
      } else {
        Alert.alert('Error', result.message || 'Failed to update complaint status');
      }
    } catch (error) {
      console.error('Update complaint error:', error);
      Alert.alert('Error', 'Failed to update complaint status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'resolved':
        return '#10B981';
      case 'closed':
        return '#6B7280';
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'service_quality':
        return '🔧';
      case 'timing':
        return '⏰';
      case 'payment':
        return '💰';
      case 'communication':
        return '💬';
      default:
        return '��';
    }
  };

  // Status filter counts
  const pendingCount = complaints.filter(c => c.status === 'pending' || c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  // Filter complaints based on status
  const filteredComplaints = useMemo(() => {
    if (!complaints || complaints.length === 0) return [];
    if (selectedStatus === 'all') return complaints;
    if (selectedStatus === 'pending') return complaints.filter(complaint => complaint.status === 'pending' || complaint.status === 'open');
    return complaints.filter(complaint => complaint.status === selectedStatus);
  }, [complaints, selectedStatus]);

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
            Loading complaints...
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
          Complaints 
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Status Filter */}
          <View style={{ marginBottom: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { key: 'all', label: `All (${complaints.length})` },
                { key: 'pending', label: `Pending (${pendingCount})` },
                { key: 'in_progress', label: `In Progress (${inProgressCount})` },
                { key: 'resolved', label: `Resolved (${resolvedCount})` },
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
            Complaints ({filteredComplaints.length})
          </Text>

          {/* Complaints List */}
          {(filteredComplaints && filteredComplaints.length > 0 ? filteredComplaints : complaints).map((complaint, idx) => {
            return (
              <View key={complaint._id} style={{ backgroundColor: theme.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: theme.border, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.textDark, marginBottom: 4 }}>
                  Booking ID: <Text style={{ color: theme.primary }}>{complaint.booking}</Text>
                      </Text>
                <Text style={{ color: theme.textDark, marginBottom: 4 }}>Description: <Text style={{ color: theme.textLight }}>{complaint.description}</Text></Text>
                <Text style={{ color: theme.textDark, marginBottom: 4 }}>Provider: <Text style={{ color: theme.textLight }}>{complaint.provider?.name || 'N/A'}</Text></Text>
                <Text style={{ color: theme.textDark, marginBottom: 4 }}>Date: <Text style={{ color: theme.textLight }}>{formatDate(complaint.createdAt)}</Text></Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: theme.textDark, fontWeight: 'bold' }}>Status: </Text>
                  <View style={{ backgroundColor: getStatusColor(complaint.status), borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 4 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>{complaint.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.textDark, marginBottom: 4 }}>
                  Evidence: {complaint.attachments && complaint.attachments.length > 0 ? (
                    <Text style={{ color: theme.primary, textDecorationLine: 'underline' }} onPress={() => {
                      // Open evidence file in browser
                      const url = `${API_CONFIG.BASE_URL}${complaint.attachments[0].url}`;
                      Linking.openURL(url);
                    }}>{complaint.attachments[0].filename}</Text>
                  ) : 'No evidence'}
                  </Text>
                {/* Action Buttons for status change */}
                {(complaint.status === 'open' || complaint.status === 'pending') && (
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#3B82F6', borderRadius: 8, padding: 10, marginRight: 10 }}
                      onPress={() => handleUpdateStatus(complaint._id, 'in_progress')}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mark In Progress</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {complaint.status === 'in_progress' && (
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#10B981', borderRadius: 8, padding: 10, marginRight: 10 }}
                      onPress={() => handleUpdateStatus(complaint._id, 'resolved')}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mark Resolved</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#6B7280', borderRadius: 8, padding: 10 }}
                      onPress={() => handleUpdateStatus(complaint._id, 'closed')}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {complaint.status === 'resolved' && (
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#6B7280', borderRadius: 8, padding: 10 }}
                      onPress={() => handleUpdateStatus(complaint._id, 'closed')}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {(!filteredComplaints || filteredComplaints.length === 0) && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{
                fontSize: 16,
                color: theme.textLight,
                fontFamily: Fonts.body,
              }}>
                No complaints found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

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
        return '📋';
    }
  };

  // Filter complaints based on status
  const filteredComplaints = complaints.filter(complaint => {
    return selectedStatus === 'all' || complaint.status === selectedStatus;
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
                { key: 'pending', label: `Pending (${complaints.filter(c => c.status === 'pending').length})` },
                { key: 'in_progress', label: `In Progress (${complaints.filter(c => c.status === 'in_progress').length})` },
                { key: 'resolved', label: `Resolved (${complaints.filter(c => c.status === 'resolved').length})` },
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
          {filteredComplaints.map((complaint, idx) => (
            <Animated.View
              key={complaint._id}
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
                        {getCategoryIcon(complaint.category)}
                      </Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.textDark,
                        fontFamily: Fonts.subheading,
                        flex: 1,
                      }}>
                        {complaint.title}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: theme.textLight,
                      fontFamily: Fonts.body,
                      marginBottom: 8,
                      lineHeight: 20,
                    }}>
                      {complaint.description}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: theme.textLight,
                      fontFamily: Fonts.body,
                    }}>
                      {formatDate(complaint.createdAt)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                    <View style={{
                      backgroundColor: getPriorityColor(complaint.priority),
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
                        {complaint.priority}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: getStatusColor(complaint.status),
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
                        {complaint.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* User Information */}
                <View style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.textDark,
                    fontFamily: Fonts.subheading,
                    marginBottom: 8,
                  }}>
                    Users Involved
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{
                        fontSize: 12,
                        color: theme.textLight,
                        fontFamily: Fonts.body,
                      }}>
                        Customer
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: theme.textDark,
                        fontFamily: Fonts.body,
                        fontWeight: '500',
                      }}>
                        {complaint.customer?.name || 'Unknown'}
                      </Text>
                    </View>
                    <View>
                      <Text style={{
                        fontSize: 12,
                        color: theme.textLight,
                        fontFamily: Fonts.body,
                      }}>
                        Provider
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: theme.textDark,
                        fontFamily: Fonts.body,
                        fontWeight: '500',
                      }}>
                        {complaint.provider?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                {complaint.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
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
                      onPress={() => handleUpdateStatus(complaint._id, 'in_progress')}
                    >
                      <Text style={{
                        color: '#3B82F6',
                        fontFamily: Fonts.body,
                        fontSize: 15,
                        fontWeight: '600',
                      }}>
                        Start Investigation
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {complaint.status === 'in_progress' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
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
                      onPress={() => handleUpdateStatus(complaint._id, 'resolved')}
                    >
                      <Text style={{
                        color: '#10B981',
                        fontFamily: Fonts.body,
                        fontSize: 15,
                        fontWeight: '600',
                      }}>
                        Mark Resolved
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.card,
                        borderRadius: 20,
                        paddingVertical: 10,
                        flex: 1,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#6B7280',
                      }}
                      onPress={() => handleUpdateStatus(complaint._id, 'closed')}
                    >
                      <Text style={{
                        color: '#6B7280',
                        fontFamily: Fonts.body,
                        fontSize: 15,
                        fontWeight: '600',
                      }}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}

          {filteredComplaints.length === 0 && (
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
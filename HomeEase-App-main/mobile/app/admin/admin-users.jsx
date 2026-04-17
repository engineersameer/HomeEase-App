import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG, getApiUrlWithParams } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import AdminFooter from './shared/Footer';

export default function AdminUsers() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pendingProviders, setPendingProviders] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS));
      if (result.success) {
        setUsers(result.users || []);
        setPendingProviders(result.users?.filter(u => u.role === 'provider' && u.approvalStatus === 'pending') || []);
        console.log('Pending providers:', result.users?.filter(u => u.role === 'provider' && u.approvalStatus === 'pending').length || 0);
      } else {
        console.log('Failed to fetch users:', result.message);
        setUsers([]);
        setPendingProviders([]);
      }
    } catch (error) {
      console.log('Error fetching users:', error);
      setUsers([]);
      setPendingProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (userId, userName) => {
    Alert.alert(
      'Approve Provider',
      `Are you sure you want to approve ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              const result = await apiCall(getApiUrlWithParams(API_CONFIG.ENDPOINTS.ADMIN_PROVIDERS_APPROVE, { providerId: userId }), {
                method: 'PATCH',
                body: JSON.stringify({ approved: true })
              });
              
              if (result.success) {
                Alert.alert('Success', 'Provider approved successfully');
                fetchUsers();
              } else {
                Alert.alert('Error', result.message || 'Failed to approve provider');
              }
            } catch (error) {
              console.error('Approve provider error:', error);
              Alert.alert('Error', 'Failed to approve provider');
            }
          }
        }
      ]
    );
  };

  const handleRejectProvider = async (userId, userName) => {
    Alert.prompt(
      'Reject Provider',
      `Are you sure you want to reject ${userName}? Please provide a reason:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              const result = await apiCall(getApiUrlWithParams(API_CONFIG.ENDPOINTS.ADMIN_PROVIDERS_REJECT, { id: userId }), {
                method: 'PATCH',
                body: JSON.stringify({ reason: reason || 'Rejected by admin' })
              });
              
              if (result.success) {
                Alert.alert('Success', 'Provider rejected successfully');
                fetchUsers();
              } else {
                Alert.alert('Error', result.message || 'Failed to reject provider');
              }
            } catch (error) {
              console.error('Reject provider error:', error);
              Alert.alert('Error', 'Failed to reject provider');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleUserAction = async (userId, action) => {
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS_STATUS.replace(':userId', userId)), {
        method: 'PATCH',
        body: JSON.stringify({ status: action })
      });
      
      if (result.success) {
        Alert.alert('Success', `User ${action} successful`);
        fetchUsers();
      } else {
        Alert.alert('Error', result.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error('User action error:', error);
      Alert.alert('Error', `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiCall(getApiUrlWithParams(API_CONFIG.ENDPOINTS.ADMIN_USERS_DELETE, { id: userId }), {
                method: 'DELETE'
              });
              
              if (result.success) {
                Alert.alert('Success', 'User deleted successfully');
                fetchUsers();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Delete user error:', error);
              Alert.alert('Error', 'Failed to delete user');
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
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      case 'suspended':
        return '#8B5CF6';
      case 'rejected':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'provider':
        return '#3B82F6';
      case 'customer':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // For providers, check approvalStatus instead of status for pending
    let matchesStatus = true;
    if (selectedStatus !== 'all') {
      if (user.role === 'provider' && selectedStatus === 'pending') {
        matchesStatus = user.approvalStatus === 'pending';
      } else {
        matchesStatus = user.status === selectedStatus;
      }
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const fadeAnims = useMemo(() => filteredUsers.map(() => new Animated.Value(0)), [filteredUsers.length]);
  const slideAnims = useMemo(() => filteredUsers.map(() => new Animated.Value(20)), [filteredUsers.length]);

  useEffect(() => {
    filteredUsers.forEach((_, idx) => {
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
    // Only run on mount or when filteredUsers changes length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsers.length]);

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
            Loading users...
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
          User Management
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Search and Filters */}
        <View style={{ padding: 24 }}>
          {/* Search Input with Icon */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 16,
            marginBottom: 18,
            height: 44,
          }}>
            <Ionicons name="search" size={20} color={theme.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 16,
                backgroundColor: 'transparent',
                paddingVertical: 0,
              }}
              placeholder="Search users by name or email..."
              placeholderTextColor={theme.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              underlineColorAndroid="transparent"
            />
          </View>

          {/* Filter Buttons */}
          <View style={{ marginBottom: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { key: 'all', label: `All (${users.length})` },
                { key: 'customer', label: `Customers (${users.filter(u => u.role === 'customer').length})` },
                { key: 'provider', label: `Providers (${users.filter(u => u.role === 'provider').length})` },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={{
                    backgroundColor: selectedRole === item.key ? theme.primary : theme.card,
                    borderRadius: 20,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selectedRole === item.key ? theme.primary : theme.border,
                    minWidth: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setSelectedRole(item.key)}
                >
                  <Text style={{
                    color: selectedRole === item.key ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Pending Providers Section */}
          {(selectedRole === 'all' || selectedRole === 'provider') && pendingProviders.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 15,
                color: theme.textDark,
                fontFamily: Fonts.subheading,
                marginBottom: 10,
                marginLeft: 2,
              }}>
                Pending Approvals ({pendingProviders.length})
              </Text>
              {pendingProviders.map((user) => (
                <View
                  key={user._id}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 48,
                    maxWidth: '100%',
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: theme.textDark,
                      fontFamily: Fonts.heading,
                      marginBottom: 1,
                      flexShrink: 1,
                    }} numberOfLines={1}>{user.name}</Text>
                    <Text style={{
                      fontSize: 12,
                      color: theme.textLight,
                      fontFamily: Fonts.body,
                      marginBottom: 1,
                      flexShrink: 1,
                    }} numberOfLines={1}>{user.email}</Text>
                    <Text style={{
                      fontSize: 10,
                      color: theme.textLight,
                      fontFamily: Fonts.body,
                      flexShrink: 1,
                    }} numberOfLines={1}>{user.city} • {formatDate(user.createdAt)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 60, marginLeft: 8 }}>
                    
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, marginLeft: 8 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#10B981',
                        minWidth: 48,
                      }}
                      activeOpacity={0.8}
                      onPress={() => handleApproveProvider(user._id, user.name)}
                    >
                      <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 11 }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#EF4444',
                        minWidth: 48,
                      }}
                      activeOpacity={0.8}
                      onPress={() => handleRejectProvider(user._id, user.name)}
                    >
                      <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 11 }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* All Users Section */}
          <View>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.textDark,
              fontFamily: Fonts.subheading,
              marginBottom: 12
            }}>
              All Users ({filteredUsers.length})
            </Text>
            
            {filteredUsers.map((user, idx) => {
              return (
                <Animated.View
                  key={user._id}
                  style={{
                    opacity: fadeAnims[idx],
                    transform: [{ translateY: slideAnims[idx] }],
                    marginBottom: 14,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setActiveUserId(activeUserId === user._id ? null : user._id)}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 14,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: theme.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 70,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.textDark,
                        fontFamily: Fonts.heading,
                        marginBottom: 1,
                      }}>{user.name}</Text>
                      <Text style={{
                        fontSize: 13,
                        color: theme.textLight,
                        fontFamily: Fonts.body,
                        marginBottom: 1,
                      }}>{user.email}</Text>
                      <Text style={{
                        fontSize: 11,
                        color: theme.textLight,
                        fontFamily: Fonts.body,
                      }}>{user.city} • {formatDate(user.createdAt)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                      <View style={{
                        backgroundColor: getRoleColor(user.role),
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
                        }}>{user.role}</Text>
                      </View>
                      <View style={{
                        backgroundColor: getStatusColor(user.status),
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
                        }}>{user.status}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {/* Minimalist Actions, only show on card press */}
                  {user.role !== 'admin' && activeUserId === user._id && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 2 }}>
                      {user.status === 'active' ? (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: 20,
                            paddingVertical: 8,
                            flex: 1,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#F59E0B',
                          }}
                          activeOpacity={0.8}
                          onPress={() => handleUserAction(user._id, 'inactive')}
                        >
                          <Text style={{ color: '#F59E0B', fontWeight: '700', fontSize: 13 }}>Deactivate</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: 20,
                            paddingVertical: 8,
                            flex: 1,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#10B981',
                          }}
                          activeOpacity={0.8}
                          onPress={() => handleUserAction(user._id, 'active')}
                        >
                          <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>Activate</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderRadius: 20,
                          paddingVertical: 8,
                          flex: 1,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#EF4444',
                        }}
                        activeOpacity={0.8}
                        onPress={() => handleDeleteUser(user._id, user.name)}
                      >
                        <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 13 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              );
            })}

            {filteredUsers.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{
                  fontSize: 16,
                  color: theme.textLight,
                  fontFamily: Fonts.body,
                }}>
                  No users found
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
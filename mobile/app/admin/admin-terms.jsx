import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, getApiUrl, getApiUrlWithParams, API_CONFIG } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminTerms = () => {
  const { isDarkMode, theme } = useTheme();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTerms, setEditingTerms] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    userType: 'customer',
    version: '1.0'
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.TERMS_ADMIN_ALL));
      
      if (response.success) {
        setTerms(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch terms');
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      Alert.alert('Error', 'Failed to fetch terms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTerms();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      userType: 'customer',
      version: '1.0'
    });
    setEditingTerms(null);
  };

  const openModal = (termsData = null) => {
    if (termsData) {
      setEditingTerms(termsData);
      setFormData({
        title: termsData.title,
        content: termsData.content,
        userType: termsData.userType,
        version: termsData.version
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let response;
      
      if (editingTerms) {
        // Update existing terms
        response = await apiCall(
          getApiUrlWithParams(API_CONFIG.ENDPOINTS.TERMS_ADMIN_UPDATE, { id: editingTerms._id }),
          {
            method: 'PUT',
            body: JSON.stringify(formData)
          }
        );
      } else {
        // Create new terms
        response = await apiCall(
          getApiUrl(API_CONFIG.ENDPOINTS.TERMS_ADMIN_CREATE),
          {
            method: 'POST',
            body: JSON.stringify(formData)
          }
        );
      }

      if (response.success) {
        Alert.alert(
          'Success', 
          editingTerms ? 'Terms updated successfully' : 'Terms created successfully',
          [{ text: 'OK', onPress: () => {
            closeModal();
            fetchTerms();
          }}]
        );
      } else {
        Alert.alert('Error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving terms:', error);
      Alert.alert('Error', 'Failed to save terms');
    }
  };

  const handleDelete = (termsId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete these terms? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(
                getApiUrlWithParams(API_CONFIG.ENDPOINTS.TERMS_ADMIN_DELETE, { id: termsId }),
                { method: 'DELETE' }
              );

              if (response.success) {
                Alert.alert('Success', 'Terms deleted successfully');
                fetchTerms();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete terms');
              }
            } catch (error) {
              console.error('Error deleting terms:', error);
              Alert.alert('Error', 'Failed to delete terms');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#10B981' : '#6B7280';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.text }}>Loading terms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.text
        }}>
          Terms & Conditions
        </Text>
        <TouchableOpacity
          onPress={() => openModal()}
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={{ color: 'white', marginLeft: 5, fontWeight: '600' }}>
            Add New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 20 }}>
          {terms.length === 0 ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 50
            }}>
              <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
              <Text style={{
                fontSize: 18,
                color: theme.textSecondary,
                marginTop: 16,
                textAlign: 'center'
              }}>
                No terms and conditions found
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginTop: 8,
                textAlign: 'center'
              }}>
                Create your first terms and conditions
              </Text>
            </View>
          ) : (
            terms.map((term) => (
              <View
                key={term._id}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: theme.text,
                      marginBottom: 4
                    }}>
                      {term.title}
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <View style={{
                        backgroundColor: term.userType === 'customer' ? '#3B82F6' : '#F59E0B',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12
                      }}>
                        <Text style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {term.userType}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: getStatusColor(term.isActive),
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12,
                        marginLeft: 8
                      }}>
                        <Text style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          {getStatusText(term.isActive)}
                        </Text>
                      </View>
                      <Text style={{
                        color: theme.textSecondary,
                        fontSize: 12,
                        marginLeft: 8
                      }}>
                        v{term.version}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => openModal(term)}
                      style={{
                        padding: 8,
                        marginRight: 8
                      }}
                    >
                      <Ionicons name="pencil" size={20} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(term._id)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  lineHeight: 20,
                  marginBottom: 12
                }} numberOfLines={3}>
                  {term.content}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: 12
                  }}>
                    Created: {formatDate(term.createdAt)}
                  </Text>
                  {term.updatedAt !== term.createdAt && (
                    <Text style={{
                      color: theme.textSecondary,
                      fontSize: 12
                    }}>
                      Updated: {formatDate(term.updatedAt)}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal for Add/Edit Terms */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            maxHeight: '80%'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text
              }}>
                {editingTerms ? 'Edit Terms' : 'Add New Terms'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                marginBottom: 8
              }}>
                Title *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 8,
                  padding: 12,
                  color: theme.text,
                  backgroundColor: theme.background,
                  marginBottom: 16
                }}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter terms title"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                marginBottom: 8
              }}>
                User Type *
              </Text>
              <View style={{
                flexDirection: 'row',
                marginBottom: 16
              }}>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, userType: 'customer' })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: formData.userType === 'customer' ? theme.primary : theme.border,
                    backgroundColor: formData.userType === 'customer' ? theme.primary + '20' : theme.background,
                    marginRight: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    color: formData.userType === 'customer' ? theme.primary : theme.text,
                    fontWeight: '600'
                  }}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, userType: 'provider' })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: formData.userType === 'provider' ? theme.primary : theme.border,
                    backgroundColor: formData.userType === 'provider' ? theme.primary + '20' : theme.background,
                    marginLeft: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    color: formData.userType === 'provider' ? theme.primary : theme.text,
                    fontWeight: '600'
                  }}>
                    Provider
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                marginBottom: 8
              }}>
                Version
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 8,
                  padding: 12,
                  color: theme.text,
                  backgroundColor: theme.background,
                  marginBottom: 16
                }}
                value={formData.version}
                onChangeText={(text) => setFormData({ ...formData, version: text })}
                placeholder="e.g., 1.0, 2.1"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.text,
                marginBottom: 8
              }}>
                Content *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 8,
                  padding: 12,
                  color: theme.text,
                  backgroundColor: theme.background,
                  height: 200,
                  textAlignVertical: 'top',
                  marginBottom: 20
                }}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Enter terms and conditions content..."
                placeholderTextColor={theme.textSecondary}
                multiline
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    marginRight: 8
                  }}
                >
                  <Text style={{
                    textAlign: 'center',
                    color: theme.text,
                    fontWeight: '600'
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                    marginLeft: 8
                  }}
                >
                  <Text style={{
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {editingTerms ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminTerms; 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors, Fonts } from '../../Color/Color';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReviews() {
  const { theme, isDarkMode } = useTheme();
  const [pendingResponses, setPendingResponses] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [moderationModalVisible, setModerationModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPendingResponses(), fetchAllResponses()]);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingResponses = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_REVIEW_RESPONSES_PENDING);
      const data = await apiCall(url);
      if (data.success) {
        setPendingResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Fetch pending responses error:', error);
    }
  };

  const fetchAllResponses = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_REVIEW_RESPONSES);
      const data = await apiCall(url);
      if (data.success) {
        setAllResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Fetch all responses error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openModerationModal = (response, action) => {
    setSelectedResponse(response);
    if (action === 'reject') {
      setModerationModalVisible(true);
      setRejectionReason('');
    } else {
      moderateResponse(action);
    }
  };

  const closeModerationModal = () => {
    setModerationModalVisible(false);
    setSelectedResponse(null);
    setRejectionReason('');
  };

  const moderateResponse = async (action) => {
    if (!selectedResponse) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setModerating(true);
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.ADMIN_REVIEW_RESPONSES_MODERATE, {
        reviewId: selectedResponse._id
      });

      const body = { action };
      if (action === 'reject') {
        body.rejectionReason = rejectionReason.trim();
      }

      const response = await apiCall(url, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      if (response.success) {
        Alert.alert(
          'Success',
          `Response ${action}d successfully`,
          [{ text: 'OK', onPress: () => {
            closeModerationModal();
            fetchData(); // Refresh data
          }}]
        );
      }
    } catch (error) {
      console.error('Moderate response error:', error);
      Alert.alert('Error', error.message || 'Failed to moderate response');
    } finally {
      setModerating(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#FFD700' : theme.textLight}
        />
      );
    }
    return stars;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28A745';
      case 'rejected': return '#DC3545';
      case 'pending': return '#FFA500';
      default: return theme.textLight;
    }
  };

  const renderResponseCard = (response) => (
    <View key={response._id} style={{
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.textDark,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4
    }}>
      {/* Response Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: theme.textDark, 
              fontFamily: Fonts.subheading 
            }}>
              {response.provider?.name || 'Provider'}
            </Text>
            <View style={{
              backgroundColor: getStatusColor(response.moderationStatus) + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginLeft: 12
            }}>
              <Text style={{
                color: getStatusColor(response.moderationStatus),
                fontSize: 12,
                fontWeight: '600',
                fontFamily: Fonts.caption
              }}>
                {response.moderationStatus.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 12 }}>
            Response submitted on {new Date(response.responseDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Original Review */}
      <View style={{
        backgroundColor: theme.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 13 }}>
            Original Review by {response.customer?.name || 'Customer'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {renderStars(response.rating)}
          <Text style={{ 
            fontSize: 14, 
            fontWeight: 'bold', 
            color: theme.primary, 
            fontFamily: Fonts.subheading, 
            marginLeft: 8 
          }}>
            {response.rating}/5
          </Text>
        </View>
        <Text style={{ 
          color: theme.textDark, 
          fontFamily: Fonts.body, 
          fontSize: 15,
          lineHeight: 22 
        }}>
          {response.reviewText}
        </Text>
        {response.service?.title && (
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption, 
            fontSize: 12, 
            marginTop: 8 
          }}>
            Service: {response.service.title}
          </Text>
        )}
      </View>

      {/* Provider Response */}
      <View style={{
        backgroundColor: theme.primary + '10',
        borderLeftWidth: 4,
        borderLeftColor: theme.primary,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="chatbubble" size={16} color={theme.primary} />
          <Text style={{ 
            color: theme.primary, 
            fontFamily: Fonts.subheading, 
            fontSize: 14, 
            fontWeight: '600',
            marginLeft: 6 
          }}>
            Provider Response
          </Text>
        </View>
        <Text style={{ 
          color: theme.textDark, 
          fontFamily: Fonts.body, 
          fontSize: 15,
          lineHeight: 22 
        }}>
          {response.providerResponse}
        </Text>
      </View>

      {/* Moderation Info */}
      {response.moderationStatus !== 'pending' && (
        <View style={{
          backgroundColor: theme.background,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}>
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption, 
            fontSize: 13 
          }}>
            Moderated by {response.moderatedBy?.name || 'Admin'} on{' '}
            {response.moderationDate ? new Date(response.moderationDate).toLocaleDateString() : 'N/A'}
          </Text>
          {response.rejectionReason && (
            <Text style={{ 
              color: '#DC3545', 
              fontFamily: Fonts.body, 
              fontSize: 14, 
              marginTop: 6 
            }}>
              Rejection Reason: {response.rejectionReason}
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons for Pending Responses */}
      {response.moderationStatus === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#28A745',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center'
            }}
            onPress={() => {
              setSelectedResponse(response);
              moderateResponse('approve');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={{ 
                color: 'white', 
                fontFamily: Fonts.subheading, 
                fontSize: 14, 
                fontWeight: '600',
                marginLeft: 6
              }}>
                Approve
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#DC3545',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center'
            }}
            onPress={() => openModerationModal(response, 'reject')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="close" size={16} color="white" />
              <Text style={{ 
                color: 'white', 
                fontFamily: Fonts.subheading, 
                fontSize: 14, 
                fontWeight: '600',
                marginLeft: 6
              }}>
                Reject
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const currentData = activeTab === 'pending' ? pendingResponses : allResponses;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
        paddingBottom: 25,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          color: theme.textDark, 
          fontFamily: Fonts.heading,
          marginBottom: 20
        }}>
          Review Response Moderation
        </Text>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: theme.background, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: activeTab === 'pending' ? theme.primary : 'transparent',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center'
            }}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={{
              color: activeTab === 'pending' ? 'white' : theme.textLight,
              fontFamily: Fonts.subheading,
              fontSize: 14,
              fontWeight: '600'
            }}>
              Pending ({pendingResponses.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: activeTab === 'all' ? theme.primary : 'transparent',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center'
            }}
            onPress={() => setActiveTab('all')}
          >
            <Text style={{
              color: activeTab === 'all' ? 'white' : theme.textLight,
              fontFamily: Fonts.subheading,
              fontSize: 14,
              fontWeight: '600'
            }}>
              All Responses ({allResponses.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.textLight, fontFamily: Fonts.body }}>
            Loading responses...
          </Text>
        </View>
      ) : currentData.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons 
            name={activeTab === 'pending' ? 'time-outline' : 'chatbubbles-outline'} 
            size={64} 
            color={theme.textLight} 
          />
          <Text style={{ 
            fontSize: 18, 
            color: theme.textLight, 
            fontFamily: Fonts.body, 
            marginTop: 16, 
            textAlign: 'center' 
          }}>
            {activeTab === 'pending' ? 'No pending responses' : 'No responses found'}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: theme.textLight, 
            fontFamily: Fonts.caption, 
            marginTop: 8, 
            textAlign: 'center' 
          }}>
            {activeTab === 'pending' 
              ? 'Provider responses will appear here when they need moderation'
              : 'All provider responses will appear here once they submit responses'
            }
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {currentData.map(renderResponseCard)}
        </ScrollView>
      )}

      {/* Rejection Modal */}
      <Modal
        visible={moderationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModerationModal}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center',
          padding: 24
        }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 16, 
            padding: 24
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.textDark, 
              fontFamily: Fonts.heading,
              marginBottom: 16
            }}>
              Reject Response
            </Text>

            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.body, 
              fontSize: 14,
              marginBottom: 16
            }}>
              Please provide a reason for rejecting this response:
            </Text>

            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 12,
                padding: 16,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 15,
                textAlignVertical: 'top',
                minHeight: 100,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 20
              }}
              placeholder="Enter rejection reason..."
              placeholderTextColor={theme.textLight}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              maxLength={200}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.textLight,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
                onPress={closeModerationModal}
                disabled={moderating}
              >
                <Text style={{ 
                  color: 'white', 
                  fontFamily: Fonts.subheading, 
                  fontSize: 14, 
                  fontWeight: '600'
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#DC3545',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: moderating ? 0.7 : 1
                }}
                onPress={() => moderateResponse('reject')}
                disabled={moderating}
              >
                {moderating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ 
                    color: 'white', 
                    fontFamily: Fonts.subheading, 
                    fontSize: 14, 
                    fontWeight: '600'
                  }}>
                    Reject Response
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 
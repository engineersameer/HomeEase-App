import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors, Fonts } from '../../Color/Color';
import { useEffect, useState } from 'react';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProviderReviews() {
  const { theme, isDarkMode } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_REVIEWS);
    const data = await apiCall(url);
    if (data.success && data.reviews) {
      setReviews(data.reviews);
    } else {
      setReviews([]);
    }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      Alert.alert('Error', 'Failed to fetch reviews');
    } finally {
    setLoading(false);
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setReplyModalVisible(true);
  };

  const closeReplyModal = () => {
    setReplyModalVisible(false);
    setSelectedReview(null);
    setReplyText('');
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    setSubmittingReply(true);
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.PROVIDER_REVIEW_RESPONSE, { 
        reviewId: selectedReview._id 
      });
      
      const response = await apiCall(url, {
        method: 'POST',
        body: JSON.stringify({ response: replyText.trim() })
      });

      if (response.success) {
        Alert.alert(
          'Success', 
          'Your response has been submitted and will be reviewed by admin before being published.',
          [{ text: 'OK', onPress: () => {
            closeReplyModal();
            fetchReviews(); // Refresh reviews
          }}]
        );
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      Alert.alert('Error', error.message || 'Failed to submit response');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getResponseStatus = (review) => {
    if (!review.providerResponse) return null;
    
    switch (review.moderationStatus) {
      case 'pending':
        return { text: 'Response pending review', color: '#FFA500', icon: 'time' };
      case 'approved':
        return { text: 'Response published', color: '#28A745', icon: 'checkmark-circle' };
      case 'rejected':
        return { text: 'Response rejected', color: '#DC3545', icon: 'close-circle' };
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : theme.textLight}
        />
      );
    }
    return stars;
  };

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Customer Reviews
        </Text>
        <TouchableOpacity onPress={fetchReviews}>
          <Ionicons name="refresh" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.textLight, fontFamily: Fonts.body }}>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="star-outline" size={64} color={theme.textLight} />
          <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body, marginTop: 16, textAlign: 'center' }}>
            No reviews yet.
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.caption, marginTop: 8, textAlign: 'center' }}>
            Reviews from customers will appear here once you complete some services.
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          {reviews.map((review, idx) => {
            const responseStatus = getResponseStatus(review);
            return (
              <View key={review._id || idx} style={{ 
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
                {/* Review Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      {renderStars(review.rating)}
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.subheading, marginLeft: 8 }}>
                        {review.rating}/5
                      </Text>
                    </View>
                    <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 14 }}>
                      by {review.customer?.name || 'Anonymous Customer'}
                    </Text>
                    <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 12, marginTop: 2 }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>

                {/* Review Text */}
                <Text style={{ 
                  color: theme.textDark, 
                  fontFamily: Fonts.body, 
                  fontSize: 16, 
                  lineHeight: 24,
                  marginBottom: 16 
                }}>
                  {review.reviewText}
                </Text>

                {/* Service Info */}
                {review.booking?.serviceName && (
                  <View style={{ 
                    backgroundColor: theme.background, 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 16 
                  }}>
                    <Text style={{ 
                      color: theme.textLight, 
                      fontFamily: Fonts.caption, 
                      fontSize: 13 
                    }}>
                      Service: {review.booking.serviceName}
                    </Text>
                  </View>
                )}

                {/* Provider Response Section */}
                {review.providerResponse && review.moderationStatus === 'approved' && (
                  <View style={{ 
                    backgroundColor: theme.background, 
                    borderLeftWidth: 4, 
                    borderLeftColor: theme.primary, 
                    padding: 12, 
                    marginBottom: 12,
                    borderRadius: 8 
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="person-circle" size={16} color={theme.primary} />
                      <Text style={{ 
                        color: theme.primary, 
                        fontFamily: Fonts.subheading, 
                        fontSize: 14, 
                        fontWeight: '600',
                        marginLeft: 6 
                      }}>
                        Your Response
                      </Text>
                    </View>
                    <Text style={{ 
                      color: theme.textDark, 
                      fontFamily: Fonts.body, 
                      fontSize: 15,
                      lineHeight: 22 
                    }}>
                      {review.providerResponse}
                    </Text>
                    {review.responseDate && (
                      <Text style={{ 
                        color: theme.textLight, 
                        fontFamily: Fonts.caption, 
                        fontSize: 12, 
                        marginTop: 6 
                      }}>
                        Responded on {new Date(review.responseDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}

                {/* Response Status */}
                {responseStatus && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: `${responseStatus.color}15`, 
                    padding: 10, 
                    borderRadius: 8, 
                    marginBottom: 12 
                  }}>
                    <Ionicons name={responseStatus.icon} size={16} color={responseStatus.color} />
                    <Text style={{ 
                      color: responseStatus.color, 
                      fontFamily: Fonts.caption, 
                      fontSize: 13, 
                      marginLeft: 6,
                      fontWeight: '500'
                    }}>
                      {responseStatus.text}
                    </Text>
                  </View>
                )}

                {/* Reply Button */}
                {!review.providerResponse && (
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: theme.primary, 
                      borderRadius: 12, 
                      paddingVertical: 12, 
                      paddingHorizontal: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onPress={() => openReplyModal(review)}
                  >
                    <Ionicons name="chatbubble" size={16} color="white" />
                    <Text style={{ 
                      color: 'white', 
                      fontFamily: Fonts.subheading, 
                      fontSize: 15, 
                      fontWeight: '600',
                      marginLeft: 8
                    }}>
                      Reply to Review
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeReplyModal}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'flex-end' 
        }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24,
            maxHeight: '80%'
          }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: theme.textDark, 
                fontFamily: Fonts.heading 
              }}>
                Reply to Review
              </Text>
              <TouchableOpacity onPress={closeReplyModal}>
                <Ionicons name="close" size={24} color={theme.textDark} />
              </TouchableOpacity>
            </View>

            {/* Original Review */}
            {selectedReview && (
              <View style={{ 
                backgroundColor: theme.background, 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 20 
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {renderStars(selectedReview.rating)}
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: theme.primary, 
                    fontFamily: Fonts.subheading, 
                    marginLeft: 8 
                  }}>
                    {selectedReview.rating}/5
                  </Text>
                </View>
                <Text style={{ 
                  color: theme.textDark, 
                  fontFamily: Fonts.body, 
                  fontSize: 15,
                  lineHeight: 22 
                }}>
                  {selectedReview.reviewText}
                </Text>
                <Text style={{ 
                  color: theme.textLight, 
                  fontFamily: Fonts.caption, 
                  fontSize: 12, 
                  marginTop: 8 
                }}>
                  - {selectedReview.customer?.name || 'Anonymous Customer'}
                </Text>
              </View>
            )}

            {/* Reply Input */}
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: theme.textDark, 
              fontFamily: Fonts.subheading, 
              marginBottom: 12 
            }}>
              Your Response
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
                minHeight: 120,
                maxHeight: 200,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              placeholder="Write a professional response to address the customer's feedback..."
              placeholderTextColor={theme.textLight}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            
            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.caption, 
              fontSize: 12, 
              textAlign: 'right', 
              marginTop: 8 
            }}>
              {replyText.length}/500 characters
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                paddingVertical: 16,
                marginTop: 20,
                opacity: submittingReply ? 0.7 : 1
              }}
              onPress={submitReply}
              disabled={submittingReply}
            >
              {submittingReply ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={{ 
                    color: 'white', 
                    fontFamily: Fonts.subheading, 
                    fontSize: 16, 
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    Submitting...
              </Text>
                </View>
              ) : (
                <Text style={{ 
                  color: 'white', 
                  fontFamily: Fonts.subheading, 
                  fontSize: 16, 
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Submit Response
                </Text>
              )}
            </TouchableOpacity>

            <Text style={{ 
              color: theme.textLight, 
              fontFamily: Fonts.caption, 
              fontSize: 12, 
              textAlign: 'center', 
              marginTop: 12,
              lineHeight: 16
            }}>
              Your response will be reviewed by admin before being published to ensure professionalism.
              </Text>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 
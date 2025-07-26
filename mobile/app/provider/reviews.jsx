import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { useEffect, useState } from 'react';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';

export default function ProviderReviews() {
  const { theme, isDarkMode } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const url = getApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_REVIEWS);
    const data = await apiCall(url);
    if (data.success && data.reviews) {
      setReviews(data.reviews);
    } else {
      setReviews([]);
    }
    setLoading(false);
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
          Reviews
        </Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: theme.textLight, fontFamily: Fonts.body }}>
            No reviews yet.
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {reviews.map((review, idx) => (
            <View key={review._id || idx} style={{ backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border, shadowColor: theme.textDark, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary, fontFamily: Fonts.subheading, marginRight: 8 }}>
                  {review.rating} / 5
                </Text>
                <Text style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
                  {review.customer?.name ? `by ${review.customer.name}` : ''}
                </Text>
              </View>
              <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 16, marginBottom: 6 }}>
                {review.reviewText}
              </Text>
              {review.booking?.serviceName && (
                <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 13 }}>
                  Service: {review.booking.serviceName}
                </Text>
              )}
              <Text style={{ color: theme.textLight, fontFamily: Fonts.caption, fontSize: 12, marginTop: 4 }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 
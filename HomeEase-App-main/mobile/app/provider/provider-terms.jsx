import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, getApiUrl, API_CONFIG } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const ProviderTerms = () => {
  const { isDarkMode, theme } = useTheme();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.TERMS_ACTIVE));
      
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
      }}>
        <Ionicons name="document-text" size={24} color={theme.primary} />
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.text,
          marginLeft: 12
        }}>
          Terms & Conditions
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 20 }}>
          {!terms ? (
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
                No terms and conditions available
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginTop: 8,
                textAlign: 'center'
              }}>
                Please contact support if you need assistance
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              {/* Header Info */}
              <View style={{
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.border
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: theme.text,
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  {terms.title}
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <View style={{
                    backgroundColor: '#F59E0B',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 16
                  }}>
                    <Text style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      Provider Terms
                    </Text>
                  </View>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginLeft: 12
                  }}>
                    Version {terms.version}
                  </Text>
                </View>

                <Text style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  textAlign: 'center'
                }}>
                  Last updated: {formatDate(terms.updatedAt)}
                </Text>
              </View>

              {/* Terms Content */}
              <View>
                <Text style={{
                  fontSize: 16,
                  color: theme.text,
                  lineHeight: 24,
                  textAlign: 'justify'
                }}>
                  {terms.content}
                </Text>
              </View>

              {/* Footer */}
              <View style={{
                marginTop: 24,
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                alignItems: 'center'
              }}>
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  textAlign: 'center'
                }}>
                  By providing services through our platform, you agree to these terms and conditions.
                </Text>
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  For questions about these terms, please contact our support team.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderTerms; 
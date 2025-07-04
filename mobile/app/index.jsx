import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../Color/Color';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = Colors.light;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{
          paddingTop: 80,
          paddingBottom: 60,
          paddingHorizontal: 32,
          alignItems: 'center',
        }}>
          <Image
            source={require('../assets/logo.png')}
            style={{ 
              width: 120, 
              height: 120, 
              marginBottom: 32,
              borderRadius: 60,
            }}
            resizeMode="contain"
          />
          
          <Text style={{ 
            fontSize: 32,
            fontWeight: '700',
            color: theme.textDark,
            fontFamily: Fonts.heading,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: -0.5,
          }}>
            Welcome to HomeEase
          </Text>
          
          <Text style={{ 
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 280,
          }}>
            Your trusted platform for home services
          </Text>
        </View>

        {/* Options Section */}
        <View style={{ paddingHorizontal: 32, flex: 1 }}>
          {/* Continue as Seller */}
          <TouchableOpacity
            onPress={() => router.push('/seller-signup')}
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#EEF2FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 24 }}>🛠️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.textDark,
                  fontFamily: Fonts.subheading,
                  marginBottom: 4,
                }}>
                  Continue as Seller
                </Text>
                <Text style={{ 
                  fontSize: 14,
                  color: theme.textLight,
                  fontFamily: Fonts.body,
                }}>
                  Offer your services
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Continue as Customer */}
          <TouchableOpacity
            onPress={() => router.push('/customer-signup')}
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#F0FDF4',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.textDark,
                  fontFamily: Fonts.subheading,
                  marginBottom: 4,
                }}>
                  Continue as Customer
                </Text>
                <Text style={{ 
                  fontSize: 14,
                  color: theme.textLight,
                  fontFamily: Fonts.body,
                }}>
                  Find and book services
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={() => router.push('/customer/service-search')}
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#FEF3C7',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 24 }}>👁️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.textDark,
                  fontFamily: Fonts.subheading,
                  marginBottom: 4,
                }}>
                  Continue as Guest
                </Text>
                <Text style={{ 
                  fontSize: 14,
                  color: theme.textLight,
                  fontFamily: Fonts.body,
                }}>
                  Browse without signing up
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign In Section */}
        <View style={{ 
          paddingHorizontal: 32,
          paddingTop: 20,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}>
          <Text style={{ 
            fontSize: 16,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            marginBottom: 24,
          }}>
            Already have an account?
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <TouchableOpacity 
              onPress={() => router.push('/provider-signin')}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: theme.accent,
                borderWidth: 1,
                borderColor: theme.accent,
              }}
            >
              <Text style={{ 
                fontSize: 14,
                fontWeight: '500',
                color: '#fff',
                fontFamily: Fonts.body,
                textAlign: 'center'
              }}>
                Seller Sign In
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/customer-signin')}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: theme.primary,
                borderWidth: 1,
                borderColor: theme.primary,
              }}
            >
              <Text style={{ 
                fontSize: 14,
                fontWeight: '500',
                color: '#fff',
                fontFamily: Fonts.body,
                textAlign: 'center'
              }}>
                Customer Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StatusBar,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../Color/Color';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = Colors.light;
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Title animation
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Subtitle animation
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 800,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          delay: 700,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 800,
          delay: 700,
          useNativeDriver: true,
        }),
      ]).start();
    };

    startAnimations();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{
          paddingTop: 80,
          paddingBottom: 40,
          alignItems: 'center',
        }}>
          {/* Animated Logo */}
          <Animated.View style={{
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
            marginBottom: 30,
          }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}>
              <Image
                source={require('../assets/logo.png')}
                style={{ 
                  width: 80, 
                  height: 80,
                  borderRadius: 40,
                }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Animated Title */}
          <Animated.View style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}>
            <Text style={{ 
              fontSize: 28,
              fontWeight: '600',
              color: '#2c3e50',
              fontFamily: Fonts.heading,
              textAlign: 'center',
              marginBottom: 12,
              letterSpacing: -0.5,
            }}>
              Welcome to HomeEase
            </Text>
          </Animated.View>

          {/* Animated Subtitle */}
          <Animated.View style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}>
            <Text style={{ 
              fontSize: 16,
              color: '#7f8c8d',
              fontFamily: Fonts.body,
              textAlign: 'center',
              lineHeight: 24,
              maxWidth: 280,
              fontWeight: '400',
            }}>
              Your trusted platform for home services
            </Text>
          </Animated.View>
        </View>

        {/* Animated Buttons Section */}
        <Animated.View style={{
          width: '100%',
          alignItems: 'center',
          paddingHorizontal: 32,
          opacity: buttonOpacity,
          transform: [{ translateY: buttonTranslateY }],
        }}>
          {/* Customer Button */}
          <TouchableOpacity
            onPress={() => router.push('/customer-signup')}
            style={{
              width: '100%',
              backgroundColor: '#3498db',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: '#3498db',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#fff',
              textAlign: 'center',
              fontFamily: Fonts.subheading,
            }}>
              Continue as Customer
            </Text>
          </TouchableOpacity>

          {/* Admin Button */}
          <TouchableOpacity
            onPress={() => router.push('/admin-signin')}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e1e8ed',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 15,
              fontWeight: '500',
              color: '#2c3e50',
              textAlign: 'center',
              fontFamily: Fonts.body,
            }}>
              Admin Access
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => router.push('/customer-signin')}
            style={{ paddingVertical: 8 }}
          >
            <Text style={{
              fontSize: 14,
              color: '#7f8c8d',
              fontFamily: Fonts.body,
              textDecorationLine: 'underline',
            }}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../Color/Color';
import Button from './shared/Button';


const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = Colors.light;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center' }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ 
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{
          paddingTop: 100,
          paddingBottom: 20,
          alignItems: 'center',
        }}>
          <Image
            source={require('../assets/logo.png')}
            style={{ 
              width: 400, 
              height: 400, 
              marginBottom: 10,
              borderRadius: 200,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 28,
            fontWeight: '400',
            color: theme.textDark,
            fontFamily: Fonts.heading,
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: -0.5,
          }}>
            Welcome to HomeEase
          </Text>
          <Text style={{ 
            fontSize: 15,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
            fontWeight: '300',
          }}>
            Your trusted platform for home services
          </Text>
        </View>

        {/* Options Section */}
        <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 0 }}>
          <Button
            title="Continue as Seller"
            onPress={() => router.push('/seller-signup')}
            variant="primary"
            style={{ width: 260, marginBottom: 12 }}
          />
          <Button
            title="Continue as Customer"
            onPress={() => router.push('/customer-signup')}
            variant="accent"
            style={{ width: 260, marginBottom: 12 }}
          />
          <Button
            title="Continue as Guest"
            onPress={() => router.push('/customer/service-search')}
            variant="card"
            textStyle={{ color: theme.textDark }}
            style={{ width: 260, marginBottom: 0 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

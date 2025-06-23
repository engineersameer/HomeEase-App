import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../Color/Color';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = Colors.dark;

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 340, height: 340, marginBottom: 24 }}
        resizeMode="contain"
      />

      <Text className="text-2xl mb-2" style={{ color: theme.textDark, fontFamily: Fonts.heading }}>
        Welcome to HomeEase
      </Text>

      <Text className="text-base text-center mb-10" style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
        Your one-stop solution for trusted home services.
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/signup')}
        className="w-full py-3 rounded-lg mb-4"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-center text-lg" style={{ color: '#fff', fontFamily: Fonts.body }}>
          Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/signin')}
        className="w-full py-3 rounded-lg mb-4"
        style={{ borderWidth: 1, borderColor: theme.accent }}
      >
        <Text className="text-center text-lg" style={{ color: theme.accent, fontFamily: Fonts.body }}>
          Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/home')}
        className="w-full py-3 rounded-lg"
        style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
      >
        <Text className="text-center text-base" style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
          Continue as Guest
        </Text>
      </TouchableOpacity>
    </View>
  );
}

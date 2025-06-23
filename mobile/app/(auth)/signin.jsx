import React, { useState } from 'react';
import { View,Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';
import { useRouter } from 'expo-router';

export default function Signin() {
  const router = useRouter();
  const theme = Colors.dark;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center px-6" style={{ backgroundColor: theme.background }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 240, height: 240, marginBottom: 24, marginLeft:30 }}
        resizeMode="contain"
      />
      <Text className="text-2xl mb-6 text-center" style={{ color: theme.textDark, fontFamily: Fonts.heading }}>
        Sign In to HomeEase
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textLight}
        value={email}
        onChangeText={setEmail}
        className="w-full mb-4 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: theme.card,
          color: theme.textDark,
          fontFamily: Fonts.body,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full mb-6 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: theme.card,
          color: theme.textDark,
          fontFamily: Fonts.body,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      />

      <TouchableOpacity
        onPress={() => router.push('/home')}
        className="w-full py-3 rounded-lg mb-4"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-center text-lg" style={{ color: '#fff', fontFamily: Fonts.body }}>
          Sign In
        </Text>
      </TouchableOpacity>

      <Text className="text-center mt-4" style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
        Do not have an account?
        <Text onPress={() => router.push('/signup')} style={{ color: theme.accent }}> Sign Up</Text>
      </Text>
    </View>
  );
}

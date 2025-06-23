import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const theme = Colors.dark;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center px-6" style={{ backgroundColor: theme.background }}>
      <Text className="text-2xl mb-6 text-center" style={{ color: theme.textDark, fontFamily: Fonts.heading }}>
        Create an Account
      </Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={theme.textLight}
        value={name}
        onChangeText={setName}
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
          Sign Up
        </Text>
      </TouchableOpacity>

      <Text className="text-center mt-4" style={{ color: theme.textLight, fontFamily: Fonts.caption }}>
        Already have an account?
        <Text onPress={() => router.push('/signin')} style={{ color: theme.accent }}> Sign In</Text>
      </Text>
    </View>
  );
}

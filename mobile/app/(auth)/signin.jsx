import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts } from "../../Color/Color";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.100.5:5000/api/auth/login";
export default function Signin() {
  const router = useRouter();
  const theme = Colors.dark;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_URL, { email, password });

      const { token, user } = response.data; 
      const role = response.data.role;


      if (!token || !role) {
        throw new Error("Invalid response from server");
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);

      Alert.alert("Success", "Login successful!");

      router.replace(role === "provider" ? "/provider-home" : "/customer-home");
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("Login error:", message);
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="flex-1 justify-center px-6"
      style={{ backgroundColor: theme.background }}
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 240, height: 240, marginBottom: 24, marginLeft: 30 }}
        resizeMode="contain"
      />

      <Text
        className="text-2xl mb-6 text-center"
        style={{ color: theme.textDark, fontFamily: Fonts.heading }}
      >
        Sign In to HomeEase
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textLight}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: theme.card,
          color: theme.textDark,
          fontFamily: Fonts.body,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: theme.card,
          color: theme.textDark,
          fontFamily: Fonts.body,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: theme.primary,
          borderRadius: 8,
          paddingVertical: 14,
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className="text-center text-lg"
            style={{ color: "#fff", fontFamily: Fonts.body }}
          >
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      <Text
        className="text-center mt-4"
        style={{ color: theme.textLight, fontFamily: Fonts.caption }}
      >
        Don't have an account?
        <Text
          onPress={() => router.push("/signup")}
          style={{ color: theme.accent }}
        >
          {" "}
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

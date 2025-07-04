// app/(auth)/_layout.jsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer-signin" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="provider-signin" />
      <Stack.Screen name="seller-signup" />
      
    </Stack>
  );
}

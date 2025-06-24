// app/(home)/_layout.jsx
import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer-home" />
      <Stack.Screen name="provider-home" />
    </Stack>
  );
}

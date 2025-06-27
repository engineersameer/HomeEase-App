// app/(home)/_layout.jsx
import { Stack } from "expo-router";
import { Slot, usePathname } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import BottomBar from './BottomBar';

export default function HomeLayout() {
  const pathname = usePathname();
  // Optionally, hide the BottomBar on certain routes if needed
  const hideFooterRoutes = [];
  const showFooter = !hideFooterRoutes.includes(pathname);

  return (
    <View style={styles.container}>
      <Slot />
      {showFooter && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

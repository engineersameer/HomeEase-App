import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';
import { useLocalSearchParams } from 'expo-router';

export default function ServiceDetail() {
  const theme = Colors.dark;
  const { service } = useLocalSearchParams();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.text, { color: theme.textDark, fontFamily: Fonts.heading }]}>Service: {service}</Text>
      <Text style={[styles.text, { color: theme.textLight, fontFamily: Fonts.caption }]}>Details coming soon...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    marginBottom: 10,
  },
}); 
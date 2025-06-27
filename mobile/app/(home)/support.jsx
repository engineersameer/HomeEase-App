import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';

export default function Support() {
  const theme = Colors.dark;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.text, { color: theme.textDark, fontFamily: Fonts.heading }]}>Support Chatbot (Coming Soon)</Text>
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
  },
}); 
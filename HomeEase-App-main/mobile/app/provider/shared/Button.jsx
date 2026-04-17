import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../../Color/Color';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style = {},
  textStyle = {},
  ...props
}) {
  const theme = Colors.dark;
  let backgroundColor = theme.primary;
  let color = '#fff';
  if (variant === 'accent') {
    backgroundColor = theme.accent;
    color = '#fff';
  } else if (variant === 'card') {
    backgroundColor = theme.card;
    color = theme.textDark;
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor,
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[
          {
            color,
            fontSize: 16,
            fontFamily: Fonts.subheading,
            fontWeight: 'bold',
          },
          textStyle,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 
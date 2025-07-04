import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';

export default function Button({
  title,
  onPress,
  loading = false,
  icon = null,
  style = {},
  textStyle = {},
  disabled = false,
  variant = 'primary', // 'primary' | 'accent' | 'card'
}) {
  const theme = Colors.light; // TODO: Accept theme as prop for dark mode
  let backgroundColor = theme.primary;
  if (variant === 'accent') backgroundColor = theme.accent;
  if (variant === 'card') backgroundColor = theme.card;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={{
        backgroundColor,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: variant === 'card' ? 1 : 0,
        borderColor: variant === 'card' ? theme.border : 'transparent',
        ...style,
      }}
    >
      {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={variant === 'card' ? theme.textDark : '#fff'} />
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: variant === 'card' ? theme.textDark : '#fff',
            fontFamily: Fonts.subheading,
            ...textStyle,
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 
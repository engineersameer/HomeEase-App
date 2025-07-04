import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, Text } from 'react-native';
import { Colors, Fonts } from '../../Color/Color';

export default function FloatingInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style = {},
  inputStyle = {},
  theme,
  ...rest
}) {
  const appliedTheme = theme || Colors.light; // Use provided theme or fallback to light
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 0,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [appliedTheme.textLight, appliedTheme.accent],
    }),
    fontFamily: Fonts.body,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  };

  return (
    <View style={[{ marginBottom: 24, paddingTop: 8 }, style]}>
      <Animated.Text style={labelStyle} pointerEvents="none">
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          {
            height: 40,
            fontSize: 16,
            color: appliedTheme.textDark,
            borderBottomWidth: 2,
            borderBottomColor: isFocused ? appliedTheme.accent : appliedTheme.border,
            fontFamily: Fonts.body,
            backgroundColor: 'transparent',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 16,
            paddingBottom: 4,
          },
          inputStyle,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        blurOnSubmit
        {...rest}
      />
    </View>
  );
} 
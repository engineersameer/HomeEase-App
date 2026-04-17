import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../Color/Color';

export default function FloatingInput({
  label,
  value,
  onChangeText,
  theme,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  inputStyle = {},
  ...props
}) {
  const isFocused = false; // You can add focus state if needed

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: theme.card,
          borderColor: isFocused ? theme.primary : theme.border,
        }
      ]}>
        <Text style={[
          styles.label,
          {
            color: isFocused ? theme.primary : theme.textLight,
            fontSize: value ? 12 : 16,
            top: value ? 8 : 16,
          }
        ]}>
          {label}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.textDark,
              fontFamily: Fonts.body,
            },
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholderTextColor={theme.textLight}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    minHeight: 56,
  },
  label: {
    position: 'absolute',
    left: 16,
    fontFamily: 'System',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
}); 
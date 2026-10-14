import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  helperText?: string;
  /** Renders a show/hide toggle for password fields. */
  secureToggle?: boolean;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, error, icon, helperText, secureToggle, style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);

    const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, { borderColor }]}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={focused ? colors.primary : colors.textMuted}
              style={styles.icon}
            />
          )}
          <TextInput
            {...rest}
            ref={ref}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, style]}
            secureTextEntry={secureToggle ? hidden : rest.secureTextEntry}
            accessibilityLabel={label}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
          {secureToggle && (
            <Pressable
              onPress={() => setHidden((h) => !h)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            >
              <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : helperText ? (
          <Text style={styles.helper}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs + 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  icon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: spacing.md },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  helper: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
});

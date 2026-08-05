import React from "react";

import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
} from "react-native";

import {
  useTheme,
  Spacing,
  Typography,
} from "../../theme";

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {

  const { theme } = useTheme();

  return (

    <View style={styles.container}>

      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>

      <TextInput
        {...props}
        placeholderTextColor={theme.colors.placeholder}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            borderColor: error
              ? theme.colors.danger
              : theme.colors.border,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.inputBackground,
          },
          style,
        ]}
      />

      {error && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.danger,
            },
          ]}
        >
          {error}
        </Text>
      )}

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    marginBottom: Spacing.lg,
  },

  label: {
    marginBottom: Spacing.sm,
    fontSize: Typography.caption,
  },

  input: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
  },

  error: {
    marginTop: Spacing.xs,
    fontSize: Typography.small,
  },

});
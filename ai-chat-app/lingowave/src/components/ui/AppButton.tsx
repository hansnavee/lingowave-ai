import React from "react";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";

import {
  useTheme,
  Spacing,
  Typography,
} from "../../theme";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export default function AppButton({
  title,
  onPress,
  style,
  disabled = false,
  variant = "primary",
}: AppButtonProps) {
  const { theme } = useTheme();

  const backgroundColor =
    variant === "primary"
      ? theme.colors.primary
      : variant === "secondary"
        ? theme.colors.primaryMuted
        : variant === "danger"
          ? theme.colors.danger
          : "transparent";

  const textColor =
    variant === "primary" || variant === "danger"
      ? theme.colors.onPrimary
      : theme.colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          borderRadius: theme.radius.lg,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: theme.colors.borderStrong,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  text: {
    fontSize: Typography.body,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});

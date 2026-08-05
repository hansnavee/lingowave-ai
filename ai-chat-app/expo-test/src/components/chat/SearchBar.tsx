import React from "react";

import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useTheme,
  Spacing,
  Typography,
} from "../../theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({
  value,
  onChangeText,
}: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={theme.colors.textMuted}
      />

      <TextInput
        style={[
          styles.input,
          { color: theme.colors.textPrimary },
        ]}
        placeholder="Search conversations..."
        placeholderTextColor={theme.colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.body,
  },
});

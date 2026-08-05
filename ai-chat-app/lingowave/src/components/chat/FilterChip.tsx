import React from "react";

import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AppText from "../ui/AppText";

import {
  useTheme,
  Spacing,
} from "../../theme";

interface FilterChipProps {
  title: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({
  title,
  selected,
  onPress,
}: FilterChipProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? theme.colors.chipActive
            : theme.colors.chipInactive,
          borderColor: selected
            ? theme.colors.chipActive
            : theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <AppText
        weight="600"
        size={14}
        color={
          selected
            ? theme.colors.onPrimary
            : theme.colors.textSecondary
        }
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
});

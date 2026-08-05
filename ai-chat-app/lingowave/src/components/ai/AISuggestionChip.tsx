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

interface Props {
  title: string;
  onPress: () => void;
}

export default function AISuggestionChip({
  title,
  onPress,
}: Props) {

  const { theme } = useTheme();

  return (

    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primaryMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >

      <AppText
        color={theme.colors.primary}
        weight="600"
      >
        {title}
      </AppText>

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({

  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },

});
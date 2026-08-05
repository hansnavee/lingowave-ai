import React from "react";
import { View, StyleSheet } from "react-native";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";

export default function AIEmptyState() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <AppText size={40}>🤖</AppText>

      <AppText
        weight="700"
        size={24}
        style={styles.title}
      >
        Hello 👋
      </AppText>

      <AppText
        color={theme.colors.textSecondary}
        style={styles.text}
      >
        I am your AI assistant.
        {"\n"}
        How can I help you today?
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: Spacing.lg,
  },

  title: {
    marginTop: Spacing.md,
  },

  text: {
    marginTop: Spacing.sm,
    textAlign: "center",
    lineHeight: 24,
  },
});
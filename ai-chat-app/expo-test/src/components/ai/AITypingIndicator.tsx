import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import AppText from "../ui/AppText";

import {
  useTheme,
  Spacing,
} from "../../theme";

export default function AITypingIndicator() {

  const { theme } = useTheme();

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
        },
      ]}
    >

      <AppText
        color={theme.colors.textSecondary}
      >
        🤖 AI is typing...
      </AppText>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    padding: Spacing.md,
    alignSelf: "flex-start",
    marginVertical: Spacing.sm,
    borderWidth: 1,
  },

});
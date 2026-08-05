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

interface Props {
  title: string;
}

export default function DateSeparator({
  title,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText
          size={12}
          weight="600"
          color={theme.colors.textSecondary}
        >
          {title}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});

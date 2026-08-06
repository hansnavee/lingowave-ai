import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../../theme";

export default function AppBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.gradientMid }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

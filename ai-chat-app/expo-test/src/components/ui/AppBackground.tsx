import React from "react";

import {
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../../theme";

export default function AppBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[
        theme.colors.gradientStart,
        theme.colors.gradientMid,
        theme.colors.gradientEnd,
      ]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

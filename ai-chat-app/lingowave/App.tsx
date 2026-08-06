import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useTheme, Typography } from "./src/theme";

/**
 * Isolation build 1.0.6 — theme JS only, no navigation / screens / media natives.
 * If this launches, react-native-screens (or another 1.0.5 native dep) caused the crash.
 */
function BootScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.gradientMid }]}
    >
      <StatusBar style="dark" />
      <Text
        style={[
          styles.title,
          { color: theme.colors.primary, fontSize: Typography.title },
        ]}
      >
        LingoWave
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>
        Boot OK · v1.0.6 theme-only
      </Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        Theme loaded without navigation or media modules.
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BootScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});

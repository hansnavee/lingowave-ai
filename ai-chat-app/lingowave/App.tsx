import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useTheme } from "./src/theme/themeContext";

/**
 * Cold start matches the known-good 1.0.6 native+theme boot.
 * Full app JS (supabase, navigators, screens) loads only after Continue.
 */
function BootGate() {
  const { theme } = useTheme();
  const [openApp, setOpenApp] = useState(false);

  if (openApp) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RootNavigator = require("./src/navigation/RootNavigation").default;
    return <RootNavigator />;
  }

  return (
    <View
      style={[
        styles.boot,
        { backgroundColor: theme.colors.gradientMid },
      ]}
    >
      <StatusBar style="dark" />
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        LingoWave
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Boot OK · 1.0.9
      </Text>
      <Pressable
        onPress={() => setOpenApp(true)}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.buttonLabel}>Continue</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BootGate />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

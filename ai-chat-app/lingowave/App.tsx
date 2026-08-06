import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

/**
 * Diagnostic boot screen — no navigation, auth, media, or native feature modules.
 * If this APK still crashes on open, the device cannot run Expo 57 / RN New Arch.
 */
export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>LingoWave</Text>
        <Text style={styles.subtitle}>Boot OK · v1.0.4 diagnostic</Text>
        <Text style={styles.body}>
          If you can read this, the app launched successfully on this device.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E8F5F2",
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F766E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#134E4A",
    marginBottom: 16,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    lineHeight: 22,
  },
});

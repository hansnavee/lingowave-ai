import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../../theme";

interface ChatBackgroundProps {
  children: React.ReactNode;
}

/** Solid color only — large PNG backgrounds OOM older Android devices. */
export default function ChatBackground({ children }: ChatBackgroundProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
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

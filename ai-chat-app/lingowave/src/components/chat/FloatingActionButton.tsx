import React from "react";

import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme";

interface FloatingButtonProps {
  onPress: () => void;
}

export default function FloatingButton({
  onPress,
}: FloatingButtonProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        },
      ]}
    >
      <Ionicons
        name="add"
        size={30}
        color={theme.colors.onPrimary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
});

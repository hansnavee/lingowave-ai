import React from "react";
import {
  ImageBackground,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme";

interface ChatBackgroundProps {
  children: React.ReactNode;
}

const lightBackground = require("../../assets/images/chat-bg-light.png");
const darkBackground = require("../../assets/images/chat-bg-dark.png");

export default function ChatBackground({
  children,
}: ChatBackgroundProps) {

  const { darkMode } = useTheme();

  return (
    <ImageBackground
      source={
        darkMode
          ? darkBackground
          : lightBackground
      }
      resizeMode="cover"
      style={styles.container}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
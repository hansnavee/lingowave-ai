import React from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";

interface Props {
  uri: string;
  isMe: boolean;
}

/** Playback stub — expo-av removed from Android APK to stop cold-start crashes. */
export default function AudioBubble({ isMe }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe
            ? theme.colors.bubbleMe
            : theme.colors.bubbleOther,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Voice playback unavailable",
            "Audio playback is temporarily disabled on this build."
          )
        }
      >
        <AppText
          color={
            isMe ? theme.colors.onBubbleMe : theme.colors.textSecondary
          }
          weight="700"
        >
          ▶ Voice note
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: 18,
    marginVertical: 6,
    minWidth: 130,
  },
});

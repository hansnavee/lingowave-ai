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
  message: string;
  isUser: boolean;
  time?: string;
}

export default function AIMessageBubble({
  message,
  isUser,
  time,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        isUser ? styles.userWrapper : styles.aiWrapper,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            borderRadius: theme.radius.xl,
            borderBottomRightRadius: isUser ? 6 : theme.radius.xl,
            borderBottomLeftRadius: isUser ? theme.radius.xl : 6,
            backgroundColor: isUser
              ? theme.colors.bubbleMe
              : theme.colors.bubbleOther,
            borderWidth: isUser ? 0 : 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText
          color={
            isUser
              ? theme.colors.onBubbleMe
              : theme.colors.onBubbleOther
          }
          style={styles.message}
        >
          {message}
        </AppText>

        {time ? (
          <AppText
            size={11}
            color={
              isUser
                ? theme.dark
                  ? "rgba(4, 47, 46, 0.72)"
                  : "rgba(255, 255, 255, 0.82)"
                : theme.colors.textSecondary
            }
            style={styles.time}
          >
            {time}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  aiWrapper: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    lineHeight: 22,
  },
  time: {
    marginTop: 6,
    alignSelf: "flex-end",
  },
});

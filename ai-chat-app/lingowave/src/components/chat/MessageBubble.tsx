import React from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import AppText from "../ui/AppText";

import {
  useTheme,
  Spacing,
} from "../../theme";

interface MessageBubbleProps {
  message: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  reaction?: string;
  replyTo?: {
    content: string;
  };
  starred?: boolean;
  isPinned?: boolean;
  isTranslated?: boolean;
  onToggleOriginal?: () => void;
  showingOriginal?: boolean;
}

export default function MessageBubble({
  message,
  time,
  isMe,
  isRead = false,
  reaction,
  replyTo,
  starred,
  isPinned,
  isTranslated = false,
  onToggleOriginal,
  showingOriginal = false,
}: MessageBubbleProps) {
  const { theme } = useTheme();

  const bubbleColor = isMe
    ? theme.colors.bubbleMe
    : theme.colors.bubbleOther;

  const textColor = isMe
    ? theme.colors.onBubbleMe
    : theme.colors.onBubbleOther;

  const metaColor = isMe
    ? theme.dark
      ? "rgba(4, 47, 46, 0.72)"
      : "rgba(255, 255, 255, 0.82)"
    : theme.colors.textSecondary;

  return (
    <View
      style={[
        styles.wrapper,
        isMe ? styles.myWrapper : styles.otherWrapper,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor,
            borderRadius: theme.radius.xl,
            borderBottomRightRadius: isMe ? 6 : theme.radius.xl,
            borderBottomLeftRadius: isMe ? theme.radius.xl : 6,
            borderWidth: isMe ? 0 : 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {starred ? (
          <AppText color={metaColor} size={12} style={styles.metaLabel}>
            ⭐ Starred
          </AppText>
        ) : null}

        {isPinned ? (
          <AppText color={metaColor} size={12} style={styles.metaLabel}>
            📌 Pinned
          </AppText>
        ) : null}

        {replyTo ? (
          <View
            style={[
              styles.reply,
              {
                backgroundColor: theme.colors.bubbleReply,
                borderLeftColor: theme.colors.accent,
              },
            ]}
          >
            <AppText weight="700" size={12} color={textColor}>
              Reply
            </AppText>
            <AppText numberOfLines={1} size={13} color={textColor}>
              {replyTo.content}
            </AppText>
          </View>
        ) : null}

        <AppText color={textColor} style={styles.message}>
          {message}
        </AppText>

        {isTranslated ? (
          <TouchableOpacity onPress={onToggleOriginal}>
            <AppText size={11} color={metaColor} style={styles.translateMeta}>
              {showingOriginal ? "Show translation" : "Translated · View original"}
            </AppText>
          </TouchableOpacity>
        ) : null}

        {reaction ? (
          <View
            style={[
              styles.reaction,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                alignSelf: isMe ? "flex-end" : "flex-start",
              },
            ]}
          >
            <AppText size={16}>{reaction}</AppText>
          </View>
        ) : null}

        <View style={styles.footer}>
          <AppText size={11} color={metaColor}>
            {time}
          </AppText>

          {isMe ? (
            <AppText size={12} color={metaColor} style={styles.readStatus}>
              {isRead ? " ✓✓" : " ✓"}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  myWrapper: {
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metaLabel: {
    marginBottom: 4,
  },
  message: {
    lineHeight: 22,
  },
  translateMeta: {
    marginTop: 6,
  },
  reply: {
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  reaction: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
  },
  readStatus: {
    marginLeft: 4,
  },
});

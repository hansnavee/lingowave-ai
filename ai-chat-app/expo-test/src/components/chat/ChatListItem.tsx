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
  Typography,
} from "../../theme";

import { Chat } from "../../types/models";

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

export default function ChatListItem({
  chat,
  onPress,
}: ChatListItemProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.divider,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.avatar },
          ]}
        >
          <AppText
            color={theme.colors.onPrimary}
            weight="700"
            size={Typography.title}
          >
            {chat.name.charAt(0).toUpperCase()}
          </AppText>
        </View>

        {chat.online ? (
          <View
            style={[
              styles.online,
              {
                backgroundColor: theme.colors.online,
                borderColor: theme.colors.background,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <AppText weight="700" color={theme.colors.textPrimary}>
            {chat.name}
          </AppText>

          <AppText size={12} color={theme.colors.textMuted}>
            {chat.time}
          </AppText>
        </View>

        <View style={styles.row}>
          <AppText
            numberOfLines={1}
            color={
              chat.unread > 0
                ? theme.colors.textPrimary
                : theme.colors.textSecondary
            }
            weight={chat.unread > 0 ? "600" : "400"}
            style={styles.message}
          >
            {chat.message}
          </AppText>

          {chat.unread > 0 ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.unread },
              ]}
            >
              <AppText
                size={12}
                weight="700"
                color={theme.colors.onPrimary}
              >
                {chat.unread}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  online: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    flex: 1,
    marginTop: 4,
    marginRight: 10,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});

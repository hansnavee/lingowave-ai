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

interface ChatListHeaderProps {
  greeting?: string;
  title: string;
  onInvitePress?: () => void;
}

export default function ChatListHeader({
  greeting,
  title,
  onInvitePress,
}: ChatListHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textBlock}>
          {greeting ? (
            <AppText
              color={theme.colors.textSecondary}
              size={Typography.body}
            >
              {greeting}
            </AppText>
          ) : null}

          <AppText
            size={Typography.h1}
            weight="700"
            color={theme.colors.textPrimary}
            style={styles.title}
          >
            {title}
          </AppText>
        </View>

        {onInvitePress ? (
          <TouchableOpacity
            onPress={onInvitePress}
            style={[
              styles.inviteBtn,
              { backgroundColor: theme.colors.primaryMuted },
            ]}
          >
            <AppText color={theme.colors.primary} weight="700" size={13}>
              Invite
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    marginTop: Spacing.xs,
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
});

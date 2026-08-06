import React from "react";

import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppText from "../ui/AppText";
import ProfileAvatar from "../profile/ProfileAvatar";

import { useTheme, Spacing, Typography } from "../../theme";

interface ChatHeaderProps {
  name: string;
  online?: boolean;
  avatarUrl?: string | null;
  translateEnabled?: boolean;
  onBack: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
  onToggleTranslate?: () => void;
  onBlockUser?: () => void;
}

export default function ChatHeader({
  name,
  online = false,
  avatarUrl,
  translateEnabled = false,
  onBack,
  onAudioCall,
  onVideoCall,
  onToggleTranslate,
  onBlockUser,
}: ChatHeaderProps) {
  const { theme } = useTheme();

  const openMore = () => {
    if (!onBlockUser) {
      return;
    }

    Alert.alert(name, undefined, [
      {
        text: "Block user",
        style: "destructive",
        onPress: onBlockUser,
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={theme.colors.textPrimary}
        />
      </TouchableOpacity>

      <View style={styles.avatarWrap}>
        <ProfileAvatar name={name} avatarUrl={avatarUrl} size={42} />
        <View
          style={[
            styles.dot,
            {
              backgroundColor: online
                ? theme.colors.online
                : theme.colors.textSecondary,
              borderColor: theme.colors.background,
            },
          ]}
        />
      </View>

      <View style={styles.info}>
        <AppText
          weight="700"
          size={Typography.body}
          color={theme.colors.textPrimary}
        >
          {name}
        </AppText>

        <AppText
          size={13}
          color={online ? theme.colors.online : theme.colors.textSecondary}
        >
          {online ? "Online" : "Offline"}
          {translateEnabled ? " · AI" : ""}
        </AppText>
      </View>

      {onToggleTranslate ? (
        <TouchableOpacity
          onPress={onToggleTranslate}
          style={[
            styles.translateChip,
            {
              backgroundColor: translateEnabled
                ? theme.colors.primary
                : theme.colors.primaryMuted,
            },
          ]}
        >
          <AppText
            size={11}
            weight="700"
            color={
              translateEnabled
                ? theme.colors.onPrimary
                : theme.colors.primary
            }
          >
            AI
          </AppText>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity onPress={onAudioCall} style={styles.iconButton}>
        <Ionicons name="call-outline" size={22} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onVideoCall} style={styles.iconButton}>
        <Ionicons
          name="videocam-outline"
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {onBlockUser ? (
        <TouchableOpacity onPress={openMore} style={styles.iconButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  avatarWrap: {
    marginLeft: Spacing.sm,
  },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
  translateChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginHorizontal: 4,
  },
});

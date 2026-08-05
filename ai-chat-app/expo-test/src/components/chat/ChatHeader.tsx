import React from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppText from "../ui/AppText";

import {
  useTheme,
  Spacing,
  Typography,
} from "../../theme";

interface ChatHeaderProps {
  name: string;
  online?: boolean;
  translateEnabled?: boolean;
  onBack: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
  onToggleTranslate?: () => void;
}

export default function ChatHeader({
  name,
  online = false,
  translateEnabled = false,
  onBack,
  onAudioCall,
  onVideoCall,
  onToggleTranslate,
}: ChatHeaderProps) {
  const { theme } = useTheme();

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

      <View
        style={[
          styles.avatar,
          { backgroundColor: theme.colors.avatar },
        ]}
      >
        <AppText color={theme.colors.onPrimary} weight="700">
          {name.charAt(0).toUpperCase()}
        </AppText>
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
          color={
            online ? theme.colors.online : theme.colors.textSecondary
          }
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
        <Ionicons
          name="call-outline"
          size={22}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onVideoCall} style={styles.iconButton}>
        <Ionicons
          name="videocam-outline"
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
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
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
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

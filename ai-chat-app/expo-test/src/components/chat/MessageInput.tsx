import React from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useTheme,
  Spacing,
} from "../../theme";

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onEmojiPress?: () => void;
  onAttachmentPress?: () => void;
  onCameraPress?: () => void;
  onVoicePress?: () => void;
}

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onEmojiPress,
  onAttachmentPress,
  onCameraPress,
  onVoicePress,
}: MessageInputProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.inputBackground,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {onEmojiPress ? (
        <TouchableOpacity
          onPress={onEmojiPress}
          style={styles.iconButton}
        >
          <Ionicons
            name="happy-outline"
            size={24}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}

      {onAttachmentPress ? (
        <TouchableOpacity
          onPress={onAttachmentPress}
          style={styles.iconButton}
        >
          <Ionicons
            name="attach"
            size={22}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}

      <TextInput
        style={[
          styles.input,
          { color: theme.colors.textPrimary },
        ]}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
      />

      {value.trim().length > 0 ? (
        <TouchableOpacity
          onPress={onSend}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightIcons}>
          {onCameraPress ? (
            <TouchableOpacity
              onPress={onCameraPress}
              style={styles.iconButton}
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}

          {onVoicePress ? (
            <TouchableOpacity
              onPress={onVoicePress}
              style={styles.iconButton}
            >
              <Ionicons
                name="mic-outline"
                size={22}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    minHeight: 52,
  },
  iconButton: {
    padding: 6,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
});

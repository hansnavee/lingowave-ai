import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AppText from "../ui/AppText";

import {
  useTheme,
  Spacing,
} from "../../theme";

interface UserListItemProps {
  name: string;
  status: string;
  onPress: () => void;
}

export default function UserListItem({
  name,
  status,
  onPress,
}: UserListItemProps) {

  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.border,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <AppText
          color="#FFFFFF"
          weight="700"
        >
          {name.charAt(0).toUpperCase()}
        </AppText>
      </View>

      {/* User Info */}
      <View style={styles.info}>
        <AppText
          weight="700"
          color={theme.colors.textPrimary}
        >
          {name}
        </AppText>

        <AppText
          color={theme.colors.textSecondary}
        >
          {status}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
});
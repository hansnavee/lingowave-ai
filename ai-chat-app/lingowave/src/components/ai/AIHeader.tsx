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

interface AIHeaderProps {
  title?: string;
  status?: string;
}

export default function AIHeader({
  title = "AI Assistant",
  status = "Online",
}: AIHeaderProps) {

  const { theme } = useTheme();

  return (

    <View style={styles.container}>

      <View
        style={[
          styles.avatar,
          {
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <AppText
          color={theme.colors.primary}
          size={22}
        >
          🤖
        </AppText>
      </View>

      <View style={styles.info}>

        <AppText
          weight="700"
          color={theme.colors.textPrimary}
        >
          {title}
        </AppText>

        <AppText
          color={theme.colors.online}
          size={12}
        >
          {status}
        </AppText>

      </View>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },

  avatar: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  info: {
    flex: 1,
  },

});
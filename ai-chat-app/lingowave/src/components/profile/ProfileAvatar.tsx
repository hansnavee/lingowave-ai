import React from "react";

import { Image, StyleSheet, View } from "react-native";

import AppText from "../ui/AppText";
import { useTheme } from "../../theme";

interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function ProfileAvatar({
  name,
  avatarUrl,
  size = 90,
}: Props) {
  const { theme } = useTheme();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.avatar,
        },
      ]}
    >
      <AppText
        size={Math.round(size * 0.3)}
        weight="700"
        color={theme.colors.onPrimary}
      >
        {name.charAt(0).toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
});

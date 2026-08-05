import React from "react";
import { Image, StyleSheet, View } from "react-native";

import AppText from "../ui/AppText";
import { useTheme, Typography } from "../../theme";
import { APP_NAME } from "../../constants/branding";

const LOGO = require("../../../assets/branding/lingowave-logo.png");

type Props = {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
};

export default function BrandLogo({
  size = "md",
  showName = true,
}: Props) {
  const { theme } = useTheme();

  const dim = size === "lg" ? 120 : size === "sm" ? 56 : 88;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.logoBox,
          {
            width: dim,
            height: dim,
            borderRadius: dim * 0.28,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Image
          source={LOGO}
          style={{ width: dim * 0.9, height: dim * 0.9 }}
          resizeMode="contain"
        />
      </View>

      {showName ? (
        <AppText
          size={size === "lg" ? Typography.h1 : Typography.h3}
          weight="700"
          color={theme.colors.textPrimary}
          style={styles.name}
        >
          {APP_NAME}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  logoBox: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  name: {
    marginTop: 14,
    textAlign: "center",
  },
});

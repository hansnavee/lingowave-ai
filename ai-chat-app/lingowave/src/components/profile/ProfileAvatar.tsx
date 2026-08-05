import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import AppText from "../ui/AppText";

import {
  useTheme,
} from "../../theme";

interface Props {
  name: string;
}

export default function ProfileAvatar({
  name,
}: Props) {

  const { theme } = useTheme();

  return (

    <View
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.avatar,
          borderRadius: theme.radius.full,
        },
      ]}
    >

      <AppText
        size={28}
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
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },

});
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";

interface Props {
  message: {
    content: string;
  };

  onClose: () => void;
}

export default function ReplyPreview({
  message,
  onClose,
}: Props) {

  const { theme } = useTheme();

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderLeftColor: theme.colors.primary,
        },
      ]}
    >

      <View style={{ flex: 1 }}>

        <AppText
          weight="700"
          color={theme.colors.primary}
        >
          Replying
        </AppText>

        <AppText numberOfLines={1}>
          {message.content}
        </AppText>

      </View>

      <TouchableOpacity
        onPress={onClose}
      >
        <AppText size={22}>
          ✕
        </AppText>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderLeftWidth: 4,
  },

});
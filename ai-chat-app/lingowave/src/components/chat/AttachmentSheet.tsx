import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import BottomSheet from "../common/BottomSheet";
import AppText from "../ui/AppText";

import {
  useTheme,
  Typography,
  Spacing,
} from "../../theme";

interface Props {
  visible: boolean;

  onClose: () => void;

  onDocument: () => void;

  onGallery: () => void;

  onCamera: () => void;

  onAudio: () => void;

  onLocation: () => void;

  onContact: () => void;
}

export default function AttachmentSheet({
  visible,
  onClose,
  onDocument,
  onGallery,
  onCamera,
  onAudio,
  onLocation,
  onContact,
}: Props) {
  const { theme } = useTheme();

  const items = [
    {
      title: "Document",
      icon: "📄",
      onPress: onDocument,
    },
    {
      title: "Gallery",
      icon: "🖼️",
      onPress: onGallery,
    },
    {
      title: "Camera",
      icon: "📷",
      onPress: onCamera,
    },
    {
      title: "Audio",
      icon: "🎵",
      onPress: onAudio,
    },
    {
      title: "Location",
      icon: "📍",
      onPress: onLocation,
    },
    {
      title: "Contact",
      icon: "👤",
      onPress: onContact,
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
    >
      <AppText
        size={Typography.h3}
        weight="700"
        style={styles.title}
      >
        Attach
      </AppText>

      {items.map((item) => (
        <TouchableOpacity
          key={item.title}
          style={[
            styles.item,
            {
              borderBottomColor:
                theme.colors.border,
            },
          ]}
          onPress={() => {
            item.onPress();
            onClose();
          }}
        >
          <View style={styles.icon}>
            <AppText size={24}>
              {item.icon}
            </AppText>
          </View>

          <AppText
            size={Typography.body}
            weight="600"
          >
            {item.title}
          </AppText>
        </TouchableOpacity>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },

  icon: {
    width: 45,
    alignItems: "center",
    marginRight: 15,
  },
});
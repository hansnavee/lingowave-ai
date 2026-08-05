import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import { useTheme } from "../../theme";

interface Props {
  visible: boolean;
  onClose: () => void;

  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onDelete: () => void;
  onStar:()=>void;
  onPin:()=>void;
}

export default function MessageActionSheet({
  visible,
  onClose,
  onReply,
  onCopy,
  onForward,
  onDelete,
  onStar,
  onPin,
}: Props) {

  const { theme } = useTheme();

  return (

    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >

      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >

          <Action title="💬 Reply" onPress={onReply} />
          <Action title="⭐ Star" onPress={onStar} />
          <Action title="📌 Pin" onPress={onPin} />

          <Action title="📋 Copy" onPress={onCopy} />

          <Action title="📤 Forward" onPress={onForward} />

          <Action title="🗑 Delete" onPress={onDelete} />

        </View>

      </TouchableOpacity>

    </Modal>

  );

}

function Action({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <AppText size={18}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },

  item: {
    paddingVertical: 18,
  },

});
import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import BottomSheet from "../common/BottomSheet";
import AppText from "../ui/AppText";

import {
  useTheme,
  Typography,
  Spacing,
} from "../../theme";

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const emojis = [
  "😀","😃","😄","😁","😆","😂","🤣","😊",
  "😍","😘","🥰","😎","🤩","🤔","😴","😭",
  "😡","👍","👎","👏","🙌","🙏","👌","💪",
  "🔥","❤️","💙","💚","💛","💜","🖤","🤍",
  "🎉","🎊","🚀","🤖","💯","⭐","✨","🌈",
  "🍕","☕","🎵","🎮","📷","📄","🎁","📱"
];

export default function EmojiPicker({
  visible,
  onClose,
  onSelect,
}: EmojiPickerProps) {

  const { theme } = useTheme();

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
        Emojis
      </AppText>

      <FlatList
        data={emojis}
        numColumns={8}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (

          <TouchableOpacity

            style={[
              styles.emojiButton,
              {
                backgroundColor: theme.colors.card,
              },
            ]}

            onPress={() => {
              onSelect(item);
              onClose();
            }}

          >

            <AppText style={styles.emoji}>
              {item}
            </AppText>

          </TouchableOpacity>

        )}
      />

    </BottomSheet>

  );
}

const styles = StyleSheet.create({

  title: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },

  emojiButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
  },

  emoji: {
    fontSize: 24,
  },

});
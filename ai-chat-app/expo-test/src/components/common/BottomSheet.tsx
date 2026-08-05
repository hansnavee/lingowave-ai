import React from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
} from "react-native";

import { useTheme, Spacing } from "../../theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Pressable
              style={[
                styles.container,
                {
                  backgroundColor: theme.colors.background,
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.handle,
                  {
                    backgroundColor: theme.colors.border,
                  },
                ]}
              />

              {children}
            </Pressable>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
  },

  handle: {
    width: 55,
    height: 5,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
});
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import AppButton from "../ui/AppButton";
import { useTheme, Spacing, Typography } from "../../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  featureLabel?: string;
}

export default function PaywallSheet({
  visible,
  onClose,
  onSubscribe,
  featureLabel = "AI Translate",
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <AppText size={Typography.h2} weight="700" style={styles.title}>
            Unlock {featureLabel}
          </AppText>

          <AppText color={theme.colors.textSecondary} style={styles.body}>
            Chat and call for free in the original language. Subscribe to
            translate messages, voice notes, and live call captions into your
            preferred language.
          </AppText>

          <View style={styles.perks}>
            {[
              "Message translation",
              "Voice note transcription + translation",
              "Live audio/video call captions",
              "Monthly, quarterly, or yearly plans",
            ].map((perk) => (
              <AppText key={perk} style={styles.perk}>
                ✓  {perk}
              </AppText>
            ))}
          </View>

          <AppButton title="View plans" onPress={onSubscribe} />

          <TouchableOpacity onPress={onClose} style={styles.later}>
            <AppText color={theme.colors.textSecondary} weight="600">
              Maybe later
            </AppText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  body: {
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  perks: {
    marginBottom: Spacing.lg,
    gap: 8,
  },
  perk: {
    marginBottom: 6,
  },
  later: {
    alignItems: "center",
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
});

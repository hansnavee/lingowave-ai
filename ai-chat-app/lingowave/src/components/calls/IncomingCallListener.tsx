import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppText from "../ui/AppText";
import { useAuthStore } from "../../store/authStore";
import { subscribeIncomingCalls } from "../../repositories/callRepository";
import {
  acceptIncomingCall,
  declineIncomingCall,
} from "../../services/callService";
import type { CallSession } from "../../types/calls";
import type { AppStackParamList } from "../../navigation/types";
import { useTheme, Spacing, Typography } from "../../theme";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function IncomingCallListener() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id);
  const [incoming, setIncoming] = useState<CallSession | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeIncomingCalls(userId, (call) => {
      if (call.calleeId === userId && call.status === "ringing") {
        setIncoming(call);
      }

      if (
        call.callerId === userId &&
        (call.status === "declined" ||
          call.status === "ended" ||
          call.status === "missed")
      ) {
        // Caller can observe remote hang-up via call screen subscription.
      }
    });
  }, [userId]);

  const handleDecline = async () => {
    if (!incoming) {
      return;
    }
    await declineIncomingCall(incoming.id);
    setIncoming(null);
  };

  const handleAccept = async () => {
    if (!incoming) {
      return;
    }

    const updated = await acceptIncomingCall(incoming.id);
    setIncoming(null);

    if (!updated) {
      return;
    }

    const screen = updated.callType === "video" ? "CallVideo" : "AudioCall";
    navigation.navigate(screen, {
      name: updated.peerName ?? "Incoming call",
      callId: updated.id,
      peerUserId: updated.callerId,
      callType: updated.callType,
      isIncoming: true,
    });
  };

  return (
    <Modal visible={Boolean(incoming)} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.elevated ?? theme.colors.card },
          ]}
        >
          <AppText size={Typography.h2} weight="700" style={styles.title}>
            Incoming {incoming?.callType === "video" ? "video" : "audio"} call
          </AppText>
          <AppText
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            {incoming?.peerName ?? "Someone"} is calling…
          </AppText>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.callEnd }]}
              onPress={handleDecline}
            >
              <AppText weight="700" color="#fff">
                Decline
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleAccept}
            >
              <AppText weight="700" color={theme.colors.onPrimary}>
                Accept
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    padding: Spacing.xl,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
});

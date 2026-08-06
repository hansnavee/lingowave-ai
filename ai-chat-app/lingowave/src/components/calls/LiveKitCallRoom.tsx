import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppText from "../ui/AppText";
import { useTheme } from "../../theme";
import { endCall } from "../../services/callService";
import type { CallType } from "../../types/calls";

type Props = {
  callId: string;
  peerName: string;
  callType: CallType;
  enableTranslate?: boolean;
  aiOn: boolean;
  onToggleAi: () => void;
  caption?: string;
};

/**
 * Call media (LiveKit/WebRTC) is intentionally not linked in the current
 * Android APK — native WebRTC was crashing on open on some devices.
 * Chat and the rest of the app stay usable; media will be re-enabled once stable.
 */
export default function LiveKitCallRoom(props: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.centered}>
      <AppText weight="700" style={styles.message}>
        Voice/video calling is temporarily unavailable
      </AppText>
      <AppText color={theme.colors.textSecondary} style={styles.message}>
        Chat still works. Media for {props.callType} calls with {props.peerName}{" "}
        will return in a later update.
      </AppText>
      <TouchableOpacity
        style={[styles.endBtn, { backgroundColor: theme.colors.callEnd }]}
        onPress={async () => {
          await endCall(props.callId);
          navigation.goBack();
        }}
      >
        <AppText>📞</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  message: {
    textAlign: "center",
    marginTop: 8,
  },
  endBtn: {
    marginTop: 24,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

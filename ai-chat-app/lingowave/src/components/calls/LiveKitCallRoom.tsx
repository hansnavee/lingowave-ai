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

/** Default / web implementation — media runs on native via LiveKitCallRoom.native.tsx */
export default function LiveKitCallRoom(props: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.centered}>
      <AppText weight="700" style={styles.message}>
        Calls need the iOS/Android development build.
      </AppText>
      <AppText color={theme.colors.textSecondary} style={styles.message}>
        Open LingoWave on a device build to place {props.callType} calls with{" "}
        {props.peerName}.
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

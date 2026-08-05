import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppText from "../../components/ui/AppText";
import { useTheme, Typography, Spacing } from "../../theme";
import { AppStackParamList } from "../../navigation/types";
import type { CallRecord } from "../../types/models";
import { getCalls } from "../../repositories/callRepository";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function CallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCalls().then(setCalls);
    }, [])
  );

  const startCall = (mode: "AudioCall" | "CallVideo") => {
    if (!selectedCall?.peerUserId) {
      setSelectedCall(null);
      return;
    }

    navigation.navigate(mode, {
      name: selectedCall.name,
      peerUserId: selectedCall.peerUserId,
      callType: mode === "CallVideo" ? "video" : "audio",
    });
    setSelectedCall(null);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText weight="700" style={styles.emptyTitle}>
              No calls yet
            </AppText>
            <AppText color={theme.colors.textSecondary} style={styles.emptySub}>
              Start an audio or video call from a chat.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.callItem, { backgroundColor: theme.colors.card }]}
            onPress={() => setSelectedCall(item)}
          >
            <View style={styles.avatar}>
              <AppText size={25}>{item.icon}</AppText>
            </View>
            <View>
              <AppText weight="700">{item.name}</AppText>
              <AppText color={theme.colors.textSecondary}>{item.type}</AppText>
              <AppText color={theme.colors.textSecondary}>{item.time}</AppText>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={selectedCall !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCall(null)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.profile}>
              <View style={styles.bigAvatar}>
                <AppText size={35}>{selectedCall?.icon}</AppText>
              </View>
              <View>
                <AppText size={Typography.h3} weight="700">
                  {selectedCall?.name}
                </AppText>
                <AppText color={theme.colors.textSecondary}>
                  {selectedCall?.type}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => startCall("AudioCall")}
            >
              <View style={styles.actionIcon}>
                <AppText size={22}>📞</AppText>
              </View>
              <View>
                <AppText weight="700">Audio Call</AppText>
                <AppText color={theme.colors.textSecondary}>
                  Start voice call
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => startCall("CallVideo")}
            >
              <View style={styles.actionIcon}>
                <AppText size={22}>📹</AppText>
              </View>
              <View>
                <AppText weight="700">Video Call</AppText>
                <AppText color={theme.colors.textSecondary}>
                  Start video call
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setSelectedCall(null)}
            >
              <AppText color={theme.colors.primary} weight="700">
                Cancel
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  empty: {
    paddingVertical: 64,
    alignItems: "center",
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySub: {
    textAlign: "center",
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bigAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionCard: {
    height: 75,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    marginRight: 15,
  },
  cancel: {
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    backgroundColor: "#F1F5F9",
  },
});

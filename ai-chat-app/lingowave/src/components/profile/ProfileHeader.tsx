import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import ProfileAvatar from "./ProfileAvatar";
import { useTheme, Spacing } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { hasActiveEntitlement } from "../../services/subscriptionService";
import {
  clearExpiredAvatarUndo,
  getAvatarRefreshState,
  refreshAvatarWithAI,
  undoAvatarRefresh,
} from "../../services/avatarEnhanceService";

interface Props {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ProfileHeader({ name, email, avatarUrl }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const setUserFromEnhance = useAuthStore((state) => state.setUser);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const aiUnlocked = subscription
    ? hasActiveEntitlement(subscription)
    : false;

  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!aiUnlocked) {
      return;
    }
    void clearExpiredAvatarUndo().then(() => refreshUser());
  }, [aiUnlocked, refreshUser]);

  useEffect(() => {
    const state = getAvatarRefreshState(user);
    if (!state.canUndo) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [user?.avatarUndoExpiresAt, user?.avatarPreviousUrl]);

  const state = getAvatarRefreshState(user);
  const undoMs = state.undoExpiresAt
    ? new Date(state.undoExpiresAt).getTime() - now
    : 0;
  const showUndo = aiUnlocked && state.canUndo && undoMs > 0;
  const showRefresh =
    aiUnlocked && Boolean(avatarUrl) && state.canRefresh && !busy;

  const handleRefresh = () => {
    Alert.alert(
      "AI photo refresh",
      "Apply a fresh AI look to your profile photo? You can undo for 1 hour. Available once per day.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refresh",
          onPress: async () => {
            setBusy(true);
            const result = await refreshAvatarWithAI();
            setBusy(false);

            if (!result.ok) {
              Alert.alert("Could not refresh", result.error);
              return;
            }

            setUserFromEnhance(result.user);
            Alert.alert(
              "Looking great",
              `Applied ${result.filter}. Undo is available for the next hour.`
            );
          },
        },
      ]
    );
  };

  const handleUndo = () => {
    Alert.alert("Undo AI look", "Restore your previous profile photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Undo",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          const result = await undoAvatarRefresh();
          setBusy(false);

          if (!result.ok) {
            Alert.alert("Could not undo", result.error);
            return;
          }

          setUserFromEnhance(result.user);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ProfileAvatar name={name} avatarUrl={avatarUrl} />

      {aiUnlocked ? (
        <View style={styles.actions}>
          {busy ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : null}

          {showRefresh ? (
            <TouchableOpacity
              onPress={handleRefresh}
              style={[
                styles.button,
                { backgroundColor: theme.colors.primaryMuted },
              ]}
            >
              <AppText color={theme.colors.primary} weight="700" size={13}>
                ↻ AI refresh
              </AppText>
            </TouchableOpacity>
          ) : null}

          {showUndo ? (
            <TouchableOpacity
              onPress={handleUndo}
              style={[
                styles.button,
                { borderColor: theme.colors.border, borderWidth: 1 },
              ]}
            >
              <AppText color={theme.colors.textPrimary} weight="600" size={13}>
                Undo · {formatRemaining(undoMs)}
              </AppText>
            </TouchableOpacity>
          ) : null}

          {aiUnlocked && !avatarUrl ? (
            <AppText
              size={12}
              color={theme.colors.textSecondary}
              style={styles.hint}
            >
              Add a photo in Edit Profile to unlock daily AI refresh.
            </AppText>
          ) : null}

          {aiUnlocked &&
          avatarUrl &&
          state.refreshUsedToday &&
          !showUndo &&
          !busy ? (
            <AppText
              size={12}
              color={theme.colors.textSecondary}
              style={styles.hint}
            >
              {state.filterName
                ? `${state.filterName} applied · next refresh tomorrow`
                : "Next AI refresh available tomorrow"}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <AppText
        weight="700"
        style={styles.name}
        color={theme.colors.textPrimary}
      >
        {name}
      </AppText>

      <AppText color={theme.colors.textSecondary}>{email}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  actions: {
    marginTop: Spacing.sm,
    alignItems: "center",
    gap: 8,
    minHeight: 36,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  hint: {
    textAlign: "center",
    maxWidth: 260,
  },
  name: {
    marginTop: Spacing.md,
  },
});

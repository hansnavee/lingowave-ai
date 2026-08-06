import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import { useTheme, Spacing, Typography } from "../../theme";
import {
  getBlockedUsers,
  unblockUser,
  type BlockedUser,
} from "../../repositories/blockRepository";
import { deleteAccountRequest } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const logout = useAuthStore((state) => state.logout);

  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setBlocked(await getBlockedUsers());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert("Unblock", `Unblock ${user.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: async () => {
          const result = await unblockUser(user.id);
          if (!result.ok) {
            Alert.alert("Failed", result.error);
            return;
          }
          await load();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete profile",
      "This permanently deletes your account and signs you out. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccountRequest();
            setDeleting(false);

            if (!result.ok) {
              Alert.alert("Could not delete", result.error);
              return;
            }

            await logout();
          },
        },
      ]
    );
  };

  return (
    <AppScreen
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <AppText color={theme.colors.primary} weight="600">
          ← Back
        </AppText>
      </TouchableOpacity>

      <AppText size={Typography.h1} weight="700" style={styles.title}>
        Privacy
      </AppText>

      <AppText weight="700" style={styles.section}>
        Blocked users
      </AppText>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <AppText color={theme.colors.textSecondary} style={styles.empty}>
              No blocked users. You can block someone from a chat menu.
            </AppText>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.elevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText weight="600" color={theme.colors.textPrimary}>
                {item.name}
              </AppText>
              <TouchableOpacity onPress={() => handleUnblock(item)}>
                <AppText color={theme.colors.primary} weight="600">
                  Unblock
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.dangerZone}>
        <AppText weight="700" style={styles.section}>
          Delete profile
        </AppText>
        <AppText color={theme.colors.textSecondary} style={styles.dangerHint}>
          Removes your account data and deletes your login permanently.
        </AppText>
        {deleting ? (
          <ActivityIndicator color={theme.colors.danger} />
        ) : (
          <AppButton
            title="Delete my account"
            onPress={handleDeleteAccount}
            variant="danger"
          />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  empty: {
    marginBottom: Spacing.lg,
  },
  dangerZone: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  dangerHint: {
    marginBottom: Spacing.md,
  },
});

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import { useTheme, Spacing, Typography } from "../../theme";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../../repositories/notificationRepository";
import { formatChatTime } from "../../lib/chatMappers";

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getNotifications();
    setItems(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await load();
  };

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      await markNotificationRead(item.id);
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, read: true } : row
        )
      );
    }
  };

  return (
    <AppScreen
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AppText color={theme.colors.primary} weight="600">
            ← Back
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMarkAll}>
          <AppText color={theme.colors.primary} weight="600">
            Mark all read
          </AppText>
        </TouchableOpacity>
      </View>

      <AppText size={Typography.h1} weight="700" style={styles.title}>
        Notifications
      </AppText>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            items.length === 0 ? styles.emptyWrap : undefined
          }
          ListEmptyComponent={
            <AppText color={theme.colors.textSecondary} style={styles.empty}>
              No notifications yet. New messages will show up here.
            </AppText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              style={[
                styles.row,
                {
                  backgroundColor: item.read
                    ? theme.colors.elevated
                    : theme.colors.primaryMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText weight="700" color={theme.colors.textPrimary}>
                {item.title}
              </AppText>
              {item.body ? (
                <AppText color={theme.colors.textSecondary} style={styles.body}>
                  {item.body}
                </AppText>
              ) : null}
              <AppText size={12} color={theme.colors.textSecondary}>
                {formatChatTime(item.createdAt)}
              </AppText>
            </TouchableOpacity>
          )}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  row: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  body: {
    marginTop: 4,
    marginBottom: 6,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
  },
});

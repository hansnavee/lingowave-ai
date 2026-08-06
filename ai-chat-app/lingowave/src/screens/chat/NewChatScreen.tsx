import React, { useCallback, useState } from "react";

import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import SearchBar from "../../components/chat/SearchBar";
import UserListItem from "../../components/chat/UserListItem";

import { useTheme, Spacing } from "../../theme";
import { ChatStackParamList } from "../../navigation/types";
import type { ChatUser } from "../../types/models";
import {
  getJoinedContacts,
  getUsers,
} from "../../repositories/userRepository";
import { getOrCreateDirectChat } from "../../repositories/chatRepository";

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "NewChat"
>;

type ListRow =
  | { kind: "header"; id: string; title: string }
  | { kind: "user"; id: string; user: ChatUser };

export default function NewChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [joined, setJoined] = useState<ChatUser[]>([]);
  const [others, setOthers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [allUsers, contactMatch] = await Promise.all([
      getUsers(),
      getJoinedContacts(),
    ]);

    setPermissionDenied(contactMatch.permissionDenied);
    setJoined(contactMatch.users);

    const joinedIds = new Set(contactMatch.users.map((user) => user.id));
    setOthers(allUsers.filter((user) => !joinedIds.has(user.id)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openChat = async (user: ChatUser) => {
    const result = await getOrCreateDirectChat({
      otherUserId: user.id,
      otherUserName: user.name,
    });

    if (!result.ok) {
      Alert.alert("Could not start chat", result.error);
      return;
    }

    navigation.navigate("Chat", {
      userId: result.chat.id,
      userName: result.chat.name,
      status: user.status,
    });
  };

  const query = search.toLowerCase().trim();
  const filterUser = (user: ChatUser) =>
    user.name.toLowerCase().includes(query) ||
    (user.phone ?? "").includes(query);

  const rows: ListRow[] = [];

  const joinedFiltered = joined.filter(filterUser);
  const othersFiltered = others.filter(filterUser);

  if (joinedFiltered.length > 0) {
    rows.push({
      kind: "header",
      id: "header-joined",
      title: "From your contacts",
    });
    for (const user of joinedFiltered) {
      rows.push({ kind: "user", id: `joined-${user.id}`, user });
    }
  } else if (permissionDenied) {
    rows.push({
      kind: "header",
      id: "header-permission",
      title: "Allow contacts access to find friends who joined",
    });
  }

  if (othersFiltered.length > 0) {
    rows.push({
      kind: "header",
      id: "header-all",
      title: joinedFiltered.length > 0 ? "Everyone else" : "People on LingoWave",
    });
    for (const user of othersFiltered) {
      rows.push({ kind: "user", id: `all-${user.id}`, user });
    }
  }

  return (
    <AppScreen
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AppText
        size={24}
        weight="700"
        color={theme.colors.textPrimary}
        style={styles.title}
      >
        New Chat
      </AppText>

      <SearchBar value={search} onChangeText={setSearch} />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText color={theme.colors.textSecondary}>
              No matching people yet. Invite friends with their phone number.
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <AppText
                weight="700"
                color={theme.colors.textSecondary}
                style={styles.section}
              >
                {item.title}
              </AppText>
            );
          }

          return (
            <UserListItem
              name={item.user.name}
              status={item.user.status}
              onPress={() => openChat(item.user)}
            />
          );
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  empty: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
});

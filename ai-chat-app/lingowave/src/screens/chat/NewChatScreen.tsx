import React, { useEffect, useState } from "react";

import {
  FlatList,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import SearchBar from "../../components/chat/SearchBar";
import UserListItem from "../../components/chat/UserListItem";

import { useTheme, Spacing } from "../../theme";
import { ChatStackParamList } from "../../navigation/types";
import type { ChatUser } from "../../types/models";
import { getUsers } from "../../repositories/userRepository";

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "NewChat"
>;

export default function NewChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase().trim())
  );

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
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <UserListItem
            name={item.name}
            status={item.status}
            onPress={() =>
              navigation.navigate("Chat", {
                userId: item.id,
                userName: item.name,
                status: item.status,
              })
            }
          />
        )}
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
});

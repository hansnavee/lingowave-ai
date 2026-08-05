import React, { useCallback, useMemo, useState } from "react";

import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";

import ChatListHeader from "../../components/chat/ChatListHeader";
import SearchBar from "../../components/chat/SearchBar";
import ChatListItem from "../../components/chat/ChatListItem";
import FilterChip from "../../components/chat/FilterChip";
import FloatingButton from "../../components/chat/FloatingActionButton";

import { getChats } from "../../repositories/chatRepository";
import type { Chat } from "../../types/models";

import { useTheme, Spacing } from "../../theme";
import { ChatStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "ChatList"
>;

const FILTER_OPTIONS = ["All", "Unread", "Groups"] as const;

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useFocusEffect(
    useCallback(() => {
      getChats().then(setChats);
    }, [])
  );

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (selectedFilter === "Unread" && chat.unread === 0) {
        return false;
      }

      if (selectedFilter === "Groups" && !chat.isGroup) {
        return false;
      }

      return chat.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
    });
  }, [chats, search, selectedFilter]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ChatListHeader
        greeting="Welcome 👋"
        title="Chats"
        onInvitePress={() => navigation.navigate("Invites")}
      />

      <SearchBar value={search} onChangeText={setSearch} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScrollView}
        contentContainerStyle={styles.chipsContainer}
      >
        {FILTER_OPTIONS.map((filter) => (
          <FilterChip
            key={filter}
            title={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppText
        weight="700"
        style={[
          styles.emptyTitle,
          { color: theme.colors.textPrimary },
        ]}
      >
        No conversations found
      </AppText>

      <AppText
        style={[
          styles.emptySubtitle,
          { color: theme.colors.textSecondary },
        ]}
      >
        {search
          ? `No results matching "${search}"`
          : `You have no ${selectedFilter.toLowerCase()} chats.`}
      </AppText>
    </View>
  );

  return (
    <AppScreen>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Chat }) => (
          <ChatListItem
            chat={item}
            onPress={() =>
              navigation.navigate("Chat", {
                userId: item.id,
                userName: item.name,
              })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />

      <FloatingButton onPress={() => navigation.navigate("NewChat")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 8,
  },
  chipsScrollView: {
    flexGrow: 0,
  },
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

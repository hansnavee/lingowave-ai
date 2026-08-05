import { supabase } from "../lib/supabase";
import { buildChatListItem } from "../lib/chatMappers";
import type { Chat } from "../types/models";
import type { ChatRow } from "../types/database";

async function requireUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getChats(): Promise<Chat[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const { data: memberships, error } = await supabase
    .from("chat_members")
    .select("chat_id, unread_count")
    .eq("user_id", userId);

  if (error || !memberships?.length) {
    if (error) {
      console.warn("getChats failed:", error.message);
    }
    return [];
  }

  const chatIds = memberships.map((row) => row.chat_id);
  const { data: chatRows, error: chatsError } = await supabase
    .from("chats")
    .select("*")
    .in("id", chatIds);

  if (chatsError || !chatRows) {
    console.warn("getChats chats failed:", chatsError?.message);
    return [];
  }

  const chatById = new Map(chatRows.map((chat) => [chat.id, chat]));
  const chats: Chat[] = [];

  for (const membership of memberships) {
    const chat = chatById.get(membership.chat_id);
    if (!chat) {
      continue;
    }

    let displayName = chat.name;
    let phone: string | undefined;

    if (!chat.is_group) {
      const { data: otherMembers } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", chat.id)
        .neq("user_id", userId)
        .limit(1);

      const otherUserId = otherMembers?.[0]?.user_id;
      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", otherUserId)
          .maybeSingle();

        if (profile?.name) {
          displayName = profile.name;
          phone = profile.phone || undefined;
        }
      }
    }

    chats.push(
      buildChatListItem({
        id: chat.id,
        name: displayName,
        lastMessage: chat.last_message,
        lastMessageAt: chat.last_message_at,
        unread: membership.unread_count,
        isGroup: chat.is_group,
        translateEnabled: chat.translate_enabled,
        phone,
      })
    );
  }

  return chats.sort((a, b) => (a.time < b.time ? 1 : -1));
}

export async function getChatById(id: string): Promise<Chat | undefined> {
  const chats = await getChats();
  return chats.find((chat) => chat.id === id);
}

export async function addChat(chat: Chat): Promise<Chat> {
  return chat;
}

export async function setChatTranslateEnabled(
  chatId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from("chats")
    .update({ translate_enabled: enabled })
    .eq("id", chatId);

  if (error) {
    console.warn("setChatTranslateEnabled failed:", error.message);
  }
}

/** Find or create a 1:1 chat with another profile. */
export async function getOrCreateDirectChat(params: {
  otherUserId: string;
  otherUserName: string;
}): Promise<{ ok: true; chat: Chat } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Not signed in." };
  }

  if (params.otherUserId === userId) {
    return { ok: false, error: "You cannot chat with yourself." };
  }

  const { data: myMemberships, error: mineError } = await supabase
    .from("chat_members")
    .select("chat_id")
    .eq("user_id", userId);

  if (mineError) {
    return { ok: false, error: mineError.message };
  }

  const myChatIds = (myMemberships ?? []).map((row) => row.chat_id);

  if (myChatIds.length > 0) {
    const { data: shared } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", params.otherUserId)
      .in("chat_id", myChatIds);

    const sharedIds = (shared ?? []).map((row) => row.chat_id);
    if (sharedIds.length > 0) {
      const { data: existingChats } = await supabase
        .from("chats")
        .select("*")
        .in("id", sharedIds)
        .eq("is_group", false)
        .limit(1);

      const existing = existingChats?.[0] as ChatRow | undefined;
      if (existing) {
        return {
          ok: true,
          chat: buildChatListItem({
            id: existing.id,
            name: params.otherUserName || existing.name,
            lastMessage: existing.last_message,
            lastMessageAt: existing.last_message_at,
            unread: 0,
            isGroup: false,
            translateEnabled: existing.translate_enabled,
          }),
        };
      }
    }
  }

  const { data: created, error: createError } = await supabase
    .from("chats")
    .insert({
      name: params.otherUserName,
      is_group: false,
      last_message: "",
    })
    .select("*")
    .single();

  if (createError || !created) {
    return {
      ok: false,
      error: createError?.message ?? "Could not create chat.",
    };
  }

  const { error: memberError } = await supabase.from("chat_members").insert([
    { chat_id: created.id, user_id: userId },
    { chat_id: created.id, user_id: params.otherUserId },
  ]);

  if (memberError) {
    return { ok: false, error: memberError.message };
  }

  return {
    ok: true,
    chat: buildChatListItem({
      id: created.id,
      name: params.otherUserName,
      lastMessage: "",
      lastMessageAt: null,
      unread: 0,
      isGroup: false,
      translateEnabled: false,
    }),
  };
}

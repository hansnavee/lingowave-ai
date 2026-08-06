import { supabase } from "../lib/supabase";
import { mapMessageRow } from "../lib/chatMappers";
import type { Message } from "../types/models";

async function requireUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.warn("getMessages failed:", error?.message);
    return [];
  }

  return data.map((row) => mapMessageRow(row, userId));
}

/** Persist a newly composed message (and refresh chat preview). */
export async function sendMessage(
  chatId: string,
  message: Omit<Message, "id" | "time"> & { id?: string }
): Promise<Message | null> {
  const userId = await requireUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: userId,
      type: message.type,
      content: message.content,
      original_text: message.originalText ?? message.content,
      translations: message.translations ?? {},
      source_language: message.sourceLanguage ?? null,
      file_name: message.fileName ?? null,
      file_size: message.fileSize ?? null,
      reaction: message.reaction ?? null,
      reply_to_id: message.replyTo?.id ?? null,
      reply_to_content: message.replyTo?.content ?? null,
      starred: Boolean(message.starred),
      pinned: Boolean(message.pinned),
    })
    .select("*")
    .single();

  if (error || !data) {
    console.warn("sendMessage failed:", error?.message);
    return null;
  }

  const preview =
    message.type === "text"
      ? message.content
      : message.type === "image"
        ? "📷 Photo"
        : message.type === "audio"
          ? "🎤 Voice message"
          : message.type === "file"
            ? `📎 ${message.fileName ?? "File"}`
            : message.type === "location"
              ? "📍 Location"
              : message.content;

  await supabase
    .from("chats")
    .update({
      last_message: preview.slice(0, 200),
      last_message_at: data.created_at,
    })
    .eq("id", chatId);

  return mapMessageRow(data, userId);
}

export async function updateMessage(
  messageId: string,
  patch: Partial<
    Pick<Message, "starred" | "pinned" | "reaction" | "translations" | "content">
  >
): Promise<void> {
  const updates: {
    starred?: boolean;
    pinned?: boolean;
    reaction?: string | null;
    translations?: Message["translations"];
    content?: string;
  } = {};

  if (patch.starred !== undefined) updates.starred = patch.starred;
  if (patch.pinned !== undefined) updates.pinned = patch.pinned;
  if (patch.reaction !== undefined) updates.reaction = patch.reaction ?? null;
  if (patch.translations !== undefined) updates.translations = patch.translations;
  if (patch.content !== undefined) updates.content = patch.content;

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", messageId);

  if (error) {
    console.warn("updateMessage failed:", error.message);
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", messageId);

  if (error) {
    console.warn("deleteMessage failed:", error.message);
  }
}

/**
 * Legacy bulk save used by ChatScreen — only updates mutable fields on
 * existing rows. New messages should go through sendMessage.
 */
export async function saveMessages(
  _chatId: string,
  messages: Message[]
): Promise<void> {
  await Promise.all(
    messages.map(async (message) => {
      if (!message.id || message.id.length < 30) {
        return;
      }

      await updateMessage(message.id, {
        starred: message.starred,
        pinned: message.pinned,
        reaction: message.reaction,
        translations: message.translations,
        content: message.content,
      });
    })
  );
}

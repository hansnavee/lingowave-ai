import type {
  Chat,
  Invite,
  Message,
  MessageType,
  PreferredLanguage,
} from "../types/models";
import type { InviteRow, MessageRow } from "../types/database";
import { toPreferredLanguage } from "./mappers";

export function formatChatTime(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function mapInviteRow(row: InviteRow): Invite {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    fromUserName: row.from_user_name,
    toPhone: row.to_phone,
    message: row.message ?? undefined,
    status: row.status as Invite["status"],
    chatId: row.chat_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function mapMessageRow(
  row: MessageRow,
  currentUserId: string | null
): Message {
  const translations =
    row.translations &&
    typeof row.translations === "object" &&
    !Array.isArray(row.translations)
      ? (row.translations as Message["translations"])
      : undefined;

  return {
    id: row.id,
    type: row.type as MessageType,
    content: row.content,
    originalText: row.original_text ?? undefined,
    translations,
    sourceLanguage: toPreferredLanguage(row.source_language),
    fileName: row.file_name ?? undefined,
    fileSize: row.file_size ?? undefined,
    reaction: row.reaction ?? undefined,
    replyTo: row.reply_to_id
      ? {
          id: row.reply_to_id,
          content: row.reply_to_content ?? "",
        }
      : undefined,
    time: formatChatTime(row.created_at),
    isMe: Boolean(currentUserId && row.sender_id === currentUserId),
    starred: row.starred,
    pinned: row.pinned,
    senderId: row.sender_id ?? undefined,
  };
}

export function buildChatListItem(params: {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
  isGroup: boolean;
  translateEnabled: boolean;
  phone?: string;
}): Chat {
  return {
    id: params.id,
    name: params.name,
    message: params.lastMessage || "No messages yet",
    time: formatChatTime(params.lastMessageAt),
    unread: params.unread,
    online: false,
    isGroup: params.isGroup,
    phone: params.phone,
    translateEnabled: params.translateEnabled,
  };
}

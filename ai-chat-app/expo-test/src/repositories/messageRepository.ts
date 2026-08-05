import type { Message } from "../types/models";

const messagesByChat: Record<string, Message[]> = {};

const defaultMessages: Message[] = [
  {
    id: "1",
    type: "text",
    content: "Hello",
    originalText: "Hello",
    sourceLanguage: "en",
    time: "10:30 AM",
    isMe: false,
    senderId: "other",
  },
  {
    id: "2",
    type: "text",
    content: "How are you?",
    originalText: "How are you?",
    sourceLanguage: "en",
    time: "10:31 AM",
    isMe: false,
    senderId: "other",
  },
  {
    id: "3",
    type: "text",
    content: "Thanks!",
    originalText: "Thanks!",
    sourceLanguage: "en",
    time: "10:32 AM",
    isMe: true,
    senderId: "me",
  },
];

function ensureChat(chatId: string): Message[] {
  if (!messagesByChat[chatId]) {
    messagesByChat[chatId] = defaultMessages.map((message) => ({
      ...message,
      translations: message.translations
        ? { ...message.translations }
        : undefined,
    }));
  }

  return messagesByChat[chatId];
}

export async function getMessages(chatId: string): Promise<Message[]> {
  return ensureChat(chatId).map((message) => ({
    ...message,
    translations: message.translations
      ? { ...message.translations }
      : undefined,
  }));
}

export async function saveMessages(
  chatId: string,
  messages: Message[]
): Promise<void> {
  messagesByChat[chatId] = messages.map((message) => ({
    ...message,
    translations: message.translations
      ? { ...message.translations }
      : undefined,
  }));
}

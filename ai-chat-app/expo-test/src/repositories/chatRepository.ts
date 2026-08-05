import type { Chat } from "../types/models";

const chats: Chat[] = [
  {
    id: "1",
    name: "John Smith",
    message: "Hey! How are you?",
    time: "10:30 AM",
    unread: 2,
    online: true,
    isGroup: false,
    phone: "+15551230001",
    translateEnabled: false,
  },
  {
    id: "2",
    name: "AI Assistant",
    message: "Ask me anything...",
    time: "09:45 AM",
    unread: 0,
    online: true,
    isGroup: false,
    translateEnabled: false,
  },
  {
    id: "3",
    name: "Sarah Johnson",
    message: "Let's meet tomorrow.",
    time: "Yesterday",
    unread: 1,
    online: false,
    isGroup: false,
    phone: "+15551230003",
    translateEnabled: false,
  },
  {
    id: "4",
    name: "Michael",
    message: "Thanks!",
    time: "Monday",
    unread: 0,
    online: false,
    isGroup: false,
    phone: "+15551230004",
    translateEnabled: false,
  },
  {
    id: "5",
    name: "Emma",
    message: "See you soon 😊",
    time: "Sunday",
    unread: 4,
    online: true,
    isGroup: false,
    phone: "+15551230005",
    translateEnabled: false,
  },
  {
    id: "6",
    name: "Project Design Team",
    message: "Alex: Updated the Figma links",
    time: "11:15 AM",
    unread: 3,
    online: true,
    isGroup: true,
    translateEnabled: false,
  },
];

export async function getChats(): Promise<Chat[]> {
  return [...chats];
}

export async function getChatById(id: string): Promise<Chat | undefined> {
  return chats.find((chat) => chat.id === id);
}

export async function addChat(chat: Chat): Promise<Chat> {
  const existing = chats.findIndex((item) => item.id === chat.id);
  if (existing >= 0) {
    chats[existing] = chat;
  } else {
    chats.unshift(chat);
  }
  return chat;
}

export async function setChatTranslateEnabled(
  chatId: string,
  enabled: boolean
): Promise<void> {
  const chat = chats.find((item) => item.id === chatId);
  if (chat) {
    chat.translateEnabled = enabled;
  }
}

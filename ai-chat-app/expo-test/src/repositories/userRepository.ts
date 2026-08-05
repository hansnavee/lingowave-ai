import type { ChatUser } from "../types/models";

const users: ChatUser[] = [
  {
    id: "1",
    name: "John Smith",
    status: "Online",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    status: "Last seen 10 min ago",
  },
  {
    id: "3",
    name: "AI Assistant",
    status: "Always available",
  },
];

export async function getUsers(): Promise<ChatUser[]> {
  return [...users];
}

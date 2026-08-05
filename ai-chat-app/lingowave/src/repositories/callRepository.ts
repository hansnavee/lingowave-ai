import type { CallRecord } from "../types/models";

const calls: CallRecord[] = [
  {
    id: "1",
    name: "John Smith",
    type: "Incoming call",
    time: "Today, 10:30 AM",
    icon: "👤",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    type: "Outgoing call",
    time: "Yesterday, 5:20 PM",
    icon: "👩",
  },
  {
    id: "3",
    name: "AI Assistant",
    type: "AI voice call",
    time: "Monday, 9:00 AM",
    icon: "🤖",
  },
];

export async function getCalls(): Promise<CallRecord[]> {
  return [...calls];
}

import type { CallRecord } from "../types/models";

export type CallType = "audio" | "video";

export type CallStatus =
  | "ringing"
  | "accepted"
  | "active"
  | "ended"
  | "declined"
  | "missed";

export type CallSession = {
  id: string;
  callerId: string;
  calleeId: string;
  callType: CallType;
  status: CallStatus;
  roomName: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  peerName?: string;
};

export type LiveKitCredentials = {
  token: string;
  url: string;
  roomName: string;
  callType: CallType;
};

export function toCallRecord(
  session: CallSession,
  currentUserId: string
): CallRecord {
  const outgoing = session.callerId === currentUserId;
  const label =
    session.callType === "video"
      ? outgoing
        ? "Outgoing video"
        : "Incoming video"
      : outgoing
        ? "Outgoing call"
        : "Incoming call";

  const when = session.createdAt
    ? new Date(session.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return {
    id: session.id,
    name: session.peerName ?? "Unknown",
    type:
      session.status === "missed"
        ? "Missed call"
        : session.status === "declined"
          ? "Declined call"
          : label,
    time: when,
    icon: session.callType === "video" ? "📹" : "📞",
    peerUserId: outgoing ? session.calleeId : session.callerId,
    callType: session.callType,
    status: session.status,
  };
}

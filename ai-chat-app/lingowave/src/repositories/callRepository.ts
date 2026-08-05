import { supabase } from "../lib/supabase";
import type { CallSession, CallType } from "../types/calls";
import { toCallRecord } from "../types/calls";
import type { CallRecord } from "../types/models";

export type { CallSession, CallType };

type CallRow = {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: CallType;
  status: CallSession["status"];
  room_name: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

function mapRow(row: CallRow, peerName?: string): CallSession {
  return {
    id: row.id,
    callerId: row.caller_id,
    calleeId: row.callee_id,
    callType: row.call_type,
    status: row.status,
    roomName: row.room_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    peerName,
  };
}

async function requireUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

async function getProfileName(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  return data?.name ?? "Unknown";
}

export async function getOtherChatMemberId(
  chatId: string
): Promise<string | null> {
  const userId = await requireUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("chat_members")
    .select("user_id")
    .eq("chat_id", chatId)
    .neq("user_id", userId)
    .limit(1);

  if (error || !data?.[0]) {
    return null;
  }

  return data[0].user_id;
}

export async function getCalls(): Promise<CallRecord[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.warn("getCalls failed:", error?.message);
    return [];
  }

  const sessions: CallRecord[] = [];

  for (const row of data as CallRow[]) {
    const peerId = row.caller_id === userId ? row.callee_id : row.caller_id;
    const peerName = await getProfileName(peerId);
    sessions.push(toCallRecord(mapRow(row, peerName), userId));
  }

  return sessions;
}

export async function createCall(params: {
  calleeId: string;
  callType: CallType;
}): Promise<{ ok: true; call: CallSession } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Not signed in." };
  }

  if (params.calleeId === userId) {
    return { ok: false, error: "You cannot call yourself." };
  }

  const roomName = `lw_${userId.slice(0, 8)}_${Date.now()}`;

  const { data, error } = await supabase
    .from("calls")
    .insert({
      caller_id: userId,
      callee_id: params.calleeId,
      call_type: params.callType,
      status: "ringing",
      room_name: roomName,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not start call." };
  }

  const peerName = await getProfileName(params.calleeId);
  return { ok: true, call: mapRow(data as CallRow, peerName) };
}

export async function updateCallStatus(
  callId: string,
  status: CallSession["status"]
): Promise<CallSession | null> {
  const patch: {
    status: CallSession["status"];
    started_at?: string;
    ended_at?: string;
  } = { status };

  if (status === "accepted" || status === "active") {
    patch.started_at = new Date().toISOString();
  }

  if (status === "ended" || status === "declined" || status === "missed") {
    patch.ended_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("calls")
    .update(patch)
    .eq("id", callId)
    .select("*")
    .single();

  if (error || !data) {
    console.warn("updateCallStatus failed:", error?.message);
    return null;
  }

  return mapRow(data as CallRow);
}

export async function getCallById(callId: string): Promise<CallSession | null> {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("id", callId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data as CallRow);
}

export function subscribeIncomingCalls(
  userId: string,
  onCall: (call: CallSession) => void
): () => void {
  const channel = supabase
    .channel(`incoming-calls-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "calls",
        filter: `callee_id=eq.${userId}`,
      },
      async (payload) => {
        const row = payload.new as CallRow;
        if (row.status !== "ringing") {
          return;
        }
        const peerName = await getProfileName(row.caller_id);
        onCall(mapRow(row, peerName));
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "calls",
        filter: `caller_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as CallRow;
        onCall(mapRow(row));
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

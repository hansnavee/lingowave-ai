import { supabase } from "../lib/supabase";
import {
  createCall,
  updateCallStatus,
  type CallSession,
} from "../repositories/callRepository";
import type { CallType, LiveKitCredentials } from "../types/calls";

export async function startOutgoingCall(params: {
  calleeId: string;
  callType: CallType;
}): Promise<{ ok: true; call: CallSession } | { ok: false; error: string }> {
  return createCall(params);
}

export async function acceptIncomingCall(
  callId: string
): Promise<CallSession | null> {
  return updateCallStatus(callId, "accepted");
}

export async function declineIncomingCall(
  callId: string
): Promise<CallSession | null> {
  return updateCallStatus(callId, "declined");
}

export async function endCall(callId: string): Promise<CallSession | null> {
  return updateCallStatus(callId, "ended");
}

export async function markCallActive(
  callId: string
): Promise<CallSession | null> {
  return updateCallStatus(callId, "active");
}

export async function fetchLiveKitToken(
  callId: string
): Promise<
  { ok: true; credentials: LiveKitCredentials } | { ok: false; error: string }
> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "Not signed in." };
  }

  const { data, error } = await supabase.functions.invoke("livekit-token", {
    body: { callId },
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message ||
        "Could not get call token. Configure LiveKit secrets on the Edge Function.",
    };
  }

  if (data?.error) {
    return { ok: false, error: String(data.error) };
  }

  if (!data?.token || !data?.url) {
    return { ok: false, error: "Invalid LiveKit token response." };
  }

  return {
    ok: true,
    credentials: {
      token: data.token,
      url: data.url,
      roomName: data.roomName,
      callType: data.callType,
    },
  };
}

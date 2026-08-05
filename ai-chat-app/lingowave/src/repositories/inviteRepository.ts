import { supabase } from "../lib/supabase";
import { buildChatListItem, mapInviteRow } from "../lib/chatMappers";
import { normalizePhone, validatePhone } from "../utils/validation";
import type { Chat, Invite } from "../types/models";

export async function listInvites(userId: string): Promise<Invite[]> {
  const [outgoing, incoming] = await Promise.all([
    listOutgoingInvites(userId),
    listIncomingForCurrentUser(),
  ]);

  const byId = new Map<string, Invite>();
  for (const invite of [...outgoing, ...incoming]) {
    byId.set(invite.id, invite);
  }

  return [...byId.values()];
}

export async function listOutgoingInvites(
  userId: string
): Promise<Invite[]> {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("from_user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("listOutgoingInvites failed:", error?.message);
    return [];
  }

  return data.map(mapInviteRow);
}

export async function listIncomingByPhone(
  phone: string
): Promise<Invite[]> {
  const normalized = normalizePhone(phone);

  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("to_phone", normalized)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("listIncomingByPhone failed:", error?.message);
    return [];
  }

  return data.map(mapInviteRow);
}

async function listIncomingForCurrentUser(): Promise<Invite[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile?.phone) {
    return [];
  }

  return listIncomingByPhone(profile.phone);
}

export async function createInvites(params: {
  fromUserId: string;
  fromUserName: string;
  phones: string[];
  message?: string;
}): Promise<{ ok: true; invites: Invite[] } | { ok: false; error: string }> {
  const cleaned = params.phones
    .map((phone) => phone.trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return { ok: false, error: "Add at least one phone number." };
  }

  for (const phone of cleaned) {
    const error = validatePhone(phone);
    if (error) {
      return { ok: false, error: `${phone}: ${error}` };
    }
  }

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const rows = cleaned.map((phone) => ({
    from_user_id: params.fromUserId,
    from_user_name: params.fromUserName,
    to_phone: normalizePhone(phone),
    message: params.message?.trim() || null,
    status: "pending",
    expires_at: expiresAt,
  }));

  const { data, error } = await supabase
    .from("invites")
    .insert(rows)
    .select("*");

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create invites." };
  }

  return { ok: true, invites: data.map(mapInviteRow) };
}

export async function acceptInvite(params: {
  inviteId: string;
  acceptorUserId: string;
  acceptorName: string;
}): Promise<{ ok: true; chat: Chat } | { ok: false; error: string }> {
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("*")
    .eq("id", params.inviteId)
    .maybeSingle();

  if (inviteError || !invite) {
    return { ok: false, error: "Invite not found." };
  }

  if (invite.status !== "pending") {
    return { ok: false, error: "This invite is no longer pending." };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await supabase
      .from("invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return { ok: false, error: "This invite has expired." };
  }

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .insert({
      name: invite.from_user_name,
      is_group: false,
      last_message: invite.message || "Invite accepted — say hello!",
      last_message_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (chatError || !chat) {
    return {
      ok: false,
      error: chatError?.message ?? "Could not create chat.",
    };
  }

  const { error: memberError } = await supabase.from("chat_members").insert([
    { chat_id: chat.id, user_id: params.acceptorUserId, unread_count: 1 },
    { chat_id: chat.id, user_id: invite.from_user_id, unread_count: 0 },
  ]);

  if (memberError) {
    return { ok: false, error: memberError.message };
  }

  const { error: updateError } = await supabase
    .from("invites")
    .update({ status: "accepted", chat_id: chat.id })
    .eq("id", invite.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return {
    ok: true,
    chat: buildChatListItem({
      id: chat.id,
      name: invite.from_user_name,
      lastMessage: invite.message || "Invite accepted — say hello!",
      lastMessageAt: chat.last_message_at,
      unread: 1,
      isGroup: false,
      translateEnabled: false,
      phone: invite.to_phone,
    }),
  };
}

/** Demo helper — no-op on Supabase (cannot invent foreign keys). */
export async function seedIncomingInviteForDemo(_params: {
  toPhone: string;
  fromUserName?: string;
}): Promise<Invite | null> {
  return null;
}

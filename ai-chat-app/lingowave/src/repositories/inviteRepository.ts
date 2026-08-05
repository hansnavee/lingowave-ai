import type { Chat, Invite } from "../types/models";
import { normalizePhone, validatePhone } from "../utils/validation";
import { addChat } from "./chatRepository";

let invites: Invite[] = [];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listInvites(userId: string): Promise<Invite[]> {
  await delay(150);
  return invites
    .filter(
      (invite) =>
        invite.fromUserId === userId ||
        invite.status === "pending"
    )
    .map((invite) => ({ ...invite }));
}

export async function listOutgoingInvites(
  userId: string
): Promise<Invite[]> {
  await delay(150);
  return invites
    .filter((invite) => invite.fromUserId === userId)
    .map((invite) => ({ ...invite }));
}

export async function listIncomingByPhone(
  phone: string
): Promise<Invite[]> {
  const normalized = normalizePhone(phone);
  await delay(150);
  return invites
    .filter(
      (invite) =>
        normalizePhone(invite.toPhone) === normalized &&
        invite.status === "pending"
    )
    .map((invite) => ({ ...invite }));
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

  await delay();

  const now = Date.now();
  const created: Invite[] = cleaned.map((phone, index) => {
    const expires = new Date(now + 7 * 24 * 60 * 60 * 1000);
    return {
      id: `invite_${now}_${index}`,
      fromUserId: params.fromUserId,
      fromUserName: params.fromUserName,
      toPhone: normalizePhone(phone),
      message: params.message?.trim() || undefined,
      status: "pending",
      createdAt: new Date(now).toISOString(),
      expiresAt: expires.toISOString(),
    };
  });

  invites = [...created, ...invites];
  return { ok: true, invites: created };
}

export async function acceptInvite(params: {
  inviteId: string;
  acceptorUserId: string;
  acceptorName: string;
}): Promise<{ ok: true; chat: Chat } | { ok: false; error: string }> {
  const invite = invites.find((item) => item.id === params.inviteId);

  if (!invite) {
    return { ok: false, error: "Invite not found." };
  }

  if (invite.status !== "pending") {
    return { ok: false, error: "This invite is no longer pending." };
  }

  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    invite.status = "expired";
    return { ok: false, error: "This invite has expired." };
  }

  await delay();

  const chatId = `chat_${invite.id}`;
  const chat: Chat = {
    id: chatId,
    name: invite.fromUserName,
    message: invite.message || "Invite accepted — say hello!",
    time: "Now",
    unread: 1,
    online: true,
    isGroup: false,
    phone: invite.toPhone,
    translateEnabled: false,
  };

  await addChat(chat);

  invite.status = "accepted";
  invite.chatId = chatId;

  return { ok: true, chat };
}

/** Demo helper: create a pending invite addressed to the current user's phone. */
export async function seedIncomingInviteForDemo(params: {
  toPhone: string;
  fromUserName?: string;
}): Promise<Invite> {
  const invite: Invite = {
    id: `invite_demo_${Date.now()}`,
    fromUserId: "user_demo_sender",
    fromUserName: params.fromUserName ?? "Alex Traveler",
    toPhone: normalizePhone(params.toPhone),
    message: "Let's chat across languages!",
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  invites = [invite, ...invites];
  return invite;
}

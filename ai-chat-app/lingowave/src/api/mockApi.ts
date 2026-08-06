/**
 * Mock API façade used until a real backend exists.
 * Wraps existing repositories/services so Phase 1 UI and Phase 2 contracts stay aligned.
 */

import type {
  AuthApi,
  BillingApi,
  ChatApi,
  InviteApi,
  RealtimeClient,
  TranslationApi,
} from "./types";
import {
  loginRequest,
  signupRequest,
  updateUserProfile,
} from "../services/authService";
import {
  acceptInvite,
  createInvites,
  listIncomingByPhone,
  listOutgoingInvites,
} from "../repositories/inviteRepository";
import {
  getChatById,
  getChats,
  setChatTranslateEnabled,
} from "../repositories/chatRepository";
import {
  getMessages,
  sendMessage,
} from "../repositories/messageRepository";
import { translateText } from "../services/translationService";
import {
  getSubscription,
  purchaseSubscription,
  restoreSubscription,
} from "../services/subscriptionService";
import { loadSession } from "../services/sessionStorage";

async function requireUser() {
  const session = await loadSession();
  if (!session) {
    return null;
  }
  return session.user;
}

export const mockAuthApi: AuthApi = {
  async login(email, password) {
    const result = await loginRequest(email, password);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return {
      ok: true,
      data: { token: result.session.token, user: result.session.user },
    };
  },
  async signup(input) {
    const result = await signupRequest(
      input.name,
      input.email,
      input.password,
      input.phone,
      input.countryCode,
      input.dateOfBirth,
      input.birthPlace
    );
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return {
      ok: true,
      data: { token: result.session.token, user: result.session.user },
    };
  },
  async updateProfile(_token, patch) {
    const result = await updateUserProfile(patch);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, data: result.session.user };
  },
};

export const mockInviteApi: InviteApi = {
  async create(_token, input) {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    const result = await createInvites({
      fromUserId: user.id,
      fromUserName: user.name,
      phones: input.phones,
      message: input.message,
    });
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, data: result.invites };
  },
  async listOutgoing(_token) {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    return { ok: true, data: await listOutgoingInvites(user.id) };
  },
  async listIncoming(_token) {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    return { ok: true, data: await listIncomingByPhone(user.phone) };
  },
  async accept(_token, inviteId) {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    const result = await acceptInvite({
      inviteId,
      acceptorUserId: user.id,
      acceptorName: user.name,
    });
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, data: { chat: result.chat } };
  },
};

export const mockChatApi: ChatApi = {
  async listChats() {
    return { ok: true, data: await getChats() };
  },
  async listMessages(_token, chatId) {
    return { ok: true, data: await getMessages(chatId) };
  },
  async sendMessage(_token, chatId, message) {
    const created = await sendMessage(chatId, message);
    if (!created) {
      return { ok: false, error: "Could not send message" };
    }
    return { ok: true, data: created };
  },
  async setTranslateEnabled(_token, chatId, enabled) {
    await setChatTranslateEnabled(chatId, enabled);
    const chat = await getChatById(chatId);
    if (!chat) {
      return { ok: false, error: "Chat not found" };
    }
    return { ok: true, data: { ...chat, translateEnabled: enabled } };
  },
};

export const mockTranslationApi: TranslationApi = {
  async translateText(_token, input) {
    const result = await translateText(input);
    return {
      ok: true,
      data: {
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        cached: false,
      },
    };
  },
};

export const mockBillingApi: BillingApi = {
  async getSubscription() {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    return { ok: true, data: await getSubscription(user.id) };
  },
  async confirmPurchase(_token, input) {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    // Mock receipt validation — always accepts non-empty receipt.
    if (!input.receipt) {
      return { ok: false, error: "Invalid receipt", code: "INVALID_RECEIPT" };
    }
    return {
      ok: true,
      data: await purchaseSubscription(user.id, input.plan),
    };
  },
  async restore() {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    return { ok: true, data: await restoreSubscription(user.id) };
  },
};

export const mockRealtimeClient: RealtimeClient = {
  async connect() {
    // no-op mock
  },
  disconnect() {
    // no-op mock
  },
  subscribe() {
    return () => undefined;
  },
};

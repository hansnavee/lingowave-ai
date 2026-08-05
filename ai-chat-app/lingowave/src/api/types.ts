/**
 * Phase 2 API contracts.
 * Mobile app talks to these interfaces; swap Mock* for HTTP clients later.
 */

import type {
  AuthUser,
  Chat,
  Invite,
  Message,
  PreferredLanguage,
  Subscription,
  SubscriptionPlan,
} from "../types/models";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface AuthApi {
  login(email: string, password: string): Promise<ApiResult<{ token: string; user: AuthUser }>>;
  signup(input: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<ApiResult<{ token: string; user: AuthUser }>>;
  updateProfile(
    token: string,
    patch: Partial<Pick<AuthUser, "name" | "phone" | "preferredLanguage">>
  ): Promise<ApiResult<AuthUser>>;
}

export interface InviteApi {
  create(
    token: string,
    input: { phones: string[]; message?: string }
  ): Promise<ApiResult<Invite[]>>;
  listOutgoing(token: string): Promise<ApiResult<Invite[]>>;
  listIncoming(token: string): Promise<ApiResult<Invite[]>>;
  accept(token: string, inviteId: string): Promise<ApiResult<{ chat: Chat }>>;
}

export interface ChatApi {
  listChats(token: string): Promise<ApiResult<Chat[]>>;
  listMessages(token: string, chatId: string): Promise<ApiResult<Message[]>>;
  sendMessage(
    token: string,
    chatId: string,
    message: Omit<Message, "id" | "time">
  ): Promise<ApiResult<Message>>;
  setTranslateEnabled(
    token: string,
    chatId: string,
    enabled: boolean
  ): Promise<ApiResult<Chat>>;
}

export interface TranslationApi {
  translateText(
    token: string,
    input: {
      text: string;
      targetLanguage: PreferredLanguage;
      sourceLanguage?: PreferredLanguage;
    }
  ): Promise<
    ApiResult<{
      translatedText: string;
      sourceLanguage: PreferredLanguage;
      cached: boolean;
    }>
  >;
}

export interface BillingApi {
  getSubscription(token: string): Promise<ApiResult<Subscription>>;
  /** Server validates store receipt then returns entitlement */
  confirmPurchase(
    token: string,
    input: {
      plan: SubscriptionPlan;
      receipt: string;
      store: "app_store" | "play" | "mock";
    }
  ): Promise<ApiResult<Subscription>>;
  restore(token: string): Promise<ApiResult<Subscription>>;
}

export type RealtimeEvent =
  | { type: "message.created"; chatId: string; message: Message }
  | { type: "invite.accepted"; inviteId: string; chatId: string }
  | { type: "typing"; chatId: string; userId: string };

export interface RealtimeClient {
  connect(token: string): Promise<void>;
  disconnect(): void;
  subscribe(
    chatId: string,
    handler: (event: RealtimeEvent) => void
  ): () => void;
}

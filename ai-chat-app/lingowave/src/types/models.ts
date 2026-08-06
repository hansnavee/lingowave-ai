export type PreferredLanguage =
  | "en"
  | "hi"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ar"
  | "zh"
  | "ja"
  | "ko";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredLanguage?: PreferredLanguage;
  avatarUrl?: string;
  avatarPreviousUrl?: string;
  avatarRefreshAt?: string;
  avatarUndoExpiresAt?: string;
  avatarRefreshDay?: string;
  avatarFilterName?: string;
  countryCode?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  createdAt: string;
};

export type Chat = {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  phone?: string;
  translateEnabled?: boolean;
};

export type ChatUser = {
  id: string;
  name: string;
  status: string;
  phone?: string;
};

export type MessageType =
  | "text"
  | "image"
  | "audio"
  | "file"
  | "location"
  | "system";

export type Message = {
  id: string;
  type: MessageType;
  /** Original message text or media URI */
  content: string;
  originalText?: string;
  /** Cached translations keyed by language code */
  translations?: Partial<Record<PreferredLanguage, string>>;
  sourceLanguage?: PreferredLanguage;
  fileName?: string;
  fileSize?: number;
  reaction?: string;
  replyTo?: {
    id: string;
    content: string;
  };
  time: string;
  isMe: boolean;
  starred?: boolean;
  pinned?: boolean;
  senderId?: string;
};

export type InviteStatus = "pending" | "accepted" | "expired";

export type Invite = {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toPhone: string;
  message?: string;
  status: InviteStatus;
  chatId?: string;
  createdAt: string;
  expiresAt: string;
};

export type SubscriptionPlan = "monthly" | "quarterly" | "yearly";

export type SubscriptionStatus = "active" | "expired" | "none";

export type Subscription = {
  userId: string;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  expiresAt: string | null;
  storeProductId: string | null;
  updatedAt: string;
};

export type CallRecord = {
  id: string;
  name: string;
  type: string;
  time: string;
  icon: string;
  peerUserId?: string;
  callType?: "audio" | "video";
  status?: string;
};

export type AIMessage = {
  id: string;
  text: string;
  isUser: boolean;
  time?: string;
};

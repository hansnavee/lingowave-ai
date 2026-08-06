export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfilesTable = {
  Row: {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferred_language: string | null;
    avatar_url: string | null;
    avatar_previous_url: string | null;
    avatar_refresh_at: string | null;
    avatar_undo_expires_at: string | null;
    avatar_refresh_day: string | null;
    avatar_filter_name: string | null;
    country_code: string | null;
    last_seen_at: string | null;
    date_of_birth: string | null;
    birth_place: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    preferred_language?: string | null;
    avatar_url?: string | null;
    avatar_previous_url?: string | null;
    avatar_refresh_at?: string | null;
    avatar_undo_expires_at?: string | null;
    avatar_refresh_day?: string | null;
    avatar_filter_name?: string | null;
    country_code?: string | null;
    last_seen_at?: string | null;
    date_of_birth?: string | null;
    birth_place?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    preferred_language?: string | null;
    avatar_url?: string | null;
    avatar_previous_url?: string | null;
    avatar_refresh_at?: string | null;
    avatar_undo_expires_at?: string | null;
    avatar_refresh_day?: string | null;
    avatar_filter_name?: string | null;
    country_code?: string | null;
    last_seen_at?: string | null;
    date_of_birth?: string | null;
    birth_place?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
};

type DailyPredictionsTable = {
  Row: {
    id: string;
    user_id: string;
    prediction_date: string;
    zodiac_sign: string;
    lucky_number: number;
    lucky_color: string;
    lucky_color_hex: string;
    message: string;
    score: number;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    prediction_date?: string;
    zodiac_sign: string;
    lucky_number: number;
    lucky_color: string;
    lucky_color_hex?: string;
    message: string;
    score?: number;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    prediction_date?: string;
    zodiac_sign?: string;
    lucky_number?: number;
    lucky_color?: string;
    lucky_color_hex?: string;
    message?: string;
    score?: number;
    created_at?: string;
  };
  Relationships: [];
};

type BlockedUsersTable = {
  Row: {
    blocker_id: string;
    blocked_id: string;
    created_at: string;
  };
  Insert: {
    blocker_id: string;
    blocked_id: string;
    created_at?: string;
  };
  Update: {
    blocker_id?: string;
    blocked_id?: string;
    created_at?: string;
  };
  Relationships: [];
};

type NotificationsTable = {
  Row: {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
    data: Json;
    read: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    type?: string;
    title: string;
    body?: string;
    data?: Json;
    read?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    type?: string;
    title?: string;
    body?: string;
    data?: Json;
    read?: boolean;
    created_at?: string;
  };
  Relationships: [];
};

type ChatsTable = {
  Row: {
    id: string;
    name: string;
    is_group: boolean;
    translate_enabled: boolean;
    last_message: string;
    last_message_at: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    is_group?: boolean;
    translate_enabled?: boolean;
    last_message?: string;
    last_message_at?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    is_group?: boolean;
    translate_enabled?: boolean;
    last_message?: string;
    last_message_at?: string | null;
    created_at?: string;
  };
  Relationships: [];
};

type ChatMembersTable = {
  Row: {
    chat_id: string;
    user_id: string;
    unread_count: number;
    joined_at: string;
  };
  Insert: {
    chat_id: string;
    user_id: string;
    unread_count?: number;
    joined_at?: string;
  };
  Update: {
    chat_id?: string;
    user_id?: string;
    unread_count?: number;
    joined_at?: string;
  };
  Relationships: [];
};

type MessagesTable = {
  Row: {
    id: string;
    chat_id: string;
    sender_id: string | null;
    type: string;
    content: string;
    original_text: string | null;
    translations: Json;
    source_language: string | null;
    file_name: string | null;
    file_size: number | null;
    reaction: string | null;
    reply_to_id: string | null;
    reply_to_content: string | null;
    starred: boolean;
    pinned: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    chat_id: string;
    sender_id?: string | null;
    type?: string;
    content: string;
    original_text?: string | null;
    translations?: Json;
    source_language?: string | null;
    file_name?: string | null;
    file_size?: number | null;
    reaction?: string | null;
    reply_to_id?: string | null;
    reply_to_content?: string | null;
    starred?: boolean;
    pinned?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    chat_id?: string;
    sender_id?: string | null;
    type?: string;
    content?: string;
    original_text?: string | null;
    translations?: Json;
    source_language?: string | null;
    file_name?: string | null;
    file_size?: number | null;
    reaction?: string | null;
    reply_to_id?: string | null;
    reply_to_content?: string | null;
    starred?: boolean;
    pinned?: boolean;
    created_at?: string;
  };
  Relationships: [];
};

type InvitesTable = {
  Row: {
    id: string;
    from_user_id: string;
    from_user_name: string;
    to_phone: string;
    message: string | null;
    status: string;
    chat_id: string | null;
    created_at: string;
    expires_at: string;
  };
  Insert: {
    id?: string;
    from_user_id: string;
    from_user_name: string;
    to_phone: string;
    message?: string | null;
    status?: string;
    chat_id?: string | null;
    created_at?: string;
    expires_at: string;
  };
  Update: {
    id?: string;
    from_user_id?: string;
    from_user_name?: string;
    to_phone?: string;
    message?: string | null;
    status?: string;
    chat_id?: string | null;
    created_at?: string;
    expires_at?: string;
  };
  Relationships: [];
};

type SubscriptionsTable = {
  Row: {
    user_id: string;
    plan: string | null;
    status: string;
    expires_at: string | null;
    store_product_id: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    provider: string | null;
    updated_at: string;
  };
  Insert: {
    user_id: string;
    plan?: string | null;
    status?: string;
    expires_at?: string | null;
    store_product_id?: string | null;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    provider?: string | null;
    updated_at?: string;
  };
  Update: {
    user_id?: string;
    plan?: string | null;
    status?: string;
    expires_at?: string | null;
    store_product_id?: string | null;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    provider?: string | null;
    updated_at?: string;
  };
  Relationships: [];
};

type CallsTable = {
  Row: {
    id: string;
    caller_id: string;
    callee_id: string;
    call_type: string;
    status: string;
    room_name: string;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    caller_id: string;
    callee_id: string;
    call_type: string;
    status?: string;
    room_name: string;
    started_at?: string | null;
    ended_at?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    caller_id?: string;
    callee_id?: string;
    call_type?: string;
    status?: string;
    room_name?: string;
    started_at?: string | null;
    ended_at?: string | null;
    created_at?: string;
  };
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: ProfilesTable;
      chats: ChatsTable;
      chat_members: ChatMembersTable;
      messages: MessagesTable;
      invites: InvitesTable;
      subscriptions: SubscriptionsTable;
      calls: CallsTable;
      blocked_users: BlockedUsersTable;
      notifications: NotificationsTable;
      daily_predictions: DailyPredictionsTable;
    };
    Views: Record<string, never>;
    Functions: {
      is_phone_taken: {
        Args: { p_phone: string };
        Returns: boolean;
      };
      is_email_taken: {
        Args: { p_email: string };
        Returns: boolean;
      };
      find_profiles_by_phones: {
        Args: { p_phones: string[] };
        Returns: { id: string; name: string; phone: string }[];
      };
      touch_presence: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      request_account_cleanup: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      clear_expired_avatar_undo: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      has_active_ai_entitlement: {
        Args: { p_user_id?: string };
        Returns: boolean;
      };
      create_notification: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_title: string;
          p_body?: string;
          p_data?: Json;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ChatRow = Database["public"]["Tables"]["chats"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type InviteRow = Database["public"]["Tables"]["invites"]["Row"];
export type SubscriptionRow =
  Database["public"]["Tables"]["subscriptions"]["Row"];

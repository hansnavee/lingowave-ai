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
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    preferred_language?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    preferred_language?: string | null;
    created_at?: string;
    updated_at?: string;
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
    updated_at: string;
  };
  Insert: {
    user_id: string;
    plan?: string | null;
    status?: string;
    expires_at?: string | null;
    store_product_id?: string | null;
    updated_at?: string;
  };
  Update: {
    user_id?: string;
    plan?: string | null;
    status?: string;
    expires_at?: string | null;
    store_product_id?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
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

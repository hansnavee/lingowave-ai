import { supabase } from "../lib/supabase";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

async function requireUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.warn("getNotifications failed:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    data:
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {},
    read: row.read,
    createdAt: row.created_at,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const userId = await requireUserId();
  if (!userId) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.warn("getUnreadNotificationCount failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    console.warn("markNotificationRead failed:", error.message);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await requireUserId();
  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.warn("markAllNotificationsRead failed:", error.message);
  }
}

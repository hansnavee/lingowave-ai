import { supabase } from "../lib/supabase";

async function requireUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export type BlockedUser = {
  id: string;
  name: string;
  blockedAt: string;
};

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocked_id, created_at")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    if (error) {
      console.warn("getBlockedUsers failed:", error.message);
    }
    return [];
  }

  const ids = data.map((row) => row.blocked_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", ids);

  const nameById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.name])
  );

  return data.map((row) => ({
    id: row.blocked_id,
    name: nameById.get(row.blocked_id) ?? "Unknown",
    blockedAt: row.created_at,
  }));
}

export async function isUserBlocked(otherUserId: string): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) {
    return false;
  }

  const { data } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", userId)
    .eq("blocked_id", otherUserId)
    .maybeSingle();

  return Boolean(data);
}

export async function blockUser(
  otherUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Not signed in." };
  }

  if (otherUserId === userId) {
    return { ok: false, error: "You cannot block yourself." };
  }

  const { error } = await supabase.from("blocked_users").upsert(
    {
      blocker_id: userId,
      blocked_id: otherUserId,
    },
    { onConflict: "blocker_id,blocked_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function unblockUser(
  otherUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Not signed in." };
  }

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", otherUserId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getBlockedIds(): Promise<Set<string>> {
  const users = await getBlockedUsers();
  return new Set(users.map((user) => user.id));
}

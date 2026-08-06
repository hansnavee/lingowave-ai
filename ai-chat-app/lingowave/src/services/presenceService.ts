import { supabase } from "../lib/supabase";

const ONLINE_MS = 2 * 60 * 1000;

export function isOnlineFromLastSeen(
  lastSeenAt: string | null | undefined
): boolean {
  if (!lastSeenAt) {
    return false;
  }

  const ts = new Date(lastSeenAt).getTime();
  if (Number.isNaN(ts)) {
    return false;
  }

  return Date.now() - ts < ONLINE_MS;
}

export async function touchPresence(): Promise<void> {
  const { error } = await supabase.rpc("touch_presence");
  if (error) {
    console.warn("touchPresence failed:", error.message);
  }
}

export async function getLastSeenMap(
  userIds: string[]
): Promise<Record<string, string | null>> {
  if (userIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, last_seen_at")
    .in("id", userIds);

  if (error || !data) {
    console.warn("getLastSeenMap failed:", error?.message);
    return {};
  }

  const map: Record<string, string | null> = {};
  for (const row of data) {
    map[row.id] = (row as { last_seen_at?: string | null }).last_seen_at ?? null;
  }
  return map;
}

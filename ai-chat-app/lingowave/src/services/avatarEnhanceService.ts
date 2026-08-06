import { supabase } from "../lib/supabase";
import { profileToAuthUser } from "../lib/mappers";
import type { AuthUser } from "../types/models";
import type { ProfileRow } from "../types/database";
import { saveSession } from "./sessionStorage";

export type AvatarRefreshState = {
  canRefresh: boolean;
  canUndo: boolean;
  undoExpiresAt?: string;
  filterName?: string;
  refreshUsedToday: boolean;
};

function todayUtc(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getAvatarRefreshState(user: AuthUser | null): AvatarRefreshState {
  if (!user?.avatarUrl) {
    return {
      canRefresh: false,
      canUndo: false,
      refreshUsedToday: false,
    };
  }

  const refreshUsedToday = user.avatarRefreshDay === todayUtc();
  const canUndo = Boolean(
    user.avatarPreviousUrl &&
      user.avatarUndoExpiresAt &&
      new Date(user.avatarUndoExpiresAt).getTime() > Date.now()
  );

  return {
    canRefresh: !refreshUsedToday,
    canUndo,
    undoExpiresAt: canUndo ? user.avatarUndoExpiresAt : undefined,
    filterName: user.avatarFilterName,
    refreshUsedToday,
  };
}

async function persistProfile(profile: ProfileRow): Promise<AuthUser> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = profileToAuthUser(profile);
  if (session?.access_token) {
    await saveSession({ token: session.access_token, user });
  }
  return user;
}

export async function clearExpiredAvatarUndo(): Promise<void> {
  await supabase.rpc("clear_expired_avatar_undo");
}

export async function refreshAvatarWithAI(): Promise<
  | { ok: true; user: AuthUser; filter: string; undoExpiresAt: string }
  | { ok: false; error: string }
> {
  await clearExpiredAvatarUndo();

  const { data, error } = await supabase.functions.invoke("enhance-avatar", {
    body: { action: "refresh" },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, error: String(data.error) };
  }

  const profile = (data as { profile?: ProfileRow }).profile;
  if (!profile) {
    return { ok: false, error: "Could not refresh photo." };
  }

  const user = await persistProfile(profile);
  return {
    ok: true,
    user,
    filter: String((data as { filter?: string }).filter ?? "AI Look"),
    undoExpiresAt: String(
      (data as { undoExpiresAt?: string }).undoExpiresAt ?? ""
    ),
  };
}

export async function undoAvatarRefresh(): Promise<
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }
> {
  const { data, error } = await supabase.functions.invoke("enhance-avatar", {
    body: { action: "undo" },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, error: String(data.error) };
  }

  const profile = (data as { profile?: ProfileRow }).profile;
  if (!profile) {
    return { ok: false, error: "Could not undo." };
  }

  const user = await persistProfile(profile);
  return { ok: true, user };
}

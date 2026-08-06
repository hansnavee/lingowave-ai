import type { AuthUser } from "../types/models";
import { memoryStorage } from "../lib/memoryStorage";

const SESSION_KEY = "ai_chat_session";

export type SessionPayload = {
  token: string;
  user: AuthUser;
};

export async function saveSession(session: SessionPayload): Promise<void> {
  const value = JSON.stringify(session);
  try {
    await memoryStorage.setItem(SESSION_KEY, value);
  } catch {
    // ignore persistence failures
  }
}

export async function loadSession(): Promise<SessionPayload | null> {
  try {
    const raw = await memoryStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await memoryStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

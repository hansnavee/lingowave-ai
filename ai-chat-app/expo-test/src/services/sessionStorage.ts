import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "../types/models";

const SESSION_KEY = "ai_chat_session";

export type SessionPayload = {
  token: string;
  user: AuthUser;
};

let memorySession: string | null = null;

async function canUseSecureStore(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function writeRaw(value: string): Promise<void> {
  memorySession = value;

  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(SESSION_KEY, value);
    return;
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, value);
  }
}

async function readRaw(): Promise<string | null> {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(SESSION_KEY);
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(SESSION_KEY);
  }

  return memorySession;
}

async function deleteRaw(): Promise<void> {
  memorySession = null;

  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function saveSession(
  session: SessionPayload
): Promise<void> {
  const value = JSON.stringify(session);

  try {
    await writeRaw(value);
  } catch {
    // Keep login working even if persistence fails.
    memorySession = value;
  }
}

export async function loadSession(): Promise<SessionPayload | null> {
  try {
    const raw = await readRaw();

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as SessionPayload;
  } catch {
    memorySession = null;
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await deleteRaw();
  } catch {
    memorySession = null;
  }
}

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { Subscription } from "../types/models";

const KEY_PREFIX = "ai_chat_subscription_";

let memoryStore: Record<string, string> = {};

async function canUseSecureStore(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

async function writeRaw(key: string, value: string): Promise<void> {
  memoryStore[key] = value;

  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
  }
}

async function readRaw(key: string): Promise<string | null> {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }

  return memoryStore[key] ?? null;
}

async function deleteRaw(key: string): Promise<void> {
  delete memoryStore[key];

  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
  }
}

export async function saveSubscription(
  subscription: Subscription
): Promise<void> {
  const key = keyFor(subscription.userId);
  const value = JSON.stringify(subscription);

  try {
    await writeRaw(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

export async function loadSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const raw = await readRaw(keyFor(userId));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Subscription;
  } catch {
    return null;
  }
}

export async function clearSubscription(userId: string): Promise<void> {
  try {
    await deleteRaw(keyFor(userId));
  } catch {
    delete memoryStore[keyFor(userId)];
  }
}

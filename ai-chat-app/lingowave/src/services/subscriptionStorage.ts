import type { Subscription } from "../types/models";
import { memoryStorage } from "../lib/memoryStorage";

const KEY_PREFIX = "ai_chat_subscription_";

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function saveSubscription(
  subscription: Subscription
): Promise<void> {
  const key = keyFor(subscription.userId);
  const value = JSON.stringify(subscription);
  try {
    await memoryStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export async function loadSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const raw = await memoryStorage.getItem(keyFor(userId));
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
    await memoryStorage.removeItem(keyFor(userId));
  } catch {
    // ignore
  }
}

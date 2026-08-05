import type {
  Subscription,
  SubscriptionPlan,
} from "../types/models";
import {
  clearSubscription,
  loadSubscription,
  saveSubscription,
} from "./subscriptionStorage";
import { getPlanConfig } from "../constants/subscriptionPlans";

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSubscription(
  userId: string
): Promise<Subscription> {
  const stored = await loadSubscription(userId);

  if (!stored) {
    return {
      userId,
      plan: null,
      status: "none",
      expiresAt: null,
      storeProductId: null,
      updatedAt: new Date().toISOString(),
    };
  }

  if (
    stored.status === "active" &&
    stored.expiresAt &&
    new Date(stored.expiresAt).getTime() < Date.now()
  ) {
    const expired: Subscription = {
      ...stored,
      status: "expired",
    };
    await saveSubscription(expired);
    return expired;
  }

  return stored;
}

export async function purchaseSubscription(
  userId: string,
  plan: SubscriptionPlan
): Promise<Subscription> {
  await delay();

  const config = getPlanConfig(plan);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.durationDays);

  const subscription: Subscription = {
    userId,
    plan,
    status: "active",
    expiresAt: expiresAt.toISOString(),
    storeProductId: config.productId,
    updatedAt: new Date().toISOString(),
  };

  await saveSubscription(subscription);
  return subscription;
}

export async function restoreSubscription(
  userId: string
): Promise<Subscription> {
  await delay(300);
  return getSubscription(userId);
}

export async function clearUserSubscription(userId: string): Promise<void> {
  await clearSubscription(userId);
}

export function hasActiveEntitlement(subscription: Subscription): boolean {
  if (subscription.status !== "active" || !subscription.expiresAt) {
    return false;
  }

  return new Date(subscription.expiresAt).getTime() > Date.now();
}

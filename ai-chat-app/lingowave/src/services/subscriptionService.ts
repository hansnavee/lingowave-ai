import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../types/models";
import {
  clearSubscription,
  loadSubscription,
  saveSubscription,
} from "./subscriptionStorage";
import { getPlanConfig } from "../constants/subscriptionPlans";
import { supabase } from "../lib/supabase";

function mapRow(row: {
  user_id: string;
  plan: string | null;
  status: string;
  expires_at: string | null;
  store_product_id: string | null;
  updated_at: string;
}): Subscription {
  const status = (row.status === "active" || row.status === "expired"
    ? row.status
    : "none") as SubscriptionStatus;

  const plan =
    row.plan === "monthly" ||
    row.plan === "quarterly" ||
    row.plan === "yearly"
      ? row.plan
      : null;

  return {
    userId: row.user_id,
    plan,
    status,
    expiresAt: row.expires_at,
    storeProductId: row.store_product_id,
    updatedAt: row.updated_at,
  };
}

function emptySubscription(userId: string): Subscription {
  return {
    userId,
    plan: null,
    status: "none",
    expiresAt: null,
    storeProductId: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getSubscription(
  userId: string
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    let subscription = mapRow(data);

    if (
      subscription.status === "active" &&
      subscription.expiresAt &&
      new Date(subscription.expiresAt).getTime() < Date.now()
    ) {
      subscription = { ...subscription, status: "expired" };
    }

    await saveSubscription(subscription);
    return subscription;
  }

  // Fallback to local cache (offline / first load)
  const stored = await loadSubscription(userId);
  if (stored) {
    if (
      stored.status === "active" &&
      stored.expiresAt &&
      new Date(stored.expiresAt).getTime() < Date.now()
    ) {
      const expired: Subscription = { ...stored, status: "expired" };
      await saveSubscription(expired);
      return expired;
    }
    return stored;
  }

  return emptySubscription(userId);
}

export async function syncSubscriptionFromServer(params?: {
  sessionId?: string;
}): Promise<Subscription | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke("sync-subscription", {
    body: { sessionId: params?.sessionId },
  });

  if (error) {
    console.warn("sync-subscription failed:", error.message);
    return getSubscription(session.user.id);
  }

  if (data?.subscription) {
    const subscription = mapRow(data.subscription);
    await saveSubscription(subscription);
    return subscription;
  }

  return getSubscription(session.user.id);
}

/** Local/demo fallback only — prefer Stripe checkout in production. */
export async function purchaseSubscription(
  userId: string,
  plan: SubscriptionPlan
): Promise<Subscription> {
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
  return (await syncSubscriptionFromServer()) ?? getSubscription(userId);
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

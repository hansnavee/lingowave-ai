import { purchaseSubscription as mockPurchase } from "./subscriptionService";
import { mockIapProvider } from "../providers/aiProviders";
import type { SubscriptionPlan } from "../types/models";
import { loadSession } from "./sessionStorage";

/**
 * Phase 3 bridge: purchase via IAP provider, then persist entitlement.
 * Swap mockIapProvider for RevenueCat and call BillingApi.confirmPurchase on the server.
 */
export async function purchaseViaStore(
  plan: SubscriptionPlan
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await loadSession();
    if (!session) {
      return { ok: false, error: "Not signed in." };
    }

    const { receipt } = await mockIapProvider.purchase(plan);

    if (!receipt) {
      return { ok: false, error: "Purchase cancelled." };
    }

    await mockPurchase(session.user.id, plan);
    return { ok: true };
  } catch {
    return { ok: false, error: "Store purchase failed." };
  }
}

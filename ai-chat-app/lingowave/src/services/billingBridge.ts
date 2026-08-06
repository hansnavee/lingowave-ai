import type { SubscriptionPlan } from "../types/models";
import { supabase } from "../lib/supabase";
import { syncSubscriptionFromServer } from "./subscriptionService";

function allowDemoBilling(): boolean {
  return (
    process.env.EXPO_PUBLIC_ALLOW_DEMO_BILLING === "true" ||
    process.env.EXPO_PUBLIC_ALLOW_DEMO_BILLING === "1"
  );
}

/**
 * Checkout without expo-web-browser (omitted from Vivo-safe APK).
 * Uses demo activation when enabled; otherwise returns a clear error.
 */
export async function purchaseViaStore(
  plan: SubscriptionPlan
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Not signed in." };
    }

    if (!allowDemoBilling()) {
      return {
        ok: false,
        error:
          "In-app browser checkout is disabled on this build. Enable demo billing or use web checkout.",
      };
    }

    const demo = await supabase.functions.invoke(
      "activate-demo-subscription",
      { body: { plan } }
    );

    if (demo.error || (demo.data as { error?: string } | null)?.error) {
      return {
        ok: false,
        error:
          (demo.data as { error?: string } | null)?.error ??
          demo.error?.message ??
          "Demo billing failed.",
      };
    }

    await syncSubscriptionFromServer();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Store purchase failed.",
    };
  }
}

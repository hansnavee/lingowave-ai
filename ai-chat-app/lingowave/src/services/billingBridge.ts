import * as WebBrowser from "expo-web-browser";

import type { SubscriptionPlan } from "../types/models";
import { supabase } from "../lib/supabase";
import { syncSubscriptionFromServer } from "./subscriptionService";

WebBrowser.maybeCompleteAuthSession();

const SUCCESS_URL = "lingowave://subscription?status=success";
const CANCEL_URL = "lingowave://subscription?status=cancel";

function allowDemoBilling(): boolean {
  return (
    process.env.EXPO_PUBLIC_ALLOW_DEMO_BILLING === "true" ||
    process.env.EXPO_PUBLIC_ALLOW_DEMO_BILLING === "1"
  );
}

function extractSessionId(url: string): string | undefined {
  const match = /[?&]session_id=([^&]+)/.exec(url);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Opens Stripe Checkout for AI Translate plans.
 * Falls back to demo activation when Stripe is not configured and demo billing is enabled.
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

    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          plan,
          successUrl: SUCCESS_URL,
          cancelUrl: CANCEL_URL,
        },
      }
    );

    if (!error && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        String(data.url),
        SUCCESS_URL
      );

      if (result.type === "cancel" || result.type === "dismiss") {
        return { ok: false, error: "Checkout cancelled." };
      }

      const sessionId =
        result.type === "success" && result.url
          ? extractSessionId(result.url)
          : undefined;

      await syncSubscriptionFromServer({ sessionId });
      return { ok: true };
    }

    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ??
      error?.message ??
      "Could not start checkout.";

    if (
      allowDemoBilling() &&
      (message.toLowerCase().includes("stripe") ||
        message.toLowerCase().includes("not configured") ||
        message.includes("503"))
    ) {
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
    }

    return { ok: false, error: message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Store purchase failed.",
    };
  }
}

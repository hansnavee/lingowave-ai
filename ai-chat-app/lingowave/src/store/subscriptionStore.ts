import { create } from "zustand";

import type { Subscription, SubscriptionPlan } from "../types/models";
import {
  getSubscription,
  hasActiveEntitlement,
  restoreSubscription,
} from "../services/subscriptionService";

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  hydrate: (userId: string) => Promise<void>;
  purchase: (userId: string, plan: SubscriptionPlan) => Promise<boolean>;
  restore: (userId: string) => Promise<boolean>;
  isEntitled: () => boolean;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  hydrate: async (userId) => {
    set({ isLoading: true, error: null });
    const subscription = await getSubscription(userId);
    set({ subscription, isLoading: false });
  },

  purchase: async (userId, plan) => {
    set({ isLoading: true, error: null });

    try {
      const { purchaseViaStore } = await import("../services/billingBridge");
      const storeResult = await purchaseViaStore(plan);

      if (!storeResult.ok) {
        set({
          isLoading: false,
          error: storeResult.error,
        });
        return false;
      }

      const subscription = await getSubscription(userId);
      set({ subscription, isLoading: false });
      return hasActiveEntitlement(subscription);
    } catch {
      set({
        isLoading: false,
        error: "Purchase failed. Please try again.",
      });
      return false;
    }
  },

  restore: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const subscription = await restoreSubscription(userId);
      set({ subscription, isLoading: false });
      return hasActiveEntitlement(subscription);
    } catch {
      set({
        isLoading: false,
        error: "Could not restore purchases.",
      });
      return false;
    }
  },

  isEntitled: () => {
    const subscription = get().subscription;
    if (!subscription) {
      return false;
    }
    return hasActiveEntitlement(subscription);
  },
}));

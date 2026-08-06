import React, { useEffect } from "react";

import { ensureTodayFortuneForCurrentUser } from "../../services/dailyPredictionService";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { hasActiveEntitlement } from "../../services/subscriptionService";

/**
 * Delivers today's lucky number/color notification once per day
 * for AI-subscribed users when the app is open.
 */
export default function DailyFortuneListener() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userId = useAuthStore((state) => state.user?.id);
  const hasDob = useAuthStore((state) => Boolean(state.user?.dateOfBirth));
  const subscription = useSubscriptionStore((state) => state.subscription);
  const entitled = subscription
    ? hasActiveEntitlement(subscription)
    : false;

  useEffect(() => {
    if (!isLoggedIn || !userId || !hasDob || !entitled) {
      return;
    }

    void ensureTodayFortuneForCurrentUser();
  }, [isLoggedIn, userId, hasDob, entitled]);

  return null;
}

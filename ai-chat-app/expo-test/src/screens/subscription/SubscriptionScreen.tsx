import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";

import { SUBSCRIPTION_PLANS } from "../../constants/subscriptionPlans";
import type { SubscriptionPlan } from "../../types/models";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useTheme, Spacing, Typography } from "../../theme";

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const purchase = useSubscriptionStore((state) => state.purchase);
  const restore = useSubscriptionStore((state) => state.restore);
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);

  const [selected, setSelected] = useState<SubscriptionPlan>(
    subscription?.plan ?? "yearly"
  );

  const handlePurchase = async () => {
    if (!user) {
      return;
    }

    const ok = await purchase(user.id, selected);

    if (ok) {
      Alert.alert(
        "Subscribed",
        "AI Translate is unlocked for messages, voice, and calls.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        "Purchase failed",
        useSubscriptionStore.getState().error ?? "Try again."
      );
    }
  };

  const handleRestore = async () => {
    if (!user) {
      return;
    }

    const ok = await restore(user.id);
    Alert.alert(
      ok ? "Restored" : "No active plan",
      ok
        ? "Your AI Translate subscription is active."
        : "We could not find an active subscription for this account."
    );
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AppText color={theme.colors.primary} weight="600">
            ← Back
          </AppText>
        </TouchableOpacity>

        <AppText size={Typography.h1} weight="700" style={styles.title}>
          AI Translate
        </AppText>

        <AppText color={theme.colors.textSecondary} style={styles.subtitle}>
          Free chat and calls stay in the original language. Subscribe to
          translate into your preferred language.
        </AppText>

        {isEntitled() ? (
          <View
            style={[
              styles.activeCard,
              {
                backgroundColor: theme.colors.primaryMuted,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <AppText weight="700" color={theme.colors.primary}>
              Active: {subscription?.plan}
            </AppText>
            <AppText color={theme.colors.textSecondary} size={13}>
              Renews / expires{" "}
              {subscription?.expiresAt
                ? new Date(subscription.expiresAt).toLocaleDateString()
                : "—"}
            </AppText>
          </View>
        ) : null}

        {SUBSCRIPTION_PLANS.map((plan) => {
          const active = selected === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelected(plan.id)}
              style={[
                styles.planCard,
                {
                  backgroundColor: active
                    ? theme.colors.primaryMuted
                    : theme.colors.elevated,
                  borderColor: active
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <AppText weight="700" size={18}>
                  {plan.title}
                </AppText>
                {plan.badge ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <AppText size={11} weight="700" color={theme.colors.onPrimary}>
                      {plan.badge}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText weight="700" color={theme.colors.primary}>
                {plan.priceLabel}
              </AppText>

              {plan.perks.map((perk) => (
                <AppText
                  key={perk}
                  color={theme.colors.textSecondary}
                  size={13}
                  style={styles.perk}
                >
                  • {perk}
                </AppText>
              ))}
            </TouchableOpacity>
          );
        })}

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : (
          <>
            <AppButton title="Subscribe" onPress={handlePurchase} />
            <TouchableOpacity onPress={handleRestore} style={styles.restore}>
              <AppText color={theme.colors.textSecondary} weight="600">
                Restore purchases
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    marginTop: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  activeCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  perk: {
    marginTop: 4,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  restore: {
    alignItems: "center",
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
});

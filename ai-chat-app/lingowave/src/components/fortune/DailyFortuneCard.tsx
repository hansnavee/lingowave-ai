import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useAuthStore } from "../../store/authStore";
import {
  ensureTodayFortuneForCurrentUser,
  type StoredDailyPrediction,
} from "../../services/dailyPredictionService";

export default function DailyFortuneCard() {
  const { theme } = useTheme();
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);
  const hasDob = useAuthStore((state) => Boolean(state.user?.dateOfBirth));
  const [fortune, setFortune] = useState<StoredDailyPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!isEntitled()) {
        setFortune(null);
        setHint("Subscribe to AI Translate to receive daily lucky number & color.");
        return;
      }

      if (!hasDob) {
        setFortune(null);
        setHint("Add your date of birth in Edit Profile to unlock cosmic luck.");
        return;
      }

      let active = true;
      setLoading(true);
      void ensureTodayFortuneForCurrentUser().then((result) => {
        if (!active) {
          return;
        }
        setLoading(false);
        if (result.ok) {
          setFortune(result.fortune);
          setHint(null);
        } else {
          setFortune(null);
          setHint(result.reason);
        }
      });

      return () => {
        active = false;
      };
    }, [hasDob, isEntitled])
  );

  if (!isEntitled() && !hint) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.elevated,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText weight="700" size={16} color={theme.colors.textPrimary}>
        Today’s cosmic luck
      </AppText>

      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={{ marginTop: Spacing.sm }}
        />
      ) : fortune ? (
        <>
          <View style={styles.row}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: fortune.luckyColorHex },
              ]}
            />
            <View style={{ flex: 1 }}>
              <AppText color={theme.colors.textSecondary} size={13}>
                {fortune.zodiacSign} · score {fortune.score}
              </AppText>
              <AppText weight="700" color={theme.colors.textPrimary}>
                Number {fortune.luckyNumber} · {fortune.luckyColor}
              </AppText>
            </View>
          </View>
          <AppText
            color={theme.colors.textSecondary}
            style={styles.message}
          >
            {fortune.message}
          </AppText>
        </>
      ) : (
        <AppText color={theme.colors.textSecondary} style={styles.message}>
          {hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 12,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  message: {
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});

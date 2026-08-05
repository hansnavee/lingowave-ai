import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";

import { SUPPORTED_LANGUAGES } from "../../constants/languages";
import type { PreferredLanguage } from "../../types/models";
import { useAuthStore } from "../../store/authStore";
import { useTheme, Spacing, Typography } from "../../theme";

export default function LanguageSetupScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const setPreferredLanguage = useAuthStore(
    (state) => state.setPreferredLanguage
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const needsLanguageSetup = useAuthStore(
    (state) => state.needsLanguageSetup
  );

  const [selected, setSelected] = useState<PreferredLanguage | null>(
    user?.preferredLanguage ?? null
  );

  const canGoBack = navigation.canGoBack() && !needsLanguageSetup;

  const handleContinue = async () => {
    if (!selected) {
      Alert.alert("Choose a language", "Pick the language you want to read.");
      return;
    }

    const ok = await setPreferredLanguage(selected);

    if (!ok) {
      Alert.alert("Could not save", "Please try again.");
      return;
    }

    if (canGoBack) {
      navigation.goBack();
    }
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        {canGoBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppText color={theme.colors.primary} weight="600">
              ← Back
            </AppText>
          </TouchableOpacity>
        ) : null}

        <AppText size={Typography.h1} weight="700" style={styles.title}>
          Your language
        </AppText>

        <AppText color={theme.colors.textSecondary} style={styles.subtitle}>
          We’ll show free chats in the original language. With AI Translate,
          messages and calls appear in the language you pick here.
        </AppText>

        <FlatList
          data={SUPPORTED_LANGUAGES}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = selected === item.code;

            return (
              <TouchableOpacity
                onPress={() => setSelected(item.code)}
                style={[
                  styles.row,
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
                <View>
                  <AppText weight="700">{item.label}</AppText>
                  <AppText color={theme.colors.textSecondary} size={13}>
                    {item.nativeLabel}
                  </AppText>
                </View>
                {active ? (
                  <AppText color={theme.colors.primary} weight="700">
                    ✓
                  </AppText>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <AppButton title="Continue" onPress={handleContinue} />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    marginTop: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  list: {
    paddingBottom: Spacing.lg,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
});

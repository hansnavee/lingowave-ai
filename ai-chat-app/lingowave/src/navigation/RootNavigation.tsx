import React, { useEffect } from "react";
import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AuthNavigator from "./AuthNavigator";
import AppStackNavigator from "./AppStackNavigator";
import LanguageSetupScreen from "../screens/onboarding/LanguageSetupScreen";

import { useAuthStore } from "../store/authStore";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useTheme, Typography } from "../theme";
import AppText from "../components/ui/AppText";
import { APP_NAME } from "../constants/branding";

const LOGO = require("../../assets/branding/lingowave-logo.png");

export default function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  const needsLanguageSetup = useAuthStore(
    (state) => state.needsLanguageSetup
  );
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrateSubscription = useSubscriptionStore((state) => state.hydrate);
  const { theme } = useTheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === "authenticated" && user?.id) {
      hydrateSubscription(user.id);
    }
  }, [status, user?.id, hydrateSubscription]);

  if (status === "unknown") {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.colors.gradientMid },
        ]}
      >
        <Image source={LOGO} style={styles.bootLogo} resizeMode="contain" />
        <AppText
          size={Typography.title}
          weight="700"
          color={theme.colors.textPrimary}
          style={styles.bootName}
        >
          {APP_NAME}
        </AppText>
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={styles.bootSpinner}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {status === "authenticated" ? (
        needsLanguageSetup ? (
          <LanguageSetupScreen />
        ) : (
          <AppStackNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bootLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  bootName: {
    marginTop: 16,
  },
  bootSpinner: {
    marginTop: 20,
  },
});

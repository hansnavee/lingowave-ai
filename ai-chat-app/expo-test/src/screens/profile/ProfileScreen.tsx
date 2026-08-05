import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import AppScreen from "../../components/ui/AppScreen";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileMenuItem from "../../components/profile/ProfileMenuItem";
import LogoutButton from "../../components/profile/LogoutButton";

import { useTheme, Spacing } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { getLanguageLabel } from "../../constants/languages";
import {
  AppStackParamList,
  AppTabParamList,
} from "../../navigation/types";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, "Profile">,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, darkMode, setDarkMode } = useTheme();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const subscription = useSubscriptionStore((state) => state.subscription);
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);

  const comingSoon = (feature: string) => {
    Alert.alert(
      "Coming soon",
      `${feature} will be available in a future update.`
    );
  };

  return (
    <AppScreen
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={user?.name ?? "Guest"}
          email={
            user
              ? `${user.email} · ${user.phone}`
              : "guest@email.com"
          }
        />

        <ProfileMenuItem
          icon="🌐"
          title={`Language: ${getLanguageLabel(user?.preferredLanguage)}`}
          onPress={() => navigation.navigate("LanguageSettings")}
        />

        <ProfileMenuItem
          icon="✨"
          title={
            isEntitled()
              ? `AI Translate · ${subscription?.plan ?? "active"}`
              : "AI Translate · Subscribe"
          }
          onPress={() => navigation.navigate("Subscription")}
        />

        <ProfileMenuItem
          icon="👤"
          title="Edit Profile"
          onPress={() => comingSoon("Edit Profile")}
        />

        <ProfileMenuItem
          icon="🔔"
          title="Notifications"
          onPress={() => comingSoon("Notifications")}
        />

        <ProfileMenuItem
          icon="🌙"
          title={darkMode ? "Light Mode" : "Dark Mode"}
          onPress={() => setDarkMode(!darkMode)}
        />

        <ProfileMenuItem
          icon="🔒"
          title="Privacy"
          onPress={() => comingSoon("Privacy")}
        />

        <LogoutButton
          onPress={() => {
            logout();
          }}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});

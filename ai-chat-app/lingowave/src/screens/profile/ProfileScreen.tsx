import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

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
  const aiEnabled = isEntitled();

  const handleLanguagePress = () => {
    if (!aiEnabled) {
      Alert.alert(
        "Language locked",
        `Your language is ${getLanguageLabel(user?.preferredLanguage)} based on the country you chose at signup. Subscribe to AI Translate to change it.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Subscribe",
            onPress: () => navigation.navigate("Subscription"),
          },
        ]
      );
      return;
    }

    navigation.navigate("LanguageSettings");
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
          avatarUrl={user?.avatarUrl}
        />

        <ProfileMenuItem
          icon="🌐"
          title={`Language: ${getLanguageLabel(user?.preferredLanguage)}${
            aiEnabled ? "" : " · locked"
          }`}
          onPress={handleLanguagePress}
        />

        <ProfileMenuItem
          icon="✨"
          title={
            aiEnabled
              ? `AI Translate · ${subscription?.plan ?? "active"}`
              : "AI Translate · Subscribe"
          }
          onPress={() => navigation.navigate("Subscription")}
        />

        <ProfileMenuItem
          icon="👤"
          title="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />

        <ProfileMenuItem
          icon="🔔"
          title="Notifications"
          onPress={() => navigation.navigate("Notifications")}
        />

        <ProfileMenuItem
          icon="🌙"
          title={darkMode ? "Light Mode" : "Dark Mode"}
          onPress={() => setDarkMode(!darkMode)}
        />

        <ProfileMenuItem
          icon="🔒"
          title="Privacy"
          onPress={() => navigation.navigate("Privacy")}
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

import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppNavigator from "./AppNavigator";
import CallVideo from "../screens/calls/VideoCall";
import AudioCall from "../screens/calls/AudioCallScreen";
import SubscriptionScreen from "../screens/subscription/SubscriptionScreen";
import LanguageSetupScreen from "../screens/onboarding/LanguageSetupScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import NotificationsScreen from "../screens/profile/NotificationsScreen";
import PrivacyScreen from "../screens/profile/PrivacyScreen";
import IncomingCallListener from "../components/calls/IncomingCallListener";
import PresenceHeartbeat from "../components/presence/PresenceHeartbeat";
import DailyFortuneListener from "../components/fortune/DailyFortuneListener";

import { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={AppNavigator} />
        <Stack.Screen name="CallVideo" component={CallVideo} />
        <Stack.Screen name="AudioCall" component={AudioCall} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen
          name="LanguageSettings"
          component={LanguageSetupScreen}
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
        />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
      <IncomingCallListener />
      <PresenceHeartbeat />
      <DailyFortuneListener />
    </>
  );
}

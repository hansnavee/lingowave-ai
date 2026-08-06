import React from "react";
import { Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ChatStackNavigator from "./ChatStackNavigator";
import AIScreen from "../screens/ai/AIScreen";
import CallsScreen from "../screens/calls/CallScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

import { useTheme } from "../theme/themeContext";
import { AppStackParamList, AppTabParamList } from "./types";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { hasActiveEntitlement } from "../services/subscriptionService";

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const Colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const aiUnlocked = subscription
    ? hasActiveEntitlement(subscription)
    : false;

  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: Colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName =
            "chatbubble-outline";

          switch (route.name) {
            case "Chats":
              iconName = "chatbubble-outline";
              break;
            case "AI":
              iconName = aiUnlocked ? "sparkles-outline" : "lock-closed-outline";
              break;
            case "Calls":
              iconName = "call-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          const iconColor =
            route.name === "AI" && !aiUnlocked
              ? Colors.textSecondary
              : color;

          return (
            <Ionicons name={iconName} size={size} color={iconColor} />
          );
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatStackNavigator} />
      <Tab.Screen
        name="AI"
        component={AIScreen}
        options={{
          tabBarLabel: aiUnlocked ? "AI" : "AI · Pro",
          tabBarAccessibilityLabel: aiUnlocked
            ? "AI"
            : "AI locked. Subscribe to unlock.",
        }}
        listeners={{
          tabPress: (event) => {
            if (aiUnlocked) {
              return;
            }

            event.preventDefault();
            Alert.alert(
              "AI is for subscribers",
              "Daily luck, AI chat, and translate unlock with an AI Translate plan.",
              [
                { text: "Not now", style: "cancel" },
                {
                  text: "Subscribe",
                  onPress: () => navigation.navigate("Subscription"),
                },
              ]
            );
          },
        }}
      />
      <Tab.Screen name="Calls" component={CallsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

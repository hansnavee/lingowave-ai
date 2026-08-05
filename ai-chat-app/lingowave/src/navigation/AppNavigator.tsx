import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ChatStackNavigator from "./ChatStackNavigator";
import AIScreen from "../screens/ai/AIScreen";
import CallsScreen from "../screens/calls/CallScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

import { useTheme } from "../theme/themeContext";
import { AppTabParamList } from "./types";

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const Colors = theme.colors;

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
          let iconName: keyof typeof Ionicons.glyphMap =
            "chatbubble-outline";

          switch (route.name) {
            case "Chats":
              iconName = "chatbubble-outline";
              break;
            case "AI":
              iconName = "sparkles-outline";
              break;
            case "Calls":
              iconName = "call-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          return (
            <Ionicons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatStackNavigator} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Calls" component={CallsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

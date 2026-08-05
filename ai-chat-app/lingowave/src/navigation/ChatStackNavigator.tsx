import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import ChatListScreen from "../screens/chat/ChatListScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import NewChatScreen from "../screens/chat/NewChatScreen";
import InvitesScreen from "../screens/invites/InvitesScreen";

import { ChatStackParamList } from "./types";

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="Invites" component={InvitesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

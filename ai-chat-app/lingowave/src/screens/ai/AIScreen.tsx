import React, { useRef, useState } from "react";

import { FlatList, StyleSheet, View } from "react-native";

import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";

import AIHeader from "../../components/ai/AIHeader";
import AIMessageBubble from "../../components/ai/AIMessageBubble";
import AITypingIndicator from "../../components/ai/AITypingIndicator";
import AIEmptyState from "../../components/ai/AIEmptyState";
import AIPromptList from "../../components/ai/AIPromptList";
import DailyFortuneCard from "../../components/fortune/DailyFortuneCard";

import MessageInput from "../../components/chat/MessageInput";

import { useTheme, Spacing, Typography } from "../../theme";
import type { AIMessage } from "../../types/models";
import { getAIReply } from "../../repositories/aiRepository";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { hasActiveEntitlement } from "../../services/subscriptionService";
import {
  AppStackParamList,
  AppTabParamList,
} from "../../navigation/types";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, "AI">,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function AIScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const subscription = useSubscriptionStore((state) => state.subscription);
  const aiUnlocked = subscription
    ? hasActiveEntitlement(subscription)
    : false;

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList<AIMessage>>(null);

  const sendMessage = async (message: string) => {
    if (!aiUnlocked || !message.trim() || isTyping) {
      return;
    }

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      time: "Now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setIsTyping(true);

    try {
      const aiMessage = await getAIReply(message);
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_error`,
          text: "Sorry, I couldn't respond right now. Please try again.",
          isUser: false,
          time: "Now",
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (!aiUnlocked) {
    return (
      <AppScreen
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <AIHeader />
        <View style={styles.locked}>
          <AppText size={Typography.h2} weight="700" style={styles.lockedTitle}>
            AI is locked
          </AppText>
          <AppText
            color={theme.colors.textSecondary}
            style={styles.lockedBody}
          >
            AI chat, daily lucky number & color, and translate features are
            available with an active AI Translate subscription.
          </AppText>
          <AppButton
            title="View plans"
            onPress={() => navigation.navigate("Subscription")}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AIHeader />

      <DailyFortuneCard />

      {messages.length === 0 ? <AIEmptyState /> : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AIMessageBubble
            message={item.text}
            isUser={item.isUser}
            time={item.time}
          />
        )}
      />

      {isTyping ? <AITypingIndicator /> : null}

      {messages.length === 0 ? (
        <AIPromptList onSelectPrompt={(prompt) => sendMessage(prompt)} />
      ) : null}

      <MessageInput
        value={text}
        onChangeText={setText}
        onSend={() => sendMessage(text)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexGrow: 1,
  },
  locked: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  lockedBody: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
});

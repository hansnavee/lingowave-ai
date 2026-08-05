import React, {
  useRef,
  useState,
} from "react";

import {
  FlatList,
  StyleSheet,
} from "react-native";

import AppScreen from "../../components/ui/AppScreen";

import AIHeader from "../../components/ai/AIHeader";
import AIMessageBubble from "../../components/ai/AIMessageBubble";
import AITypingIndicator from "../../components/ai/AITypingIndicator";
import AIEmptyState from "../../components/ai/AIEmptyState";
import AIPromptList from "../../components/ai/AIPromptList";

import MessageInput from "../../components/chat/MessageInput";

import { useTheme, Spacing } from "../../theme";
import type { AIMessage } from "../../types/models";
import { getAIReply } from "../../repositories/aiRepository";

export default function AIScreen() {
  const { theme } = useTheme();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList<AIMessage>>(null);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isTyping) {
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

  return (
    <AppScreen
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AIHeader />

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
});

import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

const ICONS: Record<string, string> = {
  "chatbubble-outline": "💬",
  "sparkles-outline": "✨",
  "lock-closed-outline": "🔒",
  "call-outline": "📞",
  "person-outline": "👤",
  "search-outline": "🔍",
  "add": "+",
  "send": "➤",
  "attach": "📎",
  "mic": "🎤",
  "close": "✕",
  "chevron-back": "‹",
  "ellipsis-vertical": "⋮",
  "videocam-outline": "📹",
  "image-outline": "🖼️",
  "camera-outline": "📷",
  "location-outline": "📍",
};

type Props = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/** Text/emoji icon stand-in — avoids @expo/vector-icons native font loading. */
export default function Icon({ name, size = 22, color, style }: Props) {
  return (
    <Text style={[{ fontSize: size, color, lineHeight: size + 4 }, style]}>
      {ICONS[name] ?? "•"}
    </Text>
  );
}

export const Ionicons = Icon;

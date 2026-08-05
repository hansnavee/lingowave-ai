import { Radius } from "./radius";

/**
 * Light theme — soft teal + warm stone.
 * Calm, high-contrast, easy to scan in chat lists and threads.
 */
export const lightTheme = {
  dark: false,
  radius: Radius,
  colors: {
    background: "#F3F6F5",
    surface: "#FFFFFF",
    card: "#EAF3F1",
    elevated: "#FFFFFF",

    primary: "#0F766E",
    primaryMuted: "#CCFBF1",
    secondary: "#0E7490",
    accent: "#059669",

    textPrimary: "#0F172A",
    textSecondary: "#5B6B73",
    textMuted: "#8A9AA3",
    onPrimary: "#FFFFFF",
    onBubbleMe: "#FFFFFF",
    onBubbleOther: "#0F172A",

    border: "#D7E3DF",
    borderStrong: "#B6CBC4",
    placeholder: "#8A9AA3",
    divider: "#E4EEEA",

    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
    online: "#10B981",

    white: "#FFFFFF",
    black: "#0B1220",
    overlay: "rgba(15, 23, 42, 0.42)",
    callEnd: "#EF4444",

    bubbleMe: "#0F766E",
    bubbleOther: "#FFFFFF",
    bubbleReply: "#DDF4EF",
    inputBackground: "#FFFFFF",
    tabBar: "#FFFFFF",
    unread: "#0F766E",
    avatar: "#14B8A6",
    chipActive: "#0F766E",
    chipInactive: "#EAF3F1",

    gradientStart: "#F3F6F5",
    gradientMid: "#E8F5F2",
    gradientEnd: "#D9F0EB",
  },
};

export type AppTheme = typeof lightTheme;

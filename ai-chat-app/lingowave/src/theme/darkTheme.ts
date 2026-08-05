import { Radius } from "./radius";
import type { AppTheme } from "./lightTheme";

/**
 * Dark theme — deep forest charcoal with luminous teal accents.
 * Soft on the eyes at night, clear hierarchy for chat UI.
 */
export const darkTheme: AppTheme = {
  dark: true,
  radius: Radius,
  colors: {
    background: "#0B1210",
    surface: "#15201C",
    card: "#1C2A25",
    elevated: "#22332D",

    primary: "#2DD4BF",
    primaryMuted: "#134E4A",
    secondary: "#22D3EE",
    accent: "#34D399",

    textPrimary: "#F0FDFA",
    textSecondary: "#9DB5AE",
    textMuted: "#6F857E",
    onPrimary: "#042F2E",
    onBubbleMe: "#042F2E",
    onBubbleOther: "#F0FDFA",

    border: "#2A3B35",
    borderStrong: "#3D524A",
    placeholder: "#6F857E",
    divider: "#24332E",

    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
    online: "#34D399",

    white: "#FFFFFF",
    black: "#020617",
    overlay: "rgba(2, 6, 23, 0.62)",
    callEnd: "#F87171",

    bubbleMe: "#14B8A6",
    bubbleOther: "#1C2A25",
    bubbleReply: "#134E4A",
    inputBackground: "#15201C",
    tabBar: "#101A17",
    unread: "#2DD4BF",
    avatar: "#0D9488",
    chipActive: "#2DD4BF",
    chipInactive: "#1C2A25",

    gradientStart: "#0B1210",
    gradientMid: "#10201B",
    gradientEnd: "#163029",
  },
};

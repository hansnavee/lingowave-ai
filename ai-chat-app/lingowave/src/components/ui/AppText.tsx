import React from "react";
import {
  Text,
  StyleSheet,
  TextProps,
  TextStyle,
} from "react-native";

import {
  Typography,
  useTheme,
} from "../../theme";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?:
    | "400"
    | "500"
    | "600"
    | "700";
  style?: TextStyle | TextStyle[];
}

export default function AppText({
  children,
  size = Typography.body,
  color,
  weight = "400",
  style,
  ...props
}: AppTextProps) {

  const { theme } = useTheme();

  return (
    <Text
      {...props}
      style={[
        styles.text,
        {
          fontSize: size,
          color: color ?? theme.colors.textPrimary,
          fontWeight: weight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {},
});
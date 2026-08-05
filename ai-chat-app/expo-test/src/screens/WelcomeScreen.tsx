import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppText from "../components/ui/AppText";
import { useTheme, Spacing, Typography } from "../theme";
import { AuthStackParamList } from "../navigation/types";
import {
  APP_NAME,
  APP_SPLASH_SUBTITLE,
} from "../constants/branding";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Welcome"
>;

const LOGO = require("../../assets/branding/lingowave-logo.png");

const SPLASH_MS = 2600;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, SPLASH_MS);

    return () => clearTimeout(timer);
  }, [fade, scale, subtitleFade, navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.gradientMid },
      ]}
    >
      <View
        style={[
          styles.glow,
          { backgroundColor: theme.colors.primaryMuted },
        ]}
      />

      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: fade,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        <AppText
          size={Typography.h1}
          weight="700"
          color={theme.colors.textPrimary}
          style={styles.title}
        >
          {APP_NAME}
        </AppText>
      </Animated.View>

      <Animated.View style={{ opacity: subtitleFade }}>
        <AppText
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          {APP_SPLASH_SUBTITLE}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.55,
  },
  brandBlock: {
    alignItems: "center",
  },
  logoWrap: {
    width: 132,
    height: 132,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    overflow: "hidden",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  logo: {
    width: 118,
    height: 118,
  },
  title: {
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.md,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});

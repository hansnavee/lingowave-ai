import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";

import { AuthStackParamList } from "../../navigation/types";
import { Spacing, Typography } from "../../theme";
import { useTheme } from "../../theme/themeContext";
import { useAuthStore } from "../../store/authStore";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ForgotPassword"
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const Colors = theme.colors;

  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    clearError();
    const message = await requestPasswordReset(email);

    if (!message) {
      const error =
        useAuthStore.getState().error ?? "Could not send reset link.";
      Alert.alert("Reset failed", error);
      return;
    }

    Alert.alert("Check your email", message, [
      {
        text: "OK",
        onPress: () =>
          navigation.navigate("OTPVerification", {
            email: email.trim(),
          }),
      },
    ]);
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <AppText size={42}>🔐</AppText>
        </View>

        <AppText size={Typography.h1} weight="700" style={styles.heading}>
          Forgot Password?
        </AppText>

        <AppText color={Colors.textSecondary} style={styles.subtitle}>
          Enter your email and we will send you a password reset link.
        </AppText>

        <AppInput
          label="Email"
          placeholder="Enter your registered email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : (
          <AppButton title="Send Reset Link" onPress={handleResetPassword} />
        )}

        <View style={styles.footer}>
          <AppText color={Colors.textSecondary}>
            Remember your password?
          </AppText>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <AppText color={Colors.primary} weight="700">
              {" "}
              Login
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heading: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  loader: {
    marginVertical: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});

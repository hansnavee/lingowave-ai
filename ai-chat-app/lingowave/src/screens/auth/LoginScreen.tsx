import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuthStore } from "../../store/authStore";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import BrandLogo from "../../components/brand/BrandLogo";

import { AuthStackParamList } from "../../navigation/types";
import { useTheme, Spacing, Typography } from "../../theme";
import { APP_TAGLINE } from "../../constants/branding";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    clearError();
    const ok = await login(email, password);

    if (!ok) {
      const message =
        useAuthStore.getState().error ?? "Could not log in.";
      Alert.alert("Login failed", message);
    }
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <BrandLogo size="md" />

        <AppText
          size={Typography.h2}
          weight="700"
          color={theme.colors.textPrimary}
          style={styles.heading}
        >
          Welcome Back
        </AppText>

        <AppText color={theme.colors.textSecondary} style={styles.subtitle}>
          {APP_TAGLINE}
        </AppText>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.colors.placeholder}
          secureTextEntry
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <AppText color={theme.colors.primary} weight="600">
            Forgot Password?
          </AppText>
        </TouchableOpacity>

        {error ? (
          <AppText color={theme.colors.danger} style={styles.error}>
            {error}
          </AppText>
        ) : null}

        {isLoading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : (
          <AppButton
            title="Login"
            onPress={handleLogin}
            style={styles.button}
          />
        )}

        <View style={styles.footer}>
          <AppText color={theme.colors.textSecondary}>
            Don't have an account?
          </AppText>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <AppText color={theme.colors.primary} weight="700">
              {" "}
              Sign Up
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
  heading: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: Typography.body,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: Spacing.lg,
  },
  error: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  loader: {
    marginVertical: Spacing.md,
  },
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});

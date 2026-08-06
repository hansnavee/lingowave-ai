import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import AppInput from "../../components/ui/AppInput";
import PhoneInput, {
  DEFAULT_COUNTRY_CODE,
} from "../../components/ui/PhoneInput";
import BrandLogo from "../../components/brand/BrandLogo";

import { AuthStackParamList } from "../../navigation/types";
import { Spacing, Typography } from "../../theme";
import { useTheme } from "../../theme/themeContext";
import { useAuthStore } from "../../store/authStore";
import { APP_NAME } from "../../constants/branding";
import type { CountryCode } from "../../constants/countryCodes";
import { composeE164Phone } from "../../utils/validation";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Signup"
>;

export default function SignupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const Colors = theme.colors;

  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [nationalNumber, setNationalNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    clearError();
    const phone = composeE164Phone(country.dialCode, nationalNumber);
    const ok = await signup(
      name,
      email,
      password,
      phone,
      country.code,
      dateOfBirth,
      birthPlace
    );

    if (!ok) {
      const message =
        useAuthStore.getState().error ?? "Could not create account.";
      Alert.alert("Signup failed", message);
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <BrandLogo size="sm" />

          <AppText size={Typography.h1} weight="700" style={styles.heading}>
            Create Account
          </AppText>

          <AppText color={Colors.textSecondary} style={styles.subtitle}>
            Join {APP_NAME} to invite friends and chat across languages. Your
            birth details power personal lucky number & color for AI
            subscribers.
          </AppText>

          <AppInput
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <PhoneInput
            label="Phone"
            country={country}
            nationalNumber={nationalNumber}
            onCountryChange={setCountry}
            onNationalNumberChange={setNationalNumber}
          />

          <AppInput
            label="Date of birth"
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />

          <AppInput
            label="Place of birth"
            placeholder="City, Country"
            value={birthPlace}
            onChangeText={setBirthPlace}
          />

          <AppInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <AppText color={Colors.danger} style={styles.error}>
              {error}
            </AppText>
          ) : null}

          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <AppButton title="Create Account" onPress={handleSignup} />
          )}

          <View style={styles.footer}>
            <AppText color={Colors.textSecondary}>
              Already have an account?
            </AppText>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <AppText color={Colors.primary} weight="700">
                {" "}
                Login
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  error: {
    marginBottom: Spacing.md,
    textAlign: "center",
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

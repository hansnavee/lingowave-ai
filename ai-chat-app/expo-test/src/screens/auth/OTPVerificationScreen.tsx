import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";

import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";

import { AuthStackParamList } from "../../navigation/types";
import { useTheme, Spacing, Typography } from "../../theme";

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "OTPVerification"
>;

type OTPRoute = RouteProp<AuthStackParamList, "OTPVerification">;

export default function OTPVerificationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OTPRoute>();
  const { theme } = useTheme();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.trim().length < 4) {
      Alert.alert("Invalid code", "Enter the 4+ digit code from your email.");
      return;
    }

    Alert.alert(
      "Verified",
      "You can now sign in with your new password once reset is complete.",
      [{ text: "OK", onPress: () => navigation.navigate("Login") }]
    );
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <AppText size={Typography.h1} weight="700" style={styles.heading}>
          OTP Verification
        </AppText>

        <AppText color={theme.colors.textSecondary} style={styles.subtitle}>
          Enter the code sent to{" "}
          {route.params?.email ?? "your email"}.
        </AppText>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          placeholder="Enter OTP"
          placeholderTextColor={theme.colors.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
              borderRadius: theme.radius.lg,
            },
          ]}
        />

        <AppButton title="Verify" onPress={handleVerify} />
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
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: Spacing.lg,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
  },
});

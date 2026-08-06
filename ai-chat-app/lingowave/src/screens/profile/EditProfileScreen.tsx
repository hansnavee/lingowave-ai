import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import AppInput from "../../components/ui/AppInput";
import PhoneInput from "../../components/ui/PhoneInput";

import { useTheme, Spacing, Typography } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { pickImage } from "../../utils/imagePicker";
import { uploadAvatar } from "../../services/storageService";
import { updateUserProfile } from "../../services/authService";
import type { CountryCode } from "../../constants/countryCodes";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
} from "../../constants/countryCodes";
import {
  composeE164Phone,
  validateBirthPlace,
  validateDateOfBirth,
} from "../../utils/validation";

function findCountryFromE164(phone: string): {
  country: CountryCode;
  national: string;
} {
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((item) => phone.startsWith(item.dialCode));

  if (!match) {
    return { country: DEFAULT_COUNTRY_CODE, national: phone.replace(/^\+/, "") };
  }

  return {
    country: match,
    national: phone.slice(match.dialCode.length),
  };
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const initial = findCountryFromE164(user?.phone ?? "");

  const [name, setName] = useState(user?.name ?? "");
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [nationalNumber, setNationalNumber] = useState(initial.national);
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [birthPlace, setBirthPlace] = useState(user?.birthPlace ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const image = await pickImage();
      if (!image?.uri) {
        return;
      }

      setUploading(true);
      const url = await uploadAvatar(image.uri);
      const result = await updateUserProfile({ avatarUrl: url });

      if (!result.ok) {
        Alert.alert("Upload failed", result.error);
        return;
      }

      setAvatarUrl(url);
      await refreshUser();
    } catch (error) {
      Alert.alert(
        "Upload failed",
        error instanceof Error ? error.message : "Could not upload photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter your display name.");
      return;
    }

    const dobError = validateDateOfBirth(dateOfBirth);
    if (dobError) {
      Alert.alert("Date of birth", dobError);
      return;
    }

    const placeError = validateBirthPlace(birthPlace);
    if (placeError) {
      Alert.alert("Place of birth", placeError);
      return;
    }

    setSaving(true);
    const phone = composeE164Phone(country.dialCode, nationalNumber);
    const result = await updateUserProfile({
      name: name.trim(),
      phone,
      dateOfBirth: dateOfBirth.trim(),
      birthPlace: birthPlace.trim(),
    });
    setSaving(false);

    if (!result.ok) {
      Alert.alert("Could not save", result.error);
      return;
    }

    await refreshUser();
    Alert.alert("Saved", "Your profile was updated.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppText color={theme.colors.primary} weight="600">
              ← Back
            </AppText>
          </TouchableOpacity>

          <AppText size={Typography.h1} weight="700" style={styles.title}>
            Edit profile
          </AppText>

          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={handlePickAvatar}
            disabled={uploading}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: theme.colors.avatar },
                ]}
              >
                <AppText size={32} weight="700" color={theme.colors.onPrimary}>
                  {(name || "?").charAt(0).toUpperCase()}
                </AppText>
              </View>
            )}
            <AppText
              color={theme.colors.primary}
              weight="600"
              style={styles.changePhoto}
            >
              {uploading ? "Uploading…" : "Change photo"}
            </AppText>
          </TouchableOpacity>

          <AppInput
            label="Full Name"
            placeholder="Your name"
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

          <AppText color={theme.colors.textSecondary} style={styles.hint}>
            Birth details unlock daily lucky number & color for AI subscribers.
            Email and country language are set at signup.
          </AppText>

          {saving ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <AppButton title="Save changes" onPress={handleSave} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl ?? 48,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhoto: {
    marginTop: Spacing.sm,
  },
  hint: {
    marginBottom: Spacing.lg,
    fontSize: 13,
  },
});

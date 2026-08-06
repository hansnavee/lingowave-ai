import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "./AppText";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  type CountryCode,
} from "../../constants/countryCodes";
import { composeE164Phone } from "../../utils/validation";
import { useTheme, Spacing, Typography } from "../../theme";

type Props = {
  label?: string;
  country: CountryCode;
  nationalNumber: string;
  onCountryChange: (country: CountryCode) => void;
  onNationalNumberChange: (value: string) => void;
  error?: string;
};

export default function PhoneInput({
  label = "Phone",
  country,
  nationalNumber,
  onCountryChange,
  onNationalNumberChange,
  error,
}: Props) {
  const { theme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return COUNTRY_CODES;
    }
    return COUNTRY_CODES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.dialCode.includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [query]);

  const preview = composeE164Phone(country.dialCode, nationalNumber);

  return (
    <View style={styles.container}>
      <AppText style={styles.label} color={theme.colors.textPrimary}>
        {label}
      </AppText>

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.codeButton,
            {
              borderColor: error ? theme.colors.danger : theme.colors.border,
              backgroundColor: theme.colors.inputBackground,
              borderRadius: theme.radius.lg,
            },
          ]}
          onPress={() => setPickerOpen(true)}
        >
          <AppText>
            {country.flag} {country.dialCode}
          </AppText>
        </TouchableOpacity>

        <TextInput
          value={nationalNumber}
          onChangeText={(value) =>
            onNationalNumberChange(value.replace(/[^\d]/g, ""))
          }
          placeholder="Phone number"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="phone-pad"
          style={[
            styles.numberInput,
            {
              color: theme.colors.textPrimary,
              borderColor: error ? theme.colors.danger : theme.colors.border,
              backgroundColor: theme.colors.inputBackground,
              borderRadius: theme.radius.lg,
            },
          ]}
        />
      </View>

      {preview ? (
        <AppText
          size={Typography.small}
          color={theme.colors.textSecondary}
          style={styles.preview}
        >
          Saves as {preview}
        </AppText>
      ) : null}

      {error ? (
        <AppText size={Typography.small} color={theme.colors.danger}>
          {error}
        </AppText>
      ) : null}

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.elevated ?? theme.colors.card },
            ]}
          >
            <AppText weight="700" size={Typography.h3} style={styles.sheetTitle}>
              Select country
            </AppText>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor={theme.colors.placeholder}
              style={[
                styles.search,
                {
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onCountryChange(item);
                    setPickerOpen(false);
                    setQuery("");
                  }}
                >
                  <AppText>
                    {item.flag}  {item.name}
                  </AppText>
                  <AppText color={theme.colors.textSecondary}>
                    {item.dialCode}
                  </AppText>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancel}
              onPress={() => {
                setPickerOpen(false);
                setQuery("");
              }}
            >
              <AppText weight="700" color={theme.colors.primary}>
                Cancel
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { DEFAULT_COUNTRY_CODE };

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontSize: Typography.caption,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  codeButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
    minWidth: 108,
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
  },
  preview: {
    marginTop: Spacing.xs,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
  },
  sheetTitle: {
    marginBottom: Spacing.md,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  cancel: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});

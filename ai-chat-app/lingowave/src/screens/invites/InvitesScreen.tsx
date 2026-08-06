import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import AppInput from "../../components/ui/AppInput";
import PhoneInput, {
  DEFAULT_COUNTRY_CODE,
} from "../../components/ui/PhoneInput";

import { useAuthStore } from "../../store/authStore";
import {
  acceptInvite,
  createInvites,
  listIncomingByPhone,
  listOutgoingInvites,
} from "../../repositories/inviteRepository";
import type { Invite } from "../../types/models";
import { ChatStackParamList } from "../../navigation/types";
import { useTheme, Spacing, Typography } from "../../theme";
import type { CountryCode } from "../../constants/countryCodes";
import {
  composeE164Phone,
  validatePhone,
} from "../../utils/validation";

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "Invites"
>;

export default function InvitesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);

  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [nationalNumber, setNationalNumber] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [outgoing, setOutgoing] = useState<Invite[]>([]);
  const [incoming, setIncoming] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }

    const [out, incomingList] = await Promise.all([
      listOutgoingInvites(user.id),
      listIncomingByPhone(user.phone),
    ]);
    setOutgoing(out);
    setIncoming(incomingList);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddPhone = () => {
    const composed = composeE164Phone(country.dialCode, nationalNumber);
    const error = validatePhone(composed);
    if (error) {
      Alert.alert("Invalid phone", error);
      return;
    }
    if (phones.includes(composed)) {
      Alert.alert("Already added", "That number is already in the list.");
      return;
    }
    setPhones((prev) => [...prev, composed]);
    setNationalNumber("");
  };

  const handleSend = async () => {
    if (!user) {
      return;
    }

    let invitePhones = [...phones];
    if (nationalNumber.trim()) {
      const composed = composeE164Phone(country.dialCode, nationalNumber);
      const error = validatePhone(composed);
      if (error) {
        Alert.alert("Invalid phone", error);
        return;
      }
      if (!invitePhones.includes(composed)) {
        invitePhones = [...invitePhones, composed];
      }
    }

    if (invitePhones.length === 0) {
      Alert.alert("Add a number", "Enter at least one phone number to invite.");
      return;
    }

    setLoading(true);

    const result = await createInvites({
      fromUserId: user.id,
      fromUserName: user.name,
      phones: invitePhones,
      message,
    });

    setLoading(false);

    if (!result.ok) {
      Alert.alert("Invite failed", result.error);
      return;
    }

    setPhones([]);
    setNationalNumber("");
    setMessage("");
    Alert.alert(
      "Invites sent",
      `Sent ${result.invites.length} invite(s). They can join with the same phone number.`
    );
    refresh();
  };

  const handleAccept = async (invite: Invite) => {
    if (!user) {
      return;
    }

    setLoading(true);
    const result = await acceptInvite({
      inviteId: invite.id,
      acceptorUserId: user.id,
      acceptorName: user.name,
    });
    setLoading(false);

    if (!result.ok) {
      Alert.alert("Could not join", result.error);
      return;
    }

    navigation.navigate("Chat", {
      userId: result.chat.id,
      userName: result.chat.name,
      status: "Online",
    });
  };

  const handleSeedDemo = async () => {
    Alert.alert(
      "Use two accounts",
      "Send an invite from one account to another account's phone number, then accept it on the second device."
    );
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AppText color={theme.colors.primary} weight="600">
            ← Back
          </AppText>
        </TouchableOpacity>

        <AppText size={Typography.h1} weight="700" style={styles.title}>
          Invite people
        </AppText>

        <AppText color={theme.colors.textSecondary} style={styles.subtitle}>
          Pick a country code and phone number. Once they join with that number,
          you can chat freely. AI Translate is optional and paid.
        </AppText>

        <PhoneInput
          label="Phone number"
          country={country}
          nationalNumber={nationalNumber}
          onCountryChange={setCountry}
          onNationalNumberChange={setNationalNumber}
        />

        <AppButton title="Add number" onPress={handleAddPhone} />

        {phones.length > 0 ? (
          <View style={styles.phoneChips}>
            {phones.map((phone) => (
              <TouchableOpacity
                key={phone}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() =>
                  setPhones((prev) => prev.filter((item) => item !== phone))
                }
              >
                <AppText size={13}>{phone}  ×</AppText>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <AppInput
          label="Optional message"
          placeholder="Let's talk across languages"
          value={message}
          onChangeText={setMessage}
        />

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <AppButton title="Send invites" onPress={handleSend} />
        )}

        <TouchableOpacity onPress={handleSeedDemo} style={styles.demo}>
          <AppText color={theme.colors.secondary} weight="600">
            Add demo incoming invite (for testing)
          </AppText>
        </TouchableOpacity>

        <AppText weight="700" style={styles.section}>
          Incoming
        </AppText>
        <FlatList
          data={incoming}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <AppText color={theme.colors.textMuted}>
              No pending invites for your phone.
            </AppText>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.elevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText weight="700">{item.fromUserName}</AppText>
              <AppText color={theme.colors.textSecondary} size={13}>
                {item.message || "Invited you to chat"}
              </AppText>
              <AppButton
                title="Accept & chat"
                onPress={() => handleAccept(item)}
                style={styles.acceptBtn}
              />
            </View>
          )}
        />

        <AppText weight="700" style={styles.section}>
          Sent
        </AppText>
        <FlatList
          data={outgoing}
          keyExtractor={(item) => item.id}
          style={styles.outgoingList}
          ListEmptyComponent={
            <AppText color={theme.colors.textMuted}>
              You haven't sent invites yet.
            </AppText>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.elevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText weight="700">{item.toPhone}</AppText>
              <AppText color={theme.colors.textSecondary} size={13}>
                Status: {item.status}
              </AppText>
            </View>
          )}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    marginTop: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  phoneChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demo: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  section: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  acceptBtn: {
    marginTop: Spacing.sm,
  },
  outgoingList: {
    flexGrow: 0,
    maxHeight: 180,
  },
});

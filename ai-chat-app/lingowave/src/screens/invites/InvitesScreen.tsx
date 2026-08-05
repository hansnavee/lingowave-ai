import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
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

import { useAuthStore } from "../../store/authStore";
import {
  acceptInvite,
  createInvites,
  listIncomingByPhone,
  listOutgoingInvites,
  seedIncomingInviteForDemo,
} from "../../repositories/inviteRepository";
import type { Invite } from "../../types/models";
import { ChatStackParamList } from "../../navigation/types";
import { useTheme, Spacing, Typography } from "../../theme";

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "Invites"
>;

export default function InvitesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);

  const [phonesText, setPhonesText] = useState("");
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

  const handleSend = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const phones = phonesText
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const result = await createInvites({
      fromUserId: user.id,
      fromUserName: user.name,
      phones,
      message,
    });

    setLoading(false);

    if (!result.ok) {
      Alert.alert("Invite failed", result.error);
      return;
    }

    setPhonesText("");
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
    if (!user) {
      return;
    }

    await seedIncomingInviteForDemo({ toPhone: user.phone });
    Alert.alert("Demo invite added", "Accept it below to open a chat.");
    refresh();
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
          Enter phone numbers (one per line). Once they join, you can chat
          freely. AI Translate is optional and paid.
        </AppText>

        <AppText weight="600" style={styles.label}>
          Phone numbers
        </AppText>
        <TextInput
          value={phonesText}
          onChangeText={setPhonesText}
          placeholder={"+919876543210\n+14155552671"}
          placeholderTextColor={theme.colors.placeholder}
          multiline
          style={[
            styles.phonesInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
              borderRadius: theme.radius.lg,
            },
          ]}
        />

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
  label: {
    marginBottom: Spacing.sm,
  },
  phonesInput: {
    minHeight: 96,
    borderWidth: 1,
    padding: Spacing.md,
    textAlignVertical: "top",
    marginBottom: Spacing.md,
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

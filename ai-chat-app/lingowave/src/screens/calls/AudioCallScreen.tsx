import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import PaywallSheet from "../../components/subscription/PaywallSheet";
import LiveKitCallRoom from "../../components/calls/LiveKitCallRoom";

import { useTheme } from "../../theme";
import { AppStackParamList } from "../../navigation/types";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useAuthStore } from "../../store/authStore";
import { getLanguageLabel } from "../../constants/languages";
import { startOutgoingCall } from "../../services/callService";

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "AudioCall"
>;

type AudioRoute = RouteProp<AppStackParamList, "AudioCall">;

export default function AudioCallScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AudioRoute>();
  const { name, enableTranslate, callId, peerUserId, isIncoming } =
    route.params;
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);
  const preferredLanguage = useAuthStore(
    (state) => state.user?.preferredLanguage
  );

  const [aiOn, setAiOn] = useState(Boolean(enableTranslate) && isEntitled());
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(
    callId ?? null
  );
  const [starting, setStarting] = useState(!callId && Boolean(peerUserId));
  const [caption, setCaption] = useState(
    "Calling… (original audio, no translation)"
  );

  useEffect(() => {
    if (callId || !peerUserId || isIncoming) {
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await startOutgoingCall({
        calleeId: peerUserId,
        callType: "audio",
      });

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        Alert.alert("Call failed", result.error);
        navigation.goBack();
        return;
      }

      setActiveCallId(result.call.id);
      setStarting(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [callId, peerUserId, isIncoming, navigation]);

  const toggleAi = () => {
    if (aiOn) {
      setAiOn(false);
      setCaption("Calling… (original audio, no translation)");
      return;
    }

    if (!isEntitled()) {
      setPaywallVisible(true);
      return;
    }

    setAiOn(true);
    setCaption(`AI captions on · ${getLanguageLabel(preferredLanguage)}`);
  };

  return (
    <AppScreen style={{ backgroundColor: theme.colors.background }}>
      {starting || !activeCallId ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
          <AppText style={styles.loadingText}>Starting call…</AppText>
        </View>
      ) : (
        <LiveKitCallRoom
          callId={activeCallId}
          peerName={name}
          callType="audio"
          aiOn={aiOn}
          onToggleAi={toggleAi}
          caption={caption}
        />
      )}

      <PaywallSheet
        visible={paywallVisible}
        featureLabel="AI call translation"
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          navigation.navigate("Subscription");
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
  },
});

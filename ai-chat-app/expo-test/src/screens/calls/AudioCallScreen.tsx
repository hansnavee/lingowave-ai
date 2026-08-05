import React, { useState } from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  RouteProp,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import PaywallSheet from "../../components/subscription/PaywallSheet";

import {
  useTheme,
  Typography,
} from "../../theme";
import { AppStackParamList } from "../../navigation/types";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useAuthStore } from "../../store/authStore";
import { getLanguageLabel } from "../../constants/languages";

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "AudioCall"
>;

type AudioRoute = RouteProp<AppStackParamList, "AudioCall">;

export default function AudioCallScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AudioRoute>();
  const { name, enableTranslate } = route.params;
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);
  const preferredLanguage = useAuthStore(
    (state) => state.user?.preferredLanguage
  );

  const [aiOn, setAiOn] = useState(Boolean(enableTranslate) && isEntitled());
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [caption, setCaption] = useState(
    "Calling… (original audio, no translation)"
  );

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
    setCaption(
      `AI captions on · ${getLanguageLabel(preferredLanguage)}`
    );
  };

  return (
    <AppScreen
      style={{
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <AppText size={60}>👤</AppText>
        </View>

        <AppText size={Typography.h2} weight="700">
          {name}
        </AppText>

        <AppText
          color={theme.colors.textSecondary}
          style={styles.status}
        >
          {caption}
        </AppText>

        <TouchableOpacity
          style={[
            styles.aiButton,
            {
              backgroundColor: aiOn
                ? theme.colors.primary
                : theme.colors.primaryMuted,
            },
          ]}
          onPress={toggleAi}
        >
          <AppText
            weight="700"
            color={aiOn ? theme.colors.onPrimary : theme.colors.primary}
          >
            {aiOn ? "AI Translate On" : "Enable AI Translate"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.endButton,
            { backgroundColor: theme.colors.callEnd },
          ]}
          onPress={() => navigation.goBack()}
        >
          <AppText>📞</AppText>
        </TouchableOpacity>
      </View>

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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  status: {
    marginTop: 10,
    textAlign: "center",
  },
  aiButton: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  endButton: {
    marginTop: 48,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

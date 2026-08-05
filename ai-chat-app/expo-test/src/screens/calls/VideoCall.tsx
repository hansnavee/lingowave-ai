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

import { useTheme } from "../../theme";
import { AppStackParamList } from "../../navigation/types";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useAuthStore } from "../../store/authStore";
import { getLanguageLabel } from "../../constants/languages";

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "CallVideo"
>;

type VideoRoute = RouteProp<AppStackParamList, "CallVideo">;

export default function CallVideo() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoRoute>();
  const { theme } = useTheme();
  const { name, enableTranslate } = route.params;
  const isEntitled = useSubscriptionStore((state) => state.isEntitled);
  const preferredLanguage = useAuthStore(
    (state) => state.user?.preferredLanguage
  );

  const [aiOn, setAiOn] = useState(Boolean(enableTranslate) && isEntitled());
  const [paywallVisible, setPaywallVisible] = useState(false);

  const toggleAi = () => {
    if (aiOn) {
      setAiOn(false);
      return;
    }

    if (!isEntitled()) {
      setPaywallVisible(true);
      return;
    }

    setAiOn(true);
  };

  return (
    <AppScreen
      style={{
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={styles.container}>
        <View style={styles.videoArea}>
          <AppText size={70}>👤</AppText>

          <AppText color={theme.colors.textPrimary}>{name}</AppText>

          <AppText color={theme.colors.textSecondary}>
            {aiOn
              ? `Video calling · AI captions (${getLanguageLabel(preferredLanguage)})`
              : "Video Calling… (no translation)"}
          </AppText>

          {aiOn ? (
            <View
              style={[
                styles.captionBox,
                {
                  backgroundColor: theme.colors.elevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText size={13} color={theme.colors.textSecondary}>
                Live caption preview
              </AppText>
              <AppText weight="600">
                Hello — how are you today?
              </AppText>
            </View>
          ) : null}
        </View>

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
            styles.endCall,
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
  },
  videoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  captionBox: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    width: "100%",
    maxWidth: 340,
  },
  aiButton: {
    alignSelf: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  endCall: {
    alignSelf: "center",
    marginBottom: 50,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

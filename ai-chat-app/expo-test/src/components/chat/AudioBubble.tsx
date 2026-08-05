import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Audio } from "expo-av";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";

interface Props {
  uri: string;
  isMe: boolean;
}

export default function AudioBubble({ uri, isMe }: Props) {
  const { theme } = useTheme();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      const sound = soundRef.current;
      soundRef.current = null;

      if (sound) {
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const playAudio = async () => {
    try {
      if (playing && soundRef.current) {
        await soundRef.current.stopAsync();
        setPlaying(false);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });

      await sound.playAsync();
    } catch {
      setPlaying(false);
      Alert.alert("Playback failed", "Could not play this audio message.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe
            ? theme.colors.bubbleMe
            : theme.colors.bubbleOther,
        },
      ]}
    >
      <TouchableOpacity onPress={playAudio}>
        <AppText
          color={
            isMe ? theme.colors.onBubbleMe : theme.colors.textSecondary
          }
          weight="700"
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: 18,
    marginVertical: 6,
    minWidth: 130,
  },
});

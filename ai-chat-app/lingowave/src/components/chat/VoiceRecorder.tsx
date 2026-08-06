import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppText from "../ui/AppText";
import { useTheme, Spacing } from "../../theme";
import {
  cancelRecording,
  startRecording,
  stopRecording,
} from "../../utils/audioRecorder";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: (uri: string) => void;
}

export default function VoiceRecorder({
  visible,
  onClose,
  onSend,
}: Props) {
  const { theme } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    let didStart = false;

    const begin = async () => {
      if (!visible) {
        setSeconds(0);
        setIsRecording(false);
        return;
      }

      const started = await startRecording();

      if (cancelled) {
        if (started) {
          await cancelRecording();
        }
        return;
      }

      if (!started) {
        Alert.alert(
          "Voice recording unavailable",
          "Voice notes are temporarily disabled on this build."
        );
        onClose();
        return;
      }

      didStart = true;
      setIsRecording(true);
      setSeconds(0);

      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    };

    begin();

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
      if (didStart) {
        cancelRecording();
      }
    };
    // Only restart when the modal opens/closes.
  }, [visible]);

  const formatTime = (value: number) => {
    const min = Math.floor(value / 60);
    const sec = value % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleCancel = async () => {
    await cancelRecording();
    setIsRecording(false);
    setSeconds(0);
    onClose();
  };

  const handleSend = async () => {
    const uri = await stopRecording();
    setIsRecording(false);

    if (!uri) {
      Alert.alert("Recording failed", "Could not save the voice message.");
      onClose();
      return;
    }

    onSend(uri);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.overlay },
        ]}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <AppText weight="700" size={22}>
            {isRecording ? "🎤 Recording..." : "🎤 Starting..."}
          </AppText>

          <AppText style={styles.timer} weight="700" size={30}>
            {formatTime(seconds)}
          </AppText>

          <TouchableOpacity
            style={[
              styles.stopButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSend}
            disabled={!isRecording}
          >
            <AppText color={theme.colors.onPrimary} weight="700">
              Stop & Send
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
            <AppText>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: "center",
  },
  timer: {
    marginVertical: 25,
  },
  stopButton: {
    width: "100%",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancel: {
    marginTop: 18,
  },
});

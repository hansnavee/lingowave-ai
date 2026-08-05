import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  LiveKitRoom,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  isTrackReference,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import { useNavigation } from "@react-navigation/native";

import AppText from "../ui/AppText";
import { useTheme, Typography } from "../../theme";
import {
  endCall,
  fetchLiveKitToken,
  markCallActive,
} from "../../services/callService";
import { subscribeIncomingCalls } from "../../repositories/callRepository";
import { useAuthStore } from "../../store/authStore";
import type { CallType, LiveKitCredentials } from "../../types/calls";

type Props = {
  callId: string;
  peerName: string;
  callType: CallType;
  enableTranslate?: boolean;
  aiOn: boolean;
  onToggleAi: () => void;
  caption?: string;
};

function CallControls({
  callId,
  callType,
  aiOn,
  onToggleAi,
  caption,
  peerName,
}: {
  callId: string;
  callType: CallType;
  aiOn: boolean;
  onToggleAi: () => void;
  caption?: string;
  peerName: string;
}) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(callType === "video");

  const remoteTracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]);
  const remoteVideo = remoteTracks.find(
    (track) =>
      isTrackReference(track) &&
      track.participant.identity !== localParticipant.identity &&
      track.source === Track.Source.Camera
  );

  const localTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: false,
  });
  const localVideo = localTracks.find(
    (track) =>
      isTrackReference(track) &&
      track.participant.identity === localParticipant.identity
  );

  const statusText = useMemo(() => {
    const remoteCount = participants.filter(
      (p) => p.identity !== localParticipant.identity
    ).length;
    if (remoteCount === 0) {
      return `Calling ${peerName}…`;
    }
    return caption ?? `Connected with ${peerName}`;
  }, [participants, localParticipant.identity, peerName, caption]);

  useEffect(() => {
    void markCallActive(callId);
  }, [callId]);

  const handleEnd = useCallback(async () => {
    try {
      await room.disconnect();
    } catch {
      // ignore
    }
    await endCall(callId);
    navigation.goBack();
  }, [callId, navigation, room]);

  const toggleMic = async () => {
    const next = !micEnabled;
    await localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  };

  const toggleCam = async () => {
    if (callType !== "video") {
      return;
    }
    const next = !camEnabled;
    await localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
  };

  return (
    <View style={styles.flex}>
      {callType === "video" ? (
        <View style={styles.videoArea}>
          {remoteVideo && isTrackReference(remoteVideo) ? (
            <VideoTrack style={styles.remoteVideo} trackRef={remoteVideo} />
          ) : (
            <View style={styles.placeholder}>
              <AppText size={64}>👤</AppText>
              <AppText weight="700" size={Typography.h2}>
                {peerName}
              </AppText>
              <AppText color={theme.colors.textSecondary}>{statusText}</AppText>
            </View>
          )}

          {localVideo && isTrackReference(localVideo) && camEnabled ? (
            <View style={styles.localPreview}>
              <VideoTrack style={styles.localVideo} trackRef={localVideo} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.audioArea}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.card }]}
          >
            <AppText size={60}>👤</AppText>
          </View>
          <AppText size={Typography.h2} weight="700">
            {peerName}
          </AppText>
          <AppText color={theme.colors.textSecondary} style={styles.status}>
            {statusText}
          </AppText>
        </View>
      )}

      {aiOn && callType === "video" ? (
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
            Captions will appear here when STT is connected.
          </AppText>
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.aiButton,
          {
            backgroundColor: aiOn
              ? theme.colors.primary
              : theme.colors.primaryMuted,
          },
        ]}
        onPress={onToggleAi}
      >
        <AppText
          weight="700"
          color={aiOn ? theme.colors.onPrimary : theme.colors.primary}
        >
          {aiOn ? "AI Translate On" : "Enable AI Translate"}
        </AppText>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: theme.colors.card }]}
          onPress={toggleMic}
        >
          <AppText>{micEnabled ? "🎤" : "🔇"}</AppText>
        </TouchableOpacity>

        {callType === "video" ? (
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: theme.colors.card }]}
            onPress={toggleCam}
          >
            <AppText>{camEnabled ? "📷" : "🚫"}</AppText>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.endBtn, { backgroundColor: theme.colors.callEnd }]}
          onPress={handleEnd}
        >
          <AppText>📞</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function LiveKitCallRoom(props: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const userId = useAuthStore((state) => state.user?.id);
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await fetchLiveKitToken(props.callId);
      if (!active) {
        return;
      }

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setCredentials(result.credentials);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [props.callId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeIncomingCalls(userId, (call) => {
      if (
        call.id === props.callId &&
        (call.status === "ended" ||
          call.status === "declined" ||
          call.status === "missed")
      ) {
        navigation.goBack();
      }
    });
  }, [userId, props.callId, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText style={styles.message}>Connecting…</AppText>
      </View>
    );
  }

  if (error || !credentials) {
    return (
      <View style={styles.centered}>
        <AppText weight="700" style={styles.message}>
          Could not start media
        </AppText>
        <AppText color={theme.colors.textSecondary} style={styles.message}>
          {error ??
            "Add LiveKit secrets (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET) to the livekit-token Edge Function."}
        </AppText>
        <TouchableOpacity
          style={[styles.endBtn, { backgroundColor: theme.colors.callEnd }]}
          onPress={async () => {
            await endCall(props.callId);
            navigation.goBack();
          }}
        >
          <AppText>📞</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={credentials.url}
      token={credentials.token}
      connect
      audio
      video={props.callType === "video"}
    >
      <View style={styles.flex}>
        <CallControls
          callId={props.callId}
          callType={props.callType}
          aiOn={props.aiOn}
          onToggleAi={props.onToggleAi}
          caption={props.caption}
          peerName={props.peerName}
        />
      </View>
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  message: {
    textAlign: "center",
    marginTop: 8,
  },
  videoArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  remoteVideo: {
    ...StyleSheet.absoluteFill,
  },
  localPreview: {
    position: "absolute",
    right: 16,
    top: 48,
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  localVideo: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  audioArea: {
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
  captionBox: {
    marginHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  aiButton: {
    alignSelf: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginBottom: 40,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  endBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

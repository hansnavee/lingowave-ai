import React, { useEffect, useRef, useState } from "react";

import {
  FlatList,
  KeyboardAvoidingView,
  Image,
  Linking,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  CompositeNavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppScreen from "../../components/ui/AppScreen";
import AppText from "../../components/ui/AppText";
import ChatBackground from "../../components/chat/ChatBackground";
import ChatHeader from "../../components/chat/ChatHeader";
import DateSeparator from "../../components/chat/DateSeparator";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageInput from "../../components/chat/MessageInput";
import ReplyPreview from "../../components/chat/ReplyPreview";
import MessageActionSheet from "../../components/chat/MessageActionSheet";
import AttachmentSheet from "../../components/chat/AttachmentSheet";
import EmojiPicker from "../../components/chat/EmojiPicker";
import VoiceRecorder from "../../components/chat/VoiceRecorder";
import ImageViewer from "../../components/chat/ImageViewer";
import AudioBubble from "../../components/chat/AudioBubble";
import PaywallSheet from "../../components/subscription/PaywallSheet";

import { pickImage } from "../../utils/imagePicker";
import { openCamera } from "../../utils/cameraPicker";
import { pickDocument } from "../../utils/documentPicker";
import {
  decodeLocationContent,
  encodeLocationContent,
  getCurrentShareLocation,
} from "../../utils/locationShare";
import { uploadChatFile } from "../../services/storageService";
import {
  getLastSeenMap,
  isOnlineFromLastSeen,
} from "../../services/presenceService";
import { blockUser } from "../../repositories/blockRepository";
import { supabase } from "../../lib/supabase";

import { useTheme, Spacing } from "../../theme";
import {
  AppStackParamList,
  ChatStackParamList,
} from "../../navigation/types";
import type { Message } from "../../types/models";
import {
  deleteMessage,
  getMessages,
  sendMessage,
  updateMessage,
} from "../../repositories/messageRepository";
import {
  getChatById,
  setChatTranslateEnabled,
} from "../../repositories/chatRepository";
import { getOtherChatMemberId } from "../../repositories/callRepository";
import {
  getDisplayText,
  translateMessageForUser,
} from "../../services/translationService";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ChatStackParamList, "Chat">,
  NativeStackNavigationProp<AppStackParamList>
>;

type ChatRouteProp = RouteProp<ChatStackParamList, "Chat">;

function formatFileSize(size?: number): string {
  if (!size) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const entitled = useSubscriptionStore((state) => {
    const sub = state.subscription;
    if (!sub || sub.status !== "active" || !sub.expiresAt) {
      return false;
    }
    return new Date(sub.expiresAt).getTime() > Date.now();
  });

  const { userId, userName } = route.params;

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [actionVisible, setActionVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [showOriginalIds, setShowOriginalIds] = useState<Record<string, boolean>>(
    {}
  );
  const [translating, setTranslating] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerAvatarUrl, setPeerAvatarUrl] = useState<string | undefined>();
  const [peerUserId, setPeerUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([getMessages(userId), getChatById(userId)]).then(
      async ([data, chat]) => {
        if (!active) {
          return;
        }

        const enabled = Boolean(chat?.translateEnabled) && entitled;
        setTranslateEnabled(enabled);

        if (enabled && user?.preferredLanguage) {
          setTranslating(true);
          const translated: Message[] = [];
          for (const message of data) {
            const next = await translateMessageForUser({
              message,
              targetLanguage: user.preferredLanguage,
            });
            translated.push(next);
            if (
              next.translations?.[user.preferredLanguage] &&
              next.translations[user.preferredLanguage] !==
                message.translations?.[user.preferredLanguage]
            ) {
              void updateMessage(next.id, {
                translations: next.translations,
                content: next.content,
              });
            }
          }
          if (active) {
            setMessages(translated);
            setTranslating(false);
          }
        } else {
          setMessages(data);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [userId, user?.preferredLanguage, entitled]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const refreshPeer = async () => {
      const otherId = await getOtherChatMemberId(userId);
      if (!active || !otherId) {
        return;
      }

      setPeerUserId(otherId);
      const map = await getLastSeenMap([otherId]);
      if (!active) {
        return;
      }

      setPeerOnline(isOnlineFromLastSeen(map[otherId]));

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, last_seen_at")
        .eq("id", otherId)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (data) {
        setPeerAvatarUrl(data.avatar_url ?? undefined);
        setPeerOnline(
          isOnlineFromLastSeen(
            (data as { last_seen_at?: string | null }).last_seen_at ??
              map[otherId]
          )
        );
      }
    };

    void refreshPeer();
    timer = setInterval(() => {
      void refreshPeer();
    }, 30_000);

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [userId]);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleToggleTranslate = async () => {
    if (translateEnabled) {
      setTranslateEnabled(false);
      await setChatTranslateEnabled(userId, false);
      return;
    }

    if (!entitled) {
      setPaywallVisible(true);
      return;
    }

    setTranslateEnabled(true);
    await setChatTranslateEnabled(userId, true);
    setTranslating(true);
    const translated: Message[] = [];
    for (const message of messages) {
      const next = await translateMessageForUser({
        message,
        targetLanguage: user!.preferredLanguage!,
      });
      translated.push(next);
      if (
        user?.preferredLanguage &&
        next.translations?.[user.preferredLanguage] &&
        next.translations[user.preferredLanguage] !==
          message.translations?.[user.preferredLanguage]
      ) {
        void updateMessage(next.id, {
          translations: next.translations,
        });
      }
    }
    setMessages(translated);
    setTranslating(false);
  };

  const appendMessage = async (message: Message) => {
    const withOriginal: Message = {
      ...message,
      originalText: message.originalText ?? message.content,
      senderId: user?.id,
    };

    let next = withOriginal;

    if (translateEnabled && user?.preferredLanguage) {
      next = await translateMessageForUser({
        message: withOriginal,
        targetLanguage: user.preferredLanguage,
      });
    }

    const saved = await sendMessage(userId, next);
    next = saved ?? next;

    setMessages((prev) => [...prev, next]);
    scrollToEnd();
  };

  const handleDocument = async () => {
    try {
      const file = await pickDocument();
      if (!file) return;

      const uploaded = await uploadChatFile({
        localUri: file.uri,
        chatId: userId,
        fileName: file.name,
      });

      await appendMessage({
        id: Date.now().toString(),
        type: "file",
        content: uploaded.url,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize ?? file.size ?? undefined,
        time: "Now",
        isMe: true,
      });

      setAttachmentVisible(false);
    } catch {
      Alert.alert("Document failed", "Could not upload this document.");
    }
  };

  const handleCamera = async () => {
    try {
      const image = await openCamera();
      if (!image) return;

      const uploaded = await uploadChatFile({
        localUri: image.uri,
        chatId: userId,
        fileName: `photo-${Date.now()}.jpg`,
      });

      await appendMessage({
        id: Date.now().toString(),
        type: "image",
        content: uploaded.url,
        time: "Now",
        isMe: true,
      });

      setAttachmentVisible(false);
    } catch {
      Alert.alert("Camera unavailable", "Allow camera access to take a photo.");
    }
  };

  const handleGallery = async () => {
    try {
      const image = await pickImage();
      if (!image) return;

      const uploaded = await uploadChatFile({
        localUri: image.uri,
        chatId: userId,
        fileName: `image-${Date.now()}.jpg`,
      });

      await appendMessage({
        id: Date.now().toString(),
        type: "image",
        content: uploaded.url,
        time: "Now",
        isMe: true,
      });

      setAttachmentVisible(false);
    } catch {
      Alert.alert(
        "Gallery unavailable",
        "Allow photo library access to send images."
      );
    }
  };

  const handleLocation = async () => {
    try {
      const location = await getCurrentShareLocation();
      await appendMessage({
        id: Date.now().toString(),
        type: "location",
        content: encodeLocationContent(location),
        originalText: location.label,
        time: "Now",
        isMe: true,
      });
      setAttachmentVisible(false);
    } catch {
      Alert.alert(
        "Location unavailable",
        "Allow location access to share where you are."
      );
    }
  };

  const handleBlockUser = () => {
    if (!peerUserId) {
      Alert.alert("Unavailable", "Could not find this contact to block.");
      return;
    }

    Alert.alert(
      "Block user",
      `Block ${userName}? You won’t see their chats anymore.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            const result = await blockUser(peerUserId);
            if (!result.ok) {
              Alert.alert("Failed", result.error);
              return;
            }
            Alert.alert("Blocked", `${userName} has been blocked.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!text.trim()) {
      return;
    }

    const body = text.trim();

    await appendMessage({
      id: Date.now().toString(),
      type: "text",
      content: body,
      originalText: body,
      replyTo: replyMessage
        ? {
            id: replyMessage.id,
            content: replyMessage.originalText ?? replyMessage.content,
          }
        : undefined,
      time: "Now",
      isMe: true,
    });

    setText("");
    setReplyMessage(null);
  };

  const comingSoon = (feature: string) => {
    Alert.alert(
      "Coming soon",
      `${feature} will be available in a future update.`
    );
    setAttachmentVisible(false);
  };

  const openCall = async (mode: "AudioCall" | "CallVideo") => {
    const peerId = await getOtherChatMemberId(userId);
    if (!peerId) {
      Alert.alert(
        "No contact",
        "This chat has no other participant to call yet."
      );
      return;
    }

    navigation.navigate(mode, {
      name: userName,
      peerUserId: peerId,
      callType: mode === "CallVideo" ? "video" : "audio",
      enableTranslate: translateEnabled && entitled,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const showingOriginal = Boolean(showOriginalIds[item.id]);
    const display = getDisplayText(item, {
      translateEnabled,
      preferredLanguage: user?.preferredLanguage,
      showOriginal: showingOriginal,
    });
    const isTranslated =
      translateEnabled &&
      Boolean(
        user?.preferredLanguage &&
          item.translations?.[user.preferredLanguage] &&
          item.translations[user.preferredLanguage] !==
            (item.originalText ?? item.content)
      );

    if (item.type === "text") {
      return (
        <TouchableOpacity
          onLongPress={() => {
            setSelectedMessage(item);
            setActionVisible(true);
          }}
        >
          <MessageBubble
            message={display}
            time={item.time}
            isMe={item.isMe}
            isRead
            reaction={item.reaction}
            replyTo={item.replyTo}
            starred={item.starred}
            isPinned={item.pinned}
            isTranslated={isTranslated}
            showingOriginal={showingOriginal}
            onToggleOriginal={() =>
              setShowOriginalIds((prev) => ({
                ...prev,
                [item.id]: !prev[item.id],
              }))
            }
          />
        </TouchableOpacity>
      );
    }

    if (item.type === "audio") {
      return (
        <View>
          <AudioBubble uri={item.content} isMe={item.isMe} />
          {translateEnabled && user?.preferredLanguage ? (
            <AppText
              size={12}
              color={theme.colors.textSecondary}
              style={styles.audioCaption}
            >
              {item.translations?.[user.preferredLanguage] ??
                "AI voice caption available for subscribers"}
            </AppText>
          ) : null}
        </View>
      );
    }

    if (item.type === "image") {
      return (
        <View
          style={{
            alignItems: item.isMe ? "flex-end" : "flex-start",
            marginVertical: 6,
            paddingHorizontal: Spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(item.content);
              setImageViewerVisible(true);
            }}
          >
            <Image source={{ uri: item.content }} style={styles.image} />
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === "file") {
      return (
        <TouchableOpacity
          onPress={() => {
            if (item.content) {
              void Linking.openURL(item.content);
            }
          }}
          style={[
            styles.fileBubble,
            {
              alignSelf: item.isMe ? "flex-end" : "flex-start",
              backgroundColor: item.isMe
                ? theme.colors.bubbleMe
                : theme.colors.bubbleOther,
            },
          ]}
        >
          <AppText
            color={
              item.isMe
                ? theme.colors.onBubbleMe
                : theme.colors.onBubbleOther
            }
            weight="700"
          >
            📄 {item.fileName ?? "Document"}
          </AppText>
          {item.fileSize ? (
            <AppText
              size={12}
              color={
                item.isMe
                  ? theme.colors.onBubbleMe
                  : theme.colors.textSecondary
              }
            >
              {formatFileSize(item.fileSize)}
            </AppText>
          ) : null}
        </TouchableOpacity>
      );
    }

    if (item.type === "location") {
      const location = decodeLocationContent(item.content);
      return (
        <TouchableOpacity
          onPress={() => {
            if (!location) {
              return;
            }
            const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
            void Linking.openURL(url);
          }}
          style={[
            styles.fileBubble,
            {
              alignSelf: item.isMe ? "flex-end" : "flex-start",
              backgroundColor: item.isMe
                ? theme.colors.bubbleMe
                : theme.colors.bubbleOther,
            },
          ]}
        >
          <AppText
            color={
              item.isMe
                ? theme.colors.onBubbleMe
                : theme.colors.onBubbleOther
            }
            weight="700"
          >
            📍 {location?.label ?? "Shared location"}
          </AppText>
          <AppText
            size={12}
            color={
              item.isMe
                ? theme.colors.onBubbleMe
                : theme.colors.textSecondary
            }
          >
            Tap to open in Maps
          </AppText>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <AppScreen>
      <ChatBackground>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ChatHeader
            name={userName}
            online={peerOnline}
            avatarUrl={peerAvatarUrl}
            translateEnabled={translateEnabled}
            onBack={() => navigation.goBack()}
            onToggleTranslate={handleToggleTranslate}
            onAudioCall={() => openCall("AudioCall")}
            onVideoCall={() => openCall("CallVideo")}
            onBlockUser={handleBlockUser}
          />

          {translating ? (
            <View style={styles.translatingBar}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText size={12} color={theme.colors.textSecondary}>
                Translating…
              </AppText>
            </View>
          ) : null}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={<DateSeparator title="Today" />}
            renderItem={renderMessage}
            onContentSizeChange={scrollToEnd}
          />

          <View
            style={[
              styles.composer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {replyMessage ? (
              <ReplyPreview
                message={replyMessage}
                onClose={() => setReplyMessage(null)}
              />
            ) : null}

            <MessageInput
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              onEmojiPress={() => setEmojiVisible(true)}
              onAttachmentPress={() => setAttachmentVisible(true)}
              onCameraPress={handleCamera}
              onVoicePress={() => setVoiceVisible(true)}
            />
          </View>
        </KeyboardAvoidingView>
      </ChatBackground>

      <AttachmentSheet
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        onDocument={handleDocument}
        onGallery={handleGallery}
        onCamera={handleCamera}
        onAudio={() => {
          setAttachmentVisible(false);
          setVoiceVisible(true);
        }}
        onLocation={handleLocation}
        onContact={() => comingSoon("Contact sharing")}
      />

      <EmojiPicker
        visible={emojiVisible}
        onClose={() => setEmojiVisible(false)}
        onSelect={(emoji) => {
          setText((prev) => prev + emoji);
        }}
      />

      <VoiceRecorder
        visible={voiceVisible}
        onClose={() => setVoiceVisible(false)}
        onSend={async (uri) => {
          try {
            const uploaded = await uploadChatFile({
              localUri: uri,
              chatId: userId,
              fileName: `voice-${Date.now()}.m4a`,
            });
            await appendMessage({
              id: Date.now().toString(),
              type: "audio",
              content: uploaded.url,
              originalText: "Voice message",
              time: "Now",
              isMe: true,
            });
          } catch {
            Alert.alert("Upload failed", "Could not send voice message.");
          }
          setVoiceVisible(false);
        }}
      />

      <ImageViewer
        visible={imageViewerVisible}
        imageUri={selectedImage}
        onClose={() => setImageViewerVisible(false)}
      />

      <PaywallSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          navigation.navigate("Subscription");
        }}
      />

      <MessageActionSheet
        visible={actionVisible}
        onClose={() => setActionVisible(false)}
        onReply={() => {
          if (selectedMessage) {
            setReplyMessage(selectedMessage);
          }
          setActionVisible(false);
        }}
        onCopy={async () => {
          if (selectedMessage) {
            Alert.alert(
              "Copy unavailable",
              "Clipboard is temporarily disabled on this build."
            );
          }
          setActionVisible(false);
        }}
        onForward={() => {
          Alert.alert(
            "Coming soon",
            "Forward message will be added in a future update."
          );
          setActionVisible(false);
        }}
        onStar={() => {
          if (selectedMessage) {
            const starred = !selectedMessage.starred;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === selectedMessage.id
                  ? { ...msg, starred }
                  : msg
              )
            );
            void updateMessage(selectedMessage.id, { starred });
          }
          setActionVisible(false);
        }}
        onDelete={() => {
          if (selectedMessage) {
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== selectedMessage.id)
            );
            void deleteMessage(selectedMessage.id);
          }
          setActionVisible(false);
        }}
        onPin={() => {
          if (selectedMessage) {
            const pinned = !selectedMessage.pinned;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === selectedMessage.id
                  ? { ...msg, pinned }
                  : msg
              )
            );
            void updateMessage(selectedMessage.id, { pinned });
          }
          setActionVisible(false);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    paddingBottom: Spacing.md,
  },
  composer: {
    paddingTop: Spacing.sm,
  },
  image: {
    width: 220,
    height: 260,
    borderRadius: 16,
  },
  fileBubble: {
    marginVertical: 6,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    maxWidth: "80%",
    gap: 4,
  },
  translatingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  audioCaption: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
  },
});

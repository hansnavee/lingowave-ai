/**
 * LiveKit / WebRTC native modules have crashed some Android devices
 * (Vivo + RN New Architecture) at process start — even before JS imports them.
 * Keep packages installed for later, but do not link them into this APK.
 */
module.exports = {
  dependencies: {
    "@livekit/react-native": {
      platforms: {
        android: null,
        ios: null,
      },
    },
    "@livekit/react-native-webrtc": {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};

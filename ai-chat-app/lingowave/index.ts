import { registerRootComponent } from "expo";
import { Platform } from "react-native";

/**
 * Hermes does not always define DOMException. LiveKit / webrtc-adapter
 * reference it during module load and can crash the app on Android devices
 * (including many Vivo phones) if it is missing.
 */
function ensureDomExceptionPolyfill() {
  const g = globalThis as typeof globalThis & {
    DOMException?: new (message?: string, name?: string) => Error;
  };

  if (typeof g.DOMException !== "undefined") {
    return;
  }

  class DOMExceptionPolyfill extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "DOMException";
    }
  }

  g.DOMException = DOMExceptionPolyfill as typeof g.DOMException;
}

if (Platform.OS !== "web") {
  ensureDomExceptionPolyfill();

  try {
    // LiveKit WebRTC globals (native/dev builds only)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@livekit/react-native").registerGlobals();
  } catch (error) {
    // Keep the app launchable even if WebRTC init fails on a device.
    console.warn("LiveKit registerGlobals failed:", error);
  }
}

import App from "./App";

registerRootComponent(App);

import { Platform } from "react-native";

let ready = false;

/**
 * Hermes may lack DOMException; LiveKit / webrtc-adapter need it.
 * Call once before any LiveKit native usage.
 */
export function ensureLiveKitReady(): void {
  if (ready || Platform.OS === "web") {
    return;
  }

  const g = globalThis as typeof globalThis & {
    DOMException?: new (message?: string, name?: string) => Error;
  };

  if (typeof g.DOMException === "undefined") {
    class DOMExceptionPolyfill extends Error {
      constructor(message?: string, name?: string) {
        super(message);
        this.name = name ?? "DOMException";
      }
    }
    g.DOMException = DOMExceptionPolyfill as typeof g.DOMException;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@livekit/react-native").registerGlobals();
  } catch (error) {
    console.warn("LiveKit registerGlobals failed:", error);
  }

  ready = true;
}

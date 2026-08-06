import { useEffect } from "react";
import { AppState } from "react-native";

import { touchPresence } from "../../services/presenceService";
import { useAuthStore } from "../../store/authStore";

const INTERVAL_MS = 45_000;

/** Keeps last_seen_at fresh while the app is active. */
export default function PresenceHeartbeat() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      void touchPresence();
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        void touchPresence();
      }, INTERVAL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    start();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [isLoggedIn]);

  return null;
}

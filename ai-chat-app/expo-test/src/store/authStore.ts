import { create } from "zustand";

import type { AuthUser, PreferredLanguage } from "../types/models";
import {
  loginRequest,
  logoutRequest,
  resetPasswordRequest,
  restoreSession,
  signupRequest,
  updateUserProfile,
} from "../services/authService";

export type AuthStatus =
  | "unknown"
  | "unauthenticated"
  | "authenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<boolean>;
  setPreferredLanguage: (language: PreferredLanguage) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  logout: () => Promise<void>;
  clearError: () => void;
  isLoggedIn: boolean;
  needsLanguageSetup: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  needsLanguageSetup: false,

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const session = await restoreSession();

      if (session) {
        set({
          status: "authenticated",
          user: session.user,
          isLoggedIn: true,
          needsLanguageSetup: !session.user.preferredLanguage,
          error: null,
        });
        return;
      }

      set({
        status: "unauthenticated",
        user: null,
        isLoggedIn: false,
        needsLanguageSetup: false,
      });
    } catch {
      set({
        status: "unauthenticated",
        user: null,
        isLoggedIn: false,
        needsLanguageSetup: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const result = await loginRequest(email, password);

      if (!result.ok) {
        set({
          isLoading: false,
          error: result.error,
          status: "unauthenticated",
          isLoggedIn: false,
          needsLanguageSetup: false,
        });
        return false;
      }

      set({
        isLoading: false,
        status: "authenticated",
        user: result.session.user,
        isLoggedIn: true,
        needsLanguageSetup: !result.session.user.preferredLanguage,
        error: null,
      });

      return true;
    } catch {
      set({
        isLoading: false,
        error: "Could not log in. Please try again.",
        status: "unauthenticated",
        isLoggedIn: false,
        needsLanguageSetup: false,
      });
      return false;
    }
  },

  signup: async (name, email, password, phone) => {
    set({ isLoading: true, error: null });

    try {
      const result = await signupRequest(name, email, password, phone);

      if (!result.ok) {
        set({
          isLoading: false,
          error: result.error,
          status: "unauthenticated",
          isLoggedIn: false,
          needsLanguageSetup: false,
        });
        return false;
      }

      set({
        isLoading: false,
        status: "authenticated",
        user: result.session.user,
        isLoggedIn: true,
        needsLanguageSetup: true,
        error: null,
      });

      return true;
    } catch {
      set({
        isLoading: false,
        error: "Could not create account. Please try again.",
        status: "unauthenticated",
        isLoggedIn: false,
        needsLanguageSetup: false,
      });
      return false;
    }
  },

  setPreferredLanguage: async (language) => {
    set({ isLoading: true, error: null });

    const result = await updateUserProfile({
      preferredLanguage: language,
    });

    if (!result.ok) {
      set({
        isLoading: false,
        error: result.error,
      });
      return false;
    }

    set({
      isLoading: false,
      user: result.session.user,
      needsLanguageSetup: false,
    });

    return true;
  },

  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });

    const result = await resetPasswordRequest(email);

    set({ isLoading: false });

    if (!result.ok) {
      set({ error: result.error });
      return null;
    }

    return result.message;
  },

  logout: async () => {
    set({ isLoading: true });
    await logoutRequest();
    set({
      isLoading: false,
      status: "unauthenticated",
      user: null,
      isLoggedIn: false,
      needsLanguageSetup: false,
      error: null,
    });
  },
}));

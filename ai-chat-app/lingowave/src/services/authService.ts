import type { AuthUser, PreferredLanguage } from "../types/models";
import {
  validateEmailOnly,
  validateLogin,
  validateSignup,
  normalizePhone,
} from "../utils/validation";
import {
  clearSession,
  loadSession,
  saveSession,
  type SessionPayload,
} from "./sessionStorage";

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createToken(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function toUser(
  name: string,
  email: string,
  phone: string,
  preferredLanguage?: PreferredLanguage
): AuthUser {
  return {
    id: `user_${email.trim().toLowerCase()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: normalizePhone(phone),
    preferredLanguage,
    createdAt: new Date().toISOString(),
  };
}

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

export type SimpleResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** Mock auth API — swap for real backend in Phase 2. */
export async function loginRequest(
  email: string,
  password: string
): Promise<AuthResult> {
  const validationError = validateLogin(email, password);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  await delay();

  const existing = await loadSession();
  const fallbackPhone =
    existing?.user.email === email.trim().toLowerCase()
      ? existing.user.phone
      : "+10000000000";

  const user = toUser(
    existing?.user.email === email.trim().toLowerCase()
      ? existing.user.name
      : email.split("@")[0] || "User",
    email,
    existing?.user.email === email.trim().toLowerCase()
      ? existing.user.phone
      : fallbackPhone,
    existing?.user.email === email.trim().toLowerCase()
      ? existing.user.preferredLanguage
      : undefined
  );

  const session: SessionPayload = {
    token: createToken(),
    user,
  };

  await saveSession(session);

  return { ok: true, session };
}

export async function signupRequest(
  name: string,
  email: string,
  password: string,
  phone: string
): Promise<AuthResult> {
  const validationError = validateSignup(name, email, password, phone);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  await delay();

  const user = toUser(name, email, phone);
  const session: SessionPayload = {
    token: createToken(),
    user,
  };

  await saveSession(session);

  return { ok: true, session };
}

export async function updateUserProfile(
  patch: Partial<
    Pick<AuthUser, "name" | "phone" | "preferredLanguage">
  >
): Promise<AuthResult> {
  const existing = await loadSession();

  if (!existing) {
    return { ok: false, error: "Not signed in." };
  }

  const user: AuthUser = {
    ...existing.user,
    ...patch,
    phone: patch.phone
      ? normalizePhone(patch.phone)
      : existing.user.phone,
  };

  const session: SessionPayload = {
    ...existing,
    user,
  };

  await saveSession(session);

  return { ok: true, session };
}

export async function resetPasswordRequest(
  email: string
): Promise<SimpleResult> {
  const validationError = validateEmailOnly(email);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  await delay();

  return {
    ok: true,
    message: "If an account exists for that email, a reset link was sent.",
  };
}

export async function restoreSession(): Promise<SessionPayload | null> {
  const session = await loadSession();

  if (!session) {
    return null;
  }

  // Migrate older sessions missing phone / createdAt.
  const user = {
    ...session.user,
    phone: session.user.phone || "+10000000000",
    createdAt: session.user.createdAt || new Date().toISOString(),
  };

  return { ...session, user };
}

export async function logoutRequest(): Promise<void> {
  await clearSession();
}

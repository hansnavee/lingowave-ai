import type { AuthUser } from "../types/models";
import {
  validateEmailOnly,
  validateLogin,
  validateSignup,
  normalizePhone,
} from "../utils/validation";
import { supabase } from "../lib/supabase";
import { profileToAuthUser } from "../lib/mappers";
import type { ProfileRow } from "../types/database";
import {
  clearSession,
  saveSession,
  type SessionPayload,
} from "./sessionStorage";

export type AuthResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

export type SimpleResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function authErrorMessage(error: { message: string } | null): string {
  if (!error?.message) {
    return "Something went wrong. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (message.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (message.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox.";
  }

  if (message.includes("password")) {
    return error.message;
  }

  return error.message;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load profile:", error.message);
    throw new Error(error.message);
  }

  return data;
}

async function ensureProfile(params: {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}): Promise<ProfileRow | null> {
  try {
    const existing = await fetchProfile(params.id);

    if (existing) {
      return existing;
    }
  } catch (error) {
    console.warn(
      "Profile fetch failed, will try upsert:",
      error instanceof Error ? error.message : error
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: params.id,
        email: params.email.trim().toLowerCase(),
        name: params.name?.trim() || params.email.split("@")[0] || "User",
        phone: params.phone ? normalizePhone(params.phone) : "",
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    console.warn("Failed to ensure profile:", error.message);
    throw new Error(error.message);
  }

  return data;
}

async function buildSession(
  accessToken: string,
  userId: string,
  email: string,
  meta?: { name?: string; phone?: string }
): Promise<SessionPayload | null> {
  const profile = await ensureProfile({
    id: userId,
    email,
    name: meta?.name,
    phone: meta?.phone,
  });

  if (!profile) {
    return null;
  }

  const session: SessionPayload = {
    token: accessToken,
    user: profileToAuthUser(profile),
  };

  await saveSession(session);
  return session;
}

/** Supabase Auth — free-tier email/password. */
export async function loginRequest(
  email: string,
  password: string
): Promise<AuthResult> {
  const validationError = validateLogin(email, password);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.session || !data.user) {
    return { ok: false, error: authErrorMessage(error) };
  }

  try {
    const session = await buildSession(
      data.session.access_token,
      data.user.id,
      data.user.email ?? email
    );

    if (!session) {
      return { ok: false, error: "Signed in, but profile could not be loaded." };
    }

    return { ok: true, session };
  } catch (profileError) {
    return {
      ok: false,
      error:
        profileError instanceof Error
          ? profileError.message
          : "Signed in, but profile could not be loaded.",
    };
  }
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

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: name.trim(),
        phone: normalizedPhone,
      },
    },
  });

  if (error) {
    return { ok: false, error: authErrorMessage(error) };
  }

  if (!data.session || !data.user) {
    return {
      ok: false,
      error:
        "Account created. Confirm your email, then sign in. (Disable email confirmation in Supabase Auth settings for instant signup.)",
    };
  }

  try {
    const session = await buildSession(
      data.session.access_token,
      data.user.id,
      data.user.email ?? normalizedEmail,
      { name: name.trim(), phone: normalizedPhone }
    );

    if (!session) {
      return {
        ok: false,
        error: "Account created, but profile could not be loaded.",
      };
    }

    return { ok: true, session };
  } catch (profileError) {
    return {
      ok: false,
      error:
        profileError instanceof Error
          ? profileError.message
          : "Account created, but profile could not be loaded.",
    };
  }
}

export async function updateUserProfile(
  patch: Partial<Pick<AuthUser, "name" | "phone" | "preferredLanguage">>
): Promise<AuthResult> {
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.user) {
    return { ok: false, error: "Not signed in." };
  }

  const updates: {
    name?: string;
    phone?: string;
    preferred_language?: string | null;
  } = {};

  if (patch.name !== undefined) {
    updates.name = patch.name.trim();
  }

  if (patch.phone !== undefined) {
    updates.phone = normalizePhone(patch.phone);
  }

  if (patch.preferredLanguage !== undefined) {
    updates.preferred_language = patch.preferredLanguage;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", authSession.user.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Could not update profile.",
    };
  }

  const session: SessionPayload = {
    token: authSession.access_token,
    user: profileToAuthUser(data),
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

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase()
  );

  if (error) {
    return { ok: false, error: authErrorMessage(error) };
  }

  return {
    ok: true,
    message: "If an account exists for that email, a reset link was sent.",
  };
}

export async function restoreSession(): Promise<SessionPayload | null> {
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.user) {
    await clearSession();
    return null;
  }

  const session = await buildSession(
    authSession.access_token,
    authSession.user.id,
    authSession.user.email ?? ""
  );

  return session;
}

export async function logoutRequest(): Promise<void> {
  await supabase.auth.signOut();
  await clearSession();
}

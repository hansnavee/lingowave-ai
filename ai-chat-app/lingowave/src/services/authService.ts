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
import { languageForCountryCode } from "../constants/countryLanguage";
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

  if (
    data &&
    !data.preferred_language &&
    data.country_code
  ) {
    const language = languageForCountryCode(data.country_code);
    const { data: updated } = await supabase
      .from("profiles")
      .update({ preferred_language: language })
      .eq("id", userId)
      .select("*")
      .single();
    return updated ?? { ...data, preferred_language: language };
  }

  return data;
}

async function ensureProfile(params: {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  countryCode?: string;
  preferredLanguage?: string;
  dateOfBirth?: string;
  birthPlace?: string;
}): Promise<ProfileRow | null> {
  try {
    const existing = await fetchProfile(params.id);

    if (existing) {
      const patch: {
        name?: string;
        phone?: string;
        country_code?: string;
        preferred_language?: string;
        date_of_birth?: string;
        birth_place?: string;
      } = {};

      if (params.name && !existing.name) {
        patch.name = params.name;
      }
      if (params.phone && !existing.phone) {
        patch.phone = normalizePhone(params.phone);
      }
      if (params.countryCode && !existing.country_code) {
        patch.country_code = params.countryCode;
      }
      if (params.preferredLanguage && !existing.preferred_language) {
        patch.preferred_language = params.preferredLanguage;
      }
      if (params.dateOfBirth && !existing.date_of_birth) {
        patch.date_of_birth = params.dateOfBirth;
      }
      if (params.birthPlace && !existing.birth_place) {
        patch.birth_place = params.birthPlace.trim();
      }

      if (Object.keys(patch).length > 0) {
        const { data } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", params.id)
          .select("*")
          .single();
        return data ?? existing;
      }

      return existing;
    }
  } catch (error) {
    console.warn(
      "Profile fetch failed, will try upsert:",
      error instanceof Error ? error.message : error
    );
  }

  const preferred =
    params.preferredLanguage ??
    languageForCountryCode(params.countryCode);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: params.id,
        email: params.email.trim().toLowerCase(),
        name: params.name?.trim() || params.email.split("@")[0] || "User",
        phone: params.phone ? normalizePhone(params.phone) : "",
        country_code: params.countryCode ?? null,
        preferred_language: preferred,
        date_of_birth: params.dateOfBirth ?? null,
        birth_place: params.birthPlace?.trim() || null,
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
  meta?: {
    name?: string;
    phone?: string;
    countryCode?: string;
    preferredLanguage?: string;
    dateOfBirth?: string;
    birthPlace?: string;
  }
): Promise<SessionPayload | null> {
  const profile = await ensureProfile({
    id: userId,
    email,
    name: meta?.name,
    phone: meta?.phone,
    countryCode: meta?.countryCode,
    preferredLanguage: meta?.preferredLanguage,
    dateOfBirth: meta?.dateOfBirth,
    birthPlace: meta?.birthPlace,
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
  phone: string,
  countryCode?: string,
  dateOfBirth?: string,
  birthPlace?: string
): Promise<AuthResult> {
  const validationError = validateSignup(
    name,
    email,
    password,
    phone,
    dateOfBirth,
    birthPlace
  );

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);
  const preferredLanguage = languageForCountryCode(countryCode);
  const dob = dateOfBirth!.trim();
  const place = birthPlace!.trim();

  const [{ data: phoneTaken, error: phoneCheckError }, { data: emailTaken }] =
    await Promise.all([
      supabase.rpc("is_phone_taken", { p_phone: normalizedPhone }),
      supabase.rpc("is_email_taken", { p_email: normalizedEmail }),
    ]);

  if (phoneCheckError) {
    console.warn("Phone uniqueness check failed:", phoneCheckError.message);
  } else if (phoneTaken) {
    return {
      ok: false,
      error:
        "This phone number is already registered. Sign in or use another number.",
    };
  }

  if (emailTaken) {
    return {
      ok: false,
      error: "This email is already registered. Sign in or use another email.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        country_code: countryCode ?? null,
        preferred_language: preferredLanguage,
        date_of_birth: dob,
        birth_place: place,
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
      {
        name: name.trim(),
        phone: normalizedPhone,
        countryCode,
        preferredLanguage,
        dateOfBirth: dob,
        birthPlace: place,
      }
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
  patch: Partial<
    Pick<
      AuthUser,
      | "name"
      | "phone"
      | "preferredLanguage"
      | "avatarUrl"
      | "countryCode"
      | "dateOfBirth"
      | "birthPlace"
    >
  >
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
    avatar_url?: string | null;
    country_code?: string | null;
    date_of_birth?: string | null;
    birth_place?: string | null;
  } = {};

  if (patch.name !== undefined) {
    updates.name = patch.name.trim();
  }

  if (patch.phone !== undefined) {
    const nextPhone = normalizePhone(patch.phone);
    const { data: phoneTaken } = await supabase.rpc("is_phone_taken", {
      p_phone: nextPhone,
    });

    if (phoneTaken) {
      const { data: mine } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", authSession.user.id)
        .maybeSingle();

      if (mine?.phone !== nextPhone) {
        return {
          ok: false,
          error: "This phone number is already registered to another account.",
        };
      }
    }

    updates.phone = nextPhone;
  }

  if (patch.preferredLanguage !== undefined) {
    updates.preferred_language = patch.preferredLanguage;
  }

  if (patch.avatarUrl !== undefined) {
    updates.avatar_url = patch.avatarUrl;
  }

  if (patch.countryCode !== undefined) {
    updates.country_code = patch.countryCode;
  }

  if (patch.dateOfBirth !== undefined) {
    updates.date_of_birth = patch.dateOfBirth.trim() || null;
  }

  if (patch.birthPlace !== undefined) {
    updates.birth_place = patch.birthPlace.trim() || null;
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

export async function deleteAccountRequest(): Promise<SimpleResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "Not signed in." };
  }

  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, error: String(data.error) };
  }

  await clearSession();
  return { ok: true, message: "Account deleted." };
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

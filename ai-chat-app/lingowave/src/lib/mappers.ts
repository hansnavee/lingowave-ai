import type { AuthUser, PreferredLanguage } from "../types/models";
import type { ProfileRow } from "../types/database";

const PREFERRED_LANGUAGES = new Set<PreferredLanguage>([
  "en",
  "hi",
  "es",
  "fr",
  "de",
  "pt",
  "ar",
  "zh",
  "ja",
  "ko",
]);

export function toPreferredLanguage(
  value: string | null | undefined
): PreferredLanguage | undefined {
  if (!value) {
    return undefined;
  }

  return PREFERRED_LANGUAGES.has(value as PreferredLanguage)
    ? (value as PreferredLanguage)
    : undefined;
}

export function profileToAuthUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    preferredLanguage: toPreferredLanguage(profile.preferred_language),
    avatarUrl: profile.avatar_url ?? undefined,
    avatarPreviousUrl: profile.avatar_previous_url ?? undefined,
    avatarRefreshAt: profile.avatar_refresh_at ?? undefined,
    avatarUndoExpiresAt: profile.avatar_undo_expires_at ?? undefined,
    avatarRefreshDay: profile.avatar_refresh_day ?? undefined,
    avatarFilterName: profile.avatar_filter_name ?? undefined,
    countryCode: profile.country_code ?? undefined,
    dateOfBirth: profile.date_of_birth ?? undefined,
    birthPlace: profile.birth_place ?? undefined,
    createdAt: profile.created_at,
  };
}

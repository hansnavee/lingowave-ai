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
    createdAt: profile.created_at,
  };
}

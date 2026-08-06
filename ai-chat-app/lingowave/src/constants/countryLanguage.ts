import type { PreferredLanguage } from "../types/models";

/** Default app language from the country chosen at signup (phone country). */
const COUNTRY_TO_LANGUAGE: Record<string, PreferredLanguage> = {
  IN: "hi",
  PK: "hi",
  NP: "hi",
  BD: "en",
  LK: "en",
  US: "en",
  GB: "en",
  AU: "en",
  CA: "en",
  SG: "en",
  NZ: "en",
  NG: "en",
  ZA: "en",
  PH: "en",
  MY: "en",
  ID: "en",
  TH: "en",
  VN: "en",
  IE: "en",
  AE: "ar",
  SA: "ar",
  EG: "ar",
  ES: "es",
  MX: "es",
  FR: "fr",
  DE: "de",
  CH: "de",
  AT: "de",
  NL: "en",
  SE: "en",
  BR: "pt",
  PT: "pt",
  JP: "ja",
  KR: "ko",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  IT: "en",
  TR: "en",
  RU: "en",
};

export function languageForCountryCode(
  countryCode: string | undefined | null
): PreferredLanguage {
  if (!countryCode) {
    return "en";
  }

  return COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()] ?? "en";
}

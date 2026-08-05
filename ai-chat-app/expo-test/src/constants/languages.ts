import type { PreferredLanguage } from "../types/models";

export type LanguageOption = {
  code: PreferredLanguage;
  label: string;
  nativeLabel: string;
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
];

export function getLanguageLabel(code?: PreferredLanguage): string {
  if (!code) {
    return "Not set";
  }

  const match = SUPPORTED_LANGUAGES.find((item) => item.code === code);
  return match ? `${match.label} (${match.nativeLabel})` : code;
}

import type { Message, PreferredLanguage } from "../types/models";

/**
 * Mock translation dictionary — replace with Phase 3 provider.
 * Enough for demo across common languages.
 */
const PHRASE_MAP: Record<string, Partial<Record<PreferredLanguage, string>>> = {
  hello: {
    en: "Hello",
    hi: "नमस्ते",
    es: "Hola",
    fr: "Bonjour",
    de: "Hallo",
    pt: "Olá",
    ar: "مرحبا",
    zh: "你好",
    ja: "こんにちは",
    ko: "안녕하세요",
  },
  "how are you": {
    en: "How are you?",
    hi: "आप कैसे हैं?",
    es: "¿Cómo estás?",
    fr: "Comment ça va ?",
    de: "Wie geht's?",
    pt: "Como vai?",
    ar: "كيف حالك؟",
    zh: "你好吗？",
    ja: "お元気ですか？",
    ko: "어떻게 지내세요?",
  },
  thanks: {
    en: "Thank you",
    hi: "धन्यवाद",
    es: "Gracias",
    fr: "Merci",
    de: "Danke",
    pt: "Obrigado",
    ar: "شكراً",
    zh: "谢谢",
    ja: "ありがとう",
    ko: "감사합니다",
  },
};

function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectSourceLanguage(text: string): PreferredLanguage {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  return "en";
}

function mockTranslateText(
  text: string,
  target: PreferredLanguage
): string {
  const normalized = text.trim().toLowerCase();

  for (const [key, translations] of Object.entries(PHRASE_MAP)) {
    if (normalized.includes(key) && translations[target]) {
      return translations[target]!;
    }
  }

  // Fallback demo: prefix so UI clearly shows translation happened.
  const labels: Record<PreferredLanguage, string> = {
    en: "EN",
    hi: "HI",
    es: "ES",
    fr: "FR",
    de: "DE",
    pt: "PT",
    ar: "AR",
    zh: "ZH",
    ja: "JA",
    ko: "KO",
  };

  return `[${labels[target]}] ${text}`;
}

export type TranslateTextResult = {
  translatedText: string;
  sourceLanguage: PreferredLanguage;
  targetLanguage: PreferredLanguage;
};

export async function translateText(params: {
  text: string;
  targetLanguage: PreferredLanguage;
  sourceLanguage?: PreferredLanguage;
}): Promise<TranslateTextResult> {
  await delay();

  const sourceLanguage =
    params.sourceLanguage ?? detectSourceLanguage(params.text);

  if (sourceLanguage === params.targetLanguage) {
    return {
      translatedText: params.text,
      sourceLanguage,
      targetLanguage: params.targetLanguage,
    };
  }

  return {
    translatedText: mockTranslateText(params.text, params.targetLanguage),
    sourceLanguage,
    targetLanguage: params.targetLanguage,
  };
}

export async function translateMessageForUser(params: {
  message: Message;
  targetLanguage: PreferredLanguage;
}): Promise<Message> {
  const original =
    params.message.originalText ?? params.message.content;

  if (params.message.type !== "text" && params.message.type !== "system") {
    // Audio/file: attach a caption translation of filename/placeholder.
    const caption = params.message.fileName || "Voice message";
    const result = await translateText({
      text: caption,
      targetLanguage: params.targetLanguage,
    });

    return {
      ...params.message,
      originalText: original,
      translations: {
        ...params.message.translations,
        [params.targetLanguage]: result.translatedText,
      },
      sourceLanguage: result.sourceLanguage,
    };
  }

  const cached = params.message.translations?.[params.targetLanguage];
  if (cached) {
    return params.message;
  }

  const result = await translateText({
    text: original,
    targetLanguage: params.targetLanguage,
    sourceLanguage: params.message.sourceLanguage,
  });

  return {
    ...params.message,
    originalText: original,
    translations: {
      ...params.message.translations,
      [params.targetLanguage]: result.translatedText,
    },
    sourceLanguage: result.sourceLanguage,
  };
}

export function getDisplayText(
  message: Message,
  options: {
    translateEnabled: boolean;
    preferredLanguage?: PreferredLanguage;
    showOriginal: boolean;
  }
): string {
  const original = message.originalText ?? message.content;

  if (
    !options.translateEnabled ||
    options.showOriginal ||
    !options.preferredLanguage
  ) {
    return original;
  }

  return (
    message.translations?.[options.preferredLanguage] ?? original
  );
}

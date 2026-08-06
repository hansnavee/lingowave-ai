import type { Message, PreferredLanguage } from "../types/models";
import { supabase } from "../lib/supabase";

function detectSourceLanguage(text: string): PreferredLanguage {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  return "en";
}

export type TranslateTextResult = {
  translatedText: string;
  sourceLanguage: PreferredLanguage;
  targetLanguage: PreferredLanguage;
  provider?: string;
};

/**
 * Server-side AI translator for entitled subscribers.
 * Edge Function checks subscription before calling OpenAI / DeepL / MyMemory.
 */
export async function translateText(params: {
  text: string;
  targetLanguage: PreferredLanguage;
  sourceLanguage?: PreferredLanguage;
}): Promise<TranslateTextResult> {
  const sourceLanguage =
    params.sourceLanguage ?? detectSourceLanguage(params.text);

  if (sourceLanguage === params.targetLanguage) {
    return {
      translatedText: params.text,
      sourceLanguage,
      targetLanguage: params.targetLanguage,
      provider: "none",
    };
  }

  const { data, error } = await supabase.functions.invoke("translate", {
    body: {
      text: params.text,
      targetLanguage: params.targetLanguage,
      sourceLanguage,
    },
  });

  if (error) {
    throw new Error(error.message || "Translation failed.");
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  const translatedText = String(
    (data as { translatedText?: string })?.translatedText ?? ""
  ).trim();

  if (!translatedText) {
    throw new Error("Empty translation response.");
  }

  return {
    translatedText,
    sourceLanguage: ((data as { sourceLanguage?: PreferredLanguage })
      .sourceLanguage ?? sourceLanguage) as PreferredLanguage,
    targetLanguage: params.targetLanguage,
    provider: (data as { provider?: string }).provider,
  };
}

export async function translateMessageForUser(params: {
  message: Message;
  targetLanguage: PreferredLanguage;
}): Promise<Message> {
  const original = params.message.originalText ?? params.message.content;

  if (params.message.type !== "text" && params.message.type !== "system") {
    const caption = params.message.fileName || "Voice message";
    try {
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
    } catch {
      return params.message;
    }
  }

  const cached = params.message.translations?.[params.targetLanguage];
  if (cached) {
    return params.message;
  }

  try {
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
  } catch {
    // Keep original if translate fails (quota / network / not entitled)
    return {
      ...params.message,
      originalText: original,
    };
  }
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

  return message.translations?.[options.preferredLanguage] ?? original;
}

/**
 * Phase 3 provider interfaces for STT / TTS / Translate / IAP.
 * Mock implementations power the demo; replace with real SDKs later.
 */

import type { PreferredLanguage, SubscriptionPlan } from "../types/models";
import { translateText } from "../services/translationService";

export interface SpeechToTextProvider {
  transcribe(uri: string, languageHint?: PreferredLanguage): Promise<string>;
}

export interface TextToSpeechProvider {
  synthesize(
    text: string,
    language: PreferredLanguage
  ): Promise<{ uri: string }>;
}

export interface TranslateProvider {
  translate(
    text: string,
    target: PreferredLanguage,
    source?: PreferredLanguage
  ): Promise<string>;
}

export interface InAppPurchaseProvider {
  getProducts(): Promise<
    Array<{ plan: SubscriptionPlan; productId: string; price: string }>
  >;
  purchase(plan: SubscriptionPlan): Promise<{ receipt: string }>;
  restore(): Promise<{ receipt: string | null }>;
}

export const mockSttProvider: SpeechToTextProvider = {
  async transcribe() {
    // Demo transcript for voice notes
    return "Hello, how are you?";
  },
};

export const mockTtsProvider: TextToSpeechProvider = {
  async synthesize(text, language) {
    return {
      uri: `mock-tts://${language}/${encodeURIComponent(text)}`,
    };
  },
};

export const mockTranslateProvider: TranslateProvider = {
  async translate(text, target, source) {
    const result = await translateText({
      text,
      targetLanguage: target,
      sourceLanguage: source,
    });
    return result.translatedText;
  },
};

export const mockIapProvider: InAppPurchaseProvider = {
  async getProducts() {
    return [
      { plan: "monthly", productId: "ai_translate_monthly", price: "$9.99" },
      {
        plan: "quarterly",
        productId: "ai_translate_quarterly",
        price: "$24.99",
      },
      { plan: "yearly", productId: "ai_translate_yearly", price: "$79.99" },
    ];
  },
  async purchase(plan) {
    return { receipt: `mock_receipt_${plan}_${Date.now()}` };
  },
  async restore() {
    return { receipt: `mock_restore_${Date.now()}` };
  },
};

/**
 * Voice-note pipeline: STT → translate → optional TTS.
 * Used when a subscriber plays/translates an audio message.
 */
export async function translateVoiceNote(params: {
  uri: string;
  targetLanguage: PreferredLanguage;
}): Promise<{
  transcript: string;
  translatedText: string;
  ttsUri: string;
}> {
  const transcript = await mockSttProvider.transcribe(params.uri);
  const translatedText = await mockTranslateProvider.translate(
    transcript,
    params.targetLanguage
  );
  const { uri } = await mockTtsProvider.synthesize(
    translatedText,
    params.targetLanguage
  );

  return { transcript, translatedText, ttsUri: uri };
}

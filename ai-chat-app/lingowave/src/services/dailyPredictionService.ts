import { supabase } from "../lib/supabase";
import {
  computeDailyFortune,
  fortuneNotificationBody,
  fortuneTitle,
  todayUtcYmd,
  type DailyFortune,
} from "./astrologyScoring";
import { hasActiveEntitlement } from "./subscriptionService";
import { getSubscription } from "./subscriptionService";
import type { PreferredLanguage } from "../types/models";

export type StoredDailyPrediction = DailyFortune & {
  id: string;
};

function mapRow(row: {
  id: string;
  zodiac_sign: string;
  lucky_number: number;
  lucky_color: string;
  lucky_color_hex: string;
  message: string;
  score: number;
  prediction_date: string;
}): StoredDailyPrediction {
  return {
    id: row.id,
    zodiacSign: row.zodiac_sign,
    luckyNumber: row.lucky_number,
    luckyColor: row.lucky_color,
    luckyColorHex: row.lucky_color_hex,
    message: row.message,
    score: row.score,
    predictionDate: row.prediction_date,
  };
}

/**
 * Generates (or returns) today's fortune for the signed-in user.
 * Only AI subscribers with DOB receive a notification.
 */
export async function ensureTodayFortuneForCurrentUser(): Promise<
  | { ok: true; fortune: StoredDailyPrediction; notified: boolean }
  | { ok: false; reason: string }
> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { ok: false, reason: "Not signed in." };
  }

  const userId = session.user.id;
  const subscription = await getSubscription(userId);

  if (!hasActiveEntitlement(subscription)) {
    return { ok: false, reason: "AI subscription required." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, date_of_birth, birth_place, preferred_language")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, reason: "Profile not found." };
  }

  if (!profile.date_of_birth) {
    return {
      ok: false,
      reason: "Add your date of birth to unlock daily cosmic luck.",
    };
  }

  const today = todayUtcYmd();

  const { data: existing } = await supabase
    .from("daily_predictions")
    .select("*")
    .eq("user_id", userId)
    .eq("prediction_date", today)
    .maybeSingle();

  if (existing) {
    return { ok: true, fortune: mapRow(existing), notified: false };
  }

  const fortune = computeDailyFortune({
    name: profile.name,
    dateOfBirth: profile.date_of_birth,
    birthPlace: profile.birth_place ?? "",
    forDate: today,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("daily_predictions")
    .insert({
      user_id: userId,
      prediction_date: fortune.predictionDate,
      zodiac_sign: fortune.zodiacSign,
      lucky_number: fortune.luckyNumber,
      lucky_color: fortune.luckyColor,
      lucky_color_hex: fortune.luckyColorHex,
      message: fortune.message,
      score: fortune.score,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    // Race: another client inserted first
    const { data: raced } = await supabase
      .from("daily_predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("prediction_date", today)
      .maybeSingle();

    if (raced) {
      return { ok: true, fortune: mapRow(raced), notified: false };
    }

    return {
      ok: false,
      reason: insertError?.message ?? "Could not save prediction.",
    };
  }

  await supabase.rpc("create_notification", {
    p_user_id: userId,
    p_type: "daily_fortune",
    p_title: fortuneTitle(
      (profile.preferred_language as PreferredLanguage | null) ?? undefined
    ),
    p_body: fortuneNotificationBody(fortune),
    p_data: {
      predictionDate: fortune.predictionDate,
      luckyNumber: fortune.luckyNumber,
      luckyColor: fortune.luckyColor,
      zodiacSign: fortune.zodiacSign,
    },
  });

  return { ok: true, fortune: mapRow(inserted), notified: true };
}

export async function getTodayFortune(): Promise<StoredDailyPrediction | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const today = todayUtcYmd();
  const { data } = await supabase
    .from("daily_predictions")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("prediction_date", today)
    .maybeSingle();

  return data ? mapRow(data) : null;
}

import type { PreferredLanguage } from "../types/models";

export type AstrologyInput = {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  birthPlace: string;
  forDate?: string; // YYYY-MM-DD, defaults to today UTC
};

export type DailyFortune = {
  zodiacSign: string;
  luckyNumber: number;
  luckyColor: string;
  luckyColorHex: string;
  message: string;
  score: number;
  predictionDate: string;
};

const ZODIAC: { sign: string; start: [number, number]; end: [number, number] }[] =
  [
    { sign: "Capricorn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", start: [2, 19], end: [3, 20] },
    { sign: "Aries", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", start: [6, 21], end: [7, 22] },
    { sign: "Leo", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  ];

const ZODIAC_COLORS: Record<
  string,
  { name: string; hex: string }[]
> = {
  Aries: [
    { name: "Scarlet Flame", hex: "#DC2626" },
    { name: "Sunrise Coral", hex: "#F97316" },
  ],
  Taurus: [
    { name: "Emerald Grove", hex: "#059669" },
    { name: "Soft Moss", hex: "#84CC16" },
  ],
  Gemini: [
    { name: "Sky Amber", hex: "#F59E0B" },
    { name: "Electric Lemon", hex: "#EAB308" },
  ],
  Cancer: [
    { name: "Moonlit Silver", hex: "#94A3B8" },
    { name: "Sea Pearl", hex: "#67E8F9" },
  ],
  Leo: [
    { name: "Royal Gold", hex: "#D97706" },
    { name: "Warm Amber", hex: "#FBBF24" },
  ],
  Virgo: [
    { name: "Forest Sage", hex: "#65A30D" },
    { name: "Quiet Olive", hex: "#A3E635" },
  ],
  Libra: [
    { name: "Rose Quartz", hex: "#FB7185" },
    { name: "Blush Pink", hex: "#F9A8D4" },
  ],
  Scorpio: [
    { name: "Deep Maroon", hex: "#9F1239" },
    { name: "Midnight Plum", hex: "#7C3AED" },
  ],
  Sagittarius: [
    { name: "Indigo Sky", hex: "#4F46E5" },
    { name: "Horizon Blue", hex: "#2563EB" },
  ],
  Capricorn: [
    { name: "Mountain Brown", hex: "#92400E" },
    { name: "Charcoal Stone", hex: "#57534E" },
  ],
  Aquarius: [
    { name: "Aqua Wave", hex: "#0EA5E9" },
    { name: "Electric Teal", hex: "#14B8A6" },
  ],
  Pisces: [
    { name: "Ocean Mist", hex: "#6366F1" },
    { name: "Lavender Tide", hex: "#A78BFA" },
  ],
};

const MESSAGES = [
  "The stars lean kindly toward you today — trust the quiet pull of intuition and let kindness open unexpected doors.",
  "A luminous thread runs through your hours. Wear your lucky color close and watch small chances bloom into bright ones.",
  "Your energy is magnetic today. Speak with warmth, move with purpose, and let your lucky number guide gentle choices.",
  "Cosmic winds favor fresh beginnings. Carry courage in your pocket and grace in your words — something beautiful is aligning.",
  "Today the universe whispers luck into ordinary moments. Stay open, stay soft, and notice the signs meant only for you.",
  "Your chart glows with quiet confidence. Share a smile, follow a hunch, and let fortune find you halfway.",
  "Harmony surrounds you. Anchor yourself in gratitude and your lucky color will amplify every good intention.",
  "A golden rhythm beats beneath your day. Lean into connection — the right conversation may rewrite the evening.",
  "Stars sketch opportunity across your path. Step lightly, choose boldly, and keep your lucky number close to heart.",
  "Wonder is woven into today. Let your birthplace’s spirit steady you while fortune paints the rest in light.",
];

function parseYmd(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return { y, m, d };
}

export function todayUtcYmd(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getZodiacSign(dateOfBirth: string): string {
  const parsed = parseYmd(dateOfBirth);
  if (!parsed) {
    return "Aries";
  }

  const { m, d } = parsed;
  for (const entry of ZODIAC) {
    const [sm, sd] = entry.start;
    const [em, ed] = entry.end;
    if (sm > em) {
      // wraps year (Capricorn)
      if ((m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em) {
        return entry.sign;
      }
    } else if (
      (m === sm && d >= sd) ||
      (m === em && d <= ed) ||
      (m > sm && m < em)
    ) {
      return entry.sign;
    }
  }
  return "Capricorn";
}

/** Reduce digits to a single life-path style number (1–9, keep 11/22 as masters → fold). */
function digitSum(n: number): number {
  let value = Math.abs(n);
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((acc, ch) => acc + Number(ch), 0);
  }
  return value || 1;
}

function placeSeed(place: string): number {
  return place
    .trim()
    .toLowerCase()
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function hashSeed(...parts: (string | number)[]): number {
  const raw = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Deterministic astrology + numerology scoring layer.
 * Combines zodiac, life-path from DOB, birthplace vibration, and the calendar day.
 */
export function computeDailyFortune(input: AstrologyInput): DailyFortune {
  const predictionDate = input.forDate ?? todayUtcYmd();
  const dob = parseYmd(input.dateOfBirth) ?? { y: 2000, m: 1, d: 1 };
  const day = parseYmd(predictionDate) ?? dob;

  const zodiacSign = getZodiacSign(input.dateOfBirth);
  const lifePath = digitSum(dob.y + dob.m + dob.d);
  const placeVibe = digitSum(placeSeed(input.birthPlace || "earth"));
  const dayPulse = digitSum(day.y + day.m + day.d);

  const seed = hashSeed(
    input.dateOfBirth,
    input.birthPlace.trim().toLowerCase(),
    predictionDate,
    zodiacSign,
    input.name.trim().toLowerCase()
  );

  const luckyNumber =
    ((lifePath * 3 + placeVibe * 2 + dayPulse + (seed % 17)) % 9) + 1;

  const palette = ZODIAC_COLORS[zodiacSign] ?? ZODIAC_COLORS.Aries;
  const color = palette[seed % palette.length];

  const score = 55 + ((seed + lifePath * 7 + dayPulse * 5) % 41);
  const message =
    MESSAGES[seed % MESSAGES.length] ??
    MESSAGES[0];

  const personalized = message.replace(
    /birthplace’s spirit/i,
    input.birthPlace.trim()
      ? `${input.birthPlace.trim()}’s spirit`
      : "your roots’ spirit"
  );

  return {
    zodiacSign,
    luckyNumber,
    luckyColor: color.name,
    luckyColorHex: color.hex,
    message: personalized,
    score,
    predictionDate,
  };
}

export function fortuneNotificationBody(fortune: DailyFortune): string {
  return `Lucky number ${fortune.luckyNumber} · ${fortune.luckyColor}. ${fortune.message}`;
}

export function fortuneTitle(
  language?: PreferredLanguage
): string {
  switch (language) {
    case "hi":
      return "आज का शुभ संकेत ✨";
    case "es":
      return "Tu fortuna de hoy ✨";
    case "fr":
      return "Votre chance du jour ✨";
    case "ar":
      return "حظك اليوم ✨";
    default:
      return "Your daily cosmic luck ✨";
  }
}

import type { SubscriptionPlan } from "../types/models";

export type PlanConfig = {
  id: SubscriptionPlan;
  title: string;
  priceLabel: string;
  durationDays: number;
  productId: string;
  perks: string[];
  badge?: string;
};

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: "monthly",
    title: "Monthly",
    priceLabel: "$9.99 / month",
    durationDays: 30,
    productId: "ai_translate_monthly",
    perks: [
      "AI message translation",
      "Voice note transcription + translation",
      "Live call captions",
    ],
  },
  {
    id: "quarterly",
    title: "Quarterly",
    priceLabel: "$24.99 / 3 months",
    durationDays: 90,
    productId: "ai_translate_quarterly",
    badge: "Save 17%",
    perks: [
      "Everything in Monthly",
      "Priority translation queue",
      "Best for frequent travelers",
    ],
  },
  {
    id: "yearly",
    title: "Yearly",
    priceLabel: "$79.99 / year",
    durationDays: 365,
    productId: "ai_translate_yearly",
    badge: "Best value",
    perks: [
      "Everything in Quarterly",
      "Lowest price per month",
      "Family invite bonuses (coming soon)",
    ],
  },
];

export function getPlanConfig(plan: SubscriptionPlan): PlanConfig {
  const match = SUBSCRIPTION_PLANS.find((item) => item.id === plan);
  if (!match) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return match;
}

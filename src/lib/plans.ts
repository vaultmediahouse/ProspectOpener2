export const PLANS = {
  STARTER: { name: "STARTER", leadQuantity: 50, amount: 499, currency: "INR" },
  GROWTH: { name: "GROWTH", leadQuantity: 100, amount: 999, currency: "INR" },
} as const;

export type PlanCode = keyof typeof PLANS;

export function planFromInput(value: string | null | undefined) {
  const normalized = value?.toUpperCase();
  return normalized === "STARTER" || normalized === "GROWTH" ? normalized : null;
}

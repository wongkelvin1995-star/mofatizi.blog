import type { BillingCycle, CouponInfo, PlanRecord } from '../types/airport';

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月付',
  quarterly: '季付',
  semiannual: '半年付',
  annual: '年付',
  biennial: '两年付',
  triennial: '三年付',
  one_time: '一次性流量包',
};

export const CYCLE_MONTHS: Record<BillingCycle, number | null> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
  biennial: 24,
  triennial: 36,
  one_time: null,
};

export interface CalculatedPlanMetrics {
  originalPrice: number;
  hasConfirmedDiscount: boolean;
  appliedCouponCode: string | null;
  discountMultiplier: number | null;
  discountedPrice: number | null;
  savingsAmount: number | null;
  effectivePayable: number;
  originalMonthlyAvg: number | null;
  effectiveMonthlyAvg: number | null;
  originalCostPerGB: number | null;
  effectiveCostPerGB: number | null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatYuan(n: number): string {
  const r = round2(n);
  return Number.isInteger(r) ? `¥${r}` : `¥${r.toFixed(2).replace(/\.00$/, '')}`;
}

export function calculatePlanMetrics(
  plan: PlanRecord,
  primaryCalculableCoupon?: CouponInfo | null
): CalculatedPlanMetrics {
  const originalPrice = plan.originalPrice;
  const canApplyCoupon =
    Boolean(primaryCalculableCoupon) &&
    primaryCalculableCoupon!.calculable &&
    primaryCalculableCoupon!.discountMultiplier !== null &&
    plan.couponEligible;

  const discountedPrice = canApplyCoupon
    ? round2(originalPrice * primaryCalculableCoupon!.discountMultiplier!)
    : null;
  const savingsAmount =
    discountedPrice !== null ? round2(originalPrice - discountedPrice) : null;
  const effectivePayable = discountedPrice !== null ? discountedPrice : originalPrice;

  const originalMonthlyAvg =
    plan.cycleMonths && plan.cycleMonths > 0
      ? round2(originalPrice / plan.cycleMonths)
      : null;

  const effectiveMonthlyAvg =
    plan.cycleMonths && plan.cycleMonths > 0
      ? round2(effectivePayable / plan.cycleMonths)
      : null;

  const originalCostPerGB =
    plan.totalPeriodGB && plan.totalPeriodGB > 0
      ? round2(originalPrice / plan.totalPeriodGB)
      : null;

  const effectiveCostPerGB =
    plan.totalPeriodGB && plan.totalPeriodGB > 0
      ? round2(effectivePayable / plan.totalPeriodGB)
      : null;

  return {
    originalPrice,
    hasConfirmedDiscount: canApplyCoupon,
    appliedCouponCode: canApplyCoupon ? primaryCalculableCoupon!.code : null,
    discountMultiplier: canApplyCoupon ? primaryCalculableCoupon!.discountMultiplier : null,
    discountedPrice,
    savingsAmount,
    effectivePayable,
    originalMonthlyAvg,
    effectiveMonthlyAvg,
    originalCostPerGB,
    effectiveCostPerGB,
  };
}

export function getPrimaryCalculableCoupon(coupons: CouponInfo[]): CouponInfo | null {
  return (
    coupons.find(
      (c) => c.status === 'active' && c.calculable && c.discountMultiplier !== null
    ) ?? null
  );
}

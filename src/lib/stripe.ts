import Stripe from 'stripe';
import type { PlanTier } from '@/lib/billing/plans';

// Null when STRIPE_SECRET_KEY is unset (e.g. local dev without billing).
// Callers must handle the null case gracefully.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Only paid, self-serve tiers map to a Stripe price. Enterprise = contact sales.
export function priceIdForTier(tier: PlanTier): string | null {
  if (tier === 'startup') return process.env.STRIPE_PRICE_STARTUP ?? null;
  if (tier === 'professional') return process.env.STRIPE_PRICE_PRO ?? null;
  return null;
}

export function tierForPriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTUP) return 'startup';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'professional';
  return null;
}

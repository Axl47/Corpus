export const runtime = 'nodejs';

import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { syncSubscriptionForCustomer } from '@/lib/billing/sync';
import type Stripe from 'stripe';

// Stripe sends raw bodies; we must read text() and verify the signature.
// Route lives outside [locale] and is whitelisted in src/proxy.ts.
export async function POST(req: Request) {
  if (!stripe) return new Response('Billing disabled', { status: 503 });

  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response('Missing signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('[stripe/webhook] signature_verification_failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Recompute from Stripe's live state — robust to duplicates + ordering.
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionForCustomer(sub.customer as string, sub.metadata?.ownerUserId);
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.customer) {
          await db
            .update(subscriptions)
            .set({ status: 'past_due', updatedAt: new Date() })
            .where(eq(subscriptions.stripeCustomerId, inv.customer as string));
        }
        break;
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler_error', event.type, err);
    return new Response('Handler error', { status: 500 });
  }

  return Response.json({ received: true });
}

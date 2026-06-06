import Stripe from 'stripe';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function clean(s: string | undefined) {
  return (s ?? '').replace(/^﻿/, '').trim();
}

const stripe = new Stripe(clean(process.env.STRIPE_SECRET_KEY), {
  apiVersion: '2026-05-27.dahlia',
});

const supabase = createServiceClient(
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(clean(process.env.RESEND_API_KEY));
const FROM   = clean(process.env.RESEND_FROM) || 'The Matcht Team <onboarding@resend.dev>';

// Next.js 14 App Router disables body parsing for webhooks — we need the raw body.
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body      = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, clean(process.env.STRIPE_WEBHOOK_SECRET));
  } catch (err: any) {
    console.error('[stripe/webhook] signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.supabase_user_id;
      if (!userId) break;

      const subId  = session.subscription as string | null;
      const status = session.status === 'complete' ? 'trialing' : 'incomplete';

      await supabase
        .from('profiles')
        .update({
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: subId,
          subscription_status:    status,
        })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub     = event.data.object as Stripe.Subscription;
      const userId  = await userIdFromCustomer(sub.customer as string);
      if (!userId) break;

      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: sub.id,
          subscription_status:    sub.status as string,
        })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = await userIdFromCustomer(sub.customer as string);
      if (!userId) break;

      await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' })
        .eq('id', userId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice  = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
      if (!customerId) break;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile?.email) {
        await resend.emails.send({
          from:    FROM,
          to:      profile.email as string,
          subject: 'Action required: payment failed for your Matcht subscription',
          html: `
            <p>Hi${profile.name ? ` ${profile.name}` : ''},</p>
            <p>We couldn't process your Matcht payment. Your subscription may be paused if this isn't resolved soon.</p>
            <p>Please update your payment method: <a href="https://billing.stripe.com">Billing portal →</a></p>
            <p>— The Matcht Team</p>
          `,
        });
      }

      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function userIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

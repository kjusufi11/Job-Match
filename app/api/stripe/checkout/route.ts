import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function clean(s: string | undefined) {
  return (s ?? '').replace(/^﻿/, '').trim();
}

const stripe = new Stripe(clean(process.env.STRIPE_SECRET_KEY), {
  apiVersion: '2026-05-27.dahlia',
});

const PRICE_ID = clean(process.env.STRIPE_PRICE_ID); // e.g. price_xxx
const APP_URL  = clean(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000';

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name, stripe_customer_id, subscription_status')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // Already active — redirect straight to dashboard
  if (profile.subscription_status === 'active' || profile.subscription_status === 'trialing') {
    return NextResponse.json({ url: `${APP_URL}/recruiter/dashboard` });
  }

  // Reuse or create the Stripe customer
  let customerId = profile.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email as string,
      name:  profile.name  as string,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Persist the customer ID immediately
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${APP_URL}/recruiter/dashboard?success=1`,
    cancel_url:  `${APP_URL}/pricing`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}

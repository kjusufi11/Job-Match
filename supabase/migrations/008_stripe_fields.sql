-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status     TEXT
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete'));

CREATE INDEX IF NOT EXISTS profiles_stripe_customer ON profiles (stripe_customer_id);

-- Migration 006: Extended profile fields for new MatchtSurvey
-- All ADD COLUMN IF NOT EXISTS — safe to run multiple times, never drops data.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline        TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin        TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_link      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS race            TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS veteran         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disability      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS summary         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accomplishments JSONB    DEFAULT '["","",""]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications  JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS test_scores     JSONB    DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS volunteer       JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS projects        JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS awards          JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages       JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

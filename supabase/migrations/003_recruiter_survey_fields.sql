-- ============================================================
-- Matcht — Migration 003: Recruiter survey + feedback fields
-- Run in Supabase SQL Editor after 002_survey_fields.sql
-- ============================================================

-- ── Profiles: recruiter company fields + candidate culture ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS target_culture   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS company_website  TEXT,
  ADD COLUMN IF NOT EXISTS company_stage    TEXT,
  ADD COLUMN IF NOT EXISTS company_desc     TEXT;

-- ── Jobs: all new fields from 6-section recruiter survey ────
ALTER TABLE jobs
  -- S1: Company
  ADD COLUMN IF NOT EXISTS company_name       TEXT,
  ADD COLUMN IF NOT EXISTS company_website    TEXT,
  ADD COLUMN IF NOT EXISTS company_industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS company_stage      TEXT,
  ADD COLUMN IF NOT EXISTS hq_location        TEXT,
  ADD COLUMN IF NOT EXISTS company_desc       TEXT,
  -- S2: Role
  ADD COLUMN IF NOT EXISTS department         TEXT,
  ADD COLUMN IF NOT EXISTS reports_to         TEXT,
  ADD COLUMN IF NOT EXISTS employment_type    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS office_location    TEXT,
  ADD COLUMN IF NOT EXISTS start_date         TEXT,
  ADD COLUMN IF NOT EXISTS managing_reports   TEXT,
  -- S3: Requirements
  ADD COLUMN IF NOT EXISTS min_exp            INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_education      TEXT,
  ADD COLUMN IF NOT EXISTS nice_skills        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS soft_skills_required TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_certs     TEXT,
  ADD COLUMN IF NOT EXISTS work_auth          TEXT,
  -- S4: Compensation
  ADD COLUMN IF NOT EXISTS show_salary        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bonus              TEXT,
  ADD COLUMN IF NOT EXISTS show_equity        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS equity_type        TEXT,
  ADD COLUMN IF NOT EXISTS benefits           TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS comp_notes         TEXT,
  -- S5: Culture & Personality
  ADD COLUMN IF NOT EXISTS team_culture       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mgmt_style         TEXT,
  ADD COLUMN IF NOT EXISTS feedback_culture   TEXT,
  ADD COLUMN IF NOT EXISTS personality_required JSONB,
  ADD COLUMN IF NOT EXISTS success_in_90      TEXT,
  ADD COLUMN IF NOT EXISTS who_struggles      TEXT,
  -- S6: Additional weight dimensions
  ADD COLUMN IF NOT EXISTS weight_education   INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS weight_culture     INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS other_notes        TEXT;

-- ── Applications: extended feedback fields ───────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS feedback_reason  TEXT,
  ADD COLUMN IF NOT EXISTS feedback_notes   TEXT,
  ADD COLUMN IF NOT EXISTS share_notes      BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS addon_offered    TEXT;

-- Backfill: map legacy feedback column to feedback_reason where not set
UPDATE applications
SET feedback_reason = feedback
WHERE feedback IS NOT NULL AND feedback_reason IS NULL;

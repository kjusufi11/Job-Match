-- ============================================================
-- Matcht — Migration 002: Full survey fields
-- Run in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- Drop overly-restrictive check constraints so the survey's
-- richer option strings can be stored verbatim
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_remote_preference_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_experience_level_check;

ALTER TABLE profiles
  -- ── Section 1: Basic Info ──────────────────────────────────
  ADD COLUMN IF NOT EXISTS first_name     TEXT,
  ADD COLUMN IF NOT EXISTS last_name      TEXT,
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS zip            TEXT,
  ADD COLUMN IF NOT EXISTS work_auth      TEXT,
  ADD COLUMN IF NOT EXISTS eeoc           TEXT[] DEFAULT '{}',

  -- ── Section 2: Education ───────────────────────────────────
  ADD COLUMN IF NOT EXISTS education      TEXT,
  ADD COLUMN IF NOT EXISTS major          TEXT,
  ADD COLUMN IF NOT EXISTS university     TEXT,
  ADD COLUMN IF NOT EXISTS certs          TEXT,
  ADD COLUMN IF NOT EXISTS enrolled       TEXT,

  -- ── Section 3: Work History ────────────────────────────────
  ADD COLUMN IF NOT EXISTS current_employer  TEXT,
  ADD COLUMN IF NOT EXISTS total_exp         INTEGER,
  ADD COLUMN IF NOT EXISTS field_exp         INTEGER,
  ADD COLUMN IF NOT EXISTS longest_tenure    INTEGER,
  ADD COLUMN IF NOT EXISTS direct_reports    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS managed_projects  TEXT,
  ADD COLUMN IF NOT EXISTS emp_status        TEXT,
  ADD COLUMN IF NOT EXISTS gaps              TEXT,

  -- ── Section 4: Skills ──────────────────────────────────────
  ADD COLUMN IF NOT EXISTS soft_skills    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_skills    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS other_skills   TEXT,
  ADD COLUMN IF NOT EXISTS seniority      TEXT,

  -- ── Section 5: Job Preferences ────────────────────────────
  ADD COLUMN IF NOT EXISTS target_titles      TEXT,
  ADD COLUMN IF NOT EXISTS max_commute        INTEGER,
  ADD COLUMN IF NOT EXISTS employment_type    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability       TEXT,
  ADD COLUMN IF NOT EXISTS relocation         TEXT,
  ADD COLUMN IF NOT EXISTS relocation_regions TEXT,
  ADD COLUMN IF NOT EXISTS travel             TEXT,
  ADD COLUMN IF NOT EXISTS company_size       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_industries  TEXT[] DEFAULT '{}',

  -- ── Section 6: Work Style ──────────────────────────────────
  ADD COLUMN IF NOT EXISTS feedback_pref  TEXT,
  ADD COLUMN IF NOT EXISTS work_style     TEXT,
  ADD COLUMN IF NOT EXISTS pace           TEXT,
  ADD COLUMN IF NOT EXISTS mgmt_style     TEXT,
  ADD COLUMN IF NOT EXISTS team_role      TEXT,
  ADD COLUMN IF NOT EXISTS env_prefs      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS motivators     TEXT[] DEFAULT '{}',

  -- ── Section 7: Personality (JSONB already exists) ─────────
  -- personality column stores { EI,SN,TF,JP,stress,conflict,
  --   ambiguity,risk,detail,change,recognition,collab } as 1-5 ints
  ADD COLUMN IF NOT EXISTS comm_style     TEXT,
  ADD COLUMN IF NOT EXISTS mistake_style  TEXT,

  -- ── Section 8: Career Goals ────────────────────────────────
  ADD COLUMN IF NOT EXISTS primary_goal     TEXT,
  ADD COLUMN IF NOT EXISTS five_year        TEXT,
  ADD COLUMN IF NOT EXISTS search_intensity TEXT,
  ADD COLUMN IF NOT EXISTS other_interviews TEXT,
  ADD COLUMN IF NOT EXISTS stay_reasons     TEXT[] DEFAULT '{}';
  -- personalNote maps to existing `bio` column

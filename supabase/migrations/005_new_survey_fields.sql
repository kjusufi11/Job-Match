-- ── Migration 005: New survey schema ──────────────────────────────────────────
-- Adds repeatable degree/job blocks, unified skills, and new salary fields.
-- Run AFTER deploying app code — dropping columns will break the old UI.

-- New JSONB columns for repeatable blocks
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS degrees      JSONB    DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jobs_history JSONB    DEFAULT '[]';

-- New salary fields (ideal target + floor)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ideal_salary INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS min_salary   INTEGER;

-- Unified skills array (may already exist — safe to re-add)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Convert target_titles from TEXT → TEXT[]
-- Existing string values are wrapped in a single-element array; NULLs become empty array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'target_titles'
      AND data_type    = 'text'
  ) THEN
    ALTER TABLE public.profiles
      ALTER COLUMN target_titles TYPE TEXT[]
      USING CASE
        WHEN target_titles IS NULL OR target_titles = '' THEN '{}'::TEXT[]
        ELSE ARRAY[target_titles]
      END;
  END IF;
END $$;

-- Drop superseded single-field columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS education;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS major;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS university;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS enrolled;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS current_employer;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS field_exp;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS longest_tenure;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS direct_reports;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS managed_projects;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS soft_skills;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS tech_skills;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS other_skills;

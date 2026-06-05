-- ============================================================
-- Matcht — Migration 007: Fix remote_policy check constraint
-- The recruiter form uses longer descriptive strings that didn't
-- match the original constraint from migration 001.
-- ============================================================

-- Drop the old constraint
ALTER TABLE jobs
  DROP CONSTRAINT IF EXISTS jobs_remote_policy_check;

-- Re-add with the exact strings used by the recruiter survey form
ALTER TABLE jobs
  ADD CONSTRAINT jobs_remote_policy_check
  CHECK (remote_policy IN (
    'Remote only',
    'Hybrid',
    'On-site',
    'Fully remote — work from anywhere',
    'Remote with occasional on-site (1–2x/month)',
    'Hybrid — set days in office per week',
    'On-site required'
  ));

-- ============================================================
-- Matcht — Migration 004: Notification preferences
-- Run in Supabase SQL Editor after 003_recruiter_survey_fields.sql
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notif_email_matches  BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_email_viewed   BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_email_feedback BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notif_sms_alerts     BOOLEAN DEFAULT FALSE;

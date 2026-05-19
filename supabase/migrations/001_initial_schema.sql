-- ============================================================
-- Matcht — Initial Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role              TEXT NOT NULL CHECK (role IN ('seeker', 'recruiter', 'admin')),
  name              TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL DEFAULT '',

  -- Seeker profile fields
  title             TEXT,
  location          TEXT,
  remote_preference TEXT CHECK (remote_preference IN ('Remote only', 'Hybrid', 'On-site', 'Open to anything')),
  salary_label      TEXT,
  salary_min        INTEGER,
  salary_max        INTEGER,
  experience_level  TEXT CHECK (experience_level IN ('0–2 yrs', '3–5 yrs', '6–10 yrs', '10+ yrs')),
  skills            TEXT[]  DEFAULT '{}',
  industries        TEXT[]  DEFAULT '{}',
  personality       JSONB   DEFAULT '{}',
  bio               TEXT,
  video_url         TEXT,
  profile_complete  BOOLEAN DEFAULT FALSE,
  searchable        BOOLEAN DEFAULT TRUE,
  visibility        TEXT    DEFAULT 'recruiters' CHECK (visibility IN ('recruiters', 'everyone', 'nobody')),

  -- Recruiter fields
  company_name      TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── jobs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title            TEXT        NOT NULL,
  industry         TEXT,
  location         TEXT,
  remote_policy    TEXT        CHECK (remote_policy IN ('Remote only', 'Hybrid', 'On-site')),
  salary_min       INTEGER,
  salary_max       INTEGER,
  experience_level TEXT,
  required_skills  TEXT[]      DEFAULT '{}',
  description      TEXT,
  status           TEXT        DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),

  -- 8-dimension weights (1 = Low … 5 = Critical)
  weight_skills       INTEGER DEFAULT 3 CHECK (weight_skills       BETWEEN 1 AND 5),
  weight_salary       INTEGER DEFAULT 3 CHECK (weight_salary       BETWEEN 1 AND 5),
  weight_personality  INTEGER DEFAULT 2 CHECK (weight_personality  BETWEEN 1 AND 5),
  weight_location     INTEGER DEFAULT 2 CHECK (weight_location     BETWEEN 1 AND 5),
  weight_experience   INTEGER DEFAULT 3 CHECK (weight_experience   BETWEEN 1 AND 5),
  weight_industry     INTEGER DEFAULT 2 CHECK (weight_industry     BETWEEN 1 AND 5),
  weight_work_style   INTEGER DEFAULT 2 CHECK (weight_work_style   BETWEEN 1 AND 5),
  weight_availability INTEGER DEFAULT 1 CHECK (weight_availability BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── applications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     UUID REFERENCES jobs(id)     ON DELETE CASCADE NOT NULL,
  seeker_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status     TEXT DEFAULT 'matched' CHECK (status IN ('matched', 'viewed', 'applied', 'shortlisted', 'rejected', 'pass')),
  feedback   TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ── match_scores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_scores (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id      UUID REFERENCES jobs(id)     ON DELETE CASCADE NOT NULL,
  seeker_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  score_skills       INTEGER DEFAULT 0,
  score_salary       INTEGER DEFAULT 0,
  score_personality  INTEGER DEFAULT 0,
  score_location     INTEGER DEFAULT 0,
  score_experience   INTEGER DEFAULT 0,
  score_industry     INTEGER DEFAULT 0,
  score_work_style   INTEGER DEFAULT 0,
  score_availability INTEGER DEFAULT 0,
  total_score        INTEGER DEFAULT 0,

  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ── notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type     TEXT NOT NULL CHECK (type IN ('match', 'viewed', 'feedback', 'shortlist', 'system')),
  text     TEXT NOT NULL,
  read     BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── auto-update timestamps ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jobs_updated_at         BEFORE UPDATE ON jobs         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- jobs
CREATE POLICY "jobs_select" ON jobs FOR SELECT
  USING (auth.role() = 'authenticated' AND (status = 'active' OR recruiter_id = auth.uid()));
CREATE POLICY "jobs_insert" ON jobs FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "jobs_update" ON jobs FOR UPDATE USING (auth.uid() = recruiter_id);

-- applications
CREATE POLICY "applications_select" ON applications FOR SELECT
  USING (
    auth.uid() = seeker_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid())
  );
CREATE POLICY "applications_insert" ON applications FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "applications_update" ON applications FOR UPDATE
  USING (
    auth.uid() = seeker_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid())
  );

-- match_scores — service role writes; authenticated users read their own
CREATE POLICY "match_scores_select" ON match_scores FOR SELECT
  USING (
    auth.uid() = seeker_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = match_scores.job_id AND j.recruiter_id = auth.uid())
  );
CREATE POLICY "match_scores_all_service" ON match_scores FOR ALL USING (auth.role() = 'service_role');

-- notifications
CREATE POLICY "notifs_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifs_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifs_insert_service" ON notifications FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ── Storage: videos bucket ────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('videos', 'videos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "videos_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "videos_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');
CREATE POLICY "videos_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

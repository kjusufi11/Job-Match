export type Role = 'seeker' | 'recruiter' | 'admin';

export type Profile = {
  id: string;
  role: Role;
  name: string;
  email: string;

  // ── S1: Basic Info & Online Presence ───────────────────────
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  location?: string | null;
  zip?: string | null;
  work_auth?: string | null;
  eeoc?: string[] | null;           // legacy — kept for existing data
  headline?: string | null;
  linkedin?: string | null;
  website?: string | null;
  other_link?: string | null;
  gender?: string | null;
  race?: string | null;
  veteran?: string | null;
  disability?: string | null;

  // ── S2: Professional Summary ────────────────────────────────
  summary?: string | null;
  accomplishments?: string[] | null;

  // ── S3: Education ───────────────────────────────────────────
  degrees?: Record<string, unknown>[] | null;
  certs?: string | null;            // legacy text field
  certifications?: Record<string, unknown>[] | null;
  test_scores?: Record<string, string> | null;

  // ── S4: Work History ────────────────────────────────────────
  title?: string | null;
  jobs_history?: Record<string, unknown>[] | null;
  total_exp?: number | null;
  experience_level?: string | null;
  emp_status?: string | null;
  gaps?: string | null;
  volunteer?: Record<string, unknown>[] | null;

  // ── S5: Skills & Expertise ──────────────────────────────────
  skills?: string[] | null;
  seniority?: string | null;
  industries?: string[] | null;
  languages?: Record<string, string>[] | null;
  projects?: Record<string, unknown>[] | null;
  awards?: Record<string, string>[] | null;

  // ── S6: Job Preferences ─────────────────────────────────────
  target_titles?: string[] | null;
  ideal_salary?: number | null;
  min_salary?: number | null;
  salary_label?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  remote_preference?: string | null;
  max_commute?: number | null;
  employment_type?: string[] | null;
  availability?: string | null;
  relocation?: string | null;
  relocation_regions?: string | null;
  travel?: string | null;
  company_size?: string[] | null;
  target_industries?: string[] | null;

  // ── S7: Work Style & Culture ────────────────────────────────
  target_culture?: string[] | null;
  feedback_pref?: string | null;
  work_style?: string | null;
  pace?: string | null;
  mgmt_style?: string | null;
  team_role?: string | null;
  env_prefs?: string[] | null;
  motivators?: string[] | null;

  // ── S8: Personality ─────────────────────────────────────────
  personality?: Record<string, number | string> | null;
  comm_style?: string | null;
  mistake_style?: string | null;

  // ── S9: Career Goals ────────────────────────────────────────
  primary_goal?: string | null;
  five_year?: string | null;
  search_intensity?: string | null;
  other_interviews?: string | null;
  stay_reasons?: string[] | null;
  referral_source?: string | null;
  bio?: string | null;

  // ── Recruiter company fields ────────────────────────────────
  company_name?: string | null;
  company_website?: string | null;
  company_stage?: string | null;
  company_desc?: string | null;

  // ── Notification preferences ────────────────────────────────
  notif_email_matches?: boolean | null;
  notif_email_viewed?: boolean | null;
  notif_email_feedback?: boolean | null;
  notif_sms_alerts?: boolean | null;

  // ── Resume ──────────────────────────────────────────────────
  resume_text?: string | null;

  // ── Stripe ──────────────────────────────────────────────────
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null;

  // ── Meta ────────────────────────────────────────────────────
  video_url?: string | null;
  profile_complete?: boolean;
  searchable?: boolean;
  visibility?: string;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  recruiter_id: string;
  // S1: Company
  company_name?: string | null;
  company_website?: string | null;
  company_industries?: string[] | null;
  company_size?: string | null;
  company_stage?: string | null;
  hq_location?: string | null;
  company_desc?: string | null;
  // S2: Role
  title: string;
  department?: string | null;
  reports_to?: string | null;
  employment_type?: string[] | null;
  remote_policy?: string | null;
  office_location?: string | null;
  start_date?: string | null;
  managing_reports?: string | null;
  travel?: string | null;
  description?: string | null;
  // S3: Requirements
  min_exp?: number | null;
  min_education?: string | null;
  required_skills?: string[] | null;
  nice_skills?: string[] | null;
  soft_skills_required?: string[] | null;
  preferred_industries?: string[] | null;
  required_certs?: string | null;
  work_auth?: string | null;
  // S4: Compensation
  show_salary?: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  bonus?: string | null;
  show_equity?: boolean;
  equity_type?: string | null;
  benefits?: string[] | null;
  comp_notes?: string | null;
  // S5: Culture
  team_culture?: string[] | null;
  mgmt_style?: string | null;
  feedback_culture?: string | null;
  personality_required?: Record<string, number> | null;
  success_in_90?: string | null;
  who_struggles?: string | null;
  // S6: Weights
  weight_skills: number;
  weight_salary: number;
  weight_experience: number;
  weight_education?: number;
  weight_culture?: number;
  weight_location: number;
  weight_availability: number;
  weight_work_style: number;
  weight_personality?: number;
  weight_industry?: number;
  other_notes?: string | null;
  // Legacy
  industry?: string | null;
  location?: string | null;
  experience_level?: string | null;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  seeker_id: string;
  status: 'matched' | 'viewed' | 'applied' | 'shortlisted' | 'rejected' | 'pass';
  feedback?: string | null;
  feedback_reason?: string | null;
  feedback_notes?: string | null;
  share_notes?: boolean;
  addon_offered?: string | null;
  applied_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchScore = {
  id: string;
  job_id: string;
  seeker_id: string;
  score_skills: number;
  score_salary: number;
  score_personality: number;
  score_location: number;
  score_experience: number;
  score_industry: number;
  score_work_style: number;
  score_availability: number;
  total_score: number;
  computed_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'match' | 'viewed' | 'feedback' | 'shortlist' | 'system';
  text: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
};

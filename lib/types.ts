export type Role = 'seeker' | 'recruiter' | 'admin';

export type Profile = {
  id: string;
  role: Role;
  name: string;
  email: string;

  // ── Section 1: Basic Info ───────────────────────────────────
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  location?: string | null;
  zip?: string | null;
  work_auth?: string | null;
  eeoc?: string[] | null;

  // ── Section 2: Education ────────────────────────────────────
  education?: string | null;
  major?: string | null;
  university?: string | null;
  certs?: string | null;
  enrolled?: string | null;

  // ── Section 3: Work History ─────────────────────────────────
  title?: string | null;              // current/most recent job title
  current_employer?: string | null;
  total_exp?: number | null;          // total years (integer)
  field_exp?: number | null;          // years in primary function
  longest_tenure?: number | null;
  experience_level?: string | null;   // legacy text label
  industries?: string[] | null;
  direct_reports?: number | null;
  managed_projects?: string | null;
  emp_status?: string | null;
  gaps?: string | null;

  // ── Section 4: Skills ───────────────────────────────────────
  skills?: string[] | null;           // legacy combined skills
  soft_skills?: string[] | null;
  tech_skills?: string[] | null;
  other_skills?: string | null;
  seniority?: string | null;

  // ── Section 5: Job Preferences ──────────────────────────────
  target_titles?: string | null;
  salary_label?: string | null;       // legacy label
  salary_min?: number | null;         // full dollars
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

  // ── Section 6: Work Style ───────────────────────────────────
  feedback_pref?: string | null;
  work_style?: string | null;
  pace?: string | null;
  mgmt_style?: string | null;
  team_role?: string | null;
  env_prefs?: string[] | null;
  motivators?: string[] | null;

  // ── Section 7: Personality ──────────────────────────────────
  // { EI, SN, TF, JP, stress, conflict, ambiguity, risk,
  //   detail, change, recognition, collab } each 1–5
  personality?: Record<string, number | string> | null;
  comm_style?: string | null;
  mistake_style?: string | null;

  // ── Section 8: Career Goals ─────────────────────────────────
  primary_goal?: string | null;
  five_year?: string | null;
  search_intensity?: string | null;
  other_interviews?: string | null;
  stay_reasons?: string[] | null;
  bio?: string | null;                // personal note / bio

  // ── Meta ────────────────────────────────────────────────────
  video_url?: string | null;
  profile_complete?: boolean;
  searchable?: boolean;
  visibility?: string;
  company_name?: string | null;       // recruiter only
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  recruiter_id: string;
  title: string;
  industry?: string | null;
  location?: string | null;
  remote_policy?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_level?: string | null;
  required_skills?: string[] | null;
  description?: string | null;
  status: 'active' | 'paused' | 'closed';
  weight_skills: number;
  weight_salary: number;
  weight_personality: number;
  weight_location: number;
  weight_experience: number;
  weight_industry: number;
  weight_work_style: number;
  weight_availability: number;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  seeker_id: string;
  status: 'matched' | 'viewed' | 'applied' | 'shortlisted' | 'rejected' | 'pass';
  feedback?: string | null;
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

import type { Profile, Job } from '@/lib/types';

export type DimensionScores = {
  score_skills: number;
  score_salary: number;
  score_personality: number;
  score_location: number;
  score_experience: number;
  score_industry: number;
  score_work_style: number;
  score_availability: number;
  total_score: number;
};

// ── Skills ──────────────────────────────────────────────────────────────────
function scoreSkills(seeker: Profile, job: Job): number {
  const required = job.required_skills ?? [];
  if (!required.length) return 100;

  // Pool all skill sources from the richer survey data
  const pool = [
    ...(seeker.soft_skills ?? []),
    ...(seeker.tech_skills ?? []),
    ...(seeker.skills ?? []),
    ...(seeker.other_skills ? seeker.other_skills.split(',').map(s => s.trim()) : []),
  ].map(s => s.toLowerCase());

  const matched = required.filter(r =>
    pool.some(s => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s))
  ).length;

  return Math.round((matched / required.length) * 100);
}

// ── Salary ──────────────────────────────────────────────────────────────────
function scoreSalary(seeker: Profile, job: Job): number {
  const sMin = seeker.salary_min ?? 0;
  const sMax = seeker.salary_max ?? 500000;
  const jMin = job.salary_min ?? 0;
  const jMax = job.salary_max ?? 500000;

  if (!seeker.salary_min && !seeker.salary_max) return 70;
  if (!job.salary_min && !job.salary_max) return 70;

  if (sMin >= jMin && sMax <= jMax) return 100;                 // perfect fit
  if (jMin > sMax) return 90;                                   // job pays more — seeker will likely accept
  if (sMin > jMax) return Math.max(10, 100 - Math.round(((sMin - jMax) / jMax) * 150)); // seeker wants more
  return 75;                                                    // partial overlap
}

// ── Experience ──────────────────────────────────────────────────────────────
// Map the recruiter's text experience level to a minimum year requirement
function jobExpMinYears(level: string | null | undefined): number {
  if (!level) return 0;
  const l = level.toLowerCase();
  if (l.includes('0') || l.includes('entry') || l.includes('junior')) return 0;
  if (l.includes('3') || l.includes('mid')) return 3;
  if (l.includes('5') || l.includes('senior')) return 5;
  if (l.includes('8') || l.includes('lead')) return 8;
  if (l.includes('10') || l.includes('exec') || l.includes('director')) return 10;
  return 2;
}

function scoreExperience(seeker: Profile, job: Job): number {
  const seekerYears = seeker.total_exp ?? null;
  const jobMin = jobExpMinYears(job.experience_level);

  if (seekerYears === null) return 65; // unknown — be generous

  const over = seekerYears - jobMin;
  if (over >= 0 && over <= 3) return 100;
  if (over > 3 && over <= 7) return 85;   // overqualified but functional
  if (over > 7) return 72;               // significantly overqualified
  if (over === -1) return 55;            // slightly under
  if (over === -2) return 35;
  return 15;                             // well under
}

// ── Location / Remote ───────────────────────────────────────────────────────
function scoreLocation(seeker: Profile, job: Job): number {
  const pref   = (seeker.remote_preference ?? '').toLowerCase();
  const policy = (job.remote_policy ?? '').toLowerCase();

  if (pref.includes('flexible') || pref.includes('whatever')) return 100;
  if (pref.includes('remote only') || pref.includes('will not commute')) {
    if (policy.includes('remote')) return 100;
    if (policy.includes('hybrid')) return 50;
    return 10;
  }
  if (pref.includes('strongly prefer remote')) {
    if (policy.includes('remote')) return 100;
    if (policy.includes('hybrid')) return 80;
    return 35;
  }
  if (pref.includes('hybrid')) {
    if (policy.includes('hybrid')) return 100;
    if (policy.includes('remote')) return 90;
    return 60;
  }
  if (pref.includes('on-site')) {
    if (policy.includes('on-site') || policy.includes('onsite')) return 100;
    if (policy.includes('hybrid')) return 80;
    return 45;
  }
  return 70;
}

// ── Industry ─────────────────────────────────────────────────────────────────
function scoreIndustry(seeker: Profile, job: Job): number {
  if (!job.industry) return 70;
  const jobInd = job.industry.toLowerCase();

  const targets = (seeker.target_industries ?? []).map(s => s.toLowerCase());
  const worked  = (seeker.industries ?? []).map(s => s.toLowerCase());

  if (targets.some(t => t.includes(jobInd) || jobInd.includes(t))) return 100;
  if (worked.some(w => w.includes(jobInd) || jobInd.includes(w))) return 88;
  if (!targets.length && !worked.length) return 65;
  return 38;
}

// ── Personality ──────────────────────────────────────────────────────────────
function scorePersonality(seeker: Profile, _job: Job): number {
  const p = seeker.personality as Record<string, number> | null | undefined;
  if (!p) return 50;
  const answered = Object.values(p).filter(v => typeof v === 'number' && v > 0).length;
  if (answered >= 10) return 88;
  if (answered >= 6)  return 75;
  if (answered >= 3)  return 63;
  return 50;
}

// ── Work Style ───────────────────────────────────────────────────────────────
function scoreWorkStyle(seeker: Profile, job: Job): number {
  // Location preference is the dominant work-style signal for job matching
  return scoreLocation(seeker, job);
}

// ── Availability ─────────────────────────────────────────────────────────────
function scoreAvailability(seeker: Profile, _job: Job): number {
  const avail = (seeker.availability ?? '').toLowerCase();
  if (avail.includes('immediately') || avail.includes('2 week')) return 100;
  if (avail.includes('1 month') || avail.includes('within 1')) return 90;
  if (avail.includes('1–3') || avail.includes('1-3')) return 75;
  if (avail.includes('3–6') || avail.includes('3-6')) return 55;
  if (avail.includes('exploring') || avail.includes('no fixed')) return 40;
  return 70;
}

// ── Weighted total ────────────────────────────────────────────────────────────
export function computeMatchScore(seeker: Profile, job: Job): DimensionScores {
  const dims = {
    score_skills:       scoreSkills(seeker, job),
    score_salary:       scoreSalary(seeker, job),
    score_personality:  scorePersonality(seeker, job),
    score_location:     scoreLocation(seeker, job),
    score_experience:   scoreExperience(seeker, job),
    score_industry:     scoreIndustry(seeker, job),
    score_work_style:   scoreWorkStyle(seeker, job),
    score_availability: scoreAvailability(seeker, job),
  };

  const weights: Record<keyof typeof dims, number> = {
    score_skills:       job.weight_skills,
    score_salary:       job.weight_salary,
    score_personality:  job.weight_personality ?? 0,
    score_location:     job.weight_location,
    score_experience:   job.weight_experience,
    score_industry:     job.weight_industry ?? 0,
    score_work_style:   job.weight_work_style,
    score_availability: job.weight_availability,
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedSum = (Object.keys(dims) as (keyof typeof dims)[]).reduce(
    (acc, k) => acc + dims[k] * weights[k],
    0
  );

  return { ...dims, total_score: Math.round(weightedSum / totalWeight) };
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Salary undisclosed';
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

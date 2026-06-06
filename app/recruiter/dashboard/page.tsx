'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Badge, GBtn, PBtn, Spinner, matchColor, matchDim, matchLabel } from '@/components/ui';

// ── Types ─────────────────────────────────────────────────────────────────────

type JobRow = {
  id: string; title: string; company_name: string | null;
  status: string; created_at: string;
  remote_policy: string | null; salary_min: number | null; salary_max: number | null;
};

type Candidate = {
  seeker_id: string;
  name: string; email: string | null; phone: string | null; linkedin: string | null;
  title: string | null; location: string | null;
  experience_level: string | null; salary_label: string | null;
  skills: string[];
  total_score: number;
  score_skills: number; score_salary: number; score_personality: number;
  score_location: number; score_experience: number; score_industry: number;
  score_work_style: number; score_availability: number;
  appStatus: 'shortlisted' | 'rejected' | null;
};

type JobCard = JobRow & { matchCount: number; excellentCount: number; candidates: Candidate[] };

// ── Constants ─────────────────────────────────────────────────────────────────

const DIMS: [keyof Candidate & `score_${string}`, string][] = [
  ['score_skills',       'Skills'],
  ['score_experience',   'Experience'],
  ['score_salary',       'Salary'],
  ['score_work_style',   'Work Style'],
  ['score_location',     'Location'],
  ['score_availability', 'Availability'],
  ['score_industry',     'Industry'],
  ['score_personality',  'Personality'],
];

function anonName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function fmtSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${k(min)}–${k(max)}`;
  if (min) return `${k(min)}+`;
  return `Up to ${k(max!)}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null); // seeker_id being acted on
  const [showSuccess, setShowSuccess] = useState(searchParams.get('success') === '1');

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { window.location.href = '/login'; return; }
    if (!loading && profile && profile.role !== 'recruiter') window.location.href = '/dashboard';
  }, [loading, user, profile]);

  // Load everything
  useEffect(() => {
    if (!profile?.id || loading) return;
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, loading]);

  async function load() {
    setFetching(true);
    try {
      const { data: jobRows } = await supabase
        .from('jobs')
        .select('id,title,company_name,status,created_at,remote_policy,salary_min,salary_max')
        .eq('recruiter_id', profile!.id)
        .order('created_at', { ascending: false });

      if (!jobRows?.length) { setJobs([]); return; }

      const ids = (jobRows as JobRow[]).map(j => j.id);

      // Fetch match scores + seeker profile fields in one query
      const { data: scoreRows } = await supabase
        .from('match_scores')
        .select(`
          seeker_id, job_id, total_score,
          score_skills, score_salary, score_personality, score_location,
          score_experience, score_industry, score_work_style, score_availability,
          profiles:seeker_id (
            name, email, phone, linkedin, title, location,
            experience_level, salary_label, skills
          )
        `)
        .in('job_id', ids)
        .order('total_score', { ascending: false });

      // Fetch application statuses
      const { data: appRows } = await supabase
        .from('applications')
        .select('job_id,seeker_id,status')
        .in('job_id', ids);

      const appMap: Record<string, Record<string, string>> = {};
      for (const a of appRows ?? []) {
        if (!appMap[a.job_id]) appMap[a.job_id] = {};
        appMap[a.job_id][a.seeker_id] = a.status;
      }

      // Group scores by job
      const byJob: Record<string, Candidate[]> = {};
      for (const s of (scoreRows ?? []) as any[]) {
        const p = s.profiles ?? {};
        const status = appMap[s.job_id]?.[s.seeker_id] ?? null;
        const c: Candidate = {
          seeker_id:         s.seeker_id,
          name:              p.name ?? 'Candidate',
          email:             p.email ?? null,
          phone:             p.phone ?? null,
          linkedin:          p.linkedin ?? null,
          title:             p.title ?? null,
          location:          p.location ?? null,
          experience_level:  p.experience_level ?? null,
          salary_label:      p.salary_label ?? null,
          skills:            Array.isArray(p.skills) ? p.skills : [],
          total_score:       s.total_score,
          score_skills:      s.score_skills,
          score_salary:      s.score_salary,
          score_personality: s.score_personality,
          score_location:    s.score_location,
          score_experience:  s.score_experience,
          score_industry:    s.score_industry,
          score_work_style:  s.score_work_style,
          score_availability:s.score_availability,
          appStatus:         (status === 'shortlisted' || status === 'rejected') ? status : null,
        };
        if (!byJob[s.job_id]) byJob[s.job_id] = [];
        byJob[s.job_id].push(c);
      }

      setJobs((jobRows as JobRow[]).map(job => ({
        ...job,
        matchCount:    byJob[job.id]?.length ?? 0,
        excellentCount: byJob[job.id]?.filter(c => c.total_score >= 85).length ?? 0,
        candidates:    byJob[job.id] ?? [],
      })));
    } finally {
      setFetching(false);
    }
  }

  async function expressInterest(job: JobCard, c: Candidate) {
    setActingOn(c.seeker_id);
    try {
      await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, seekerId: c.seeker_id }),
      });

      // Fire shortlist email (non-blocking)
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'seeker-shortlisted', seekerId: c.seeker_id, jobId: job.id }),
      });

      // Optimistic update — reveal contact info
      setJobs(prev => prev.map(j =>
        j.id !== job.id ? j : {
          ...j,
          candidates: j.candidates.map(x =>
            x.seeker_id !== c.seeker_id ? x : { ...x, appStatus: 'shortlisted' }
          ),
        }
      ));
    } finally {
      setActingOn(null);
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const firstName     = profile?.first_name ?? profile?.name?.split(' ')[0] ?? '';
  const activeCount   = jobs.filter(j => j.status === 'active').length;
  const totalMatches  = jobs.reduce((a, j) => a + j.matchCount, 0);
  const excellentTotal = jobs.reduce((a, j) => a + j.excellentCount, 0);

  if (loading || fetching) return <Spinner />;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Stripe success banner */}
        {showSuccess && (
          <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎉</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>You&apos;re all set!</div>
                <div style={{ fontSize: 12, color: C.gray600, marginTop: 2 }}>Your 14-day free trial is active. Post your first job to start matching with candidates.</div>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} style={{ background: 'none', border: 'none', color: C.gray400, fontSize: 18, cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.slate, letterSpacing: -0.5 }}>
              {firstName ? `Welcome back, ${firstName}.` : 'Recruiter Dashboard'}
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: C.gray600 }}>Your posted jobs and candidate matches.</p>
          </div>
          <PBtn onClick={() => router.push('/recruiter/post')} style={{ fontSize: 13, padding: '9px 18px' }}>
            + Post a job
          </PBtn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 24 }}>
          {([
            ['Active jobs',       activeCount,    C.teal],
            ['Total matches',     totalMatches,   C.slate],
            ['Excellent matches', excellentTotal, C.green],
          ] as [string, number, string][]).map(([label, val, color]) => (
            <div key={label} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ fontSize: 38, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.slate, marginBottom: 6 }}>No jobs posted yet</div>
            <div style={{ fontSize: 13, color: C.gray600, marginBottom: 20 }}>Post your first job to start matching with candidates.</div>
            <PBtn onClick={() => router.push('/recruiter/post')}>Post your first job →</PBtn>
          </div>
        )}

        {/* Job cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map(job => (
            <JobSection
              key={job.id}
              job={job}
              actingOn={actingOn}
              onInterest={c => expressInterest(job, c)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── JobSection ─────────────────────────────────────────────────────────────────

function JobSection({ job, actingOn, onInterest }: {
  job: JobCard;
  actingOn: string | null;
  onInterest: (c: Candidate) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const visible = job.candidates.filter(c => c.appStatus !== 'rejected');
  const shown   = visible.slice(0, 5);
  const more    = visible.length - shown.length;
  const sal     = fmtSalary(job.salary_min, job.salary_max);

  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>

      {/* Job header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '18px 22px', borderBottom: expanded ? `1px solid ${C.border}` : 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.slate }}>{job.title}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: job.status === 'active' ? C.greenDim : C.amberDim,
              color:      job.status === 'active' ? C.green    : C.amber,
            }}>
              {job.status === 'active' ? 'Active' : 'Paused'}
            </span>
            {job.company_name && (
              <span style={{ fontSize: 12, color: C.gray400 }}>{job.company_name}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.gray600, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {sal    && <span>{sal}</span>}
            {job.remote_policy && <span>{job.remote_policy}</span>}
            <span>Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.slate, lineHeight: 1 }}>{job.matchCount}</div>
            <div style={{ fontSize: 10, color: C.gray400 }}>
              match{job.matchCount !== 1 ? 'es' : ''}
              {job.excellentCount > 0 && (
                <span style={{ color: C.green }}> · {job.excellentCount} excellent</span>
              )}
            </div>
          </div>
          <span style={{ fontSize: 16, color: C.gray400, lineHeight: 1, marginTop: 1 }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Candidate list */}
      {expanded && (
        <div style={{ padding: '14px 22px' }}>
          {visible.length === 0 ? (
            <div style={{ fontSize: 13, color: C.gray400, textAlign: 'center', padding: '18px 0' }}>
              No active candidates yet — matches appear automatically as seekers complete their profiles.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Ranked by match score
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {shown.map((c, i) => (
                  <CandidateCard
                    key={c.seeker_id}
                    rank={i + 1}
                    candidate={c}
                    acting={actingOn === c.seeker_id}
                    onInterest={() => onInterest(c)}
                  />
                ))}
              </div>
              {(more > 0 || job.candidates.length > 5) && (
                <button
                  onClick={() => router.push(`/recruiter/candidates/${job.id}`)}
                  style={{ marginTop: 12, width: '100%', padding: '9px 0', background: 'none', border: `1.5px dashed ${C.border}`, borderRadius: 9, color: C.teal, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}
                >
                  {more > 0 ? `See ${more} more candidate${more > 1 ? 's' : ''} →` : 'View all candidates →'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── CandidateCard ─────────────────────────────────────────────────────────────

function CandidateCard({ rank, candidate: c, acting, onInterest }: {
  rank: number;
  candidate: Candidate;
  acting: boolean;
  onInterest: () => void;
}) {
  const isShortlisted = c.appStatus === 'shortlisted';
  const col = matchColor(c.total_score);
  const dim = matchDim(c.total_score);

  const topDims = DIMS
    .map(([k, label]) => ({ label, val: c[k] as number }))
    .filter(d => d.val >= 70)
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  const initials = c.name.trim().split(/\s+/).map(n => n[0]?.toUpperCase() ?? '').join('').slice(0, 2);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 14px',
      background: isShortlisted ? C.greenDim : C.bg,
      borderRadius: 10,
      border: `1px solid ${isShortlisted ? '#19A87A30' : C.border}`,
    }}>
      {/* Rank + avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: rank === 1 ? C.amber : C.gray400 }}>#{rank}</div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: isShortlisted ? '#19A87A22' : C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: isShortlisted ? C.green : C.teal }}>
          {initials}
        </div>
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.slate }}>
            {isShortlisted ? c.name : anonName(c.name)}
          </span>
          {isShortlisted && (
            <Badge color={C.green} dim={C.greenDim}>Interested</Badge>
          )}
        </div>

        <div style={{ fontSize: 11, color: C.gray600, marginBottom: 6 }}>
          {[c.title, c.location, c.experience_level].filter(Boolean).join(' · ')}
          {c.salary_label && <span style={{ color: C.gray400 }}> · {c.salary_label}</span>}
        </div>

        {/* Top matching dimensions */}
        {topDims.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {topDims.map(d => (
              <span key={d.label} style={{ fontSize: 10, background: C.greenDim, color: C.green, border: '1px solid #19A87A25', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>
                ✓ {d.label} {d.val}%
              </span>
            ))}
          </div>
        )}

        {/* Skills */}
        {c.skills.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: isShortlisted ? 10 : 0 }}>
            {c.skills.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', color: C.gray600 }}>{s}</span>
            ))}
          </div>
        )}

        {/* Contact info — revealed after interest */}
        {isShortlisted && (
          <div style={{ background: C.white, borderRadius: 8, border: `1px solid #19A87A25`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Contact Info</div>
            {c.email && (
              <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>
                ✉ {c.email}
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>
                📞 {c.phone}
              </a>
            )}
            {c.linkedin && (
              <a href={c.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>
                🔗 LinkedIn →
              </a>
            )}
            {!c.email && !c.phone && !c.linkedin && (
              <span style={{ fontSize: 12, color: C.gray400 }}>No contact info on file.</span>
            )}
          </div>
        )}
      </div>

      {/* Score circle + action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Score circle */}
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2.5px solid ${col}`, background: dim, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: col, lineHeight: 1 }}>{c.total_score}%</div>
          <div style={{ fontSize: 7, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: 0.3 }}>{matchLabel(c.total_score)}</div>
        </div>

        {/* Express interest */}
        {!isShortlisted && (
          <button
            onClick={onInterest}
            disabled={acting}
            style={{
              background: acting ? C.gray100 : C.teal,
              border: 'none', borderRadius: 7,
              color: acting ? C.gray400 : C.white,
              fontWeight: 700, fontSize: 11,
              cursor: acting ? 'default' : 'pointer',
              fontFamily: F, padding: '6px 10px',
              whiteSpace: 'nowrap',
              opacity: acting ? 0.7 : 1,
            }}
          >
            {acting ? '…' : 'Express\nInterest'}
          </button>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, matchColor, matchLabel, matchDim, Pill, Spinner } from '@/components/ui';
import type { MatchScore, Job } from '@/lib/types';

type Match = MatchScore & { job: Job };
type Filter = 'all' | 'excellent' | 'good' | 'fair';

type ScoreDimKey = 'score_skills' | 'score_salary' | 'score_personality' | 'score_location' |
                   'score_experience' | 'score_industry' | 'score_work_style' | 'score_availability';

const DIMS: [ScoreDimKey, string][] = [
  ['score_skills',       'Skills'],
  ['score_experience',   'Experience'],
  ['score_salary',       'Salary'],
  ['score_location',     'Location'],
  ['score_work_style',   'Work Style'],
  ['score_industry',     'Industry'],
  ['score_personality',  'Personality'],
  ['score_availability', 'Availability'],
];

function fmtSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const f = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${f(min)}–${f(max)}`;
  if (min) return `${f(min)}+`;
  return `Up to ${f(max!)}`;
}

export default function MatchesPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [matches,  setMatches]  = useState<Match[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter,   setFilter]   = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  useEffect(() => {
    if (!user?.id || loading) return;
    void loadMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  async function loadMatches() {
    setFetching(true);
    try {
      const { data: scores, error: scoresErr } = await supabase
        .from('match_scores')
        .select('*')
        .eq('seeker_id', user!.id)
        .order('total_score', { ascending: false });

      if (scoresErr || !scores?.length) { setMatches([]); return; }

      const ids = scores.map(s => s.job_id);
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .in('id', ids)
        .eq('status', 'active');

      const byId = Object.fromEntries((jobs ?? []).map((j: Job) => [j.id, j]));
      setMatches(
        (scores as MatchScore[])
          .filter(s => byId[s.job_id])
          .map(s => ({ ...s, job: byId[s.job_id] }))
      );
    } finally {
      setFetching(false);
    }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const visible = matches.filter(m =>
    filter === 'excellent' ? m.total_score >= 85 :
    filter === 'good'      ? m.total_score >= 70 && m.total_score < 85 :
    filter === 'fair'      ? m.total_score < 70 :
    true
  );

  const counts = {
    all:       matches.length,
    excellent: matches.filter(m => m.total_score >= 85).length,
    good:      matches.filter(m => m.total_score >= 70 && m.total_score < 85).length,
    fair:      matches.filter(m => m.total_score < 70).length,
  };

  if (loading || fetching) return <Spinner />;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.slate, letterSpacing: -0.5 }}>Your Matches</h1>
          {matches.length > 0 && (
            <span style={{ fontSize: 13, color: C.gray400, fontWeight: 500 }}>
              {matches.length} scored job{matches.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter pills */}
        {matches.length > 0 && (
          <div style={{ display: 'flex', gap: 7, marginBottom: 20, flexWrap: 'wrap' }}>
            <Pill active={filter === 'all'}       onClick={() => setFilter('all')}>All ({counts.all})</Pill>
            <Pill active={filter === 'excellent'} onClick={() => setFilter('excellent')}>Excellent 85%+ ({counts.excellent})</Pill>
            <Pill active={filter === 'good'}      onClick={() => setFilter('good')}>Good 70–84% ({counts.good})</Pill>
            <Pill active={filter === 'fair'}      onClick={() => setFilter('fair')}>Fair &lt;70% ({counts.fair})</Pill>
          </div>
        )}

        {/* Empty: profile not complete */}
        {!profile?.profile_complete && (
          <EmptyCard icon="🎯" title="Complete your profile to see matches"
            sub="Once your profile is live, we score you against every active job automatically.">
            <a href="/profile" style={{ display: 'inline-block', marginTop: 18, padding: '11px 24px', borderRadius: 8, background: C.teal, color: C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Complete profile →
            </a>
          </EmptyCard>
        )}

        {/* Empty: profile complete, no matches scored yet */}
        {profile?.profile_complete && matches.length === 0 && (
          <EmptyCard icon="⏳" title="No matches yet"
            sub="Your profile is live. As recruiters post new roles, we'll score them against your profile and notify you when there's a strong fit." />
        )}

        {/* Empty: active filter has no results */}
        {matches.length > 0 && visible.length === 0 && (
          <EmptyCard icon="🔍" title="No matches in this tier">
            <button onClick={() => setFilter('all')} style={{ marginTop: 14, background: 'none', border: 'none', color: C.teal, fontWeight: 600, cursor: 'pointer', fontFamily: F, fontSize: 14 }}>
              View all matches →
            </button>
          </EmptyCard>
        )}

        {/* Match cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(m => {
            const job    = m.job;
            const col    = matchColor(m.total_score);
            const lbl    = matchLabel(m.total_score);
            const dim    = matchDim(m.total_score);
            const isOpen = expanded.has(m.id);
            const loc    = job.remote_policy ?? job.office_location ?? job.hq_location ?? null;
            const sal    = job.show_salary !== false ? fmtSalary(job.salary_min, job.salary_max) : null;
            const topDims = DIMS
              .map(([k, label]) => ({ label, val: m[k] }))
              .filter(d => d.val >= 70)
              .sort((a, b) => b.val - a.val)
              .slice(0, 3);

            return (
              <div key={m.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>

                {/* Score + job info */}
                <div style={{ padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Score circle */}
                  <div style={{ width: 60, height: 60, borderRadius: '50%', border: `3px solid ${col}`, background: dim, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: col, lineHeight: 1 }}>{m.total_score}%</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: col, marginTop: 1, textTransform: 'uppercase' }}>{lbl}</span>
                  </div>

                  {/* Job details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.slate, marginBottom: 2, letterSpacing: -0.3, lineHeight: 1.2 }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: C.gray600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{job.company_name ?? '—'}</span>
                      {job.company_stage && (
                        <span style={{ fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: '1px 7px', color: C.gray400, fontWeight: 500 }}>
                          {job.company_stage}
                        </span>
                      )}
                    </div>

                    {/* Meta chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: topDims.length ? 10 : 0 }}>
                      {loc                    && <Chip>{loc}</Chip>}
                      {sal                    && <Chip>{sal}</Chip>}
                      {job.employment_type?.[0] && <Chip>{job.employment_type[0]}</Chip>}
                      {job.company_size        && <Chip>{job.company_size}</Chip>}
                    </div>

                    {/* Top 3 matching strengths */}
                    {topDims.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {topDims.map(d => (
                          <span key={d.label} style={{ fontSize: 11, background: C.greenDim, color: C.green, border: `1px solid #19A87A30`, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
                            ✓ {d.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable breakdown */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '18px 22px', background: C.bg }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Score breakdown</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px' }}>
                      {DIMS.map(([k, label]) => {
                        const val = m[k];
                        const c2  = matchColor(val);
                        return (
                          <div key={k}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: C.gray600, fontWeight: 500 }}>{label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: c2 }}>{val}%</span>
                            </div>
                            <div style={{ height: 5, background: C.gray100, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${val}%`, height: '100%', background: c2, borderRadius: 3, transition: 'width .4s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {job.description && (
                      <>
                        <div style={{ borderTop: `1px solid ${C.border}`, margin: '18px 0 14px' }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>About the role</div>
                        <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.65, margin: 0 }}>
                          {job.description.length > 500 ? job.description.slice(0, 500) + '…' : job.description}
                        </p>
                      </>
                    )}

                    {job.required_skills?.length ? (
                      <>
                        <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0 12px' }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Required skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {job.required_skills.map(s => <Chip key={s}>{s}</Chip>)}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Footer */}
                <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => toggleExpand(m.id)} style={{ background: 'none', border: 'none', color: C.teal, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F, padding: 0 }}>
                    {isOpen ? 'Hide details ↑' : 'See score breakdown ↓'}
                  </button>
                  <span style={{ fontSize: 11, color: C.gray400 }}>
                    Matched {new Date(m.computed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {matches.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: C.gray400, marginTop: 28, lineHeight: 1.6 }}>
            Scores update automatically when new jobs are posted or you update your profile.
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, color: C.gray600, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 9px', fontWeight: 500, fontFamily: F }}>
      {children}
    </span>
  );
}

function EmptyCard({ icon, title, sub, children }: { icon?: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '36px 28px', textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>}
      <div style={{ fontSize: 16, fontWeight: 700, color: C.slate, marginBottom: sub ? 8 : 0 }}>{title}</div>
      {sub && <p style={{ fontSize: 14, color: C.gray600, margin: '0 auto', lineHeight: 1.65, maxWidth: 400 }}>{sub}</p>}
      {children}
    </div>
  );
}

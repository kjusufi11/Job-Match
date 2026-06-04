'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/app/providers';
import { C, F, matchColor, matchDim, matchLabel } from '@/components/ui';

const SB_URL  = (process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '').replace(/^﻿/, '').trim();
const SB_ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '').trim();

type JobRow = {
  id: string; title: string; company_name: string | null;
  status: string; created_at: string;
};

type TopCandidate = {
  seeker_id: string; total_score: number;
  name: string; title: string | null;
  location: string | null; skills: string[];
};

type JobWithCandidates = JobRow & {
  matchCount: number; excellentCount: number; topCandidates: TopCandidate[];
};

function anonName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function RecruiterDashboard() {
  const { user, profile, loading, supabaseUrl, supabaseKey, getToken } = useUser();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [jobs, setJobs] = useState<JobWithCandidates[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { window.location.href = '/login'; return; }
    if (!user) {
      timerRef.current = setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  useEffect(() => {
    if (!loading && profile && profile.role !== 'recruiter') {
      window.location.href = '/dashboard';
    }
  }, [loading, profile]);

  useEffect(() => {
    if (!user?.id || loading) return;
    const token = getToken();
    const url   = supabaseUrl || SB_URL;
    const key   = supabaseKey || SB_ANON;
    if (!token || !url || !key) { setFetching(false); return; }

    async function load() {
      setFetching(true);
      try {
        const jobsRes = await fetch(
          `${url}/rest/v1/jobs?recruiter_id=eq.${user!.id}&order=created_at.desc&select=id,title,company_name,status,created_at`,
          { headers: { apikey: key, Authorization: `Bearer ${token}` } }
        );
        const jobRows: JobRow[] = jobsRes.ok ? await jobsRes.json() : [];
        if (!jobRows.length) { setJobs([]); setFetching(false); return; }

        const ids = jobRows.map(j => j.id).join(',');
        const scoresRes = await fetch(
          `${url}/rest/v1/match_scores?job_id=in.(${ids})&select=seeker_id,job_id,total_score,profiles:seeker_id(name,title,location,skills)&order=total_score.desc`,
          { headers: { apikey: key, Authorization: `Bearer ${token}` } }
        );
        const scoreRows: any[] = scoresRes.ok ? await scoresRes.json() : [];

        const byJob: Record<string, any[]> = {};
        for (const s of scoreRows) {
          if (!byJob[s.job_id]) byJob[s.job_id] = [];
          byJob[s.job_id].push(s);
        }

        setJobs(jobRows.map(job => {
          const scores = byJob[job.id] ?? [];
          return {
            ...job,
            matchCount: scores.length,
            excellentCount: scores.filter((s: any) => s.total_score >= 85).length,
            topCandidates: scores.slice(0, 3).map((s: any) => ({
              seeker_id: s.seeker_id,
              total_score: s.total_score,
              name: s.profiles?.name ?? 'Candidate',
              title: s.profiles?.title ?? null,
              location: s.profiles?.location ?? null,
              skills: Array.isArray(s.profiles?.skills) ? (s.profiles.skills as string[]).slice(0, 3) : [],
            })),
          };
        }));
      } catch (e) {
        console.error('[RecruiterDashboard] fetch error:', e);
      } finally {
        setFetching(false);
      }
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  const firstName    = profile?.first_name ?? profile?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '';
  const activeJobs   = jobs.filter(j => j.status === 'active').length;
  const totalMatches = jobs.reduce((a, j) => a + j.matchCount, 0);
  const excellentTotal = jobs.reduce((a, j) => a + j.excellentCount, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.slate, letterSpacing: -0.5 }}>
              Welcome back{firstName ? `, ${firstName}` : ''}.
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray600 }}>Recruiter dashboard</p>
          </div>
          <a href="/recruiter/post" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: C.teal, color: C.white, fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: F }}>
            + Post a job
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 22 }}>
          {([
            ['Active jobs',       activeJobs,    C.teal],
            ['Total matches',     totalMatches,  C.slate],
            ['Excellent matches', excellentTotal, C.green],
          ] as [string, number, string][]).map(([label, val, color]) => (
            <div key={label} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{fetching ? '–' : val}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!fetching && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.slate, marginBottom: 6 }}>No jobs posted yet</div>
            <div style={{ fontSize: 13, color: C.gray600, marginBottom: 20 }}>Post your first job to start matching with candidates.</div>
            <a href="/recruiter/post" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 8, background: C.teal, color: C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: F }}>
              Post your first job →
            </a>
          </div>
        )}

        {/* Job cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.map(job => (
            <div key={job.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>

              {/* Job header row */}
              <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: C.slate }}>{job.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: job.status === 'active' ? C.greenDim : C.amberDim,
                      color: job.status === 'active' ? C.green : C.amber,
                    }}>
                      {job.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gray600 }}>
                    Posted {new Date(job.created_at).toLocaleDateString()}
                    {' · '}
                    <strong style={{ color: C.slate }}>{job.matchCount}</strong> match{job.matchCount !== 1 ? 'es' : ''}
                    {job.excellentCount > 0 && (
                      <span style={{ color: C.green, fontWeight: 700 }}> · {job.excellentCount} excellent</span>
                    )}
                  </div>
                </div>
                <a
                  href={`/recruiter/candidates/${job.id}`}
                  style={{ fontSize: 12, fontWeight: 700, color: C.teal, textDecoration: 'none', padding: '6px 14px', border: `1.5px solid ${C.tealBorder}`, borderRadius: 7, whiteSpace: 'nowrap' }}
                >
                  View all candidates →
                </a>
              </div>

              {/* Top candidates */}
              <div style={{ padding: '14px 22px' }}>
                {job.topCandidates.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.gray400, textAlign: 'center', padding: '10px 0' }}>
                    No matches yet — candidates are matched automatically as they complete their profiles.
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      Top candidates
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {job.topCandidates.map(c => (
                        <div key={c.seeker_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: C.bg, borderRadius: 9, border: `1px solid ${C.border}` }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: C.teal, flexShrink: 0 }}>
                            {anonName(c.name).split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: C.slate }}>{anonName(c.name)}</div>
                            <div style={{ fontSize: 11, color: C.gray600, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {[c.title, c.location].filter(Boolean).join(' · ')}
                            </div>
                            {c.skills.length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                                {c.skills.map(s => (
                                  <span key={s} style={{ fontSize: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', color: C.gray600 }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', border: `2.5px solid ${matchColor(c.total_score)}`, background: matchDim(c.total_score), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: matchColor(c.total_score), lineHeight: 1 }}>{c.total_score}%</div>
                            <div style={{ fontSize: 8, color: matchColor(c.total_score), fontWeight: 700 }}>{matchLabel(c.total_score)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

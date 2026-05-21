'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { formatSalary } from '@/lib/matching/score';
import { C, F, Card, Badge, GBtn, PBtn, Spinner, matchColor, matchDim, matchLabel } from '@/components/ui';

type Match = {
  total_score: number;
  score_skills: number; score_salary: number; score_personality: number;
  score_location: number; score_experience: number; score_industry: number;
  job_id: string; job_title: string; company: string; location: string;
  salary_min: number | null; salary_max: number | null;
  required_skills: string[]; remote_policy: string | null;
  appStatus: string | null;
};

export default function SeekerDashboard() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sel, setSel] = useState<Match | null>(null);

  useEffect(() => {
    if (!profile) { setFetching(false); return; }
    const timer = setTimeout(() => setFetching(false), 5000);

    async function load() {
      try {
        const { data: scores } = await supabase
          .from('match_scores')
          .select(`
            total_score, score_skills, score_salary, score_personality,
            score_location, score_experience, score_industry,
            jobs (
              id, title, location, remote_policy, salary_min, salary_max, required_skills, status,
              profiles:recruiter_id ( name, company_name )
            )
          `)
          .eq('seeker_id', profile!.id)
          .order('total_score', { ascending: false });

        const jobIds = scores?.map((s: any) => s.jobs?.id).filter(Boolean) ?? [];

        const { data: apps } = jobIds.length
          ? await supabase.from('applications').select('job_id, status').eq('seeker_id', profile!.id).in('job_id', jobIds)
          : { data: [] };

        const appMap = Object.fromEntries((apps ?? []).map((a: any) => [a.job_id, a.status]));

        const rows: Match[] = (scores ?? [])
          .filter((s: any) => s.jobs?.status === 'active')
          .map((s: any) => ({
            total_score: s.total_score,
            score_skills: s.score_skills,
            score_salary: s.score_salary,
            score_personality: s.score_personality,
            score_location: s.score_location,
            score_experience: s.score_experience,
            score_industry: s.score_industry,
            job_id: s.jobs.id,
            job_title: s.jobs.title,
            company: s.jobs.profiles?.company_name || s.jobs.profiles?.name || 'Unknown',
            location: s.jobs.location || s.jobs.remote_policy || '—',
            salary_min: s.jobs.salary_min,
            salary_max: s.jobs.salary_max,
            required_skills: s.jobs.required_skills ?? [],
            remote_policy: s.jobs.remote_policy,
            appStatus: appMap[s.jobs.id] ?? null,
          }));

        setMatches(rows);
      } catch {
        // render empty on error
      } finally {
        clearTimeout(timer);
        setFetching(false);
      }
    }

    load();
    return () => clearTimeout(timer);
  }, [profile?.id, loading, supabase]);

  async function act(jobId: string, status: 'applied' | 'pass') {
    if (!profile) return;
    await supabase.from('applications').upsert({ job_id: jobId, seeker_id: profile.id, status, applied_at: status === 'applied' ? new Date().toISOString() : null }, { onConflict: 'job_id,seeker_id' });
    setMatches(prev => prev.map(m => m.job_id === jobId ? { ...m, appStatus: status } : m));
    setSel(null);
  }

  if (loading || fetching) return <Spinner />;

  if (!profile?.profile_complete) {
    router.replace('/profile');
    return <Spinner />;
  }

  const visible = matches.filter(m => {
    if (m.appStatus === 'pass') return filter === 'Passed';
    if (filter === 'All') return true;
    if (filter === 'Applied') return m.appStatus === 'applied';
    if (filter === 'Excellent') return m.total_score >= 85;
    if (filter === 'Good') return m.total_score >= 70 && m.total_score < 85;
    return true;
  });

  const strong = matches.filter(m => m.total_score >= 70 && m.appStatus !== 'pass').length;
  const appliedCount = matches.filter(m => m.appStatus === 'applied').length;
  const excellentCount = matches.filter(m => m.total_score >= 85).length;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.slate, margin: '0 0 3px', letterSpacing: -0.5 }}>Hey {profile.name?.split(' ')[0] ?? 'there'} 👋</h1>
            <p style={{ color: C.gray600, margin: 0, fontSize: 13 }}>You have <strong style={{ color: C.teal }}>{strong} strong match{strong !== 1 ? 'es' : ''}</strong> waiting.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['All', 'Excellent', 'Good', 'Applied', 'Passed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? C.teal : C.white, border: `1.5px solid ${filter === f ? C.teal : C.border}`, color: filter === f ? C.white : C.gray600, borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8, marginBottom: 16 }}>
          {[['Total matches', matches.length, C.slate], ['Excellent', excellentCount, C.green], ['Applied', appliedCount, C.amber]].map(([l, v, col]) => (
            <Card key={l as string} style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: col as string }}>{v as number}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 2 }}>{l as string}</div>
            </Card>
          ))}
        </div>

        {/* Match list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {visible.map(job => (
            <div key={job.job_id} onClick={() => setSel(job)} style={{ background: C.white, borderRadius: 11, border: `1.5px solid ${sel?.job_id === job.job_id ? C.teal : C.border}`, padding: '14px 16px', cursor: 'pointer', transition: 'border-color .18s', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2.5px solid ${matchColor(job.total_score)}`, background: matchDim(job.total_score), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: matchColor(job.total_score), lineHeight: 1 }}>{job.total_score}%</div>
                <div style={{ fontSize: 8, color: matchColor(job.total_score), fontWeight: 700 }}>{matchLabel(job.total_score)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.slate }}>{job.job_title}</span>
                  {job.appStatus === 'applied' && <Badge color={C.green} dim={C.greenDim}>Applied</Badge>}
                  {job.appStatus === 'shortlisted' && <Badge color={C.purple} dim={C.purpleDim}>Shortlisted</Badge>}
                  {job.appStatus === 'rejected' && <Badge color={C.red} dim={C.redDim}>Not selected</Badge>}
                </div>
                <div style={{ color: C.gray600, fontSize: 12 }}>{job.company} · {job.location} · {formatSalary(job.salary_min, job.salary_max)}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                  {job.required_skills.slice(0, 4).map(t => <span key={t} style={{ fontSize: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', color: C.gray600 }}>{t}</span>)}
                </div>
              </div>
              {!['applied', 'rejected', 'pass'].includes(job.appStatus ?? '') && (
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <GBtn onClick={e => { e.stopPropagation(); act(job.job_id, 'pass'); }} style={{ padding: '6px 11px', fontSize: 11 }}>Pass</GBtn>
                  <PBtn onClick={e => { e.stopPropagation(); act(job.job_id, 'applied'); }} style={{ padding: '6px 12px', fontSize: 11 }}>Apply →</PBtn>
                </div>
              )}
            </div>
          ))}
          {visible.length === 0 && <div style={{ textAlign: 'center', padding: '44px 0', color: C.gray400, fontSize: 14 }}>No matches in this filter.</div>}
        </div>
      </div>

      {/* Detail drawer */}
      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,45,58,.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }} onClick={() => setSel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: '16px 16px 0 0', border: `1px solid ${C.border}`, padding: '24px 22px 32px', width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: C.slate, margin: '0 0 2px' }}>{sel.job_title}</h2>
                <p style={{ color: C.gray600, margin: 0, fontSize: 12 }}>{sel.company} · {sel.location} · {formatSalary(sel.salary_min, sel.salary_max)}</p>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: C.gray400, fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: matchDim(sel.total_score), border: `1.5px solid ${matchColor(sel.total_score)}44`, borderRadius: 9, padding: '9px 13px', marginBottom: 18 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: matchColor(sel.total_score) }}>{sel.total_score}%</span>
              <div>
                <div style={{ fontWeight: 700, color: matchColor(sel.total_score), fontSize: 12 }}>{matchLabel(sel.total_score)} Match</div>
                <div style={{ fontSize: 11, color: C.gray600 }}>Scored across 8 dimensions</div>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 9px' }}>Match breakdown</p>
              {([['Skills alignment', sel.score_skills], ['Salary fit', sel.score_salary], ['Work style', sel.score_location], ['Industry match', sel.score_industry], ['Experience', sel.score_experience]] as [string, number][]).map(([dim, pct]) => (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: C.gray600, width: 130, flexShrink: 0 }}>{dim}</span>
                  <div style={{ flex: 1, height: 4, background: C.gray100, borderRadius: 2 }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: matchColor(pct) }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: matchColor(pct), width: 28, textAlign: 'right' }}>{pct}%</span>
                </div>
              ))}
            </div>
            {!['applied', 'rejected', 'pass'].includes(sel.appStatus ?? '') && (
              <div style={{ display: 'flex', gap: 7 }}>
                <GBtn onClick={() => act(sel.job_id, 'pass')} style={{ flex: 1 }}>Not interested</GBtn>
                <PBtn onClick={() => act(sel.job_id, 'applied')} style={{ flex: 2 }}>Apply to this role →</PBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

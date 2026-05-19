'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Badge, GBtn, PBtn, Spinner, matchColor, matchDim, matchLabel } from '@/components/ui';

type Candidate = {
  seeker_id: string; name: string; title: string | null; location: string | null;
  experience_level: string | null; salary_label: string | null; skills: string[];
  video_url: string | null;
  total_score: number; score_skills: number; score_salary: number;
  score_experience: number; score_location: number; score_industry: number;
  appStatus: string | null; feedback: string | null;
};

const FB_OPTIONS = ['Skills don\'t fully match', 'Salary expectations too high', 'Looking for more experience', 'Culture fit concerns', 'Role has been filled'];

export default function RecCandidates() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const supabase = createClient();

  const [jobTitle, setJobTitle] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sel, setSel] = useState<Candidate | null>(null);
  const [fbFor, setFbFor] = useState<Candidate | null>(null);
  const [fbText, setFbText] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!profile || !jobId) return;
    async function load() {
      const { data: job } = await supabase.from('jobs').select('title').eq('id', jobId).single();
      setJobTitle(job?.title ?? '');

      const { data: scores } = await supabase
        .from('match_scores')
        .select(`
          seeker_id, total_score, score_skills, score_salary,
          score_experience, score_location, score_industry,
          profiles:seeker_id ( name, title, location, experience_level, salary_label, skills, video_url )
        `)
        .eq('job_id', jobId)
        .order('total_score', { ascending: false });

      const seekerIds = scores?.map((s: any) => s.seeker_id) ?? [];
      const { data: apps } = seekerIds.length
        ? await supabase.from('applications').select('seeker_id, status, feedback').eq('job_id', jobId).in('seeker_id', seekerIds)
        : { data: [] };

      const appMap = Object.fromEntries((apps ?? []).map((a: any) => [a.seeker_id, { status: a.status, feedback: a.feedback }]));

      const rows: Candidate[] = (scores ?? []).map((s: any) => ({
        seeker_id: s.seeker_id,
        name: s.profiles?.name ?? 'Unknown',
        title: s.profiles?.title ?? null,
        location: s.profiles?.location ?? null,
        experience_level: s.profiles?.experience_level ?? null,
        salary_label: s.profiles?.salary_label ?? null,
        skills: s.profiles?.skills ?? [],
        video_url: s.profiles?.video_url ?? null,
        total_score: s.total_score,
        score_skills: s.score_skills,
        score_salary: s.score_salary,
        score_experience: s.score_experience,
        score_location: s.score_location,
        score_industry: s.score_industry,
        appStatus: appMap[s.seeker_id]?.status ?? null,
        feedback: appMap[s.seeker_id]?.feedback ?? null,
      }));

      setCandidates(rows);
      setFetching(false);
    }
    load();
  }, [profile, jobId, supabase]);

  async function act(seekerId: string, status: 'shortlisted' | 'rejected', feedback?: string) {
    setActing(true);
    await supabase.from('applications').upsert({ job_id: jobId, seeker_id: seekerId, status, feedback: feedback ?? null }, { onConflict: 'job_id,seeker_id' });

    if (status === 'rejected' && feedback) {
      await supabase.from('notifications').insert({ user_id: seekerId, type: 'feedback', text: `You received feedback: "${feedback}"`, metadata: { job_id: jobId } });
    }
    if (status === 'shortlisted') {
      await supabase.from('notifications').insert({ user_id: seekerId, type: 'shortlist', text: `You've been shortlisted for ${jobTitle}!`, metadata: { job_id: jobId } });
    }

    setCandidates(prev => prev.map(c => c.seeker_id === seekerId ? { ...c, appStatus: status, feedback: feedback ?? null } : c));
    setSel(null); setFbFor(null); setFbText(''); setActing(false);
  }

  if (loading || fetching) return <Spinner />;

  const visible = candidates.filter(c => {
    if (filter === 'All') return c.appStatus !== 'rejected';
    if (filter === 'Shortlisted') return c.appStatus === 'shortlisted';
    if (filter === 'Rejected') return c.appStatus === 'rejected';
    if (filter === 'Excellent') return c.total_score >= 85;
    return true;
  });

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <button onClick={() => router.push('/recruiter/jobs')} style={{ background: 'none', border: 'none', color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: F, fontWeight: 600, marginBottom: 6 }}>← Job Postings</button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: '0 0 2px', letterSpacing: -0.5 }}>{jobTitle}</h1>
            <p style={{ color: C.gray600, margin: 0, fontSize: 12 }}>{candidates.length} candidates · {candidates.filter(c => c.total_score >= 85).length} excellent matches</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['All', 'Excellent', 'Shortlisted', 'Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? C.teal : C.white, border: `1.5px solid ${filter === f ? C.teal : C.border}`, color: filter === f ? C.white : C.gray600, borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {visible.map(c => (
            <div key={c.seeker_id} onClick={() => setSel(c)} style={{ background: C.white, borderRadius: 11, border: `1.5px solid ${sel?.seeker_id === c.seeker_id ? C.teal : C.border}`, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: C.teal, flexShrink: 0 }}>
                {c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.slate }}>{c.name}</span>
                  {c.video_url && <Badge color={C.purple} dim={C.purpleDim}>🎥 Video</Badge>}
                  {c.appStatus === 'shortlisted' && <Badge color={C.green} dim={C.greenDim}>Shortlisted</Badge>}
                  {c.appStatus === 'rejected' && <Badge color={C.red} dim={C.redDim}>Rejected</Badge>}
                </div>
                <div style={{ color: C.gray600, fontSize: 12 }}>{c.title} · {c.location} · {c.experience_level} · Target {c.salary_label}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                  {(c.skills ?? []).slice(0, 4).map(s => <span key={s} style={{ fontSize: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', color: C.gray600 }}>{s}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', border: `2.5px solid ${matchColor(c.total_score)}`, background: matchDim(c.total_score), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: matchColor(c.total_score), lineHeight: 1 }}>{c.total_score}%</div>
                  <div style={{ fontSize: 8, color: matchColor(c.total_score), fontWeight: 700 }}>{matchLabel(c.total_score)}</div>
                </div>
                {c.appStatus !== 'rejected' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setFbFor(c); }} style={{ background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Pass</button>
                    <button onClick={e => { e.stopPropagation(); act(c.seeker_id, 'shortlisted'); }} style={{ background: C.greenDim, border: `1px solid ${C.green}44`, color: C.green, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Shortlist</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {visible.length === 0 && <div style={{ textAlign: 'center', padding: '44px 0', color: C.gray400, fontSize: 13 }}>No candidates in this filter.</div>}
        </div>
      </div>

      {/* Candidate detail drawer */}
      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,45,58,.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }} onClick={() => setSel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: '16px 16px 0 0', border: `1px solid ${C.border}`, padding: '24px 22px 32px', width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: C.teal }}>{sel.name.split(' ').map(n => n[0]).join('')}</div>
                <div><h2 style={{ fontSize: 17, fontWeight: 800, color: C.slate, margin: '0 0 1px' }}>{sel.name}</h2><p style={{ color: C.gray600, margin: 0, fontSize: 12 }}>{sel.title} · {sel.location}</p></div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: C.gray400, fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            {sel.video_url && (
              <div style={{ background: C.bg, borderRadius: 9, padding: 16, textAlign: 'center', marginBottom: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 28, marginBottom: 5 }}>▶️</div>
                <p style={{ color: C.slate, fontWeight: 600, fontSize: 13, margin: '0 0 6px' }}>Video intro available</p>
                <a href={sel.video_url} target="_blank" rel="noreferrer" style={{ color: C.teal, fontSize: 12, fontWeight: 600 }}>Watch video →</a>
              </div>
            )}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: matchDim(sel.total_score), border: `1.5px solid ${matchColor(sel.total_score)}44`, borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: matchColor(sel.total_score) }}>{sel.total_score}%</span>
              <div><div style={{ fontWeight: 700, color: matchColor(sel.total_score), fontSize: 12 }}>{matchLabel(sel.total_score)} match</div><div style={{ fontSize: 10, color: C.gray600 }}>for this role</div></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Dimension scores</p>
              {([['Skills', sel.score_skills], ['Salary', sel.score_salary], ['Experience', sel.score_experience], ['Location', sel.score_location], ['Industry', sel.score_industry]] as [string, number][]).map(([dim, pct]) => (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.gray600, width: 90, flexShrink: 0 }}>{dim}</span>
                  <div style={{ flex: 1, height: 4, background: C.gray100, borderRadius: 2 }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: matchColor(pct) }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: matchColor(pct), width: 27, textAlign: 'right' }}>{pct}%</span>
                </div>
              ))}
            </div>
            {sel.appStatus !== 'rejected' && (
              <div style={{ display: 'flex', gap: 7 }}>
                <button onClick={() => { setFbFor(sel); setSel(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 7, background: 'none', border: `1.5px solid ${C.border}`, color: C.gray600, fontWeight: 600, cursor: 'pointer', fontFamily: F, fontSize: 13 }}>Pass with feedback</button>
                <PBtn onClick={() => act(sel.seeker_id, 'shortlisted')} style={{ flex: 2 }} disabled={acting}>Shortlist →</PBtn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {fbFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,45,58,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 14, padding: '26px 22px', width: '100%', maxWidth: 400, fontFamily: F }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.slate, margin: '0 0 5px' }}>Pass on {fbFor.name}</h3>
            <p style={{ color: C.gray600, fontSize: 12, margin: '0 0 14px' }}>This feedback is shared with the candidate to help them improve.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {FB_OPTIONS.map(o => (
                <button key={o} onClick={() => setFbText(o)} style={{ background: fbText === o ? C.tealDim : C.bg, border: `1.5px solid ${fbText === o ? C.teal : C.border}`, borderRadius: 7, padding: '8px 11px', color: fbText === o ? C.teal : C.gray600, fontWeight: fbText === o ? 600 : 400, fontSize: 12, cursor: 'pointer', textAlign: 'left', fontFamily: F }}>{o}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <GBtn onClick={() => { setFbFor(null); setFbText(''); }} style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>Cancel</GBtn>
              <PBtn onClick={() => act(fbFor.seeker_id, 'rejected', fbText)} style={{ flex: 2 }} disabled={!fbText || acting}>Send & pass</PBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

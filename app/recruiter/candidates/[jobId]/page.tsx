'use client';
import { useState, useEffect, useMemo } from 'react';
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

type FeedbackAddon = { name: string; price: string; icon: string; desc: string };

type FeedbackReason = {
  id: string;
  label: string;
  candidateLabel: string;
  detail: string | null;
  detailPlaceholder?: string;
  addon: FeedbackAddon;
  encourageNotes: boolean;
};

const FEEDBACK_REASONS: FeedbackReason[] = [
  {
    id: 'skills',
    label: "Skills don't match the role",
    candidateLabel: "Your skills weren't the right fit for this role.",
    detail: 'Which specific skills were missing? (optional but helps the candidate improve)',
    detailPlaceholder: 'e.g. We needed someone with hands-on Salesforce experience, SQL proficiency...',
    addon: { name: 'Skill Gap Report', price: '$9.99', icon: '🔍', desc: 'A detailed breakdown of which skills are getting you passed on and what roles you\'d score higher on.' },
    encourageNotes: true,
  },
  {
    id: 'salary',
    label: 'Salary expectations are above our range',
    candidateLabel: "Your salary expectations didn't align with this role's compensation.",
    detail: 'Any context you\'d like to share? (optional)',
    detailPlaceholder: 'e.g. Our range for this role is $90–110k base...',
    addon: { name: 'Salary Benchmarking Report', price: '$4.99', icon: '💰', desc: 'See where your salary expectations sit vs. market rates for your title, experience, and location.' },
    encourageNotes: false,
  },
  {
    id: 'experience',
    label: 'Not enough experience for this level',
    candidateLabel: 'We were looking for someone with more experience for this particular role.',
    detail: 'What experience level were you looking for? (optional)',
    detailPlaceholder: 'e.g. We need someone with 7+ years in B2B SaaS sales specifically...',
    addon: { name: 'Profile Boost', price: '$4.99', icon: '🚀', desc: 'Move to the top of recruiter search results for 48 hours while you build toward stronger matches.' },
    encourageNotes: true,
  },
  {
    id: 'education',
    label: "Education background doesn't meet our requirements",
    candidateLabel: "Your educational background wasn't the right fit for this role's requirements.",
    detail: 'What was the specific requirement? (optional)',
    detailPlaceholder: 'e.g. This role requires a CPA or active pursuit of CPA designation...',
    addon: { name: 'Profile & Resume Review', price: '$79', icon: '📄', desc: 'A human recruiter reviews your full profile and gives written recommendations on how to position your background.' },
    encourageNotes: true,
  },
  {
    id: 'culture',
    label: 'Work style or culture fit concerns',
    candidateLabel: "Based on your profile, we felt your work style or preferences weren't the right fit for our team.",
    detail: 'Any context that would help them? (optional — keep it constructive)',
    detailPlaceholder: "e.g. We're a very fast-paced, high-autonomy team and the candidate indicated a preference for structured environments...",
    addon: { name: 'Personality & Culture Coaching', price: '$79', icon: '🧠', desc: 'A coach reviews your behavioral answers and gives honest feedback on how your responses are coming across to employers.' },
    encourageNotes: true,
  },
  {
    id: 'location',
    label: 'Location or availability doesn\'t work',
    candidateLabel: "Location or availability requirements for this role didn't align with your profile.",
    detail: null,
    addon: { name: 'Profile Boost', price: '$4.99', icon: '🚀', desc: 'Boost your visibility with recruiters who do match your location and availability preferences.' },
    encourageNotes: false,
  },
  {
    id: 'overqualified',
    label: 'Candidate appears overqualified',
    candidateLabel: 'Based on your background, we felt this role might not be the right fit for your experience level.',
    detail: 'Any context you\'d like to share? (optional)',
    detailPlaceholder: 'e.g. This is a junior-level role and we want to find someone who can grow into it...',
    addon: { name: 'Match Score Audit', price: '$14.99', icon: '📊', desc: 'A review of why your profile is scoring on roles that may be below your level, with suggestions to refine your preferences.' },
    encourageNotes: true,
  },
  {
    id: 'filled',
    label: 'Role has been filled',
    candidateLabel: "This role has been filled. Your profile is still active and we'll continue matching you to other opportunities.",
    detail: null,
    addon: { name: 'Profile Boost', price: '$4.99', icon: '🚀', desc: 'Boost your visibility to recruiters with similar open roles.' },
    encourageNotes: false,
  },
  {
    id: 'video',
    label: "Video intro wasn't strong enough",
    candidateLabel: "We reviewed your video intro and felt it didn't give us enough to move forward.",
    detail: 'Any constructive notes? (optional but very helpful)',
    detailPlaceholder: 'e.g. The audio quality made it hard to hear. Try to be more specific about what you\'ve built or accomplished...',
    addon: { name: 'Video Review', price: '$49', icon: '🎥', desc: 'A recruiter watches your video intro and gives actionable feedback on delivery, content, and first impression.' },
    encourageNotes: true,
  },
  {
    id: 'other',
    label: 'Other reason',
    candidateLabel: 'The recruiter passed on your application for this role.',
    detail: 'Please share any context you\'re comfortable providing (optional)',
    detailPlaceholder: 'e.g. We went with an internal candidate, the role scope changed...',
    addon: { name: 'Unlock Full Feedback', price: '$2.99', icon: '💬', desc: "See the recruiter's specific notes and any additional context they shared." },
    encourageNotes: true,
  },
];

export default function RecCandidates() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const supabase = useMemo(() => createClient(), []);

  const [jobTitle, setJobTitle] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sel, setSel] = useState<Candidate | null>(null);
  const [acting, setActing] = useState(false);

  // Feedback flow state
  const [fbFor, setFbFor] = useState<Candidate | null>(null);
  const [fbStep, setFbStep] = useState<'form' | 'confirmed'>('form');
  const [fbReasonId, setFbReasonId] = useState<string | null>(null);
  const [fbNotes, setFbNotes] = useState('');
  const [shareNotes, setShareNotes] = useState(true);
  const [fbError, setFbError] = useState(false);

  const fbReason = FEEDBACK_REASONS.find(r => r.id === fbReasonId) ?? null;

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

  async function shortlist(seekerId: string) {
    setActing(true);
    await supabase.from('applications').upsert(
      { job_id: jobId, seeker_id: seekerId, status: 'shortlisted' },
      { onConflict: 'job_id,seeker_id' }
    );
    await supabase.from('notifications').insert({
      user_id: seekerId, type: 'shortlist',
      text: `You've been shortlisted for ${jobTitle}!`,
      metadata: { job_id: jobId },
    });
    // Send shortlisted email (non-blocking)
    fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'seeker-shortlisted', seekerId, jobId }) });
    setCandidates(prev => prev.map(c => c.seeker_id === seekerId ? { ...c, appStatus: 'shortlisted' } : c));
    setSel(null);
    setActing(false);
  }

  async function submitFeedback() {
    if (!fbFor || !fbReason) { setFbError(true); return; }
    setActing(true);
    const notesValue = fbReason.detail && shareNotes ? fbNotes : null;

    await supabase.from('applications').upsert({
      job_id: jobId,
      seeker_id: fbFor.seeker_id,
      status: 'rejected',
      feedback: fbReason.label,
      feedback_reason: fbReason.id,
      feedback_notes: notesValue,
      share_notes: shareNotes,
      addon_offered: fbReason.addon.name,
    }, { onConflict: 'job_id,seeker_id' });

    await supabase.from('notifications').insert({
      user_id: fbFor.seeker_id,
      type: 'feedback',
      text: `You received feedback on your application for ${jobTitle}.`,
      metadata: {
        job_id: jobId,
        feedback_reason: fbReason.id,
        feedback_label: fbReason.label,
        addon_name: fbReason.addon.name,
        addon_price: fbReason.addon.price,
        addon_icon: fbReason.addon.icon,
        addon_desc: fbReason.addon.desc,
      },
    });

    // Send feedback email (non-blocking)
    fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'seeker-feedback', seekerId: fbFor.seeker_id, jobId, feedbackReason: fbReason.label }) });
    setCandidates(prev => prev.map(c =>
      c.seeker_id === fbFor.seeker_id ? { ...c, appStatus: 'rejected', feedback: fbReason.label } : c
    ));
    setFbStep('confirmed');
    setActing(false);
  }

  function closeFeedback() {
    setFbFor(null);
    setFbStep('form');
    setFbReasonId(null);
    setFbNotes('');
    setShareNotes(true);
    setFbError(false);
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
                    <button onClick={e => { e.stopPropagation(); setFbFor(c); setFbStep('form'); }} style={{ background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Pass</button>
                    <button onClick={e => { e.stopPropagation(); shortlist(c.seeker_id); }} style={{ background: C.greenDim, border: `1px solid ${C.green}44`, color: C.green, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Shortlist</button>
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
                <button onClick={() => { setFbFor(sel); setFbStep('form'); setSel(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 7, background: 'none', border: `1.5px solid ${C.border}`, color: C.gray600, fontWeight: 600, cursor: 'pointer', fontFamily: F, fontSize: 13 }}>Pass with feedback</button>
                <PBtn onClick={() => shortlist(sel.seeker_id)} style={{ flex: 2 }} disabled={acting}>Shortlist →</PBtn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback modal — full flow */}
      {fbFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,45,58,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 480, fontFamily: F, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Step 1: reason form */}
            {fbStep === 'form' && (
              <div style={{ padding: '26px 22px' }}>
                {/* Candidate mini-card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: C.teal, flexShrink: 0 }}>
                    {fbFor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.slate }}>{fbFor.name}</div>
                    <div style={{ fontSize: 12, color: C.gray600 }}>{fbFor.title} · {fbFor.location} · Target {fbFor.salary_label}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${matchColor(fbFor.total_score)}`, background: matchDim(fbFor.total_score), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: matchColor(fbFor.total_score), lineHeight: 1 }}>{fbFor.total_score}%</div>
                  </div>
                </div>

                {/* Required notice */}
                <div style={{ background: C.redDim, border: `1px solid ${C.red}22`, borderRadius: 8, padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontSize: 12, color: C.red, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    A reason is required. This feedback is shared anonymously with the candidate and helps them improve.
                  </p>
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: C.slate, marginBottom: 12 }}>
                  Why are you passing on {fbFor.name.split(' ')[0]}?
                </div>

                {/* Reason options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {FEEDBACK_REASONS.map(r => (
                    <button key={r.id} onClick={() => { setFbReasonId(r.id); setFbError(false); setFbNotes(''); }}
                      style={{ background: fbReasonId === r.id ? C.tealDim : C.bg, border: `1.5px solid ${fbReasonId === r.id ? C.teal : C.border}`, borderRadius: 7, padding: '10px 13px', color: fbReasonId === r.id ? C.teal : C.gray800, fontWeight: fbReasonId === r.id ? 700 : 400, fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
                      {r.label}
                    </button>
                  ))}
                </div>

                {fbError && <p style={{ color: C.red, fontSize: 12, margin: '0 0 12px' }}>Please select a reason before submitting.</p>}

                {/* Optional notes */}
                {fbReason?.detail && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ borderTop: `1px solid ${C.border}`, margin: '4px 0 14px' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 6 }}>
                      {fbReason.detail}
                      {fbReason.encourageNotes && (
                        <span style={{ fontSize: 10, color: C.amber, fontWeight: 600, background: C.amberDim, padding: '2px 7px', borderRadius: 8, marginLeft: 8 }}>Recommended</span>
                      )}
                    </div>
                    <textarea value={fbNotes} onChange={e => setFbNotes(e.target.value)} placeholder={fbReason.detailPlaceholder} rows={3}
                      style={{ width: '100%', padding: '10px 13px', borderRadius: 8, background: C.bg, border: `1.5px solid ${C.border}`, color: C.slate, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: F, resize: 'vertical', lineHeight: 1.55 }} />
                    {fbNotes.length > 0 && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={shareNotes} onChange={e => setShareNotes(e.target.checked)} style={{ accentColor: C.teal }} />
                        <span style={{ fontSize: 12, color: C.gray600 }}>Share these notes with {fbFor.name.split(' ')[0]} (sent anonymously)</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Preview of what candidate sees */}
                {fbReason && (
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: '12px 14px', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                      What {fbFor.name.split(' ')[0]} will see
                    </div>
                    <p style={{ fontSize: 12, color: C.slate, margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>"{fbReason.candidateLabel}"</p>
                    {fbNotes && shareNotes && (
                      <p style={{ fontSize: 12, color: C.gray600, margin: '6px 0 0', lineHeight: 1.55, fontStyle: 'italic' }}>Additional context: "{fbNotes}"</p>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 7 }}>
                  <GBtn onClick={closeFeedback} style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>Cancel</GBtn>
                  <button onClick={submitFeedback} disabled={acting}
                    style={{ flex: 2, padding: '11px 0', borderRadius: 8, background: C.red, color: C.white, border: 'none', fontWeight: 700, fontSize: 13, cursor: acting ? 'not-allowed' : 'pointer', fontFamily: F, opacity: acting ? 0.7 : 1 }}>
                    {acting ? 'Sending…' : 'Confirm pass & send feedback →'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: C.gray400, textAlign: 'center', margin: '8px 0 0' }}>This action is final. The candidate will be notified.</p>
              </div>
            )}

            {/* Step 2: confirmation + addon preview */}
            {fbStep === 'confirmed' && fbReason && (
              <div style={{ padding: '26px 22px' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: C.slate, margin: '0 0 5px', letterSpacing: -0.3 }}>Feedback sent.</h3>
                  <p style={{ fontSize: 13, color: C.gray600, margin: 0, lineHeight: 1.6 }}>{fbFor.name} has been notified. Your feedback was sent anonymously.</p>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, margin: '0 0 16px' }} />

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>What you sent</div>
                  <div style={{ fontSize: 13, color: C.slate, fontWeight: 600, marginBottom: 3 }}>{fbReason.label}</div>
                  {fbNotes && shareNotes && <p style={{ fontSize: 12, color: C.gray600, margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>"{fbNotes}"</p>}
                </div>

                {/* Addon preview */}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    What {fbFor.name.split(' ')[0]} sees next
                  </div>
                  <p style={{ fontSize: 12, color: C.gray600, margin: '0 0 12px', lineHeight: 1.55 }}>
                    Based on your reason, {fbFor.name.split(' ')[0]} will be offered this add-on:
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{fbReason.addon.icon}</span>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.slate }}>{fbReason.addon.name}</div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: C.teal, marginLeft: 8 }}>{fbReason.addon.price}</div>
                      </div>
                      <div style={{ fontSize: 12, color: C.gray600, lineHeight: 1.5 }}>{fbReason.addon.desc}</div>
                    </div>
                  </div>
                </div>

                <button onClick={closeFeedback} style={{ width: '100%', padding: '11px 0', borderRadius: 8, background: C.teal, color: C.white, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>
                  Back to candidate list →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

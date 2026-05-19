'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { SKILLS_ALL, INDS_ALL, WEIGHT_LABELS, WEIGHT_LEVEL_LABELS } from '@/lib/constants';
import { C, F, Card, Pill, FField, FLabel, PBtn, GBtn, Spinner } from '@/components/ui';

const STEPS = ['Role details', 'Requirements', 'Scoring weights', 'Review & post'];

type Draft = {
  title: string; industry: string; location: string; remote: string;
  salaryMin: string; salaryMax: string; exp: string; description: string; skills: string[];
  weights: Record<string, number>;
};

const DEFAULT_WEIGHTS: Record<string, number> = { skills: 3, salary: 3, experience: 3, personality: 2, location: 2, industry: 2, work_style: 2, availability: 1 };

export default function RecPost() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [d, setD] = useState<Draft>({ title: '', industry: '', location: '', remote: '', salaryMin: '', salaryMax: '', exp: '', description: '', skills: [], weights: { ...DEFAULT_WEIGHTS } });

  const tog = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  async function publish() {
    if (!profile) return;
    setPublishing(true);

    const { data: job, error } = await supabase.from('jobs').insert({
      recruiter_id: profile.id,
      title: d.title,
      industry: d.industry || null,
      location: d.location || null,
      remote_policy: d.remote || null,
      salary_min: d.salaryMin ? parseInt(d.salaryMin) : null,
      salary_max: d.salaryMax ? parseInt(d.salaryMax) : null,
      experience_level: d.exp || null,
      required_skills: d.skills,
      description: d.description || null,
      weight_skills:       d.weights.skills,
      weight_salary:       d.weights.salary,
      weight_experience:   d.weights.experience,
      weight_personality:  d.weights.personality,
      weight_location:     d.weights.location,
      weight_industry:     d.weights.industry,
      weight_work_style:   d.weights.work_style,
      weight_availability: d.weights.availability,
    }).select('id').single();

    if (error || !job) { setPublishing(false); alert('Error posting job: ' + (error?.message ?? 'Unknown')); return; }

    // Fire match scoring in background — don't await so we don't block the redirect
    fetch('/api/match-scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: job.id }) });

    router.push('/recruiter/jobs');
  }

  if (loading) return <Spinner />;

  const salaryDisplay = d.salaryMin && d.salaryMax ? `$${Math.round(+d.salaryMin / 1000)}k–$${Math.round(+d.salaryMax / 1000)}k` : '—';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '32px 16px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 4px' }}>{step + 1} of {STEPS.length} — {STEPS[step]}</p>
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.teal : C.gray100, transition: 'background .3s' }} />)}
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: 0, letterSpacing: -0.5 }}>{['Tell us about the role', 'What are you looking for?', 'Weight your priorities', 'Review & go live'][step]}</h2>
        </div>

        <Card style={{ marginBottom: 12 }}>
          {step === 0 && (
            <>
              <FField label="Job title" value={d.title} onChange={v => setD(x => ({ ...x, title: v }))} placeholder="e.g. Senior Product Manager" />
              <div style={{ marginBottom: 12 }}><FLabel>Industry</FLabel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>{INDS_ALL.slice(0, 8).map(o => <Pill key={o} active={d.industry === o} onClick={() => setD(x => ({ ...x, industry: o }))}>{o}</Pill>)}</div></div>
              <FField label="Location" value={d.location} onChange={v => setD(x => ({ ...x, location: v }))} placeholder="e.g. Chicago, IL" />
              <div style={{ marginBottom: 12 }}><FLabel>Remote policy</FLabel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>{['Remote only', 'Hybrid', 'On-site'].map(o => <Pill key={o} active={d.remote === o} onClick={() => setD(x => ({ ...x, remote: o }))}>{o}</Pill>)}</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <FField label="Salary min (USD)" value={d.salaryMin} onChange={v => setD(x => ({ ...x, salaryMin: v }))} placeholder="e.g. 120000" type="number" />
                <FField label="Salary max (USD)" value={d.salaryMax} onChange={v => setD(x => ({ ...x, salaryMax: v }))} placeholder="e.g. 160000" type="number" />
              </div>
              <div><FLabel>Required experience</FLabel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>{['0–2 yrs', '3–5 yrs', '5–8 yrs', '8+ yrs'].map(o => <Pill key={o} active={d.exp === o} onClick={() => setD(x => ({ ...x, exp: o }))}>{o}</Pill>)}</div></div>
            </>
          )}

          {step === 1 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <FLabel>Required skills (up to 8)</FLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                  {SKILLS_ALL.map(s => <Pill key={s} active={d.skills.includes(s)} onClick={() => { if (!d.skills.includes(s) && d.skills.length >= 8) return; setD(x => ({ ...x, skills: tog(x.skills, s) })); }}>{s}</Pill>)}
                </div>
                <p style={{ fontSize: 11, color: C.gray400, margin: '6px 0 0' }}>{d.skills.length}/8 selected</p>
              </div>
              <FField label="Job description" value={d.description} onChange={v => setD(x => ({ ...x, description: v }))} placeholder="Describe the role, team, and responsibilities…" rows={5} />
            </>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: C.gray600, fontSize: 13, margin: '0 0 16px', lineHeight: 1.55 }}>Set how much each of the 8 dimensions affects candidate match scores. Higher weight = more influence.</p>
              {Object.entries(WEIGHT_LABELS).map(([k, label]) => (
                <div key={k} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <FLabel>{label}</FLabel>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{WEIGHT_LEVEL_LABELS[(d.weights[k] ?? 3) - 1]}</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} value={d.weights[k] ?? 3} onChange={e => setD(x => ({ ...x, weights: { ...x.weights, [k]: +e.target.value } }))} style={{ width: '100%', accentColor: C.teal }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.gray400, marginTop: 2 }}><span>Low</span><span>Critical</span></div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              {[['Job title', d.title || '—'], ['Industry', d.industry || '—'], ['Location', d.location || '—'], ['Remote policy', d.remote || '—'], ['Salary', salaryDisplay], ['Experience', d.exp || '—'], ['Required skills', d.skills.join(', ') || '—']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '9px 0' }}>
                  <span style={{ fontSize: 13, color: C.gray600, width: 140 }}>{l}</span>
                  <span style={{ fontSize: 13, color: C.slate, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: 12, background: C.tealDim, borderRadius: 7, border: `1px solid ${C.tealBorder}` }}>
                <p style={{ fontSize: 13, color: C.teal, fontWeight: 600, margin: 0 }}>✓ Once posted, all eligible seekers will be ranked automatically.</p>
              </div>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', gap: 9 }}>
          {step > 0 && <GBtn onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Back</GBtn>}
          <PBtn onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : publish} style={{ flex: 2 }} disabled={publishing}>
            {publishing ? 'Publishing…' : step < STEPS.length - 1 ? 'Continue →' : 'Post job & go live'}
          </PBtn>
        </div>
      </div>
    </div>
  );
}

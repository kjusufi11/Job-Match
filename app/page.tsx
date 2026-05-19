import Link from 'next/link';
import { C, F, Card, PBtn } from '@/components/ui';

const steps = [
  { icon: '📝', n: 1, t: 'One profile, forever', d: 'Enter your skills, experience, salary, and personality once. Never fill out another job application form.' },
  { icon: '🎯', n: 2, t: 'Ranked matches, automatically', d: 'Our scoring engine matches you across 8 dimensions of fit. You see a percentage, not just a title.' },
  { icon: '🎥', n: 3, t: 'Show your personality', d: 'Record a 2-minute video intro. Recruiters see the real you before the first call — 4× more callbacks.' },
  { icon: '📬', n: 4, t: 'Track every step', d: 'Know exactly where you stand — match score, status, and recruiter feedback in one clean place.' },
];

export default function Landing() {
  return (
    <div style={{ fontFamily: F, background: C.bg }}>
      {/* Hero */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 24, fontSize: 13, color: C.teal, fontWeight: 700 }}>✦ Built for job seekers — free, always</div>
        <h1 style={{ fontSize: 'clamp(34px,6vw,64px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 720, margin: '0 auto 18px', color: C.slate }}>
          Find the job that{' '}
          <span style={{ color: C.teal, borderBottom: `4px solid ${C.teal}`, paddingBottom: 2 }}>actually fits you</span>
        </h1>
        <p style={{ fontSize: 17, color: C.gray600, maxWidth: 460, margin: '0 auto 34px', lineHeight: 1.65 }}>
          Build your profile once. Get matched to roles based on skills, personality, salary, and culture — not just keywords.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <PBtn style={{ padding: '13px 26px', fontSize: 15 }}>Create free profile →</PBtn>
          </Link>
          <Link href="/pricing">
            <button style={{ padding: '13px 20px', fontSize: 15, borderRadius: 8, background: 'none', border: `1.5px solid ${C.teal}`, color: C.teal, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>See recruiter plans</button>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 52, borderTop: `1px solid ${C.border}`, paddingTop: 36, flexWrap: 'wrap' }}>
          {[['83%', 'Faster than job boards'], ['4.7×', 'More likely to get an interview'], ['Free', 'For job seekers, forever']].map(([v, l], i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 36px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.teal, letterSpacing: -1 }}>{v}</div>
              <div style={{ fontSize: 13, color: C.gray600, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '64px 24px', maxWidth: 1020, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.slate, letterSpacing: -1, margin: '0 0 8px' }}>How Matcht works</h2>
          <p style={{ color: C.gray600, fontSize: 15, margin: 0 }}>Designed so you never start from scratch again.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
          {steps.map(s => (
            <Card key={s.n}>
              <div style={{ fontSize: 24, marginBottom: 9 }}>{s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.teal, textTransform: 'uppercase', marginBottom: 5 }}>Step {s.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.slate, margin: '0 0 6px' }}>{s.t}</h3>
              <p style={{ color: C.gray600, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA split */}
      <div style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: C.teal, borderRadius: 14, padding: '40px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>For job seekers</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: '0 0 10px', lineHeight: 1.2 }}>Find your fit. Free, forever.</h3>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>Build one profile. Get automatically matched to roles that fit your skills, salary, and personality.</p>
            <Link href="/signup">
              <button style={{ background: C.white, color: C.teal, border: 'none', borderRadius: 7, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: F }}>Create free profile →</button>
            </Link>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '40px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>For recruiters</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.slate, margin: '0 0 10px', lineHeight: 1.2 }}>Find ranked candidates, fast.</h3>
            <p style={{ color: C.gray600, fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>Post a job and get a ranked list of pre-scored candidates with video intros and personality data built in.</p>
            <Link href="/pricing">
              <button style={{ background: C.teal, color: C.white, border: 'none', borderRadius: 7, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>See recruiter plans →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

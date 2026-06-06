'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { C, F } from '@/components/ui';

const FEATURES = [
  'Unlimited job posts',
  'Ranked candidate matches — scored across 8 dimensions',
  'Full contact info revealed when you express interest',
  'Real-time email alerts for new strong matches',
  'Anonymous candidate profiles until you shortlist',
  'Candidate pipeline dashboard with accept / pass tracking',
];

export default function Pricing() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const isActive =
    profile?.subscription_status === 'active' ||
    profile?.subscription_status === 'trialing';

  async function startTrial() {
    if (!user) { router.push('/login?next=/pricing'); return; }
    setStarting(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not open checkout');
      window.location.href = json.url;
    } catch (e: any) {
      setError(e.message);
      setStarting(false);
    }
  }

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', fontFamily: F,
      padding: '56px 16px 80px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 560, marginBottom: 44 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: 1.6, marginBottom: 10 }}>
          Recruiter Plan
        </div>
        <h1 style={{ margin: '0 0 14px', fontSize: 36, fontWeight: 900, color: C.slate, letterSpacing: -1, lineHeight: 1.1 }}>
          Find the right candidate,<br />not just any candidate.
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: C.gray600, lineHeight: 1.65 }}>
          Matcht scores every applicant across 8 dimensions and surfaces your best matches automatically — so you spend time interviewing, not screening.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: C.white, borderRadius: 20,
        border: `2px solid ${C.teal}`,
        padding: '40px 44px', width: '100%', maxWidth: 440,
        boxShadow: '0 4px 40px rgba(26,140,140,0.10)',
      }}>
        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2, marginBottom: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.slate, marginTop: 10 }}>$</span>
            <span style={{ fontSize: 64, fontWeight: 900, color: C.slate, lineHeight: 1, letterSpacing: -2 }}>299</span>
            <span style={{ fontSize: 15, color: C.gray400, alignSelf: 'flex-end', marginBottom: 8 }}>/month</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>
            14-day free trial included
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
          {FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: C.greenDim, border: `1.5px solid ${C.green}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <span style={{ color: C.green, fontSize: 10, fontWeight: 800 }}>✓</span>
              </div>
              <span style={{ fontSize: 14, color: C.slate, lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isActive ? (
          <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 10 }}>
              You have an active plan
            </div>
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              style={{ padding: '9px 22px', borderRadius: 8, background: C.green, color: C.white, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}
            >
              Go to dashboard →
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={startTrial}
              disabled={starting || loading}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 10,
                background: starting ? C.tealDim : C.teal,
                color: starting ? C.teal : C.white,
                border: `1.5px solid ${C.teal}`,
                fontWeight: 800, fontSize: 15,
                cursor: starting ? 'default' : 'pointer',
                fontFamily: F, transition: 'all .15s',
              }}
            >
              {starting ? 'Opening checkout…' : 'Start free trial →'}
            </button>
            {error && (
              <div style={{ marginTop: 10, fontSize: 13, color: C.red, textAlign: 'center' }}>{error}</div>
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: C.gray400, textAlign: 'center', lineHeight: 1.6 }}>
              14 days free. Then $299/month. Cancel anytime.
            </div>
          </>
        )}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 440, width: '100%', marginTop: 40 }}>
        {([
          ['Do I need a credit card to start?', "Stripe may ask for one to hold on file, but you won't be charged until your 14-day trial ends. Cancel any time before then — no cost."],
          ['Can I cancel during the trial?', 'Yes. Cancel any time from your account and you\'ll never be billed.'],
          ['How many jobs can I post?', 'Unlimited. Post as many roles as you need, no per-job fees.'],
          ['Job seekers cost anything?', 'Never. Matcht is free for job seekers — that\'s a core principle.'],
        ] as [string, string][]).map(([q, a]) => (
          <div key={q} style={{ borderTop: `1px solid ${C.border}`, padding: '16px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.slate, marginBottom: 5 }}>{q}</div>
            <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

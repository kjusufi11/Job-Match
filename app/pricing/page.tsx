'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, F, Card } from '@/components/ui';

const plans = [
  { name: 'Job Seeker', price: 0, aPrice: 0, badge: null, color: C.teal, features: ['Unlimited job matching', 'Match score per role', '4-step profile builder', 'Video intro upload', 'Application status tracking', 'Rejection feedback', '1 profile boost/month'], cta: 'Create free account', href: '/signup' },
  { name: 'Seeker Pro', price: 19.99, aPrice: 14.99, badge: 'Most popular', color: C.green, features: ['Everything in Free', 'See who viewed your profile', '5 profile boosts/month', 'Priority in recruiter search', 'Detailed match breakdown', 'Skill-gap recommendations', 'Early access to new roles'], cta: 'Start free trial', href: '/signup' },
  { name: 'Recruiter Starter', price: 99, aPrice: 79, badge: null, color: C.teal, features: ['5 active job postings', 'Unlimited candidate swipes', 'Ranked candidate list', 'Video profile access', 'Candidate messaging', 'Basic analytics', 'Accept/reject with feedback'], cta: 'Start free trial', href: '/signup' },
  { name: 'Recruiter Pro', price: 299, aPrice: 239, badge: 'Best value', color: C.purple, features: ['25 active job postings', 'Everything in Starter', 'Smart filters', 'Advanced analytics', 'Early access to top candidates', 'Company branding page', 'Priority support'], cta: 'Start free trial', href: '/signup' },
];

const addons = [
  { name: 'Profile Boost', price: '$4.99', desc: 'Move to top of recruiter search for 48 hrs' },
  { name: 'Resume Review', price: '$79', desc: 'Professional human review of your profile and video' },
  { name: 'Unlock Top Matches', price: '$9.99', desc: 'See which of your top 10 matches are hiring now' },
  { name: 'Featured Job Post', price: '$49', desc: 'Highlight your role to top-matching candidates' },
];

export default function Pricing() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ background: C.bg, fontFamily: F, minHeight: '100vh', padding: '56px 20px 72px' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.slate, letterSpacing: -1.5, margin: '0 0 10px' }}>Simple, transparent pricing</h1>
        <p style={{ color: C.gray600, fontSize: 15, margin: '0 0 24px' }}>Job seekers are always free. Recruiters pay for quality matches.</p>
        <div style={{ display: 'inline-flex', background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, gap: 3 }}>
          {['Monthly', 'Annual (save 20%)'].map((l, i) => (
            <button key={l} onClick={() => setAnnual(i === 1)} style={{ padding: '7px 16px', borderRadius: 7, background: annual === (i === 1) ? C.teal : 'none', color: annual === (i === 1) ? C.white : C.gray600, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, maxWidth: 980, margin: '0 auto 48px' }}>
        {plans.map(p => (
          <div key={p.name} style={{ background: C.white, borderRadius: 13, border: `2px solid ${p.badge ? p.color : C.border}`, padding: '26px 20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {p.badge && <div style={{ position: 'absolute', top: -1, right: 14, background: p.color, color: C.white, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: '0 0 7px 7px' }}>{p.badge}</div>}
            <div style={{ fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 5 }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 3 }}>
              <span style={{ fontSize: 33, fontWeight: 800, color: C.slate, letterSpacing: -1 }}>${annual ? p.aPrice : p.price}</span>
              {p.price > 0 && <span style={{ color: C.gray400, fontSize: 12 }}>/mo</span>}
            </div>
            {p.price === 0 && <div style={{ fontSize: 12, color: C.gray400, marginBottom: 10 }}>Free forever</div>}
            {annual && p.price > 0 && <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 10 }}>Save ${((p.price - p.aPrice) * 12).toFixed(0)}/yr</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 20px', flex: 1 }}>
              {p.features.map(f => <li key={f} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 8, fontSize: 12, color: C.gray800, lineHeight: 1.4 }}><span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</li>)}
            </ul>
            <button onClick={() => router.push(p.href)} style={{ width: '100%', padding: '10px 0', borderRadius: 7, background: p.badge ? p.color : C.tealDim, color: p.badge ? C.white : C.teal, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: F }}>{p.cta}</button>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: C.slate, textAlign: 'center', marginBottom: 16 }}>Add-ons & à la carte</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {addons.map(a => (
            <Card key={a.name} style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.slate }}>{a.name}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.teal }}>{a.price}</div>
              </div>
              <div style={{ fontSize: 12, color: C.gray600, marginTop: 4, lineHeight: 1.5 }}>{a.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

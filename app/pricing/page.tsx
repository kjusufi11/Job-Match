'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, F } from '@/components/ui';

function Divider() { return <div style={{ borderTop: `1px solid ${C.border}`, margin: '28px 0' }} />; }
function Check() { return <span style={{ color: C.green, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span>; }
function Dash() { return <span style={{ color: C.gray400, fontSize: 15, flexShrink: 0 }}>—</span>; }

type PlanFeature = [boolean, string];

type PlanCardProps = {
  name: string; price: number; annualPrice?: number; annual: boolean;
  badge?: string | null; badgeColor?: string; highlight?: boolean;
  sub?: string; features: PlanFeature[];
  cta: string; ctaSecondary?: string; note?: string;
  onCta: () => void; onCtaSecondary?: () => void;
};

function PlanCard({ name, price, annualPrice, annual, badge, badgeColor = C.teal, highlight, sub, features, cta, ctaSecondary, note, onCta, onCtaSecondary }: PlanCardProps) {
  const displayPrice = annual && annualPrice !== undefined ? annualPrice : price;
  const savings = annual && annualPrice !== undefined && price > 0 ? ((price - annualPrice) * 12).toFixed(0) : null;
  return (
    <div style={{
      background: C.white, borderRadius: 16,
      border: `2px solid ${highlight ? C.teal : C.border}`,
      padding: '28px 24px', position: 'relative',
      display: 'flex', flexDirection: 'column',
      boxShadow: highlight ? '0 4px 24px rgba(26,140,140,0.12)' : 'none',
    }}>
      {badge && <div style={{ position: 'absolute', top: -1, right: 18, background: badgeColor, color: C.white, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>{badge}</div>}
      <div style={{ fontSize: 12, fontWeight: 700, color: highlight ? C.teal : C.gray600, marginBottom: 6, fontFamily: F, textTransform: 'uppercase', letterSpacing: 1 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        {price === 0
          ? <span style={{ fontSize: 34, fontWeight: 800, color: C.slate, letterSpacing: -1, fontFamily: F }}>Free</span>
          : <><span style={{ fontSize: 34, fontWeight: 800, color: C.slate, letterSpacing: -1, fontFamily: F }}>${displayPrice}</span><span style={{ color: C.gray400, fontSize: 13, fontFamily: F }}>/mo</span></>}
      </div>
      {price === 0 && <div style={{ fontSize: 13, color: C.gray400, marginBottom: 4, fontFamily: F }}>Forever. No card needed.</div>}
      {savings && <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 4, fontFamily: F }}>Save ${savings}/yr with annual</div>}
      {sub && <div style={{ fontSize: 13, color: C.gray600, marginBottom: 16, lineHeight: 1.5, fontFamily: F }}>{sub}</div>}
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 20px', flex: 1 }}>
        {features.map(([check, label]) => (
          <li key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 9, fontSize: 13, color: C.gray800, lineHeight: 1.4, fontFamily: F }}>
            {check ? <Check /> : <Dash />} {label}
          </li>
        ))}
      </ul>
      <button onClick={onCta} style={{ width: '100%', padding: '11px 0', borderRadius: 8, background: highlight ? C.teal : C.tealDim, color: highlight ? C.white : C.teal, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: F }}>{cta}</button>
      {ctaSecondary && onCtaSecondary && (
        <button onClick={onCtaSecondary} style={{ width: '100%', padding: '9px 0', borderRadius: 8, background: 'none', color: C.gray600, border: `1.5px solid ${C.border}`, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F, marginTop: 8 }}>{ctaSecondary}</button>
      )}
      {note && <p style={{ fontSize: 11, color: C.gray400, textAlign: 'center', margin: '10px 0 0', fontFamily: F }}>{note}</p>}
    </div>
  );
}

type AddonCardProps = { icon: string; name: string; price: string; trigger?: string; desc: string; highlight?: boolean };

function AddonCard({ icon, name, price, trigger, desc, highlight }: AddonCardProps) {
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1.5px solid ${highlight ? C.teal : C.border}`, padding: '18px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, fontFamily: F }}>{name}</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, fontFamily: F, flexShrink: 0, marginLeft: 10 }}>{price}</div>
        </div>
        {trigger && <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, background: C.amberDim, padding: '2px 8px', borderRadius: 8, display: 'inline-block', marginBottom: 6, fontFamily: F }}>Triggered by: {trigger}</div>}
        <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.5, fontFamily: F }}>{desc}</div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [tab, setTab] = useState<'seeker' | 'recruiter'>('recruiter');

  // TODO: Replace router.push('/signup') with Stripe checkout session initiation
  function handleRecruiterCta(plan: string) {
    // TODO: Stripe — create checkout session for plan
    router.push('/signup');
  }
  function handleContactUs() {
    // TODO: wire to contact form or Calendly
    router.push('/contact');
  }
  function handleSeekerCta() {
    router.push('/signup');
  }

  const recruiterPlans: (Omit<PlanCardProps, 'annual' | 'onCta' | 'onCtaSecondary'>)[] = [
    {
      name: 'Starter', price: 99, annualPrice: 79,
      sub: 'For small teams and first-time users.',
      features: [
        [true, '5 active job postings'], [true, 'Unlimited candidate views'],
        [true, 'Ranked candidate list'], [true, 'Video profile access'],
        [true, 'Accept / pass with feedback'], [true, 'Basic match score breakdown'],
        [true, 'Email notifications'], [false, 'Smart filters'],
        [false, 'Advanced analytics'], [false, 'Company branding page'],
      ],
      cta: 'Start free trial', note: '14-day free trial. No card required.',
    },
    {
      name: 'Growth', price: 179, annualPrice: 139,
      sub: 'For growing teams hiring regularly.',
      badge: 'Most popular', highlight: true,
      features: [
        [true, '15 active job postings'], [true, 'Everything in Starter'],
        [true, 'Smart filters (skill, salary, location, exp)'], [true, 'Candidate messaging'],
        [true, 'Analytics dashboard'], [true, 'Scoring weight adjustments per role'],
        [true, 'Company branding page'], [false, 'Executive talent pool access'],
        [false, 'Multi-user / team seats'], [false, 'API access'],
      ],
      cta: 'Start free trial', note: '14-day free trial. No card required.',
    },
    {
      name: 'Pro', price: 299, annualPrice: 239,
      sub: 'For established orgs with volume hiring needs.',
      features: [
        [true, '25 active job postings'], [true, 'Everything in Growth'],
        [true, 'Early access to top-matching candidates'], [true, 'Priority candidate notifications'],
        [true, 'Advanced analytics + export'], [true, '3 team seats included'],
        [true, 'Dedicated onboarding support'], [false, 'Executive talent pool access'],
        [false, 'Unlimited team seats'], [false, 'API access'],
      ],
      cta: 'Start free trial', note: '14-day free trial. No card required.',
    },
    {
      name: 'Executive', price: 499, annualPrice: 399,
      sub: 'For VP+ and C-suite hiring. Separate, higher-quality talent pool.',
      badge: 'High-value roles', badgeColor: C.purple,
      features: [
        [true, '10 active executive postings'], [true, 'Access to executive candidate pool (VP+)'],
        [true, 'Everything in Pro'], [true, 'White-glove onboarding'],
        [true, 'Dedicated account manager'], [true, 'Candidate background verification add-on'],
        [true, '5 team seats included'], [false, 'Unlimited postings'],
        [false, 'Agency / multi-client management'],
      ],
      cta: 'Contact us', ctaSecondary: 'Start free trial',
    },
    {
      name: 'Agency', price: 1999, annualPrice: 1599,
      sub: 'For staffing agencies managing multiple clients and high-volume roles.',
      features: [
        [true, 'Unlimited active job postings'], [true, 'Multi-client management dashboard'],
        [true, 'Everything in Executive'], [true, 'Unlimited team seats'],
        [true, 'API access'], [true, 'White-label option'],
        [true, 'Dedicated support + SLA'], [true, 'Custom analytics reporting'],
        [true, 'Invoicing / net-30 payment terms'],
      ],
      cta: 'Contact us', note: 'Custom contract available.',
    },
  ];

  const seekerAddons: AddonCardProps[] = [
    { icon: '🔍', name: 'Skill Gap Report', price: '$9.99', trigger: "Skills don't match", highlight: true, desc: "A detailed breakdown of which skills are getting you passed on most, what roles you'd score higher on, and specific steps to close the gap." },
    { icon: '💰', name: 'Salary Benchmarking Report', price: '$4.99', trigger: 'Salary expectations too high', desc: 'See where your salary expectations sit vs. current market rates for your title, experience level, and location. Includes a recommended range.' },
    { icon: '📄', name: 'Profile & Resume Review', price: '$79', trigger: 'Education background / experience', desc: 'A human recruiter reviews your full profile, answers, and video intro. You get written feedback and specific recommendations within 48 hours.' },
    { icon: '🧠', name: 'Personality & Culture Coaching', price: '$79', trigger: 'Culture / work style mismatch', desc: 'A coach reviews your behavioral and personality answers and gives honest feedback on how your responses are coming across to employers — and how to adjust.' },
    { icon: '🚀', name: 'Profile Boost', price: '$4.99', trigger: 'Any rejection / low visibility', desc: 'Moves your profile to the top of recruiter search results for 48 hours. Useful when you\'re early in your job search or haven\'t been getting many views.' },
    { icon: '💬', name: 'Unlock Full Feedback', price: '$2.99', trigger: 'Any rejection', desc: "You always see the rejection category for free. Pay to unlock the recruiter's specific notes and any additional context they chose to share." },
    { icon: '🎥', name: 'Video Review', price: '$49', trigger: 'Multiple passes / low callback rate', desc: 'A recruiter watches your video intro and gives you actionable feedback on your delivery, content, and how to make a stronger first impression.' },
    { icon: '📊', name: 'Match Score Audit', price: '$14.99', trigger: 'Consistently low match scores', desc: 'A detailed review of why your profile is scoring low across specific dimensions, with a prioritized action plan to improve your overall match percentage.' },
  ];

  const recruiterAddons = [
    { icon: '✅', name: 'Candidate Background Verification', price: '$19.99/candidate', desc: 'Verify education, employment history, and credentials through our verification partner. Results in 24–48 hours.' },
    { icon: '📌', name: 'Featured Job Post', price: '$49/post', desc: 'Your role appears at the top of matched candidates\' job feed for 7 days, increasing visibility and application rate.' },
    { icon: '📈', name: 'Talent Market Report', price: '$99', desc: 'A snapshot of talent availability, salary benchmarks, and competition for a specific role and location. Useful before you post.' },
    { icon: '🎥', name: 'Video Screening Package', price: '$199/role', desc: 'We send your shortlisted candidates a structured set of role-specific video questions and deliver scored responses within 5 business days.' },
  ];

  return (
    <div style={{ fontFamily: F, background: C.bg, minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '56px 24px 40px' }}>
        <h1 style={{ fontSize: 'clamp(30px,5vw,48px)' as any, fontWeight: 800, color: C.slate, letterSpacing: -1.5, margin: '0 0 12px', fontFamily: F }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 17, color: C.gray600, margin: '0 0 28px', fontFamily: F, lineHeight: 1.6 }}>
          Job seekers are <strong style={{ color: C.teal }}>always free</strong>. Recruiters pay for quality matches.
        </p>

        {/* Tab toggle */}
        <div style={{ display: 'inline-flex', background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, gap: 4, marginBottom: 28 }}>
          {([['seeker', 'For Job Seekers'], ['recruiter', 'For Recruiters']] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)} style={{ padding: '9px 22px', borderRadius: 7, background: tab === k ? C.teal : 'none', color: tab === k ? C.white : C.gray600, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: F }}>{l}</button>
          ))}
        </div>

        {/* Annual toggle (recruiter only) */}
        {tab === 'recruiter' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: annual ? C.gray400 : C.slate, fontWeight: annual ? 400 : 600, fontFamily: F }}>Monthly</span>
            <div onClick={() => setAnnual(a => !a)} style={{ width: 44, height: 24, borderRadius: 12, background: annual ? C.teal : C.gray200, cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.white, position: 'absolute', top: 3, left: annual ? 23 : 3, transition: 'left .2s' }} />
            </div>
            <span style={{ fontSize: 14, color: annual ? C.slate : C.gray400, fontWeight: annual ? 600 : 400, fontFamily: F }}>Annual</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green, background: C.greenDim, padding: '3px 9px', borderRadius: 10, fontFamily: F }}>Save up to 20%</span>
          </div>
        )}
      </div>

      {/* SEEKER TAB */}
      {tab === 'seeker' && (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px' }}>
          {/* Free plan banner */}
          <div style={{ background: C.teal, borderRadius: 16, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontFamily: F }}>For job seekers</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: C.white, margin: '0 0 10px', letterSpacing: -0.5, fontFamily: F }}>Free. Forever. No exceptions.</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: 0, fontFamily: F, lineHeight: 1.6, maxWidth: 480 }}>
                Every feature that helps you find a job — profile, matching, notifications, feedback, dashboard — is completely free. No trial, no credit card, no catch.
              </p>
            </div>
            <button onClick={handleSeekerCta} style={{ background: C.white, color: C.teal, border: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>Create free profile →</button>
          </div>

          {/* What's included */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.slate, margin: '0 0 20px', letterSpacing: -0.3, fontFamily: F }}>Everything included — at no cost</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              {[
                ['🎯', 'Automatic job matching', 'Scored across 8 dimensions. You see ranked matches, not just job listings.'],
                ['📝', 'One profile, forever', 'Fill it out once. Never fill in another job application form again.'],
                ['🎥', 'Video intro upload', 'Record a 2–3 min intro. Candidates with video get 4× more callbacks.'],
                ['📊', 'Match score per role', 'See exactly how well you fit each job before you apply.'],
                ['💬', 'Rejection feedback', "Every time a recruiter passes on you, they're required to say why. You see it."],
                ['📬', 'Status tracking', 'Know exactly where you stand — viewed, shortlisted, passed, applied.'],
                ['🔔', 'Match notifications', 'Get notified when a new role matches your criteria. Weekly or monthly digest.'],
                ['⚙️', 'Profile editing', 'Update your profile anytime. Your match scores update automatically.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.slate, marginBottom: 4, fontFamily: F }}>{title}</div>
                    <div style={{ fontSize: 12, color: C.gray600, lineHeight: 1.5, fontFamily: F }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.slate, margin: '0 0 6px', letterSpacing: -0.3, fontFamily: F }}>Optional add-ons</h3>
              <p style={{ color: C.gray600, fontSize: 14, margin: 0, fontFamily: F, lineHeight: 1.6 }}>
                When recruiters pass on you, they're required to select a reason. We use that feedback to surface add-ons that are actually relevant to why you're not getting through — not generic upsells.
              </p>
            </div>
            <div style={{ background: C.amberDim, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: '13px 16px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{ fontSize: 13, color: C.amber, fontWeight: 600, margin: 0, fontFamily: F, lineHeight: 1.5 }}>
                Every rejection on Matcht includes a required reason from the recruiter. You always see the category for free. Add-ons unlock deeper insights and tools to act on that feedback.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {seekerAddons.map(a => <AddonCard key={a.name} {...a} />)}
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER TAB */}
      {tab === 'recruiter' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          {/* Plans grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 48 }}>
            {recruiterPlans.map(p => (
              <PlanCard
                key={p.name}
                {...p}
                annual={annual}
                onCta={() => p.cta === 'Contact us' ? handleContactUs() : handleRecruiterCta(p.name)}
                onCtaSecondary={p.ctaSecondary ? () => handleRecruiterCta(p.name) : undefined}
              />
            ))}
          </div>

          {/* Enterprise */}
          <div style={{ background: C.slate, borderRadius: 16, padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontFamily: F }}>Enterprise</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: '0 0 8px', fontFamily: F }}>Large-scale or custom needs?</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, fontFamily: F, lineHeight: 1.6, maxWidth: 480 }}>Full ATS integration, SSO, custom analytics, dedicated support, SLAs, and net-30 invoicing. Pricing based on volume and requirements.</p>
            </div>
            <button onClick={handleContactUs} style={{ background: C.teal, color: C.white, border: 'none', borderRadius: 9, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>Talk to us →</button>
          </div>

          {/* Recruiter add-ons */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.slate, margin: '0 0 6px', letterSpacing: -0.3, fontFamily: F }}>Recruiter add-ons</h3>
            <p style={{ color: C.gray600, fontSize: 14, margin: '0 0 16px', fontFamily: F }}>Available on any plan, à la carte.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              {recruiterAddons.map(a => (
                <div key={a.name} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 20 }}>{a.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.slate, fontFamily: F }}>{a.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 13, color: C.teal, fontFamily: F, flexShrink: 0, marginLeft: 8 }}>{a.price}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gray600, lineHeight: 1.5, fontFamily: F }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.slate, margin: '0 0 20px', letterSpacing: -0.3, fontFamily: F }}>Common questions</h3>
            {[
              ['Is the free trial really no credit card?', "Yes. You get 14 days on your chosen plan, no card required. We'll remind you before it ends."],
              ['Can I switch plans anytime?', 'Yes — upgrade or downgrade at any time. Downgrades take effect at your next billing cycle.'],
              ['What happens if I go over my job posting limit?', "We'll notify you and give you the option to upgrade or archive an existing role to make room."],
              ['Do candidates pay anything?', "Never. Job seekers are free forever. That's a core principle of how Matcht works."],
              ['Is recruiter feedback on candidates really required?', "Yes. When a recruiter passes on a candidate, they must select a reason. This isn't optional — it's how we maintain feedback quality and keep the platform valuable for job seekers."],
              ['What\'s the difference between Starter and Growth?', 'Mainly smart filters and analytics. Growth lets you filter candidates by specific attributes and see performance data across your roles. Starter is great for getting started but Growth is where most active hiring teams land.'],
              ['Do you offer discounts for nonprofits?', 'Yes — contact us for nonprofit and educational institution pricing.'],
            ].map(([q, a]) => (
              <div key={q} style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 0' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, marginBottom: 6, fontFamily: F }}>{q}</div>
                <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, fontFamily: F }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

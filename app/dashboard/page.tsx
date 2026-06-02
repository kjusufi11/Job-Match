'use client';
import { useEffect, useRef } from 'react';
import { useUser } from '@/app/providers';

const C = {
  bg:'#F0F4F7', white:'#FFFFFF', teal:'#1A8C8C', tealDim:'#1A8C8C12', tealBorder:'#1A8C8C35',
  slate:'#1E2D3A', gray400:'#8FAABB', gray600:'#4E6475', border:'#D4E3EC',
  green:'#19A87A', greenDim:'#19A87A14', greenBorder:'#19A87A40',
  amber:'#C9870C', amberDim:'#C9870C14', amberBorder:'#C9870C40',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

export default function Dashboard() {
  const { user, profile, loading } = useUser();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After 3 s with no user, redirect to login — never block the render on this
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
      return;
    }
    if (!user) {
      timerRef.current = setTimeout(() => {
        if (!user) window.location.href = '/login';
      }, 3000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  // Derive display values from whatever is available right now
  const rawName = profile?.name ?? (user?.email ?? '');
  const firstName = rawName.includes('@')
    ? rawName.split('@')[0]
    : (rawName.split(' ')[0] || rawName);
  const skills = Array.isArray(profile?.skills) ? (profile!.skills as string[]) : [];
  const isLive = !!profile?.profile_complete;
  const hasProfile = !!profile;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '32px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Greeting */}
        <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: C.slate, letterSpacing: -0.4 }}>
          Welcome back{firstName ? `, ${firstName}` : ''}.
        </h1>

        {/* Profile live / complete-your-profile banner */}
        {isLive && (
          <div style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Your profile is live — recruiters can find you now.</span>
          </div>
        )}

        {hasProfile && !isLive && (
          <div style={{ background: C.amberDim, border: `1px solid ${C.amberBorder}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.amber }}>Complete your profile to go live.</span>
            <a href="/profile" style={{ fontSize: 13, fontWeight: 700, color: C.white, background: C.amber, padding: '8px 16px', borderRadius: 7, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Continue →
            </a>
          </div>
        )}

        {/* Basic info — renders as data arrives, nothing hidden */}
        {hasProfile && (
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px 22px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Your info</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {profile!.headline && <InfoRow label="Target role" value={profile!.headline as string} />}
              {profile!.location && <InfoRow label="Location" value={profile!.location as string} />}
              {profile!.seniority && <InfoRow label="Level" value={profile!.seniority as string} />}
              {profile!.total_exp != null && (
                <InfoRow label="Experience" value={`${profile!.total_exp} yr${(profile!.total_exp as number) !== 1 ? 's' : ''}`} />
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => (
                <span key={s} style={{ fontSize: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 10px', color: C.gray600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Matches coming soon */}
        <div style={{ background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.teal, fontWeight: 600 }}>
            Match results coming soon — once recruiters post roles, your top matches appear here automatically.
          </p>
        </div>

        {/* Edit profile link */}
        {isLive && (
          <a href="/profile" style={{ fontSize: 13, fontWeight: 600, color: C.gray600, textDecoration: 'none', borderBottom: `1px solid ${C.border}` }}>
            Edit profile
          </a>
        )}

      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.slate }}>{value}</div>
    </div>
  );
}

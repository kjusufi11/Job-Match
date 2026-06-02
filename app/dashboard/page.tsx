'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { C, F, Spinner } from '@/components/ui';

export default function SeekerDashboard() {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  if (loading) return <Spinner />;

  if (!user) {
    router.replace('/login');
    return <Spinner />;
  }

  if (!profile?.profile_complete) {
    router.replace('/profile');
    return <Spinner />;
  }

  const skills = Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
  const firstName = profile.name?.split(' ')[0] ?? 'there';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Hero card */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '28px 28px 24px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.tealDim, border: `2px solid ${C.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: C.teal, flexShrink: 0 }}>
              {(profile.name?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.slate, letterSpacing: -0.4 }}>Hey, {firstName}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.greenDim, color: C.green, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginTop: 5 }}>
                ✓ Profile live
              </span>
            </div>
          </div>
          <p style={{ color: C.gray600, margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Your profile is live — recruiters can now find you. We'll notify you the moment a strong match arrives. No applying, no forms. Just matches.
          </p>
        </div>

        {/* Key info row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 14 }}>
          {profile.headline && (
            <InfoCard label="Role" value={profile.headline} />
          )}
          {profile.location && (
            <InfoCard label="Location" value={profile.location} />
          )}
          {profile.seniority && (
            <InfoCard label="Level" value={profile.seniority as string} />
          )}
          {profile.total_exp != null && (
            <InfoCard label="Experience" value={`${profile.total_exp} yr${(profile.total_exp as number) !== 1 ? 's' : ''}`} />
          )}
        </div>

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

        {/* Matches coming soon banner */}
        <div style={{ background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.teal, fontWeight: 600 }}>
            Match results coming soon — once recruiters start posting roles, your top matches will appear here automatically.
          </p>
        </div>

        {/* Edit profile */}
        <div>
          <button
            onClick={() => router.push('/profile')}
            style={{ background: 'none', border: `1.5px solid ${C.border}`, color: C.gray600, fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: F }}
          >
            Edit profile
          </button>
        </div>

      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.white, borderRadius: 11, border: `1px solid ${C.border}`, padding: '14px 18px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ fontWeight: 700, color: C.slate, fontSize: 14 }}>{value}</div>
    </div>
  );
}

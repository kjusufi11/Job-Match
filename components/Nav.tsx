'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { C, F, Badge, GBtn, PBtn } from './ui';

export default function Nav() {
  const { user, profile, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isRecruiter = profile?.role === 'recruiter';
  const isAdmin     = profile?.role === 'admin';

  async function signOut() {
    const uid = user?.id;
    if (uid) {
      try { localStorage.removeItem(`matcht_profile_draft_${uid}`); } catch {}
      try { localStorage.removeItem(`matcht_profile_step_${uid}`); } catch {}
    }
    try { await Promise.race([fetch('/api/auth/signout', { method: 'POST' }), new Promise(r => setTimeout(r, 3000))]); } catch {}
    window.location.href = '/';
  }

  if (isAdmin) return null;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100, fontFamily: F }}>
      <div onClick={() => router.push(user ? (isRecruiter ? '/recruiter/jobs' : '/dashboard') : '/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 27, height: 27, borderRadius: 6, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: C.white }}>M</div>
        <span style={{ fontWeight: 800, fontSize: 15, color: C.slate, letterSpacing: -0.3 }}>Matcht</span>
        {isRecruiter && <Badge color={C.purple} dim={C.purpleDim} style={{ fontSize: 10, marginLeft: 2 }}>Recruiter</Badge>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {!loading && !user && (
          <>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: `1.5px solid ${C.border}`, color: C.slate, fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '7px 14px', borderRadius: 7, fontFamily: F, marginLeft: 4 }}>Sign in</button>
            <PBtn onClick={() => router.push('/signup')} style={{ padding: '7px 14px', fontSize: 13, marginLeft: 6 }}>Get started free</PBtn>
          </>
        )}

        {!loading && user && (
          <>
            <span style={{ fontSize: 12, color: C.gray400, fontFamily: F, padding: '0 6px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
            <button onClick={() => router.push('/dashboard')} style={{ background: pathname === '/dashboard' ? C.tealDim : 'none', border: 'none', color: pathname === '/dashboard' ? C.teal : C.gray600, fontWeight: pathname === '/dashboard' ? 700 : 500, fontSize: 13, cursor: 'pointer', padding: '7px 11px', borderRadius: 7, fontFamily: F }}>Dashboard</button>
            <GBtn onClick={signOut} style={{ padding: '6px 11px', fontSize: 12 }}>Sign out</GBtn>
          </>
        )}
      </div>
    </nav>
  );
}

'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Badge, GBtn, PBtn } from './ui';

export default function Nav() {
  const { user, profile, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [unread, setUnread] = useState(0);

  const isRecruiter = profile?.role === 'recruiter';
  const isAdmin     = profile?.role === 'admin';

  // Links depend on profile content, but we only show them when the user is logged in.
  // If the user is logged in but has no profile row yet (brand-new account, survey not submitted)
  // default to the seeker nav so they can navigate to /profile.
  const links = profile
    ? isRecruiter
      ? [{ l: 'Job Postings', p: '/recruiter/jobs' }, { l: 'Candidates', p: '/recruiter/candidates' }, { l: 'Post a Job', p: '/recruiter/post' }]
      : [{ l: 'My Matches', p: '/dashboard' }, { l: 'My Profile', p: '/profile' }, { l: 'Notifications', p: '/notifications' }]
    : user
      ? [{ l: 'My Profile', p: '/profile' }]
      : [];

  useEffect(() => {
    if (!profile || profile.role !== 'seeker') return;
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('read', false)
      .then(({ count }) => setUnread(count ?? 0));
  }, [profile?.id, supabase]);

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
        {!loading && links.map(l => (
          <button key={l.p} onClick={() => router.push(l.p)} style={{ background: pathname === l.p || pathname.startsWith(l.p) ? C.tealDim : 'none', border: 'none', color: pathname === l.p || pathname.startsWith(l.p) ? C.teal : C.gray600, fontWeight: pathname === l.p || pathname.startsWith(l.p) ? 700 : 500, fontSize: 13, cursor: 'pointer', padding: '7px 11px', borderRadius: 7, fontFamily: F, position: 'relative' }}>
            {l.l}
            {l.p === '/notifications' && unread > 0 && <span style={{ position: 'absolute', top: 4, right: 6, width: 7, height: 7, background: C.red, borderRadius: '50%', border: `2px solid ${C.white}` }} />}
          </button>
        ))}

        {/* Only show sign-in / get-started when there is definitively no auth session */}
        {!loading && !user && (
          <>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: `1.5px solid ${C.border}`, color: C.slate, fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '7px 14px', borderRadius: 7, fontFamily: F, marginLeft: 4 }}>Sign in</button>
            <PBtn onClick={() => router.push('/signup')} style={{ padding: '7px 14px', fontSize: 13, marginLeft: 6 }}>Get started free</PBtn>
          </>
        )}

        {!loading && user && (
          <>
            {profile && (
              <>
                <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: C.gray600, fontWeight: 500, fontSize: 13, cursor: 'pointer', padding: '7px 11px', borderRadius: 7, fontFamily: F }}>Settings</button>
                <div onClick={() => router.push('/settings')} style={{ width: 30, height: 30, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: C.white, cursor: 'pointer', marginLeft: 2 }}>
                  {profile.name?.[0] ?? '?'}
                </div>
              </>
            )}
            <GBtn onClick={signOut} style={{ padding: '6px 11px', fontSize: 12 }}>Sign out</GBtn>
          </>
        )}
      </div>
    </nav>
  );
}

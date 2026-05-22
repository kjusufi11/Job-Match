'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type UserCtx = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const UserContext = createContext<UserCtx>({ user: null, profile: null, loading: true, refreshProfile: async () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect version changes: if the server's deploy ID differs from the one stored in
  // sessionStorage, a new version was deployed — reload once to get fresh assets.
  useEffect(() => {
    try {
      const cookieVersion = document.cookie.split('; ')
        .find(c => c.startsWith('app-deploy-id='))?.split('=')[1];
      if (!cookieVersion) return;
      const stored = sessionStorage.getItem('app-deploy-id');
      if (stored && stored !== cookieVersion) {
        sessionStorage.setItem('app-deploy-id', cookieVersion);
        window.location.reload();
        return;
      }
      sessionStorage.setItem('app-deploy-id', cookieVersion);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Stable client — not recreated every render, so useEffect deps don't thrash
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data as Profile | null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        const u = session?.user ?? null;
        setUser(u);
        setLoading(false); // unblock nav immediately — profile loads in background
        if (u) await fetchProfile(u.id);
        else setProfile(null);
      } catch {
        if (!cancelled) { setUser(null); setProfile(null); setLoading(false); }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      try {
        if (u) await fetchProfile(u.id);
        else setProfile(null);
      } catch {
        if (!cancelled) setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

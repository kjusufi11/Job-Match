'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type UserCtx = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  getToken: () => string | null;
};

const UserContext = createContext<UserCtx>({ user: null, profile: null, loading: true, refreshProfile: async () => {}, getToken: () => null });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

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

  const getToken = useCallback(() => tokenRef.current, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Fallback: if getSession never resolves (stuck token refresh), unblock the UI
      // after 5s WITHOUT clearing user/profile state — onAuthStateChange will correct
      // things when it fires. This prevents the nav from briefly flashing "Sign In"
      // for logged-in users whose tokens are being refreshed in the background.
      let timedOut = false;
      const fallback = setTimeout(() => {
        timedOut = true;
        if (!cancelled) setLoading(false);
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(fallback);
        if (cancelled) return;
        tokenRef.current = session?.access_token ?? null;
        const u = session?.user ?? null;
        setUser(u);
        setLoading(false);
        if (u) await fetchProfile(u.id);
        else setProfile(null);
      } catch {
        clearTimeout(fallback);
        if (!cancelled) { setUser(null); setProfile(null); setLoading(false); }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      tokenRef.current = session?.access_token ?? null;
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
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, getToken }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

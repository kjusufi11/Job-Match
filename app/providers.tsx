'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

// Module-level singleton: React Strict Mode mounts components twice, which would
// create two separate GoTrueClient instances each with their own internal lock.
// Two simultaneous getSession() calls from different instances deadlock each other.
// A single shared client instance avoids this entirely.
const supabaseClient = createClient();

type UserCtx = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  getToken: () => string | null;
  supabaseUrl: string;
  supabaseKey: string;
};

const UserContext = createContext<UserCtx>({ user: null, profile: null, loading: true, refreshProfile: async () => {}, getToken: () => null, supabaseUrl: '', supabaseKey: '' });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Detect version changes: if the server's deploy ID differs from the one stored in
  // sessionStorage, a new version was deployed -- reload once to get fresh assets.
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

  const supabase = supabaseClient;

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

    // Rely on onAuthStateChange (fires INITIAL_SESSION immediately) rather than a
    // separate getSession() call. This avoids a second concurrent lock acquisition
    // when Strict Mode unmounts/remounts the provider.
    const fallback = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      clearTimeout(fallback);
      tokenRef.current = session?.access_token ?? null;
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Defer profile fetch to a new macrotask so it runs AFTER the auth client
      // releases its internal lock (which is held for the duration of this callback).
      // Calling supabase.from().select() here would call auth.getSession() → deadlock.
      setTimeout(async () => {
        if (cancelled) return;
        try { await fetchProfile(u.id); } catch { if (!cancelled) setProfile(null); }
        if (!cancelled) setLoading(false);
      }, 0);
    });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const sbUrl = ((supabase as any).supabaseUrl as string ?? '').replace(/^\uFEFF/, '').trim();
  const sbKey = ((supabase as any).supabaseKey as string ?? '').replace(/^\uFEFF/, '').trim();

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, getToken, supabaseUrl: sbUrl, supabaseKey: sbKey }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
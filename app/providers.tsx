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
    const loadingTimer = setTimeout(() => { if (!cancelled) setLoading(false); }, 5000);

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
        else setProfile(null);
      } catch {
        // Any failure (network, invalid token, etc.) — treat as logged out
        if (!cancelled) setProfile(null);
      } finally {
        clearTimeout(loadingTimer);
        // Always clear loading — this runs even if getSession() throws
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      try {
        if (session?.user) await fetchProfile(session.user.id);
        else setProfile(null);
      } catch {
        if (!cancelled) setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
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

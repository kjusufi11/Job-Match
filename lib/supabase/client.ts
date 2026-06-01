import { createBrowserClient } from '@supabase/ssr';

function clean(s: string | undefined): string {
  return (s ?? '').replace(/^\uFEFF/, '').trim();
}

export function createClient() {
  return createBrowserClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Start with a base response that forwards the request as-is.
  // Supabase's setAll will reassign this when it needs to persist refreshed tokens.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          // Write cookies back onto the request so subsequent getAll() calls see them.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Replace supabaseResponse so all refreshed cookies are carried forward.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  // getSession() reads the cookie locally and refreshes the token when expired —
  // no external network call on every request, unlike getUser().
  let user: { id: string } | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
  } catch {
    // Any failure — treat as logged out and allow the request through
  }

  const authRequired = ['/dashboard', '/profile', '/notifications', '/settings', '/recruiter', '/admin'];
  if (authRequired.some(r => path.startsWith(r)) && !user) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    // Carry Supabase cookies onto the redirect so the session isn't dropped.
    supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value));
    return res;
  }

  // Logged-in users don't need auth pages — send them home.
  if (user && (path === '/login' || path === '/signup')) {
    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value));
    return res;
  }

  // Stamp every response with the deploy ID so the client can detect version changes.
  const deployId = process.env.VERCEL_DEPLOYMENT_ID ?? 'dev';
  supabaseResponse.cookies.set('app-deploy-id', deployId, {
    maxAge: 60 * 60 * 24 * 365, httpOnly: false, sameSite: 'lax', path: '/',
  });

  // Prevent CDN / browser caching of page HTML.
  const isPageRequest =
    !path.startsWith('/_next/') && !path.startsWith('/api/') && !path.includes('.');
  if (isPageRequest) {
    supabaseResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    supabaseResponse.headers.set('Surrogate-Control', 'no-store');
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/.*).*)'],
};

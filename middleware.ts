import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  try {
    // Read session from cookie — no network round-trip, keeps navigation fast
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    const authRequired = ['/dashboard', '/profile', '/notifications', '/settings', '/recruiter', '/admin'];
    if (authRequired.some(r => path.startsWith(r)) && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Already logged in → skip auth pages
    if (user && (path === '/login' || path === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch {
    // Auth check failed — allow the request through rather than blocking navigation
  }

  // Prevent CDN and browsers from caching page HTML.
  // Static assets already get long-lived cache via next.config.js headers.
  const isPageRequest = !path.startsWith('/_next/') && !path.startsWith('/api/') && !path.includes('.');
  if (isPageRequest) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/.*).*)'],
};

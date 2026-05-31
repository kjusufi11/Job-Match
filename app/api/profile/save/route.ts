import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Auth check with 5-second timeout — prevents Vercel's 10s hard kill from being the first signal the client gets
    const { data: { user }, error: authError } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('Auth check timed out')), 5000)
      ),
    ]);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Force the row id to the authenticated user — never trust client-supplied id
    const payload = { ...body, id: user.id };

    const service = createServiceClient();

    // Upsert with 7-second timeout — total budget is 5+7=12s but auth resolves first so realistic ceiling is ~9s
    const { error } = await Promise.race([
      service.from('profiles').upsert(payload),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('Database request timed out — your data is saved locally, please try again')), 7000)
      ),
    ]);

    if (error) {
      console.error('[profile/save] upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? 'Internal error';
    console.error('[profile/save] error:', msg);
    const status = msg.includes('timed out') ? 408 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient as createUserClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function clean(s: string | undefined) {
  return (s ?? '').replace(/^﻿/, '').trim();
}

const serviceSupabase = createServiceClient(
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/shortlist
 * Body: { jobId, seekerId }
 * Uses service role to bypass RLS for cross-user writes (recruiter → seeker records).
 */
export async function POST(request: Request) {
  try {
    const { jobId, seekerId } = await request.json();
    if (!jobId || !seekerId) {
      return NextResponse.json({ error: 'jobId and seekerId required' }, { status: 400 });
    }

    // Authenticate the caller via their session cookies
    const userClient = createUserClient();
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the recruiter owns this job
    const { data: job } = await serviceSupabase
      .from('jobs')
      .select('id, title, company_name, recruiter_id')
      .eq('id', jobId)
      .eq('recruiter_id', user.id)
      .single();

    if (!job) return NextResponse.json({ error: 'Job not found or not yours' }, { status: 403 });

    // Upsert interest into applications
    const { error: appErr } = await serviceSupabase
      .from('applications')
      .upsert(
        { job_id: jobId, seeker_id: seekerId, status: 'shortlisted' },
        { onConflict: 'job_id,seeker_id' }
      );
    if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

    // Notify the seeker
    await serviceSupabase.from('notifications').insert({
      user_id:  seekerId,
      type:     'shortlist',
      text:     `A recruiter expressed interest in your profile for ${job.title}${job.company_name ? ` at ${job.company_name}` : ''}.`,
      metadata: { job_id: jobId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

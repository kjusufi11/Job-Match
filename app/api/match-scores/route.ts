import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { computeMatchScore } from '@/lib/matching/score';
import type { Profile, Job } from '@/lib/types';

/**
 * POST /api/match-scores
 *
 * Body: { jobId } → compute scores for all eligible seekers vs this job
 *       { seekerId } → compute scores for this seeker vs all active jobs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    if (body.jobId) {
      const { data: job } = await supabase.from('jobs').select('*').eq('id', body.jobId).single();
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

      const { data: seekers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seeker')
        .eq('profile_complete', true)
        .eq('searchable', true);

      if (!seekers?.length) return NextResponse.json({ computed: 0 });

      const scores = (seekers as Profile[]).map(seeker => ({
        job_id: job.id,
        seeker_id: seeker.id,
        ...computeMatchScore(seeker, job as Job),
        computed_at: new Date().toISOString(),
      }));

      await supabase.from('match_scores').upsert(scores, { onConflict: 'job_id,seeker_id' });

      const topMatches = scores.filter(s => s.total_score >= 70);
      if (topMatches.length > 0) {
        const notifs = topMatches.map(s => ({
          user_id: s.seeker_id,
          type: 'match' as const,
          text: `You have a new ${s.total_score >= 85 ? 'excellent' : 'good'} match for ${job.title}.`,
          metadata: { job_id: job.id },
        }));
        await supabase.from('notifications').insert(notifs);
      }

      return NextResponse.json({ computed: scores.length });
    }

    if (body.seekerId) {
      const { data: seeker } = await supabase.from('profiles').select('*').eq('id', body.seekerId).single();
      if (!seeker) return NextResponse.json({ error: 'Seeker not found' }, { status: 404 });

      const { data: jobs } = await supabase.from('jobs').select('*').eq('status', 'active');
      if (!jobs?.length) return NextResponse.json({ computed: 0 });

      const scores = (jobs as Job[]).map(job => ({
        job_id: job.id,
        seeker_id: seeker.id,
        ...computeMatchScore(seeker as Profile, job),
        computed_at: new Date().toISOString(),
      }));

      await supabase.from('match_scores').upsert(scores, { onConflict: 'job_id,seeker_id' });

      return NextResponse.json({ computed: scores.length });
    }

    return NextResponse.json({ error: 'Provide jobId or seekerId' }, { status: 400 });
  } catch (err) {
    console.error('[/api/match-scores]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

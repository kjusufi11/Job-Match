import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { computeMatchScore, formatSalary } from '@/lib/matching/score';
import type { Profile, Job } from '@/lib/types';
import { sendSeekerMatchAlert, sendRecruiterMatchSummary, topMatchReasons } from '@/lib/email';

/**
 * POST /api/match-scores
 *
 * Body: { jobId }   → score all eligible seekers vs this job, then fire emails
 *       { seekerId } → score this seeker vs all active jobs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    // ── jobId path: triggered when a recruiter posts a new job ────────────────
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
        job_id:       job.id,
        seeker_id:    seeker.id,
        ...computeMatchScore(seeker, job as Job),
        computed_at:  new Date().toISOString(),
      }));

      await supabase.from('match_scores').upsert(scores, { onConflict: 'job_id,seeker_id' });

      // In-app notifications for 70%+ matches
      const topMatches = scores.filter(s => s.total_score >= 70);
      if (topMatches.length > 0) {
        const notifs = topMatches.map(s => ({
          user_id:  s.seeker_id,
          type:     'match' as const,
          text:     `You have a new ${s.total_score >= 85 ? 'excellent' : 'good'} match for ${job.title}.`,
          metadata: { job_id: job.id },
        }));
        await supabase.from('notifications').insert(notifs);
      }

      // ── Email: seekers with 75%+ get a match-alert email ─────────────────
      const alertCandidates = scores.filter(s => s.total_score >= 75);
      if (alertCandidates.length > 0) {
        const seekerById = Object.fromEntries((seekers as Profile[]).map(s => [s.id, s]));
        const jobSalary   = formatSalary(job.salary_min, job.salary_max);
        const jobLocation = (job.remote_policy ?? job.hq_location ?? job.office_location ?? 'Location TBD') as string;
        const jobCompany  = (job.company_name ?? '') as string;

        // Fire-and-forget — don't block the response or let failures break scores
        Promise.allSettled(
          alertCandidates.map(score => {
            const seeker = seekerById[score.seeker_id];
            if (!seeker?.email) return Promise.resolve();
            const firstName = (seeker.first_name ?? seeker.name?.split(' ')[0] ?? 'there') as string;
            const reasons = topMatchReasons({
              score_skills:       score.score_skills,
              score_salary:       score.score_salary,
              score_experience:   score.score_experience,
              score_location:     score.score_location,
              score_work_style:   score.score_work_style,
              score_industry:     score.score_industry,
              score_availability: score.score_availability,
              score_personality:  score.score_personality,
            });
            return sendSeekerMatchAlert(
              seeker.email as string,
              firstName,
              job.title as string,
              jobCompany,
              score.total_score,
              jobSalary,
              jobLocation,
              reasons,
            );
          })
        ).catch(() => {});
      }

      // ── Email: recruiter summary (first-match notification) ───────────────
      const { data: recruiter } = await supabase
        .from('profiles')
        .select('email, first_name, name')
        .eq('id', job.recruiter_id)
        .single();

      if (recruiter?.email) {
        const recruiterFirstName = ((recruiter.first_name ?? recruiter.name?.split(' ')[0] ?? 'there') as string);
        const seekerById2 = Object.fromEntries((seekers as Profile[]).map(s => [s.id, s]));
        const matchCount     = scores.filter(s => s.total_score >= 70).length;
        const excellentCount = scores.filter(s => s.total_score >= 85).length;

        const top3 = scores
          .filter(s => s.total_score >= 70)
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 3)
          .map(s => {
            const sk = seekerById2[s.seeker_id];
            return {
              name:     ((sk?.name ?? sk?.first_name ?? 'Candidate') as string),
              title:    (sk?.title as string | null) ?? null,
              location: (sk?.location as string | null) ?? null,
              score:    s.total_score,
            };
          });

        // Only send if there are any qualifying matches
        if (matchCount > 0) {
          sendRecruiterMatchSummary(
            recruiter.email as string,
            recruiterFirstName,
            job.title as string,
            (job.company_name ?? '') as string,
            job.id as string,
            matchCount,
            excellentCount,
            top3,
          ).catch(() => {});
        }
      }

      return NextResponse.json({ computed: scores.length });
    }

    // ── seekerId path: triggered when a seeker completes their profile ────────
    if (body.seekerId) {
      const { data: seeker } = await supabase.from('profiles').select('*').eq('id', body.seekerId).single();
      if (!seeker) return NextResponse.json({ error: 'Seeker not found' }, { status: 404 });

      const { data: jobs } = await supabase.from('jobs').select('*').eq('status', 'active');
      if (!jobs?.length) return NextResponse.json({ computed: 0 });

      const scores = (jobs as Job[]).map(job => ({
        job_id:      job.id,
        seeker_id:   seeker.id,
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

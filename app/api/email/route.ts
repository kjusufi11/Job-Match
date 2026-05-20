import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  sendSeekerWelcome, sendSeekerProfileLive, sendSeekerShortlisted,
  sendSeekerFeedback, sendRecruiterJobLive,
} from '@/lib/email';

/**
 * POST /api/email
 *
 * Dispatches transactional emails. All sends are non-blocking fire-and-forget.
 * The service-role client is used to look up emails — never exposed to the client.
 *
 * Body shapes:
 *   { type: 'seeker-welcome',       seekerId }
 *   { type: 'seeker-profile-live',  seekerId }
 *   { type: 'seeker-shortlisted',   seekerId, jobId }
 *   { type: 'seeker-feedback',      seekerId, jobId, feedbackReason }
 *   { type: 'recruiter-job-live',   recruiterId, jobId }
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { type } = body;
  const supabase = createServiceClient();

  try {
    if (type === 'seeker-welcome') {
      const { seekerId } = body;
      const { data: p } = await supabase.from('profiles').select('email, first_name, name').eq('id', seekerId).single();
      if (!p?.email) return NextResponse.json({ ok: false, reason: 'no email' });
      const firstName = p.first_name ?? p.name?.split(' ')[0] ?? 'there';
      sendSeekerWelcome(p.email, firstName); // intentionally non-blocking
      return NextResponse.json({ ok: true });
    }

    if (type === 'seeker-profile-live') {
      const { seekerId } = body;
      const { data: p } = await supabase.from('profiles').select('email, first_name, name').eq('id', seekerId).single();
      if (!p?.email) return NextResponse.json({ ok: false, reason: 'no email' });
      const firstName = p.first_name ?? p.name?.split(' ')[0] ?? 'there';

      // Fetch top 3 matches for this seeker
      const { data: scores } = await supabase
        .from('match_scores')
        .select('total_score, jobs(title, company_name, salary_min, salary_max, remote_policy, hq_location)')
        .eq('seeker_id', seekerId)
        .order('total_score', { ascending: false })
        .limit(3);

      const topMatches = (scores ?? []).map((s: any) => ({
        title: s.jobs?.title ?? 'Untitled role',
        company: s.jobs?.company_name ?? 'Company',
        match: s.total_score,
        salary: s.jobs?.salary_min && s.jobs?.salary_max
          ? `$${Math.round(s.jobs.salary_min / 1000)}–${Math.round(s.jobs.salary_max / 1000)}k`
          : 'Salary not listed',
        location: s.jobs?.remote_policy ?? s.jobs?.hq_location ?? 'Location TBD',
      }));

      sendSeekerProfileLive(p.email, firstName, topMatches);
      return NextResponse.json({ ok: true });
    }

    if (type === 'seeker-shortlisted') {
      const { seekerId, jobId } = body;
      const { data: p } = await supabase.from('profiles').select('email, first_name, name').eq('id', seekerId).single();
      if (!p?.email) return NextResponse.json({ ok: false, reason: 'no email' });
      const firstName = p.first_name ?? p.name?.split(' ')[0] ?? 'there';

      const { data: job } = await supabase.from('jobs').select('title, company_name').eq('id', jobId).single();
      const jobTitle = job?.title ?? 'this role';
      const company = job?.company_name ?? 'the company';

      sendSeekerShortlisted(p.email, firstName, jobTitle, company);
      return NextResponse.json({ ok: true });
    }

    if (type === 'seeker-feedback') {
      const { seekerId, jobId, feedbackReason } = body;
      const { data: p } = await supabase.from('profiles').select('email, first_name, name').eq('id', seekerId).single();
      if (!p?.email) return NextResponse.json({ ok: false, reason: 'no email' });
      const firstName = p.first_name ?? p.name?.split(' ')[0] ?? 'there';

      const { data: job } = await supabase.from('jobs').select('title, company_name').eq('id', jobId).single();
      const jobTitle = job?.title ?? 'this role';
      const company = job?.company_name ?? 'the company';

      sendSeekerFeedback(p.email, firstName, jobTitle, company, feedbackReason);
      return NextResponse.json({ ok: true });
    }

    if (type === 'recruiter-job-live') {
      const { recruiterId, jobId } = body;
      const { data: p } = await supabase.from('profiles').select('email, first_name, name').eq('id', recruiterId).single();
      if (!p?.email) return NextResponse.json({ ok: false, reason: 'no email' });
      const firstName = p.first_name ?? p.name?.split(' ')[0] ?? 'there';

      const { data: job } = await supabase.from('jobs').select('title, company_name').eq('id', jobId).single();
      const jobTitle = job?.title ?? 'Your role';
      const company = job?.company_name ?? '';

      sendRecruiterJobLive(p.email, firstName, jobTitle, company, jobId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
  } catch (err) {
    console.error('[/api/email]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

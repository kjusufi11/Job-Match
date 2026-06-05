// ── Email delivery via Resend ─────────────────────────────────────────────────
// Requires RESEND_API_KEY in .env.local
// Template reference: MatchtEmails.jsx (12 templates, seeker × 7, recruiter × 5)
// From address: The Matcht Team <hello@getmatcht.com>

import { Resend } from 'resend';

// Use RESEND_FROM once getmatcht.com is verified in the Resend dashboard.
// Until then, set RESEND_FROM=onboarding@resend.dev in .env.local (only delivers to your own address).
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getmatcht.com';

// ── Core send wrapper ─────────────────────────────────────────────────────────

// Lazy-initialize Resend so the module loads cleanly during Next.js build
// even when RESEND_API_KEY is not set in the build environment.
async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', to);
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

// ── HTML shell ────────────────────────────────────────────────────────────────

const teal = '#1A8C8C';
const slate = '#1E2D3A';
const gray600 = '#4E6475';
const gray400 = '#8FAABB';
const border = '#D4E3EC';
const bg = '#F0F4F7';
const green = '#19A87A';
const white = '#FFFFFF';

function shell(preheader: string, heroBg: string, heroHtml: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:${bg};font-family:'Helvetica Neue',Arial,sans-serif;}a{color:${teal};}*{box-sizing:border-box;}</style>
</head>
<body>
<div style="display:none;font-size:1px;color:${bg};max-height:0;overflow:hidden;">${preheader}</div>
<div style="background:${bg};padding:32px 16px;min-height:100%;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="padding:0 0 18px;display:flex;align-items:center;gap:8px;">
      <div style="width:26px;height:26px;border-radius:6px;background:${teal};display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:${white};vertical-align:middle;">M</div>
      <span style="font-weight:800;font-size:15px;color:${slate};letter-spacing:-0.3px;vertical-align:middle;margin-left:6px;">Matcht</span>
    </div>
    <div style="background:${white};border-radius:14px;border:1px solid ${border};overflow:hidden;">
      <div style="background:${heroBg};padding:32px 36px 28px;">${heroHtml}</div>
      <div style="padding:28px 36px;">${bodyHtml}</div>
    </div>
    <div style="padding:20px 0 0;text-align:center;">
      <p style="font-size:12px;color:${gray400};margin:0 0 6px;">The Matcht Team &middot; getmatcht.com</p>
      <p style="font-size:12px;color:${gray400};margin:0;">
        <a href="${BASE_URL}/settings/notifications" style="color:${gray400};">Manage notifications</a> &middot;
        <a href="${BASE_URL}/settings/notifications" style="color:${gray400};">Unsubscribe</a>
      </p>
    </div>
  </div>
</div>
</body></html>`;
}

function cta(label: string, href: string, color = teal): string {
  return `<div style="text-align:center;margin:24px 0 8px;">
    <a href="${href}" style="display:inline-block;background:${color};color:${white};padding:13px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">${label}</a>
  </div>`;
}

function divider(): string {
  return `<div style="border-top:1px solid ${border};margin:22px 0;"></div>`;
}

// ── SEEKER TEMPLATES ──────────────────────────────────────────────────────────

type TopMatch = { title: string; company: string; match: number; salary: string; location: string };

function matchColor(pct: number): string { return pct >= 85 ? green : pct >= 70 ? '#C9870C' : '#C0392B'; }

function jobCardHtml(m: TopMatch): string {
  const col = matchColor(m.match);
  return `<div style="border:1px solid ${border};border-radius:10px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;">
    <div style="width:48px;height:48px;border-radius:50%;border:2.5px solid ${col};background:${col}14;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;vertical-align:middle;text-align:center;">
      <div style="font-size:13px;font-weight:800;color:${col};line-height:1;">${m.match}%</div>
      <div style="font-size:8px;color:${col};font-weight:700;">${m.match >= 85 ? 'Excellent' : 'Good'}</div>
    </div>
    <div style="flex:1;">
      <div style="font-weight:700;font-size:14px;color:${slate};margin-bottom:2px;">${m.title}</div>
      <div style="font-size:13px;color:${gray600};">${m.company} &middot; ${m.location} &middot; ${m.salary}</div>
    </div>
  </div>`;
}

export function buildSeekerWelcome(firstName: string): { subject: string; html: string } {
  const hero = `<div style="font-size:28px;margin-bottom:10px;">👋</div>
    <h1 style="font-size:24px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">Welcome to Matcht, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;line-height:1.6;">You just made the job search process work for you instead of the other way around.</p>`;
  const body = `<p style="font-size:15px;color:${slate};line-height:1.7;margin:0 0 18px;">Here's how Matcht works for you:</p>
    ${[
      ['🎯', 'You get matched automatically', 'As soon as recruiters post roles, our engine scores you across 8 dimensions. You\'ll hear from us when something fits.'],
      ['📬', 'No more applications', 'You\'ve already done the work. Recruiters come to you — ranked by how well you fit, not by who applied first.'],
      ['🎥', 'Add a video to stand out', 'Candidates with a short video intro are 4× more likely to get a callback. It takes less than 5 minutes.'],
    ].map(([icon, title, desc]) => `<div style="display:flex;gap:14px;margin-bottom:18px;">
        <div style="font-size:22px;flex-shrink:0;margin-top:2px;">${icon}</div>
        <div>
          <div style="font-weight:700;font-size:14px;color:${slate};margin-bottom:4px;">${title}</div>
          <div style="font-size:13px;color:${gray600};line-height:1.6;">${desc}</div>
        </div>
      </div>`).join('')}
    ${cta('Complete my profile →', `${BASE_URL}/profile`)}
    <p style="font-size:13px;color:${gray400};text-align:center;margin:12px 0 0;">Your profile is live. Matches are on their way.</p>`;
  return { subject: `Welcome to Matcht, ${firstName} 👋`, html: shell("You're in — let's find your next role.", teal, hero, body) };
}

export function buildSeekerProfileLive(firstName: string, topMatches: TopMatch[]): { subject: string; html: string } {
  const hero = `<div style="font-size:28px;margin-bottom:10px;">🎉</div>
    <h1 style="font-size:24px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">Your profile is live, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;line-height:1.6;">We've already found ${topMatches.length} role${topMatches.length !== 1 ? 's' : ''} that match your criteria.</p>`;
  const body = `<p style="font-size:14px;color:${gray600};margin:0 0 16px;">These are your top matches right now — ranked by how well they fit your skills, salary, personality, and preferences.</p>
    ${topMatches.map(jobCardHtml).join('')}
    ${cta('See all my matches →', `${BASE_URL}/matches`)}
    ${divider()}
    <p style="font-size:13px;color:${gray600};line-height:1.6;margin:0;">💡 <strong>Pro tip:</strong> Adding a 2–3 minute video intro makes you 4× more likely to hear back. You can add one anytime from your profile page.</p>`;
  return { subject: `Your profile is live — ${topMatches.length} matches waiting`, html: shell(`${topMatches.length} roles already match your profile — take a look.`, '#116060', hero, body) };
}

export function buildSeekerNewMatch(firstName: string, jobTitle: string, company: string, matchPct: number, salary: string, location: string): { subject: string; html: string } {
  const col = matchColor(matchPct);
  const matchLabel = matchPct >= 85 ? 'Excellent' : matchPct >= 70 ? 'Good' : 'Fair';
  const hero = `<div style="display:inline-flex;align-items:center;gap:5px;background:${col}14;border:1px solid ${col}44;border-radius:20px;padding:4px 12px;margin-bottom:10px;">
      <span style="font-weight:800;font-size:15px;color:${col};">${matchPct}%</span>
      <span style="font-size:12px;color:${col};font-weight:600;">${matchLabel} match</span>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:8px 0 6px;letter-spacing:-0.5px;">A strong match just came in, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">${jobTitle} at ${company}</p>`;
  const body = `<div style="background:${bg};border-radius:10px;padding:16px 18px;margin-bottom:22px;">
    ${[['Role', jobTitle], ['Company', company], ['Location', location], ['Salary', salary], ['Match score', `${matchPct}% — ${matchLabel}`]].map(([l, v]) =>
    `<div style="display:flex;border-bottom:1px solid ${border};padding:8px 0;">
        <span style="font-size:13px;color:${gray600};width:100px;flex-shrink:0;">${l}</span>
        <span style="font-size:13px;color:${slate};font-weight:600;">${v}</span>
      </div>`).join('')}
    </div>
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 20px;">This role scored highly against your profile. You don't need to do anything — if you're interested, just hit apply and your profile does the rest.</p>
    ${cta('View this role →', `${BASE_URL}/matches`)}`;
  return { subject: `${matchPct}% match — ${jobTitle} at ${company}`, html: shell(`${matchPct}% match — ${jobTitle} at ${company}`, teal, hero, body) };
}

export function buildSeekerProfileViewed(firstName: string, recruiterCompany: string): { subject: string; html: string } {
  const purple = '#6B5EA8';
  const hero = `<div style="font-size:28px;margin-bottom:10px;">👁</div>
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">Someone's interested, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">A recruiter at ${recruiterCompany} just viewed your profile.</p>`;
  const body = `<p style="font-size:15px;color:${slate};line-height:1.7;margin:0 0 18px;">This is a good sign — recruiters on Matcht only view profiles when they're seriously considering a candidate. You're on their radar.</p>
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 22px;">Now's a great time to make sure your profile is as strong as it can be. If you haven't added a video intro yet, this is the moment.</p>
    ${cta('View my profile →', `${BASE_URL}/profile`, purple)}
    ${divider()}
    <p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">You can see all profile views in your dashboard at any time.</p>`;
  return { subject: `${recruiterCompany} viewed your Matcht profile`, html: shell(`${recruiterCompany} just viewed your Matcht profile.`, purple, hero, body) };
}

export function buildSeekerShortlisted(firstName: string, jobTitle: string, company: string): { subject: string; html: string } {
  const hero = `<div style="font-size:28px;margin-bottom:10px;">⭐</div>
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">You've been shortlisted, ${firstName}!</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0;">${company} has moved you to the top of their list for ${jobTitle}.</p>`;
  const body = `<p style="font-size:15px;color:${slate};line-height:1.7;margin:0 0 16px;">This is a big deal. Being shortlisted means the recruiter has reviewed your profile and thinks you're one of the best fits for this role.</p>
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 22px;">Expect to hear from ${company} directly through Matcht. In the meantime, you might want to research the company and think about what you'd want to cover in a first conversation.</p>
    <div style="background:${bg};border-radius:10px;padding:14px 16px;margin-bottom:22px;">
      <div style="font-weight:700;font-size:13px;color:${slate};margin-bottom:4px;">${jobTitle}</div>
      <div style="font-size:13px;color:${gray600};">${company}</div>
    </div>
    ${cta('View this role →', `${BASE_URL}/matches`, green)}`;
  return { subject: `⭐ You've been shortlisted — ${jobTitle} at ${company}`, html: shell(`🌟 You've been shortlisted for ${jobTitle} at ${company}.`, green, hero, body) };
}

export function buildSeekerFeedback(firstName: string, jobTitle: string, company: string, feedbackReason: string): { subject: string; html: string } {
  const hero = `<div style="font-size:28px;margin-bottom:10px;">💬</div>
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">You received feedback, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.75);margin:0;">${company} passed on your application for ${jobTitle} — and they told us why.</p>`;
  const body = `<p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 16px;">Most companies never explain why. The fact that ${company} shared this is rare — and genuinely useful.</p>
    <div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:16px 18px;margin-bottom:22px;">
      <div style="font-size:12px;font-weight:700;color:${gray400};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Their feedback</div>
      <p style="font-size:14px;color:${slate};line-height:1.65;margin:0;font-style:italic;">"${feedbackReason}"</p>
    </div>
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 22px;">This doesn't mean you're not a great candidate — it means this particular role wasn't the right fit. Your profile is still live, and other roles are being scored against you right now.</p>
    ${cta('See my current matches →', `${BASE_URL}/matches`)}
    ${divider()}
    <p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">Every "pass" brings you closer to the right fit. Keep going.</p>`;
  return { subject: `Feedback from ${company} on your application`, html: shell(`Feedback from ${company} on your application.`, slate, hero, body) };
}

export function buildSeekerDigest(firstName: string, topMatches: TopMatch[], stats: { newMatches: number; profileViews: number; strongMatches: number }): { subject: string; html: string } {
  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">Your weekly summary, ${firstName}.</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.75);margin:0;">Week ending ${weekOf}</p>`;
  const body = `<div style="display:flex;gap:10px;margin-bottom:24px;">
    ${[['New matches', stats.newMatches, teal], ['Profile views', stats.profileViews, '#6B5EA8'], ['Strong matches', stats.strongMatches, green]].map(([l, v, col]) =>
    `<div style="flex:1;background:${bg};border-radius:9px;padding:14px 12px;text-align:center;">
        <div style="font-size:26px;font-weight:800;color:${col};">${v}</div>
        <div style="font-size:11px;color:${gray600};margin-top:3px;">${l}</div>
      </div>`).join('')}
    </div>
    <p style="font-size:14px;font-weight:700;color:${slate};margin:0 0 12px;">Your top matches this week</p>
    ${topMatches.slice(0, 3).map(jobCardHtml).join('')}
    ${cta('See all matches →', `${BASE_URL}/matches`)}
    ${divider()}
    <p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">You're receiving weekly digests. <a href="${BASE_URL}/settings/notifications">Manage notifications</a>.</p>`;
  return { subject: `Your Matcht weekly summary — ${stats.newMatches} new match${stats.newMatches !== 1 ? 'es' : ''}`, html: shell(`Your Matcht summary for the week ending ${weekOf}.`, teal, hero, body) };
}

// ── RECRUITER TEMPLATES ───────────────────────────────────────────────────────

export function buildRecruiterWelcome(firstName: string, company: string): { subject: string; html: string } {
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">Welcome to Matcht, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">Your recruiter account for ${company} is active.</p>`;
  const body = `<p style="font-size:14px;color:${slate};line-height:1.7;margin:0 0 18px;">Here's how Matcht works for recruiters:</p>
    ${[
      ['Post a role', 'Complete our job posting survey — it takes about 10 minutes. The more detail you provide, the better your matches.'],
      ['Get ranked candidates', 'As soon as your role is live, candidates are scored against it automatically. You get a ranked list, not a stack of resumes.'],
      ['Review and shortlist', 'Each candidate comes with a match score, dimension breakdown, and — where available — a video intro. Shortlist or pass with one click.'],
      ['Give feedback', "When you pass on a candidate, you can share why. It improves the platform for everyone."],
    ].map(([title, desc]) => `<div style="border-left:3px solid ${teal};padding-left:14px;margin-bottom:16px;">
        <div style="font-weight:700;font-size:14px;color:${slate};margin-bottom:3px;">${title}</div>
        <div style="font-size:13px;color:${gray600};line-height:1.6;">${desc}</div>
      </div>`).join('')}
    ${cta('Post your first role →', `${BASE_URL}/recruiter/post`)}`;
  return { subject: `Welcome to Matcht — your account is ready`, html: shell('Your account is active. Post your first role to start receiving ranked candidates.', teal, hero, body) };
}

export function buildRecruiterJobLive(firstName: string, jobTitle: string, company: string, jobId: string): { subject: string; html: string } {
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 8px;letter-spacing:-0.5px;">Your role is live.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">${jobTitle} &middot; ${company}</p>`;
  const body = `<p style="font-size:14px;color:${slate};line-height:1.7;margin:0 0 20px;">Candidates are being scored and ranked against your requirements right now. You'll receive a notification as strong matches come in.</p>
    ${[
      ['What happens next', "Matcht scores every eligible candidate across your 8 dimensions using the weights you set. The ranked list updates in real time."],
      ['When to expect results', "You'll typically see your first strong matches within 24–48 hours. We'll email you as they come in."],
      ['Editing your posting', 'You can update your posting, adjust scoring weights, or pause the role at any time from your dashboard.'],
    ].map(([title, desc]) => `<div style="margin-bottom:16px;">
        <div style="font-weight:700;font-size:13px;color:${slate};margin-bottom:3px;">${title}</div>
        <div style="font-size:13px;color:${gray600};line-height:1.6;">${desc}</div>
      </div>`).join('')}
    ${cta('View candidate pipeline →', `${BASE_URL}/recruiter/candidates/${jobId}`)}`;
  return { subject: `${jobTitle} is live on Matcht`, html: shell(`${jobTitle} is live. Candidates are being ranked now.`, teal, hero, body) };
}

export function buildRecruiterNewCandidate(firstName: string, jobTitle: string, candidateName: string, candidateTitle: string, candidateExp: string, matchPct: number, jobId: string): { subject: string; html: string } {
  const col = matchColor(matchPct);
  const initials = candidateName.split(' ').map(n => n[0]).join('');
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">Strong candidate match.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">${jobTitle}</p>`;
  const body = `<div style="display:flex;align-items:center;gap:16px;background:${bg};border-radius:10px;padding:16px 18px;margin-bottom:22px;">
    <div style="width:52px;height:52px;border-radius:50%;background:${teal}12;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:${teal};flex-shrink:0;">${initials}</div>
    <div style="flex:1;">
      <div style="font-weight:700;font-size:16px;color:${slate};">${candidateName}</div>
      <div style="font-size:13px;color:${gray600};">${candidateTitle} &middot; ${candidateExp} experience</div>
    </div>
    <div style="width:52px;height:52px;border-radius:50%;border:3px solid ${col};background:${col}14;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;text-align:center;">
      <div style="font-size:14px;font-weight:800;color:${col};line-height:1;">${matchPct}%</div>
      <div style="font-size:8px;color:${col};font-weight:700;">Excellent</div>
    </div>
  </div>
  <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 20px;">This candidate scored in the top tier across your scoring dimensions. View their full profile and video intro to evaluate fit.</p>
  ${cta('View candidate profile →', `${BASE_URL}/recruiter/candidates/${jobId}`)}
  ${divider()}
  <p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">You can shortlist, pass, or send feedback directly from the candidate profile page.</p>`;
  return { subject: `${matchPct}% match — ${candidateName} for ${jobTitle}`, html: shell(`${matchPct}% match — ${candidateName} for ${jobTitle}.`, teal, hero, body) };
}

export function buildRecruiterCandidateApplied(firstName: string, jobTitle: string, candidateName: string, candidateTitle: string, matchPct: number, applicantCount: number, jobId: string): { subject: string; html: string } {
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">New application received.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;">${jobTitle} &middot; ${applicantCount} total applicants</p>`;
  const rows = [['Candidate', candidateName, false], ['Current title', candidateTitle, false], ['Match score', `${matchPct}% — Excellent`, true], ['Applied to', jobTitle, false]] as [string, string, boolean][];
  const body = rows.map(([l, v, hi]) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${border};">
      <span style="font-size:14px;color:${gray600};">${l}</span>
      <span style="font-size:14px;font-weight:700;color:${hi ? teal : slate};">${v}</span>
    </div>`).join('') + `<div style="height:12px;"></div>` + cta('Review application →', `${BASE_URL}/recruiter/candidates/${jobId}`) + divider() +
    `<p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">All applications are visible in your candidate pipeline, ranked by match score.</p>`;
  return { subject: `${candidateName} applied to ${jobTitle}`, html: shell(`${candidateName} applied to ${jobTitle}.`, teal, hero, body) };
}

export function buildRecruiterDigest(firstName: string, activeJobs: { title: string; applicants: number; newThisWeek: number; shortlisted: number }[]): { subject: string; html: string } {
  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const totalApplicants = activeJobs.reduce((a, j) => a + j.applicants, 0);
  const totalNew = activeJobs.reduce((a, j) => a + j.newThisWeek, 0);
  const totalShortlisted = activeJobs.reduce((a, j) => a + j.shortlisted, 0);
  const hero = `<h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">Weekly summary.</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.75);margin:0;">Week ending ${weekOf} &middot; ${activeJobs.length} active role${activeJobs.length !== 1 ? 's' : ''}</p>`;
  const body = `<div style="display:flex;gap:10px;margin-bottom:24px;">
    ${[['Total applicants', totalApplicants, slate], ['New this week', totalNew, teal], ['Shortlisted', totalShortlisted, green]].map(([l, v, col]) =>
    `<div style="flex:1;background:${bg};border-radius:9px;padding:14px 12px;text-align:center;">
        <div style="font-size:26px;font-weight:800;color:${col};">${v}</div>
        <div style="font-size:11px;color:${gray600};margin-top:3px;">${l}</div>
      </div>`).join('')}
    </div>
    <p style="font-size:13px;font-weight:700;color:${slate};margin:0 0 10px;">Active roles</p>
    ${activeJobs.map(j => `<div style="border:1px solid ${border};border-radius:9px;padding:13px 15px;margin-bottom:8px;">
      <div style="font-weight:700;font-size:14px;color:${slate};margin-bottom:6px;">${j.title}</div>
      <div style="display:flex;gap:16px;">
        ${[['Total applicants', j.applicants], ['New this week', j.newThisWeek], ['Shortlisted', j.shortlisted]].map(([l, v]) =>
    `<div><div style="font-size:16px;font-weight:800;color:${teal};">${v}</div><div style="font-size:11px;color:${gray600};">${l}</div></div>`).join('')}
      </div>
    </div>`).join('')}
    ${cta('View all candidates →', `${BASE_URL}/recruiter/jobs`)}
    ${divider()}
    <p style="font-size:13px;color:${gray400};line-height:1.6;margin:0;">You're receiving weekly digests. <a href="${BASE_URL}/settings/notifications">Manage notifications</a>.</p>`;
  return { subject: `Your Matcht weekly summary — ${totalNew} new this week`, html: shell(`Your Matcht recruiter summary — week ending ${weekOf}.`, teal, hero, body) };
}

// ── MATCH ALERT — SEEKER ─────────────────────────────────────────────────────

type DimScores = {
  score_skills: number; score_salary: number; score_experience: number;
  score_location: number; score_work_style: number; score_industry: number;
  score_availability: number; score_personality: number;
};

const DIM_LABELS: Record<string, string> = {
  score_skills:       'Skills match',
  score_salary:       'Salary expectations aligned',
  score_experience:   'Experience level',
  score_location:     'Location & remote preference',
  score_work_style:   'Work style & culture fit',
  score_industry:     'Industry background',
  score_availability: 'Availability',
  score_personality:  'Personality fit',
};

export function topMatchReasons(dims: DimScores): { label: string; pct: number }[] {
  return (Object.entries(dims) as [string, number][])
    .filter(([, v]) => v >= 70)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k, v]) => ({ label: DIM_LABELS[k] ?? k, pct: v }));
}

function reasonsHtml(reasons: { label: string; pct: number }[]): string {
  if (!reasons.length) return '';
  return `<div style="background:${bg};border-radius:10px;padding:16px 18px;margin:18px 0;">
    <div style="font-size:11px;font-weight:700;color:${gray400};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Why you're a strong match</div>
    ${reasons.map(r => `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid ${border};">
      <span style="color:${green};font-size:14px;flex-shrink:0;">✓</span>
      <span style="font-size:13px;color:${slate};font-weight:600;flex:1;">${r.label}</span>
      <span style="font-size:13px;font-weight:800;color:${r.pct >= 85 ? green : r.pct >= 70 ? '#C9870C' : slate};">${r.pct}%</span>
    </div>`).join('')}
  </div>`;
}

export function buildSeekerMatchAlert(
  firstName: string,
  jobTitle: string,
  company: string,
  matchPct: number,
  salary: string,
  location: string,
  reasons: { label: string; pct: number }[],
): { subject: string; html: string } {
  const col   = matchColor(matchPct);
  const label = matchPct >= 85 ? 'Excellent' : matchPct >= 70 ? 'Good' : 'Fair';
  const hero  = `
    <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 14px;margin-bottom:12px;">
      <span style="font-weight:800;font-size:15px;color:${white};">${matchPct}%</span>
      <span style="font-size:12px;color:rgba(255,255,255,.85);font-weight:600;">${label} match</span>
    </div>
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">A strong match just came in, ${firstName}.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,.8);margin:0;">${jobTitle} at ${company}</p>`;

  const detailRows = [
    ['Role',        jobTitle],
    ['Company',     company],
    ['Location',    location],
    ['Salary',      salary],
    ['Match score', `${matchPct}% — ${label}`],
  ] as [string, string][];

  const body = `
    <div style="border:1px solid ${border};border-radius:10px;overflow:hidden;margin-bottom:4px;">
      ${detailRows.map(([l, v]) => `<div style="display:flex;padding:10px 16px;border-bottom:1px solid ${border};">
        <span style="font-size:13px;color:${gray600};width:110px;flex-shrink:0;">${l}</span>
        <span style="font-size:13px;color:${slate};font-weight:600;">${v}</span>
      </div>`).join('')}
    </div>
    ${reasonsHtml(reasons)}
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 20px;">No application needed. Your profile has already done the work — if you're interested, visit your dashboard to see the full match details and signal your interest.</p>
    ${cta('View this match on my dashboard →', `${BASE_URL}/dashboard`)}
    ${divider()}
    <p style="font-size:12px;color:${gray400};text-align:center;margin:0;line-height:1.6;">You're receiving this because your match score for this role is ${matchPct}%.<br>
    <a href="${BASE_URL}/settings/notifications" style="color:${gray400};">Manage notifications</a></p>`;

  return {
    subject: `${matchPct}% match — ${jobTitle} at ${company}`,
    html:    shell(`You're a ${matchPct}% match for ${jobTitle} at ${company}.`, teal, hero, body),
  };
}

// ── MATCH SUMMARY — RECRUITER ─────────────────────────────────────────────────

type TopSeekerCard = { name: string; title: string | null; location: string | null; score: number };

function anonName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function candidateCardHtml(c: TopSeekerCard): string {
  const col      = matchColor(c.score);
  const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const subtitle = [c.title, c.location].filter(Boolean).join(' · ');
  return `<div style="border:1px solid ${border};border-radius:10px;padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:14px;">
    <div style="width:42px;height:42px;border-radius:50%;background:${teal}12;border:1.5px solid ${teal}30;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:${teal};flex-shrink:0;">${initials}</div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:14px;color:${slate};margin-bottom:2px;">${anonName(c.name)}</div>
      ${subtitle ? `<div style="font-size:12px;color:${gray600};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subtitle}</div>` : ''}
    </div>
    <div style="width:46px;height:46px;border-radius:50%;border:2.5px solid ${col};background:${col}14;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;text-align:center;">
      <div style="font-size:12px;font-weight:800;color:${col};line-height:1;">${c.score}%</div>
      <div style="font-size:8px;color:${col};font-weight:700;">${c.score >= 85 ? 'Excellent' : 'Good'}</div>
    </div>
  </div>`;
}

export function buildRecruiterMatchSummary(
  firstName: string,
  jobTitle: string,
  company: string,
  jobId: string,
  matchCount: number,
  excellentCount: number,
  top3: TopSeekerCard[],
): { subject: string; html: string } {
  const hero = `
    <h1 style="font-size:22px;font-weight:800;color:${white};margin:0 0 6px;letter-spacing:-0.5px;">Your first matches are in.</h1>
    <p style="font-size:15px;color:rgba(255,255,255,.8);margin:0;">${jobTitle}${company ? ` · ${company}` : ''}</p>`;

  const statItems: [string, number | string, string][] = [
    ['Total matches', matchCount,     teal],
    ['Excellent',     excellentCount, green],
  ];

  const body = `
    <p style="font-size:14px;color:${gray600};line-height:1.7;margin:0 0 18px;">We've scored every eligible candidate on Matcht against your posting, ${firstName}. Here's where things stand.</p>
    <div style="display:flex;gap:10px;margin-bottom:24px;">
      ${statItems.map(([l, v, col]) => `<div style="flex:1;background:${bg};border-radius:9px;padding:14px 12px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:${col};">${v}</div>
        <div style="font-size:11px;color:${gray600};margin-top:3px;">${l}</div>
      </div>`).join('')}
    </div>
    ${top3.length ? `<p style="font-size:13px;font-weight:700;color:${slate};margin:0 0 10px;">Top candidates</p>
    ${top3.map(candidateCardHtml).join('')}` : ''}
    <p style="font-size:13px;color:${gray600};line-height:1.6;margin:16px 0 20px;">Contact details are hidden until you shortlist a candidate. Shortlisting notifies the candidate and unlocks their full profile.</p>
    ${cta('View full candidate pipeline →', `${BASE_URL}/recruiter/candidates/${jobId}`)}
    ${divider()}
    <p style="font-size:12px;color:${gray400};text-align:center;margin:0;"><a href="${BASE_URL}/settings/notifications" style="color:${gray400};">Manage notifications</a></p>`;

  const subjectCount = excellentCount > 0
    ? `${excellentCount} excellent match${excellentCount !== 1 ? 'es' : ''} for ${jobTitle}`
    : `${matchCount} match${matchCount !== 1 ? 'es' : ''} for ${jobTitle}`;

  return {
    subject: subjectCount,
    html:    shell(`Your first matches are in for ${jobTitle}.`, teal, hero, body),
  };
}

// ── TRIGGER FUNCTIONS ─────────────────────────────────────────────────────────

export async function sendSeekerWelcome(email: string, firstName: string) {
  const { subject, html } = buildSeekerWelcome(firstName);
  await send(email, subject, html);
}

export async function sendSeekerProfileLive(email: string, firstName: string, topMatches: TopMatch[]) {
  const { subject, html } = buildSeekerProfileLive(firstName, topMatches);
  await send(email, subject, html);
}

export async function sendSeekerNewMatch(email: string, firstName: string, jobTitle: string, company: string, matchPct: number, salary: string, location: string) {
  const { subject, html } = buildSeekerNewMatch(firstName, jobTitle, company, matchPct, salary, location);
  await send(email, subject, html);
}

export async function sendSeekerProfileViewed(email: string, firstName: string, recruiterCompany: string) {
  const { subject, html } = buildSeekerProfileViewed(firstName, recruiterCompany);
  await send(email, subject, html);
}

export async function sendSeekerShortlisted(email: string, firstName: string, jobTitle: string, company: string) {
  const { subject, html } = buildSeekerShortlisted(firstName, jobTitle, company);
  await send(email, subject, html);
}

export async function sendSeekerFeedback(email: string, firstName: string, jobTitle: string, company: string, feedbackReason: string) {
  const { subject, html } = buildSeekerFeedback(firstName, jobTitle, company, feedbackReason);
  await send(email, subject, html);
}

export async function sendSeekerDigest(email: string, firstName: string, topMatches: TopMatch[], stats: { newMatches: number; profileViews: number; strongMatches: number }) {
  const { subject, html } = buildSeekerDigest(firstName, topMatches, stats);
  await send(email, subject, html);
}

export async function sendRecruiterWelcome(email: string, firstName: string, company: string) {
  const { subject, html } = buildRecruiterWelcome(firstName, company);
  await send(email, subject, html);
}

export async function sendRecruiterJobLive(email: string, firstName: string, jobTitle: string, company: string, jobId: string) {
  const { subject, html } = buildRecruiterJobLive(firstName, jobTitle, company, jobId);
  await send(email, subject, html);
}

export async function sendRecruiterNewCandidate(email: string, firstName: string, jobTitle: string, candidateName: string, candidateTitle: string, candidateExp: string, matchPct: number, jobId: string) {
  const { subject, html } = buildRecruiterNewCandidate(firstName, jobTitle, candidateName, candidateTitle, candidateExp, matchPct, jobId);
  await send(email, subject, html);
}

export async function sendRecruiterCandidateApplied(email: string, firstName: string, jobTitle: string, candidateName: string, candidateTitle: string, matchPct: number, applicantCount: number, jobId: string) {
  const { subject, html } = buildRecruiterCandidateApplied(firstName, jobTitle, candidateName, candidateTitle, matchPct, applicantCount, jobId);
  await send(email, subject, html);
}

export async function sendRecruiterDigest(email: string, firstName: string, activeJobs: { title: string; applicants: number; newThisWeek: number; shortlisted: number }[]) {
  const { subject, html } = buildRecruiterDigest(firstName, activeJobs);
  await send(email, subject, html);
}

export async function sendSeekerMatchAlert(
  email: string, firstName: string, jobTitle: string, company: string,
  matchPct: number, salary: string, location: string,
  reasons: { label: string; pct: number }[],
) {
  const { subject, html } = buildSeekerMatchAlert(firstName, jobTitle, company, matchPct, salary, location, reasons);
  await send(email, subject, html);
}

export async function sendRecruiterMatchSummary(
  email: string, firstName: string, jobTitle: string, company: string,
  jobId: string, matchCount: number, excellentCount: number,
  top3: { name: string; title: string | null; location: string | null; score: number }[],
) {
  const { subject, html } = buildRecruiterMatchSummary(firstName, jobTitle, company, jobId, matchCount, excellentCount, top3);
  await send(email, subject, html);
}

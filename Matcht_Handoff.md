# Matcht — Session Handoff Document
*Generated: May 19, 2026*

---

## What was built today

### Files to download

| File | What it is |
|---|---|
| `MatchtSurvey.jsx` | Full 8-section candidate onboarding survey |
| `MatchtRecruiterSurvey.jsx` | Full 6-section recruiter job posting survey |
| `matchConstants.js` | Shared vocabulary used by both surveys (industries, skills, personality dims, culture descriptors) — source of truth for matching |
| `MatchtEmails.jsx` | All 12 email templates (7 seeker, 5 recruiter) with preview UI |
| `MatchtPricing.jsx` | Full pricing page — seeker free model + recruiter tiers + add-ons |
| `MatchtFeedbackFlow.jsx` | End-to-end recruiter feedback flow with candidate-side add-on triggers |

---

## Pricing model (decided today)

### Job seekers — always free
Every feature is free. No paid tiers. No trial periods. No exceptions.

**Free includes:** profile, matching, match scores, notifications, feedback, dashboard, profile editing, video upload.

**Add-ons (à la carte, triggered by recruiter feedback):**

| Add-on | Price | Triggered when recruiter says... |
|---|---|---|
| Skill Gap Report | $9.99 | Skills don't match |
| Salary Benchmarking Report | $4.99 | Salary expectations too high |
| Profile & Resume Review | $79 | Education / experience gap |
| Personality & Culture Coaching | $79 | Work style / culture mismatch |
| Profile Boost | $4.99 | Not enough experience / low visibility |
| Unlock Full Feedback | $2.99 | Any rejection (notes locked by default) |
| Video Review | $49 | Video intro wasn't strong enough |
| Match Score Audit | $14.99 | Consistently low match scores |

### Recruiters — subscription

| Plan | Monthly | Annual | Key limits |
|---|---|---|---|
| Starter | $99 | $79 | 5 jobs, unlimited views |
| Growth | $179 | $139 | 15 jobs, smart filters, analytics |
| Pro | $299 | $239 | 25 jobs, early access, 3 seats |
| Executive | $499 | $399 | VP+ pool, 10 jobs, account manager |
| Agency | $1,999 | $1,599 | Unlimited jobs, multi-client, API |
| Enterprise | Custom | Custom | ATS integration, SSO, SLA |

**Recruiter add-ons:**
- Candidate Background Verification — $19.99/candidate
- Featured Job Post — $49/post
- Talent Market Report — $99
- Video Screening Package — $199/role

**Free trial:** 14 days, no credit card, feature-limited (not time-pressured).

---

## Feedback flow (key product decision)

**Recruiter feedback is required — not optional.** When a recruiter passes on a candidate, they must select one of 10 reasons before the action completes. This is enforced at the UI and API level.

**10 feedback reasons:**
1. Skills don't match the role
2. Salary expectations above our range
3. Not enough experience for this level
4. Education background doesn't meet requirements
5. Work style or culture fit concerns
6. Location or availability doesn't work
7. Candidate appears overqualified
8. Role has been filled
9. Video intro wasn't strong enough
10. Other reason

**How feedback flows:**
- Recruiter selects reason (required) + optional notes
- If notes exist, candidate sees the category for free, pays $2.99 to unlock notes
- Each reason triggers a specific relevant add-on offer to the candidate
- Recruiter is shown a preview of what the candidate will see before confirming
- All feedback is delivered anonymously (recruiter identity not shown to candidate)

---

## Matching alignment (key technical decision)

Both surveys use identical vocabulary from `matchConstants.js` so the scoring engine can compare apples to apples:

| Dimension | How it's matched |
|---|---|
| Skills | Candidate skills vs recruiter required/nice-to-have skills — overlap % |
| Salary | Candidate range vs recruiter range — overlap check |
| Experience | Candidate years vs recruiter minimum — meets-or-exceeds |
| Education | Candidate level vs recruiter minimum — meets-or-exceeds |
| Culture | Same 10 descriptors on both sides — overlap % |
| Personality | Same 12 behavioral scales (1–5) on both sides — difference score per dimension |
| Management style | Same 5 options on both sides — exact match |
| Remote / location | Mapped compatibility (e.g. remote-only candidate vs on-site role = 0%) |
| Availability | Candidate start date vs recruiter target start — window overlap |
| Travel | Candidate willingness vs role requirement — meets-or-exceeds |

**Recruiter scoring weights** (set per job posting in Section 6 of recruiter survey) modify how much each dimension contributes to the final match %.

---

## Email triggers (12 templates built)

### Seeker emails
| Template | Trigger |
|---|---|
| Welcome | Account created |
| Profile live + first matches | Profile survey completed |
| New match alert | Role matches above threshold |
| Recruiter viewed profile | Recruiter views seeker profile |
| Shortlisted | Recruiter shortlists candidate |
| Feedback received | Recruiter passes with reason |
| Weekly / monthly digest | Scheduled (seeker chooses frequency) |

### Recruiter emails
| Template | Trigger |
|---|---|
| Welcome | Account created |
| Job is live | Job posting submitted |
| New strong candidate | Candidate scores above threshold on role |
| Candidate applied | Candidate applies to role |
| Weekly / monthly digest | Scheduled |

**From name:** The Matcht Team  
**From address:** hello@getmatcht.com  
**Digest frequency:** Seeker chooses weekly or monthly in notification settings  

---

## What to tell Claude Code when you're home

### 1. Wire in the candidate survey
> *I have a new file `MatchtSurvey.jsx` — an 8-section candidate onboarding survey. Replace the existing profile builder in the app with this. All fields need to be saved to Supabase. Run a migration for any missing columns. The survey should only show once after signup. Returning users go straight to the dashboard.*

### 2. Wire in the recruiter survey
> *I have `MatchtRecruiterSurvey.jsx` — a 6-section recruiter job posting survey. Replace the existing job post flow with this. Save all fields to Supabase. The shared vocabulary lives in `matchConstants.js` — use it as the source of truth for all dropdown options in both surveys.*

### 3. Wire in the feedback flow
> *I have `MatchtFeedbackFlow.jsx` — the recruiter feedback flow. Selecting a rejection reason must be required and enforced server-side. Feedback is stored in Supabase and triggers: (a) a notification to the candidate, (b) an email using the "Feedback received" template, (c) an add-on offer in the candidate dashboard. The mapping of reason → add-on is defined in the file.*

### 4. Wire in email templates
> *I have `MatchtEmails.jsx` with 12 email templates. Wire these using Resend. Trigger each from the appropriate Supabase event or API route. Seekers can choose weekly or monthly digest frequency in notification settings — store this preference in their profile row.*

### 5. Replace the pricing page
> *I have `MatchtPricing.jsx` — replace the existing pricing page with this. The seeker tab should have no paid plans. Recruiter plans need to be gated via Stripe — stub the payment logic for now and add a TODO comment where Stripe needs to connect.*

### 6. Deploy to getmatcht.com
> *Push the current codebase to GitHub and deploy to Vercel. Connect the domain getmatcht.com. Add all env vars from .env.local to Vercel. Update Supabase Auth > URL Configuration: Site URL = https://getmatcht.com, Redirect URLs = https://getmatcht.com/** and https://matcht.vercel.app/**.*

---

## What's still left to build (priority order)

1. **Deploy to getmatcht.com** — Vercel + GitHub push (you were mid-way through this tonight)
2. **Wire surveys into real app** — Claude Code task above
3. **Feedback flow enforcement** — server-side required reason
4. **Email notifications** — Resend integration
5. **Video upload** — wire to Supabase Storage
6. **Stripe** — recruiter billing (stubbed, not connected)
7. **Profile editing** — let users update survey answers post-submission
8. **Go-to-market strategy** — next session topic
9. **Admin dashboard** — connect to real data
10. **Gamification** — badges, progress, avatars (Phase 2)
11. **In-app messaging** — recruiter ↔ candidate DMs (Phase 2)
12. **iOS / Android app** (Phase 2)

---

## Domain
**getmatcht.com** — purchased and ready. Point to Vercel when deployed.

---

*All files built in Claude.ai. Download MatchtSurvey.jsx, MatchtRecruiterSurvey.jsx, matchConstants.js, MatchtEmails.jsx, MatchtPricing.jsx, and MatchtFeedbackFlow.jsx.*

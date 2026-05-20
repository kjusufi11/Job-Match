import { useState } from "react";

// ── EMAIL TEMPLATE SYSTEM ─────────────────────────────────────────────────────
// 12 templates total: 7 seeker, 5 recruiter
// Seeker tone: warm, encouraging, human
// Recruiter tone: clean, professional, direct
// From: The Matcht Team

const C = {
  bg: "#F0F4F7", white: "#FFFFFF", teal: "#1A8C8C", tealDim: "#1A8C8C12",
  tealBorder: "#1A8C8C35", tealDark: "#116060", slate: "#1E2D3A",
  gray100: "#E3ECF1", gray400: "#8FAABB", gray600: "#4E6475",
  border: "#D4E3EC", green: "#19A87A", amber: "#C9870C", red: "#C0392B",
  purple: "#6B5EA8",
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

// ── SAMPLE DATA FOR PREVIEWS ──────────────────────────────────────────────────
const SAMPLE = {
  seeker: {
    firstName: "Alex",
    jobTitle: "Senior Product Manager",
    company: "Aether Technologies",
    matchPct: 94,
    salary: "$130–160k",
    location: "Remote",
    matchCount: 3,
    recruiterCompany: "Meridian Health",
    feedbackReason: "Looking for someone with more FinTech-specific experience.",
    topMatches: [
      { title: "Senior Product Manager", company: "Aether Technologies", match: 94, salary: "$130–160k", location: "Remote" },
      { title: "Director of Marketing", company: "Nova Brands", match: 88, salary: "$110–140k", location: "Chicago, IL" },
      { title: "Operations Lead", company: "Meridian Health", match: 81, salary: "$90–115k", location: "Hybrid" },
    ],
  },
  recruiter: {
    firstName: "Sarah",
    company: "Aether Technologies",
    jobTitle: "Senior Product Manager",
    candidateName: "Maya Chen",
    candidateTitle: "Senior PM",
    candidateExp: "8 years",
    matchPct: 96,
    applicantCount: 47,
    shortlistedCount: 3,
    newMatchCount: 5,
    activeJobs: [
      { title: "Senior Product Manager", applicants: 47, newThisWeek: 5, shortlisted: 3 },
      { title: "Product Analyst", applicants: 31, newThisWeek: 3, shortlisted: 1 },
    ],
  },
};

// ── EMAIL SHELL ───────────────────────────────────────────────────────────────
function EmailShell({ children, preheader }) {
  return (
    <div style={{ background: C.bg, padding: "32px 16px", fontFamily: F, minHeight: "100%" }}>
      {preheader && <div style={{ fontSize: 0, color: C.bg, maxHeight: 0, overflow: "hidden" }}>{preheader}</div>}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ padding: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: C.white }}>M</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.slate, letterSpacing: -0.3 }}>Matcht</span>
        </div>
        {/* Body */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {children}
        </div>
        {/* Footer */}
        <div style={{ padding: "20px 0 0", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.gray400, margin: "0 0 6px", fontFamily: F }}>The Matcht Team · getmatcht.com</p>
          <p style={{ fontSize: 12, color: C.gray400, margin: 0, fontFamily: F }}>
            <a href="#" style={{ color: C.gray400 }}>Manage notifications</a> · <a href="#" style={{ color: C.gray400 }}>Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroBand({ color = C.teal, children }) {
  return <div style={{ background: color, padding: "32px 36px 28px" }}>{children}</div>;
}
function Body({ children }) {
  return <div style={{ padding: "28px 36px" }}>{children}</div>;
}
function CtaBtn({ label, color = C.teal }) {
  return (
    <div style={{ textAlign: "center", margin: "24px 0 8px" }}>
      <a href="#" style={{ display: "inline-block", background: color, color: C.white, padding: "13px 32px", borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none", fontFamily: F }}>{label}</a>
    </div>
  );
}
function Divider() { return <div style={{ borderTop: `1px solid ${C.border}`, margin: "22px 0" }} />; }
function MatchBadge({ pct }) {
  const color = pct >= 85 ? C.green : pct >= 70 ? C.amber : C.red;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}14`, border: `1px solid ${color}44`, borderRadius: 20, padding: "4px 12px" }}>
      <span style={{ fontWeight: 800, fontSize: 15, color }}>{pct}%</span>
      <span style={{ fontSize: 12, color, fontWeight: 600 }}>{pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : "Fair"} match</span>
    </span>
  );
}
function JobCard({ title, company, match, salary, location }) {
  const matchColor = match >= 85 ? C.green : match >= 70 ? C.amber : C.red;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2.5px solid ${matchColor}`, background: `${matchColor}14`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: matchColor, lineHeight: 1 }}>{match}%</div>
        <div style={{ fontSize: 8, color: matchColor, fontWeight: 700 }}>{match >= 85 ? "Excellent" : "Good"}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.gray600 }}>{company} · {location} · {salary}</div>
      </div>
    </div>
  );
}
function StatRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 14, color: C.gray600, fontFamily: F }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: highlight ? C.teal : C.slate, fontFamily: F }}>{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SEEKER EMAILS (warm, encouraging)
// ══════════════════════════════════════════════════════════════════════════════

function SeekerWelcome() {
  const { firstName } = SAMPLE.seeker;
  return (
    <EmailShell preheader="You're in — let's find your next role.">
      <HeroBand>
        <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>Welcome to Matcht, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F, lineHeight: 1.6 }}>You just did something most job seekers never do — you made the process work for you instead of the other way around.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 15, color: C.slate, lineHeight: 1.7, margin: "0 0 18px", fontFamily: F }}>Here's how Matcht works for you from here:</p>
        {[
          ["🎯", "You get matched automatically", "As soon as recruiters post roles, our engine scores you against them across 8 dimensions. You'll hear from us when something fits."],
          ["📬", "No more applications", "You've already done the work. Recruiters come to you — ranked by how well you fit, not by who applied first."],
          ["🎥", "Add a video to stand out", "Candidates with a short video intro are 4× more likely to get a callback. It takes less than 5 minutes."],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, marginBottom: 4, fontFamily: F }}>{title}</div>
              <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, fontFamily: F }}>{desc}</div>
            </div>
          </div>
        ))}
        <CtaBtn label="Complete my profile →" />
        <p style={{ fontSize: 13, color: C.gray400, textAlign: "center", margin: "12px 0 0", fontFamily: F }}>Your profile is live. Matches are on their way.</p>
      </Body>
    </EmailShell>
  );
}

function SeekerProfileLive() {
  const { firstName, topMatches } = SAMPLE.seeker;
  return (
    <EmailShell preheader={`${topMatches.length} roles already match your profile — take a look.`}>
      <HeroBand color="#116060">
        <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>Your profile is live, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F, lineHeight: 1.6 }}>We've already found {topMatches.length} roles that match your criteria. Here's a preview.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 14, color: C.gray600, margin: "0 0 16px", fontFamily: F }}>These are your top matches right now — ranked by how well they fit your skills, salary, personality, and preferences.</p>
        {topMatches.map(j => <JobCard key={j.title} {...j} />)}
        <CtaBtn label="See all my matches →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, margin: 0, fontFamily: F }}>💡 <strong>Pro tip:</strong> Adding a 2–3 minute video intro to your profile makes you 4× more likely to hear back from recruiters. You can add one anytime from your profile page.</p>
      </Body>
    </EmailShell>
  );
}

function SeekerNewMatch() {
  const { firstName, jobTitle, company, matchPct, salary, location, matchCount } = SAMPLE.seeker;
  return (
    <EmailShell preheader={`${matchPct}% match — ${jobTitle} at ${company}`}>
      <HeroBand>
        <div style={{ marginBottom: 10 }}>
          <MatchBadge pct={matchPct} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "8px 0 6px", letterSpacing: -0.5, fontFamily: F }}>A strong match just came in, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>{jobTitle} at {company}</p>
      </HeroBand>
      <Body>
        <div style={{ background: C.bg, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
          {[["Role", jobTitle], ["Company", company], ["Location", location], ["Salary", salary], ["Match score", `${matchPct}% — Excellent`]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "8px 0" }}>
              <span style={{ fontSize: 13, color: C.gray600, width: 100, flexShrink: 0, fontFamily: F }}>{l}</span>
              <span style={{ fontSize: 13, color: C.slate, fontWeight: 600, fontFamily: F }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 6px", fontFamily: F }}>This role scored highly against your profile across skills, salary, and work style. You don't need to do anything — if you're interested, just hit apply and your profile does the rest.</p>
        {matchCount > 1 && <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 20px", fontFamily: F }}>You also have <strong>{matchCount - 1} other new match{matchCount - 1 > 1 ? "es" : ""}</strong> waiting.</p>}
        <CtaBtn label="View this role →" />
      </Body>
    </EmailShell>
  );
}

function SeekerProfileViewed() {
  const { firstName, recruiterCompany } = SAMPLE.seeker;
  return (
    <EmailShell preheader={`${recruiterCompany} just viewed your Matcht profile.`}>
      <HeroBand color={C.purple}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>👁</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>Someone's interested, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>A recruiter at {recruiterCompany} just viewed your profile.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 15, color: C.slate, lineHeight: 1.7, margin: "0 0 18px", fontFamily: F }}>This is a good sign — recruiters on Matcht only view profiles when they're seriously considering a candidate. You're on their radar.</p>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 22px", fontFamily: F }}>Now's a great time to make sure your profile is as strong as it can be. If you haven't added a video intro yet, this is the moment — candidates with video are 4× more likely to move forward.</p>
        <CtaBtn label="View my profile →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>You can see all profile views and recruiter activity in your dashboard at any time.</p>
      </Body>
    </EmailShell>
  );
}

function SeekerShortlisted() {
  const { firstName, jobTitle, company } = SAMPLE.seeker;
  return (
    <EmailShell preheader={`🌟 You've been shortlisted for ${jobTitle} at ${company}.`}>
      <HeroBand color={C.green}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>You've been shortlisted, {firstName}!</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", margin: 0, fontFamily: F }}>{company} has moved you to the top of their list for {jobTitle}.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 15, color: C.slate, lineHeight: 1.7, margin: "0 0 16px", fontFamily: F }}>This is a big deal. Being shortlisted means the recruiter has reviewed your profile and thinks you're one of the best fits for this role.</p>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 22px", fontFamily: F }}>Expect to hear from {company} directly through Matcht. In the meantime, you might want to research the company and think about what you'd want to cover in a first conversation.</p>
        <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.slate, marginBottom: 4, fontFamily: F }}>{jobTitle}</div>
          <div style={{ fontSize: 13, color: C.gray600, fontFamily: F }}>{company}</div>
        </div>
        <CtaBtn label="View this role →" color={C.green} />
      </Body>
    </EmailShell>
  );
}

function SeekerFeedback() {
  const { firstName, jobTitle, company, feedbackReason } = SAMPLE.seeker;
  return (
    <EmailShell preheader={`Feedback from ${company} on your application.`}>
      <HeroBand color={C.slate}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>You received feedback, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", margin: 0, fontFamily: F }}>{company} passed on your application for {jobTitle} — and they told us why.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 16px", fontFamily: F }}>Most companies never explain why. The fact that {company} shared this is rare — and genuinely useful.</p>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: F }}>Their feedback</div>
          <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.65, margin: 0, fontFamily: F, fontStyle: "italic" }}>"{feedbackReason}"</p>
        </div>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 22px", fontFamily: F }}>This doesn't mean you're not a great candidate — it means this particular role wasn't the right fit. Your profile is still live, and other roles are being scored against you right now.</p>
        <CtaBtn label="See my current matches →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>Every "pass" brings you closer to the right fit. Keep going — the right role is out there.</p>
      </Body>
    </EmailShell>
  );
}

function SeekerDigest() {
  const { firstName, topMatches } = SAMPLE.seeker;
  const weekOf = "May 12 – 18, 2026";
  return (
    <EmailShell preheader={`Your Matcht summary for the week of ${weekOf}.`}>
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 6px", letterSpacing: -0.5, fontFamily: F }}>Your weekly summary, {firstName}.</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0, fontFamily: F }}>Week of {weekOf}</p>
      </HeroBand>
      <Body>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[["New matches", "5", C.teal], ["Profile views", "3", C.purple], ["Strong matches", "2", C.green]].map(([l, v, col]) => (
            <div key={l} style={{ background: C.bg, borderRadius: 9, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: col, fontFamily: F }}>{v}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 3, fontFamily: F }}>{l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.slate, margin: "0 0 12px", fontFamily: F }}>Your top matches this week</p>
        {topMatches.map(j => <JobCard key={j.title} {...j} />)}
        <CtaBtn label="See all matches →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>You're receiving weekly digests. You can switch to monthly or turn these off in your <a href="#" style={{ color: C.teal }}>notification settings</a>.</p>
      </Body>
    </EmailShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RECRUITER EMAILS (clean, professional, direct)
// ══════════════════════════════════════════════════════════════════════════════

function RecruiterWelcome() {
  const { firstName, company } = SAMPLE.recruiter;
  return (
    <EmailShell preheader="Your account is active. Post your first role to start receiving ranked candidates.">
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>Welcome to Matcht, {firstName}.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>Your recruiter account for {company} is active.</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7, margin: "0 0 18px", fontFamily: F }}>Here's how Matcht works for recruiters:</p>
        {[
          ["Post a role", "Complete our job posting survey — it takes about 10 minutes. The more detail you provide, the better your matches."],
          ["Get ranked candidates", "As soon as your role is live, candidates are scored against it automatically. You get a ranked list, not a stack of resumes."],
          ["Review and shortlist", "Each candidate comes with a match score, dimension breakdown, and — where available — a video intro. Shortlist or pass with one click."],
          ["Give feedback", "When you pass on a candidate, you can share why. It improves the platform for everyone."],
        ].map(([title, desc]) => (
          <div key={title} style={{ borderLeft: `3px solid ${C.teal}`, paddingLeft: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, marginBottom: 3, fontFamily: F }}>{title}</div>
            <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, fontFamily: F }}>{desc}</div>
          </div>
        ))}
        <CtaBtn label="Post your first role →" />
      </Body>
    </EmailShell>
  );
}

function RecruiterJobLive() {
  const { firstName, jobTitle, company } = SAMPLE.recruiter;
  return (
    <EmailShell preheader={`${jobTitle} is live. Candidates are being ranked now.`}>
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 8px", letterSpacing: -0.5, fontFamily: F }}>Your role is live.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>{jobTitle} · {company}</p>
      </HeroBand>
      <Body>
        <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7, margin: "0 0 20px", fontFamily: F }}>Candidates are being scored and ranked against your requirements right now. You'll receive a notification as strong matches come in.</p>
        {[
          ["What happens next", "Matcht scores every eligible candidate across your 8 dimensions using the weights you set. The ranked list updates in real time."],
          ["When to expect results", "You'll typically see your first strong matches within 24–48 hours. We'll email you as they come in."],
          ["Editing your posting", "You can update your posting, adjust scoring weights, or pause the role at any time from your dashboard."],
        ].map(([title, desc]) => (
          <div key={title} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.slate, marginBottom: 3, fontFamily: F }}>{title}</div>
            <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, fontFamily: F }}>{desc}</div>
          </div>
        ))}
        <CtaBtn label="View candidate pipeline →" />
      </Body>
    </EmailShell>
  );
}

function RecruiterNewCandidate() {
  const { firstName, jobTitle, candidateName, candidateTitle, candidateExp, matchPct } = SAMPLE.recruiter;
  const matchColor = matchPct >= 85 ? C.green : matchPct >= 70 ? C.amber : C.red;
  return (
    <EmailShell preheader={`${matchPct}% match — ${candidateName} for ${jobTitle}.`}>
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 6px", letterSpacing: -0.5, fontFamily: F }}>Strong candidate match.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>{jobTitle}</p>
      </HeroBand>
      <Body>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.bg, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.tealDim, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: C.teal, flexShrink: 0 }}>
            {candidateName.split(" ").map(n => n[0]).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.slate, fontFamily: F }}>{candidateName}</div>
            <div style={{ fontSize: 13, color: C.gray600, fontFamily: F }}>{candidateTitle} · {candidateExp} experience</div>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${matchColor}`, background: `${matchColor}14`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: matchColor, lineHeight: 1 }}>{matchPct}%</div>
            <div style={{ fontSize: 8, color: matchColor, fontWeight: 700 }}>Excellent</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.7, margin: "0 0 20px", fontFamily: F }}>This candidate scored in the top tier across your scoring dimensions. View their full profile and video intro to evaluate fit.</p>
        <CtaBtn label="View candidate profile →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>You can shortlist, pass, or send feedback directly from the candidate profile page.</p>
      </Body>
    </EmailShell>
  );
}

function RecruiterCandidateApplied() {
  const { firstName, jobTitle, candidateName, candidateTitle, matchPct, applicantCount } = SAMPLE.recruiter;
  return (
    <EmailShell preheader={`${candidateName} applied to ${jobTitle}.`}>
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 6px", letterSpacing: -0.5, fontFamily: F }}>New application received.</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, fontFamily: F }}>{jobTitle} · {applicantCount} total applicants</p>
      </HeroBand>
      <Body>
        <StatRow label="Candidate" value={candidateName} />
        <StatRow label="Current title" value={candidateTitle} />
        <StatRow label="Match score" value={`${matchPct}% — Excellent`} highlight />
        <StatRow label="Applied to" value={jobTitle} />
        <div style={{ height: 12 }} />
        <CtaBtn label="Review application →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>All applications are visible in your candidate pipeline, ranked by match score.</p>
      </Body>
    </EmailShell>
  );
}

function RecruiterDigest() {
  const { firstName, activeJobs } = SAMPLE.recruiter;
  const weekOf = "May 12 – 18, 2026";
  const totalApplicants = activeJobs.reduce((a, j) => a + j.applicants, 0);
  const totalNew = activeJobs.reduce((a, j) => a + j.newThisWeek, 0);
  const totalShortlisted = activeJobs.reduce((a, j) => a + j.shortlisted, 0);
  return (
    <EmailShell preheader={`Your Matcht recruiter summary — week of ${weekOf}.`}>
      <HeroBand>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 6px", letterSpacing: -0.5, fontFamily: F }}>Weekly summary.</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0, fontFamily: F }}>Week of {weekOf} · {activeJobs.length} active role{activeJobs.length > 1 ? "s" : ""}</p>
      </HeroBand>
      <Body>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[["Total applicants", totalApplicants, C.slate], ["New this week", totalNew, C.teal], ["Shortlisted", totalShortlisted, C.green]].map(([l, v, col]) => (
            <div key={l} style={{ background: C.bg, borderRadius: 9, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: col, fontFamily: F }}>{v}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 3, fontFamily: F }}>{l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.slate, margin: "0 0 10px", fontFamily: F }}>Active roles</p>
        {activeJobs.map(j => (
          <div key={j.title} style={{ border: `1px solid ${C.border}`, borderRadius: 9, padding: "13px 15px", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.slate, marginBottom: 6, fontFamily: F }}>{j.title}</div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Total applicants", j.applicants], ["New this week", j.newThisWeek], ["Shortlisted", j.shortlisted]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.teal, fontFamily: F }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.gray600, fontFamily: F }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <CtaBtn label="View all candidates →" />
        <Divider />
        <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0, fontFamily: F }}>You're receiving weekly digests. Switch to monthly in your <a href="#" style={{ color: C.teal }}>notification settings</a>.</p>
      </Body>
    </EmailShell>
  );
}

// ── PREVIEW UI ────────────────────────────────────────────────────────────────
const EMAILS = {
  seeker: [
    { id: "s1", label: "Welcome", component: SeekerWelcome },
    { id: "s2", label: "Profile live + first matches", component: SeekerProfileLive },
    { id: "s3", label: "New match alert", component: SeekerNewMatch },
    { id: "s4", label: "Recruiter viewed profile", component: SeekerProfileViewed },
    { id: "s5", label: "Shortlisted!", component: SeekerShortlisted },
    { id: "s6", label: "Feedback received", component: SeekerFeedback },
    { id: "s7", label: "Weekly / monthly digest", component: SeekerDigest },
  ],
  recruiter: [
    { id: "r1", label: "Welcome", component: RecruiterWelcome },
    { id: "r2", label: "Job is live", component: RecruiterJobLive },
    { id: "r3", label: "New strong candidate", component: RecruiterNewCandidate },
    { id: "r4", label: "Candidate applied", component: RecruiterCandidateApplied },
    { id: "r5", label: "Weekly / monthly digest", component: RecruiterDigest },
  ],
};

export default function App() {
  const [side, setSide] = useState("seeker");
  const [active, setActive] = useState("s1");
  const list = EMAILS[side];
  const current = list.find(e => e.id === active) || list[0];
  const EmailComponent = current.component;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: F, background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: C.white }}>M</div>
            <span style={{ fontWeight: 800, fontSize: 13, color: C.slate }}>Email Templates</span>
          </div>
          <div style={{ display: "flex", background: C.bg, borderRadius: 7, padding: 3, gap: 3 }}>
            {["seeker", "recruiter"].map(s => (
              <button key={s} onClick={() => { setSide(s); setActive(EMAILS[s][0].id); }} style={{ flex: 1, padding: "6px 0", borderRadius: 5, background: side === s ? C.teal : "none", color: side === s ? C.white : C.gray600, border: "none", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: F, textTransform: "capitalize" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {list.map(e => (
            <button key={e.id} onClick={() => setActive(e.id)} style={{ width: "100%", padding: "9px 16px", border: "none", background: active === e.id ? C.tealDim : "none", borderLeft: `3px solid ${active === e.id ? C.teal : "transparent"}`, color: active === e.id ? C.teal : C.gray600, fontWeight: active === e.id ? 700 : 400, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: F, lineHeight: 1.4 }}>
              {e.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.gray400, fontFamily: F }}>{EMAILS.seeker.length + EMAILS.recruiter.length} templates total</div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "14px 20px", background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: 1 }}>Preview</div>
          <div style={{ fontSize: 13, color: C.slate, fontWeight: 600 }}>{current.label}</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: C.gray400 }}>From: The Matcht Team &lt;hello@getmatcht.com&gt;</div>
        </div>
        <EmailComponent />
      </div>
    </div>
  );
}

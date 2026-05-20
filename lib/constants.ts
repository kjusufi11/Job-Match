// ── SHARED MATCHING VOCABULARY ────────────────────────────────────────────────
// Single source of truth for both candidate and recruiter surveys.
// Any change here affects both sides — intentional.

export const INDUSTRIES = [
  "Accounting & Tax","Advertising & PR","Agriculture & Farming","Architecture & Design",
  "Automotive","Aviation & Aerospace","Banking & Financial Services","Biotechnology",
  "Cannabis","Chemical Manufacturing","Clean Energy & Sustainability","Construction",
  "Consulting & Professional Services","Consumer Goods","Cybersecurity","Data & Analytics",
  "Defense & Military","E-commerce","Education & EdTech","Energy & Utilities",
  "Engineering","Entertainment & Media","Environmental Services","Fashion & Apparel",
  "Film & TV Production","FinTech","Food & Beverage","Gaming","Government & Public Sector",
  "Healthcare — Clinical","Healthcare — Admin & Operations","Healthcare Technology",
  "Hospitality & Tourism","Human Resources & Staffing","Insurance","Interior Design",
  "Internet & Software","Investment Management","Legal Services","Logistics & Supply Chain",
  "Manufacturing","Marketing & Growth","Mining & Natural Resources","Music & Audio",
  "Non-profit & NGO","Pharmaceuticals","Photography & Visual Arts","Publishing & Journalism",
  "Real Estate","Retail & Consumer","SaaS / Cloud","Security Services","Social Impact",
  "Sports & Recreation","Telecommunications","Transportation","Venture Capital & Private Equity",
  "Veterinary & Animal Services","Wellness & Fitness","Other",
];

export const SOFT_SKILLS = [
  "Active listening","Adaptability","Coaching & mentoring","Collaboration & teamwork",
  "Communication","Conflict resolution","Creativity","Critical thinking","Decision-making",
  "Emotional intelligence","Leadership","Negotiation","Presentation & public speaking",
  "Problem-solving","Strategic thinking","Time management",
];

export const TECH_SKILLS = [
  "Accounting & financial software","Advanced Excel / Google Sheets","Cloud platforms (AWS, Azure, GCP)",
  "CRM software (Salesforce, HubSpot)","Data analysis & BI tools (Tableau, Power BI)",
  "ERP systems (SAP, Oracle)","Figma / Adobe Creative Suite","Google Workspace / Microsoft Office",
  "Jira / Asana / Monday.com","Legal software (Clio, LexisNexis)","Marketing automation (Marketo, HubSpot)",
  "Python or R","Recruiting & HRIS tools","Social media management","Software development & coding",
  "SQL & databases","Video editing & production",
];

export const EDUCATION_LEVELS = [
  "No requirement / any","High school diploma / GED","Some college (no degree)",
  "Associate's degree","Bachelor's degree","Master's degree","MBA",
  "JD / Law degree","MD / Medical degree","PhD or Doctorate",
  "Vocational / Trade certification","Bootcamp or professional program",
];

// Same 10 descriptors on both sides — overlap % = culture match score
export const CULTURE_DESCRIPTORS = [
  "Fast-paced & high-energy",
  "Collaborative & team-first",
  "Data-driven & analytical",
  "Creative & experimental",
  "Process-driven & structured",
  "Mission-driven & purpose-led",
  "Performance & results-oriented",
  "Autonomous & self-directed",
  "Transparent & flat hierarchy",
  "Stable & predictable",
];

export const EMPLOYMENT_TYPES = [
  "Full-time (permanent)",
  "Part-time",
  "Contract / Freelance",
  "Contract-to-hire",
  "Internship",
  "Temporary / Seasonal",
];

// Recruiter-framed personality dimensions (candidate framing is in profile/page.tsx)
export const PERSONALITY_DIMS_RECRUITER = [
  { id:"EI",         q:"For this role, the ideal candidate in social situations...",    low:"Works best in small groups or 1-on-1",      high:"Thrives in large groups & high-energy settings" },
  { id:"SN",         q:"For this role, we need someone who relies on...",               low:"Facts, data & proven methods",               high:"Intuition, pattern recognition & future thinking" },
  { id:"TF",         q:"Day-to-day, this role requires decisions driven by...",         low:"Logic & objective analysis",                 high:"Empathy & people-centered judgment" },
  { id:"JP",         q:"This role is best suited to someone who prefers work to be...", low:"Planned, structured & decided",              high:"Flexible, open & spontaneous" },
  { id:"stress",     q:"Under pressure and tight deadlines, this person should...",     low:"Stay calm & methodical",                     high:"Feel energized & move faster" },
  { id:"conflict",   q:"When disagreements arise, this role requires someone who...",   low:"Manages conflict diplomatically",             high:"Addresses it directly & advocates their view" },
  { id:"ambiguity",  q:"The level of ambiguity in this role is...",                     low:"Low — clear processes & direction provided", high:"High — must create structure from scratch" },
  { id:"risk",       q:"The risk tolerance this role requires is...",                   low:"Conservative — proven paths preferred",      high:"Bold — comfortable with high-risk decisions" },
  { id:"detail",     q:"This role requires someone who is...",                          low:"Big picture — delegates the details",         high:"Detail-oriented — owns everything end-to-end" },
  { id:"change",     q:"When priorities shift suddenly, this person should...",         low:"Need time to adjust",                        high:"Adapt quickly & see it as opportunity" },
  { id:"recognition",q:"The team culture around recognition is...",                    low:"Private — individual thank-yous",             high:"Public — celebrates wins openly" },
  { id:"collab",     q:"Day-to-day, this role is primarily...",                         low:"Independent work with minimal collaboration", high:"Deeply collaborative & team-dependent" },
];

export const MGMT_STYLES = [
  "Hands-off — sets goals and trusts the team",
  "Collaborative — involved but not directive",
  "Structured — clear expectations and regular feedback",
  "Mentor-focused — invested in growth and development",
  "Varies — adapts to each person",
];

export const REMOTE_OPTIONS_SEEKER = [
  "Remote only — I will not commute",
  "Strongly prefer remote, open to occasional on-site",
  "Hybrid — mix of remote and office is ideal",
  "Flexible — whatever the role requires",
  "On-site preferred",
];

export const REMOTE_OPTIONS_RECRUITER = [
  "Fully remote — work from anywhere",
  "Remote with occasional on-site (1–2x/month)",
  "Hybrid — set days in office per week",
  "On-site required",
];

export const TRAVEL_LEVELS = [
  "No travel",
  "Occasional (under 10%)",
  "Moderate (10–25%)",
  "Frequent (25–50%)",
  "Heavy (50%+)",
];

export const AVAILABILITY_SEEKER = [
  "Immediately (within 2 weeks)",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Exploring — no fixed timeline",
];

export const AVAILABILITY_RECRUITER = [
  "Immediately — ASAP",
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "Flexible — right person over right timing",
];

// Scoring weight dimensions — used in recruiter survey Section 6
export const SCORE_DIMS = [
  { key:"skills",       label:"Hard skills match" },
  { key:"salary",       label:"Salary alignment" },
  { key:"experience",   label:"Years of experience" },
  { key:"education",    label:"Education level" },
  { key:"culture",      label:"Culture & personality fit" },
  { key:"location",     label:"Location / commute fit" },
  { key:"availability", label:"Availability to start" },
  { key:"workStyle",    label:"Work style alignment" },
];

// ── Backward-compat aliases ───────────────────────────────────────────────────
export const INDS_ALL = INDUSTRIES;
export const SKILLS_ALL = [...SOFT_SKILLS, ...TECH_SKILLS];

export const WEIGHT_LABELS: Record<string, string> = {
  skills:       'Hard skills match',
  salary:       'Salary alignment',
  experience:   'Years of experience',
  education:    'Education level',
  culture:      'Culture & personality fit',
  location:     'Location / commute fit',
  availability: 'Availability to start',
  work_style:   'Work style alignment',
  workStyle:    'Work style alignment',
};

export const WEIGHT_LEVEL_LABELS = ['Low', 'Low-Med', 'Medium', 'High', 'Critical'];

export const SALARY_LABELS = ['Under $60k', '$60–100k', '$100–150k', '$150–200k', '$200k+'];

export const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'Under $60k':   { min: 0,      max: 60000  },
  '$60–100k':     { min: 60000,  max: 100000 },
  '$100–150k':    { min: 100000, max: 150000 },
  '$150–200k':    { min: 150000, max: 200000 },
  '$200k+':       { min: 200000, max: 500000 },
};

export const EXP_LEVELS = ['0–2 yrs', '3–5 yrs', '6–10 yrs', '10+ yrs'];

export const REMOTE_OPTIONS = REMOTE_OPTIONS_SEEKER;

export const PQAS = [
  { q: 'Work style', opts: ['Structured & process-driven', 'Flexible & adaptive', 'Collaborative & team-focused', 'Independent & self-directed'] },
  { q: 'Ideal environment', opts: ['Fast-paced startup', 'Established corporation', 'Remote-first culture', 'Hybrid / flexible'] },
  { q: 'Feedback preference', opts: ['Frequent check-ins', 'Periodic reviews', 'As-needed only', 'Peer-based feedback'] },
];

// ── SHARED MATCHING VOCABULARY ────────────────────────────────────────────────
// These arrays are used on BOTH candidate and recruiter surveys.
// Any change here affects both sides — that's intentional.

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

// Shared vocabulary — candidate picks what they WANT, recruiter picks what describes them.
// Same 10 options, same labels. Overlap % = culture match score.
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

// Employment types — same options on both sides
export const EMPLOYMENT_TYPES = [
  "Full-time (permanent)",
  "Part-time",
  "Contract / Freelance",
  "Contract-to-hire",
  "Internship",
  "Temporary / Seasonal",
];

// Personality dimensions — ALL 12 used on both candidate and recruiter sides.
// Candidate: "I tend to..." | Recruiter: "This role requires someone who..."
export const PERSONALITY_DIMS = [
  { id:"EI",          low:"Prefers small groups or 1-on-1",          high:"Thrives in large groups & high-energy settings" },
  { id:"SN",          low:"Relies on facts, data & past experience",  high:"Relies on intuition & future possibilities" },
  { id:"TF",          low:"Prioritizes logic & objective analysis",   high:"Prioritizes people's feelings & values" },
  { id:"JP",          low:"Prefers planned, structured & decided",    high:"Prefers flexible, open & spontaneous" },
  { id:"stress",      low:"Stays calm & methodical under pressure",   high:"Feels energized & speeds up under pressure" },
  { id:"conflict",    low:"Avoids conflict, tends to accommodate",    high:"Addresses conflict directly & advocates view" },
  { id:"ambiguity",   low:"Needs clear direction & structure",        high:"Thrives with open-ended, ambiguous problems" },
  { id:"risk",        low:"Conservative — prefers proven paths",      high:"Bold — comfortable with high-risk decisions" },
  { id:"detail",      low:"Big picture — delegates the details",      high:"Detail-oriented — wants to know everything" },
  { id:"change",      low:"Finds sudden change stressful",            high:"Adapts quickly & sees change as opportunity" },
  { id:"recognition", low:"Prefers private acknowledgment",           high:"Energized by public recognition" },
  { id:"collab",      low:"Prefers working independently",            high:"Prefers working as part of a team" },
];

// Management styles — same on both sides
// Candidate: what they want FROM their manager
// Recruiter: what their manager actually does
export const MGMT_STYLES = [
  "Hands-off — sets goals and trusts the team",
  "Collaborative — involved but not directive",
  "Structured — clear expectations and regular feedback",
  "Mentor-focused — invested in growth and development",
  "Varies — adapts to each person",
];

// Remote options — same vocabulary, different framing
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

// Travel levels — same on both sides
export const TRAVEL_LEVELS = [
  "No travel",
  "Occasional (under 10%)",
  "Moderate (10–25%)",
  "Frequent (25–50%)",
  "Heavy (50%+)",
];

// Availability — seeker says when they can start, recruiter says when they need someone
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

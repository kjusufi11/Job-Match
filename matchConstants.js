// ── MATCHT SHARED CONSTANTS ───────────────────────────────────────────────────
// Single source of truth for both candidate and recruiter surveys.
// Any change here affects both sides — intentional.
// Used by: MatchtSurvey.jsx, MatchtRecruiterSurvey.jsx, lib/matching/score.ts

// ── INDUSTRIES ────────────────────────────────────────────────────────────────
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

// ── SKILLS — expanded library ─────────────────────────────────────────────────
// Free-form tag input uses these as suggestions. Not a fixed list.
export const SKILL_SUGGESTIONS = [
  // Soft / interpersonal
  "Active listening","Adaptability","Change management","Coaching","Collaboration",
  "Communication","Conflict resolution","Creative thinking","Critical thinking",
  "Cross-functional leadership","Customer empathy","Decision-making","Delegation",
  "Emotional intelligence","Executive presence","Facilitation","Feedback delivery",
  "Influencing without authority","Innovation","Leadership","Mentoring","Negotiation",
  "Organizational skills","Persuasion","Presentation skills","Problem-solving",
  "Project coordination","Public speaking","Relationship building","Resilience",
  "Self-management","Strategic thinking","Storytelling","Team building","Time management",
  "Written communication",
  // Business / functional
  "Account management","Budget management","Business development","Business analysis",
  "Change management","Client relations","Competitive analysis","Contract negotiation",
  "Cost reduction","Customer success","Due diligence","Financial modeling","Forecasting",
  "Go-to-market strategy","Growth strategy","KPI development","Market research",
  "Mergers & acquisitions","Operations management","P&L ownership","Pitch development",
  "Process improvement","Product roadmap","Program management","Project management",
  "Proposals & RFPs","Revenue operations","Risk management","Sales enablement",
  "Stakeholder management","Strategic planning","Vendor management",
  // Technical / tools
  "A/B testing","Advanced Excel","Agile / Scrum","API integration","AWS","Azure",
  "Blockchain","Business intelligence","C++","CI/CD","Cloud architecture","CSS",
  "CRM (Salesforce)","CRM (HubSpot)","Data analysis","Data engineering","Data modeling",
  "Data visualization","DevOps","Docker","ERP (SAP)","ERP (Oracle)","Figma",
  "Financial reporting","GCP","Git","Google Analytics","Google Workspace",
  "HTML","Infrastructure as code","Java","JavaScript","Kubernetes","Machine learning",
  "Marketing automation","Microsoft Office","Mobile development","MongoDB","MySQL",
  "Natural language processing","Network administration","Node.js","NoSQL",
  "Paid media","Pen testing","PostgreSQL","Power BI","Python","R","React",
  "REST APIs","SEO/SEM","Snowflake","Social media management","SQL","Swift",
  "Tableau","Terraform","TypeScript","UX research","Video production","Vue.js",
  "Webpack","WordPress",
  // Domain-specific
  "401(k) administration","Accounting (GAAP)","Audit","Benefits administration",
  "Clinical trials","Compliance","Content strategy","Copywriting","Digital marketing",
  "Email marketing","Environmental compliance","HIPAA","Immigration law","Intellectual property",
  "Investment analysis","Labor law","Lean / Six Sigma","Litigation","Logistics coordination",
  "Media buying","Medical coding","Payroll","Private equity","Real estate transactions",
  "Regulatory affairs","Supply chain","Tax preparation","Treasury management","Underwriting",
];

// ── EDUCATION LEVELS ──────────────────────────────────────────────────────────
export const EDUCATION_LEVELS = [
  "High school diploma / GED",
  "Some college (no degree)",
  "Associate's degree",
  "Bachelor's degree",
  "Master's degree",
  "MBA",
  "JD / Law degree",
  "MD / Medical degree",
  "PhD or Doctorate",
  "Vocational / Trade certification",
  "Bootcamp or professional program",
];

export const EDUCATION_LEVELS_RECRUITER = [
  "No requirement — skills matter more than credentials",
  ...EDUCATION_LEVELS,
];

// ── CULTURE DESCRIPTORS — identical on both sides ─────────────────────────────
// Candidate picks what they WANT. Recruiter picks what describes their team.
// Overlap % = culture match score.
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

// ── EMPLOYMENT TYPES — identical on both sides ────────────────────────────────
export const EMPLOYMENT_TYPES = [
  "Full-time (permanent)",
  "Part-time",
  "Contract / Freelance",
  "Contract-to-hire",
  "Internship",
  "Temporary / Seasonal",
];

// ── PERSONALITY DIMENSIONS — all 12, used on both sides ──────────────────────
// Candidate: "I tend to..." | Recruiter: "This role requires..."
export const PERSONALITY_DIMS = [
  { id:"EI",          low:"Prefers small groups or 1-on-1",           high:"Thrives in large groups & high-energy settings" },
  { id:"SN",          low:"Relies on facts, data & past experience",   high:"Relies on intuition & future possibilities" },
  { id:"TF",          low:"Prioritizes logic & objective analysis",    high:"Prioritizes people's feelings & values" },
  { id:"JP",          low:"Prefers planned, structured & decided",     high:"Prefers flexible, open & spontaneous" },
  { id:"stress",      low:"Stays calm & methodical under pressure",    high:"Feels energized & speeds up under pressure" },
  { id:"conflict",    low:"Avoids conflict, tends to accommodate",     high:"Addresses conflict directly & advocates view" },
  { id:"ambiguity",   low:"Needs clear direction & structure",         high:"Thrives with open-ended, ambiguous problems" },
  { id:"risk",        low:"Conservative — prefers proven paths",       high:"Bold — comfortable with high-risk decisions" },
  { id:"detail",      low:"Big picture — delegates the details",       high:"Detail-oriented — wants to know everything" },
  { id:"change",      low:"Finds sudden change stressful",             high:"Adapts quickly & sees change as opportunity" },
  { id:"recognition", low:"Prefers private acknowledgment",            high:"Energized by public recognition" },
  { id:"collab",      low:"Prefers working independently",             high:"Prefers working as part of a team" },
];

// ── MANAGEMENT STYLES — identical on both sides ───────────────────────────────
export const MGMT_STYLES = [
  "Hands-off — sets goals and trusts the team",
  "Collaborative — involved but not directive",
  "Structured — clear expectations and regular feedback",
  "Mentor-focused — invested in growth and development",
  "Varies — adapts to each person",
];

// ── TRAVEL LEVELS — identical on both sides ───────────────────────────────────
export const TRAVEL_LEVELS = [
  "No travel",
  "Occasional (under 10%)",
  "Moderate (10–25%)",
  "Frequent (25–50%)",
  "Heavy (50%+)",
];

// ── REMOTE OPTIONS ────────────────────────────────────────────────────────────
export const REMOTE_SEEKER = [
  "Remote only — I will not commute",
  "Strongly prefer remote, open to occasional on-site",
  "Hybrid — mix of remote and office is ideal",
  "Flexible — whatever the role requires",
  "On-site preferred",
];
export const REMOTE_RECRUITER = [
  "Fully remote — work from anywhere",
  "Remote with occasional on-site (1–2x/month)",
  "Hybrid — set days in office per week",
  "On-site required",
];

// ── AVAILABILITY ──────────────────────────────────────────────────────────────
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

// ── SCORING DIMENSIONS ────────────────────────────────────────────────────────
// Used in recruiter survey Section 6 weight sliders.
// Keys must match the scoring engine in lib/matching/score.ts
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

// ── COMMON UNIVERSITIES — for autocomplete ────────────────────────────────────
export const UNIVERSITIES = [
  "Arizona State University","Auburn University","Boston College","Boston University",
  "Brigham Young University","Brown University","Carnegie Mellon University",
  "Case Western Reserve University","Clemson University","Colorado State University",
  "Columbia University","Cornell University","Dartmouth College","Duke University",
  "Emory University","Florida State University","Fordham University",
  "George Washington University","Georgetown University","Georgia Institute of Technology",
  "Harvard University","Howard University","Indiana University","Iowa State University",
  "Johns Hopkins University","Louisiana State University","Loyola University",
  "Massachusetts Institute of Technology","Miami University","Michigan State University",
  "New York University","North Carolina State University","Northeastern University",
  "Northwestern University","Ohio State University","Oregon State University",
  "Penn State University","Princeton University","Purdue University","Rice University",
  "Rutgers University","Stanford University","Syracuse University","Temple University",
  "Texas A&M University","Tulane University","UC Berkeley","UC Davis","UC Los Angeles",
  "UC San Diego","University of Alabama","University of Arizona","University of Chicago",
  "University of Colorado","University of Connecticut","University of Florida",
  "University of Georgia","University of Illinois","University of Iowa",
  "University of Kansas","University of Kentucky","University of Maryland",
  "University of Massachusetts","University of Michigan","University of Minnesota",
  "University of Missouri","University of Nebraska","University of North Carolina",
  "University of Notre Dame","University of Oregon","University of Pennsylvania",
  "University of Pittsburgh","University of Southern California","University of Tennessee",
  "University of Texas","University of Utah","University of Virginia",
  "University of Washington","University of Wisconsin","Vanderbilt University",
  "Virginia Tech","Wake Forest University","Washington University in St. Louis",
  "Yale University","Other / Not listed",
];

// ── JOB TITLE SUGGESTIONS — for tag input normalization ──────────────────────
export const TITLE_SUGGESTIONS = [
  // Executive
  "CEO","CFO","COO","CTO","CMO","CHRO","CRO","CPO","General Counsel","Managing Director",
  "President","Executive Director","Partner",
  // VP level
  "VP of Product","VP of Engineering","VP of Sales","VP of Marketing","VP of Operations",
  "VP of Finance","VP of People","VP of Customer Success","VP of Business Development",
  "Vice President",
  // Director level
  "Director of Product","Director of Engineering","Director of Sales","Director of Marketing",
  "Director of Operations","Director of Finance","Director of People","Director of Design",
  "Director of Customer Success","Director of Data","Director of Strategy","Director",
  // Manager level
  "Product Manager","Senior Product Manager","Principal Product Manager","Group Product Manager",
  "Engineering Manager","Senior Engineering Manager","Project Manager","Program Manager",
  "Marketing Manager","Sales Manager","Account Manager","Customer Success Manager",
  "Operations Manager","Finance Manager","People Manager","Brand Manager",
  "Content Manager","Social Media Manager","Community Manager",
  // Individual contributor
  "Software Engineer","Senior Software Engineer","Staff Engineer","Principal Engineer",
  "Data Scientist","Senior Data Scientist","Data Analyst","Senior Data Analyst",
  "Data Engineer","Machine Learning Engineer","DevOps Engineer","Security Engineer",
  "UX Designer","Senior UX Designer","Product Designer","Graphic Designer",
  "UX Researcher","Content Strategist","Copywriter","Technical Writer",
  "Sales Representative","Account Executive","Business Development Representative",
  "Customer Success Specialist","Marketing Specialist","Financial Analyst",
  "Business Analyst","Operations Analyst","Recruiter","HR Generalist","HR Business Partner",
  "Accountant","Controller","Associate","Consultant","Analyst","Specialist","Coordinator",
];

// ── FEEDBACK REASONS — recruiter passes on candidate ─────────────────────────
// Each maps to a candidate-facing add-on offer.
export const FEEDBACK_REASONS = [
  { id:"skills",        label:"Skills don't match the role",                    addon:"Skill Gap Report",              addonPrice:"$9.99" },
  { id:"salary",        label:"Salary expectations above our range",            addon:"Salary Benchmarking Report",    addonPrice:"$4.99" },
  { id:"experience",    label:"Not enough experience for this level",           addon:"Profile Boost",                 addonPrice:"$4.99" },
  { id:"education",     label:"Education background doesn't meet requirements", addon:"Profile & Resume Review",       addonPrice:"$79" },
  { id:"culture",       label:"Work style or culture fit concerns",             addon:"Personality & Culture Coaching",addonPrice:"$79" },
  { id:"location",      label:"Location or availability doesn't work",          addon:"Profile Boost",                 addonPrice:"$4.99" },
  { id:"overqualified", label:"Candidate appears overqualified",               addon:"Match Score Audit",             addonPrice:"$14.99" },
  { id:"video",         label:"Video intro wasn't strong enough",               addon:"Video Review",                  addonPrice:"$49" },
  { id:"filled",        label:"Role has been filled",                           addon:"Profile Boost",                 addonPrice:"$4.99" },
  { id:"other",         label:"Other reason",                                   addon:"Unlock Full Feedback",          addonPrice:"$2.99" },
];

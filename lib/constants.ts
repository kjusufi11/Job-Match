// ── SHARED MATCHING VOCABULARY ────────────────────────────────────────────────
// Single source of truth for both candidate and recruiter surveys.
// Any change here affects both sides — intentional.

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
  "Client relations","Competitive analysis","Contract negotiation","Cost reduction",
  "Customer success","Due diligence","Financial modeling","Forecasting",
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
  "Tableau","Terraform","TypeScript","UX research","Video production","Vue.js","WordPress",
  // Domain-specific
  "401(k) administration","Accounting (GAAP)","Audit","Benefits administration",
  "Clinical trials","Compliance","Content strategy","Copywriting","Digital marketing",
  "Email marketing","Environmental compliance","HIPAA","Immigration law","Intellectual property",
  "Investment analysis","Labor law","Lean / Six Sigma","Litigation","Logistics coordination",
  "Media buying","Medical coding","Payroll","Private equity","Real estate transactions",
  "Regulatory affairs","Supply chain","Tax preparation","Treasury management","Underwriting",
];

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

export const TITLE_SUGGESTIONS = [
  // Executive
  "CEO","CFO","COO","CTO","CMO","CHRO","CRO","CPO","General Counsel","Managing Director",
  "President","Executive Director","Partner",
  // VP level
  "VP of Product","VP of Engineering","VP of Sales","VP of Marketing","VP of Operations",
  "VP of Finance","VP of People","VP of Customer Success","VP of Business Development","Vice President",
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
  // IC
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

// Seeker-framed personality dimensions (with question text)
export const PERSONALITY_DIMS_SEEKER = [
  { id:"EI",          q:"In social situations, I tend to...",               low:"Prefer small groups or 1-on-1",          high:"Thrive in large groups & high-energy settings" },
  { id:"SN",          q:"When solving problems, I rely more on...",          low:"Facts, data & past experience",          high:"Intuition & future possibilities" },
  { id:"TF",          q:"When making decisions, I prioritize...",            low:"Logic & objective analysis",             high:"People's feelings & values" },
  { id:"JP",          q:"I prefer my work to be...",                         low:"Planned, structured & decided",          high:"Flexible, open & spontaneous" },
  { id:"stress",      q:"Under pressure, I typically...",                    low:"Stay calm & methodical",                 high:"Feel energized & speed up" },
  { id:"conflict",    q:"When there's a disagreement at work...",            low:"I prefer to accommodate & avoid tension",high:"I address it directly & advocate my view" },
  { id:"ambiguity",   q:"My comfort with unclear or open-ended work is...",  low:"Low — I need clear direction",           high:"High — I thrive with ambiguous problems" },
  { id:"risk",        q:"My risk tolerance in professional decisions is...", low:"Conservative — prefer proven paths",     high:"Bold — comfortable with high-risk bets" },
  { id:"detail",      q:"My natural orientation toward detail is...",        low:"Big picture — I delegate details",       high:"Detail-oriented — want to know everything" },
  { id:"change",      q:"When the org changes direction suddenly...",        low:"I find it stressful & disruptive",       high:"I adapt quickly & see it as opportunity" },
  { id:"recognition", q:"I prefer recognition that is...",                   low:"Private — a personal thank-you",         high:"Public — acknowledged openly" },
  { id:"collab",      q:"My natural preference leans toward...",             low:"Working independently",                  high:"Working as part of a team" },
];

// Seeker education levels (no "No requirement" prefix)
export const EDUCATION_LEVELS_SEEKER = [
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

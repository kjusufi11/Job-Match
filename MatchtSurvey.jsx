import { useState } from "react";

const C = {
  bg:"#F0F4F7",white:"#FFFFFF",teal:"#1A8C8C",tealDark:"#116060",tealDim:"#1A8C8C12",tealBorder:"#1A8C8C35",
  slate:"#1E2D3A",gray100:"#E3ECF1",gray200:"#C8D8E4",gray400:"#8FAABB",gray600:"#4E6475",gray800:"#2B3D4D",
  border:"#D4E3EC",green:"#19A87A",red:"#C0392B",
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

const ALL_INDUSTRIES = [
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

const EDUCATION_OPTIONS = [
  "High school diploma / GED","Some college (no degree)","Associate's degree",
  "Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree",
  "PhD or Doctorate","Vocational / Trade certification","Bootcamp or professional program",
];

const SOFT_SKILLS = [
  "Active listening","Adaptability","Coaching & mentoring","Collaboration & teamwork",
  "Communication","Conflict resolution","Creativity","Critical thinking","Decision-making",
  "Emotional intelligence","Leadership","Negotiation","Presentation & public speaking",
  "Problem-solving","Strategic thinking","Time management",
];

const TECH_SKILLS = [
  "Accounting & financial software","Advanced Excel / Google Sheets","Cloud platforms (AWS, Azure, GCP)",
  "CRM software (Salesforce, HubSpot)","Data analysis & BI tools (Tableau, Power BI)",
  "ERP systems (SAP, Oracle)","Figma / Adobe Creative Suite","Google Workspace / Microsoft Office",
  "Jira / Asana / Monday.com","Legal software (Clio, LexisNexis)","Marketing automation (Marketo, HubSpot)",
  "Python or R","Recruiting & HRIS tools","Social media management","Software development & coding","SQL & databases",
  "Video editing & production",
];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "26px 24px", ...style }}>{children}</div>;
}
function SLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 5, fontFamily: F }}>{children}</div>;
}
function QLabel({ children, required }) {
  return <div style={{ fontSize: 15, fontWeight: 600, color: C.slate, marginBottom: 8, fontFamily: F, lineHeight: 1.4 }}>
    {children}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
  </div>;
}
function Sub({ children }) {
  return <div style={{ fontSize: 13, color: C.gray600, marginBottom: 11, fontFamily: F, lineHeight: 1.5 }}>{children}</div>;
}
function Divider() { return <div style={{ borderTop: `1px solid ${C.border}`, margin: "22px 0" }} />; }

function FInput({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "10px 13px", borderRadius: 8, background: C.bg, border: `1.5px solid ${C.border}`, color: C.slate, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: F }} />;
}
function FTextarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: "100%", padding: "10px 13px", borderRadius: 8, background: C.bg, border: `1.5px solid ${C.border}`, color: C.slate, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: F, resize: "vertical", lineHeight: 1.55 }} />;
}

// Simple single-value select dropdown
function FSelect({ value, onChange, options, placeholder }) {
  return <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "10px 13px", borderRadius: 8, background: C.bg, border: `1.5px solid ${C.border}`, color: value ? C.slate : C.gray400, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: F, cursor: "pointer" }}>
    <option value="">{placeholder || "Select..."}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}

// Searchable multi-select dropdown
function MultiDropdown({ options, values, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  function toggle(o) {
    onChange(values.includes(o) ? values.filter(x => x !== o) : [...values, o]);
  }
  return <div style={{ position: "relative" }}>
    <div onClick={() => setOpen(o => !o)} style={{ minHeight: 42, padding: "8px 13px", borderRadius: 8, background: C.bg, border: `1.5px solid ${open ? C.teal : C.border}`, cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", transition: "border .15s" }}>
      {values.length === 0 && <span style={{ color: C.gray400, fontSize: 14, fontFamily: F }}>{placeholder}</span>}
      {values.map(v => <span key={v} style={{ background: C.tealDim, border: `1px solid ${C.tealBorder}`, color: C.teal, borderRadius: 12, padding: "2px 9px", fontSize: 12, fontWeight: 600, fontFamily: F, display: "flex", alignItems: "center", gap: 4 }}>
        {v}
        <span onClick={e => { e.stopPropagation(); toggle(v); }} style={{ cursor: "pointer", fontWeight: 700, fontSize: 13 }}>×</span>
      </span>)}
      <span style={{ marginLeft: "auto", color: C.gray400, fontSize: 11 }}>{open ? "▲" : "▼"}</span>
    </div>
    {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.teal}`, borderRadius: 8, marginTop: 4, zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxHeight: 260, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.slate, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: F }} />
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filtered.map(o => <div key={o} onClick={() => toggle(o)} style={{ padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, background: values.includes(o) ? C.tealDim : "none" }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${values.includes(o) ? C.teal : C.gray200}`, background: values.includes(o) ? C.teal : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {values.includes(o) && <span style={{ color: C.white, fontSize: 10, fontWeight: 800 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: values.includes(o) ? C.teal : C.slate, fontWeight: values.includes(o) ? 600 : 400, fontFamily: F }}>{o}</span>
        </div>)}
        {filtered.length === 0 && <div style={{ padding: "14px", color: C.gray400, fontSize: 13, textAlign: "center", fontFamily: F }}>No results</div>}
      </div>
    </div>}
  </div>;
}

function RadioGroup({ options, value, onChange }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    {options.map(o => <button key={o} onClick={() => onChange(o)}
      style={{ background: value === o ? C.tealDim : C.bg, border: `1.5px solid ${value === o ? C.teal : C.border}`, borderRadius: 8, padding: "10px 13px", color: value === o ? C.teal : C.gray600, fontWeight: value === o ? 600 : 400, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: F, transition: "all .15s" }}>{o}</button>)}
  </div>;
}

function MultiPill({ options, values, onChange, max }) {
  function toggle(v) {
    if (values.includes(v)) onChange(values.filter(x => x !== v));
    else if (!max || values.length < max) onChange([...values, v]);
  }
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
    {options.map(o => <button key={o} onClick={() => toggle(o)}
      style={{ padding: "6px 13px", borderRadius: 20, background: values.includes(o) ? C.tealDim : C.bg, border: `1.5px solid ${values.includes(o) ? C.teal : C.border}`, color: values.includes(o) ? C.teal : C.gray600, fontWeight: values.includes(o) ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: F, transition: "all .15s" }}>{o}</button>)}
  </div>;
}

function MaxSlider({ value, onChange, min, max, step = 1, format }) {
  return <div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
      style={{ width: "100%", accentColor: C.teal }} />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
      <span style={{ fontSize: 12, color: C.gray400, fontFamily: F }}>{format(min)}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.teal, fontFamily: F }}>{format(value)}</span>
      <span style={{ fontSize: 12, color: C.gray400, fontFamily: F }}>{format(max)}</span>
    </div>
  </div>;
}

function RangeSlider({ minVal, maxVal, onMin, onMax, min, max, step = 1, format }) {
  return <div style={{ display: "flex", gap: 18 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: C.gray600, marginBottom: 4, fontFamily: F }}>Minimum</div>
      <input type="range" min={min} max={max} step={step} value={minVal} onChange={e => onMin(Math.min(+e.target.value, maxVal - step))} style={{ width: "100%", accentColor: C.teal }} />
      <div style={{ fontSize: 14, fontWeight: 800, color: C.teal, marginTop: 3, fontFamily: F }}>{format(minVal)}</div>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: C.gray600, marginBottom: 4, fontFamily: F }}>Maximum</div>
      <input type="range" min={min} max={max} step={step} value={maxVal} onChange={e => onMax(Math.max(+e.target.value, minVal + step))} style={{ width: "100%", accentColor: C.teal }} />
      <div style={{ fontSize: 14, fontWeight: 800, color: C.teal, marginTop: 3, fontFamily: F }}>{format(maxVal)}</div>
    </div>
  </div>;
}

function ScaleQ({ question, low, high, value, onChange }) {
  return <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: C.slate, marginBottom: 8, fontFamily: F, lineHeight: 1.45 }}>{question}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: C.gray600, width: 100, flexShrink: 0, lineHeight: 1.3 }}>{low}</span>
      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        {[1,2,3,4,5].map(n => <button key={n} onClick={() => onChange(n)}
          style={{ flex: 1, height: 36, borderRadius: 7, border: `1.5px solid ${value === n ? C.teal : C.border}`, background: value === n ? C.teal : C.bg, color: value === n ? C.white : C.gray600, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F, transition: "all .15s" }}>{n}</button>)}
      </div>
      <span style={{ fontSize: 11, color: C.gray600, width: 100, flexShrink: 0, textAlign: "right", lineHeight: 1.3 }}>{high}</span>
    </div>
  </div>;
}

function Progress({ step, total }) {
  const pct = Math.round(((step + 1) / (total + 1)) * 100);
  return <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: C.gray600, fontFamily: F }}>{step < total ? `Section ${step + 1} of ${total}` : "Review"}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.teal, fontFamily: F }}>{pct}% complete</span>
    </div>
    <div style={{ height: 5, background: C.gray100, borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: C.teal, transition: "width .4s" }} />
    </div>
  </div>;
}

// ── SECTIONS ──────────────────────────────────────────────────────────────────
function S1({ d, set }) {
  return <>
    <SLabel>Section 1</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Basic Information</h2>
    <Sub>Fundamentals first. This helps us personalize your experience and surface the right roles.</Sub>
    <Divider />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
      <div><QLabel required>First name</QLabel><FInput value={d.firstName} onChange={v => set(x => ({ ...x, firstName: v }))} placeholder="Jane" /></div>
      <div><QLabel required>Last name</QLabel><FInput value={d.lastName} onChange={v => set(x => ({ ...x, lastName: v }))} placeholder="Smith" /></div>
    </div>
    <div style={{ marginBottom: 12 }}><QLabel required>Email address</QLabel><FInput value={d.email} onChange={v => set(x => ({ ...x, email: v }))} placeholder="jane@example.com" type="email" /></div>
    <div style={{ marginBottom: 12 }}><QLabel>Phone number</QLabel><FInput value={d.phone} onChange={v => set(x => ({ ...x, phone: v }))} placeholder="+1 (555) 000-0000" /></div>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
      <div><QLabel required>City & state</QLabel><FInput value={d.location} onChange={v => set(x => ({ ...x, location: v }))} placeholder="Chicago, IL" /></div>
      <div><QLabel required>ZIP code</QLabel><FInput value={d.zip} onChange={v => set(x => ({ ...x, zip: v }))} placeholder="60601" /></div>
    </div>
    <Divider />
    <QLabel required>Are you legally authorized to work in the United States?</QLabel>
    <RadioGroup options={["Yes, without sponsorship","Yes, but I require sponsorship","No"]} value={d.workAuth} onChange={v => set(x => ({ ...x, workAuth: v }))} />
    <Divider />
    <QLabel>Veteran / disability status (optional)</QLabel>
    <Sub>Used only for EEOC reporting. Has no effect on your match score.</Sub>
    <MultiPill options={["U.S. Military Veteran","Person with a disability","Prefer not to answer"]} values={d.eeoc} onChange={v => set(x => ({ ...x, eeoc: v }))} />
  </>;
}

function S2({ d, set }) {
  const hasDegree = ["Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree","PhD or Doctorate"].includes(d.education);
  return <>
    <SLabel>Section 2</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Education</h2>
    <Sub>You don't need a degree to use Matcht — this is purely for matching accuracy.</Sub>
    <Divider />
    <QLabel required>Highest level of education completed</QLabel>
    <FSelect value={d.education} onChange={v => set(x => ({ ...x, education: v }))} options={EDUCATION_OPTIONS} placeholder="Select your education level..." />
    <Divider />
    {hasDegree && <>
      <div style={{ marginBottom: 12 }}><QLabel>Field of study / Major</QLabel><FInput value={d.major} onChange={v => set(x => ({ ...x, major: v }))} placeholder="e.g. Computer Science, Marketing, Finance" /></div>
      <div style={{ marginBottom: 12 }}><QLabel>University or institution</QLabel><FInput value={d.university} onChange={v => set(x => ({ ...x, university: v }))} placeholder="e.g. University of Illinois" /></div>
      <Divider />
    </>}
    <QLabel>Professional certifications or licenses</QLabel>
    <Sub>Separate with commas.</Sub>
    <FInput value={d.certs} onChange={v => set(x => ({ ...x, certs: v }))} placeholder="e.g. PMP, CPA, AWS Solutions Architect, SHRM-CP" />
    <Divider />
    <QLabel>Currently enrolled in a degree or certification program?</QLabel>
    <RadioGroup options={["Yes, full-time","Yes, part-time","No"]} value={d.enrolled} onChange={v => set(x => ({ ...x, enrolled: v }))} />
  </>;
}

function S3({ d, set }) {
  const fmtYrs = v => v >= 20 ? "20+ yrs" : `${v} yr${v === 1 ? "" : "s"}`;
  const fmtReports = v => v === 0 ? "None" : v >= 50 ? "50+ reports" : `${v} reports`;
  return <>
    <SLabel>Section 3</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Work History</h2>
    <Sub>Focus on your most recent and relevant experience.</Sub>
    <Divider />
    <div style={{ marginBottom: 12 }}><QLabel required>Current or most recent job title</QLabel><FInput value={d.currentTitle} onChange={v => set(x => ({ ...x, currentTitle: v }))} placeholder="e.g. Senior Product Manager" /></div>
    <div style={{ marginBottom: 12 }}><QLabel required>Current or most recent employer</QLabel><FInput value={d.currentEmployer} onChange={v => set(x => ({ ...x, currentEmployer: v }))} placeholder="e.g. Acme Corp" /></div>
    <Divider />
    <QLabel required>Total years of professional experience</QLabel>
    <MaxSlider value={d.totalExp} onChange={v => set(x => ({ ...x, totalExp: v }))} min={0} max={20} step={1} format={fmtYrs} />
    <Divider />
    <QLabel required>Years of experience in your primary function</QLabel>
    <Sub>Specific to the type of work you do — not total career length.</Sub>
    <MaxSlider value={d.fieldExp} onChange={v => set(x => ({ ...x, fieldExp: v }))} min={0} max={20} step={1} format={fmtYrs} />
    <Divider />
    <QLabel>Longest tenure at a single employer</QLabel>
    <MaxSlider value={d.longestTenure} onChange={v => set(x => ({ ...x, longestTenure: v }))} min={0} max={20} step={1} format={fmtYrs} />
    <Divider />
    <QLabel required>Industries you've worked in</QLabel>
    <Sub>Select all that apply.</Sub>
    <MultiDropdown options={ALL_INDUSTRIES} values={d.industries} onChange={v => set(x => ({ ...x, industries: v }))} placeholder="Search and select industries..." />
    {d.industries.length > 0 && <div style={{ fontSize: 12, color: C.gray400, marginTop: 6, fontFamily: F }}>{d.industries.length} selected</div>}
    <Divider />
    <QLabel>Maximum number of direct reports you've managed</QLabel>
    <Sub>Set to 0 if you've never managed people.</Sub>
    <MaxSlider value={d.directReports} onChange={v => set(x => ({ ...x, directReports: v }))} min={0} max={50} step={1} format={fmtReports} />
    <Divider />
    <QLabel>Have you managed projects or cross-functional teams?</QLabel>
    <RadioGroup options={["No","Occasionally","Yes — regularly","Yes — it was a core part of my role"]} value={d.managedProjects} onChange={v => set(x => ({ ...x, managedProjects: v }))} />
    <Divider />
    <QLabel>Current employment status</QLabel>
    <RadioGroup options={["Employed full-time","Employed part-time","Self-employed / Freelance","Currently unemployed","Student","Career break (planned)"]} value={d.empStatus} onChange={v => set(x => ({ ...x, empStatus: v }))} />
    <Divider />
    <QLabel>Any gaps in your work history? Briefly explain (optional)</QLabel>
    <FTextarea value={d.gaps} onChange={v => set(x => ({ ...x, gaps: v }))} placeholder="e.g. Took time off for family, freelanced, traveled..." />
  </>;
}

function S4({ d, set }) {
  return <>
    <SLabel>Section 4</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Skills</h2>
    <Sub>Be honest — overstating skills leads to bad matches for everyone.</Sub>
    <Divider />
    <QLabel required>Soft skills — select your strongest (up to 8)</QLabel>
    <MultiDropdown options={SOFT_SKILLS} values={d.softSkills} onChange={v => v.length <= 8 && set(x => ({ ...x, softSkills: v }))} placeholder="Search and select soft skills..." />
    {d.softSkills.length > 0 && <div style={{ fontSize: 12, color: C.gray400, marginTop: 6, fontFamily: F }}>{d.softSkills.length}/8 selected</div>}
    <Divider />
    <QLabel required>Technical & functional skills — select all that apply</QLabel>
    <MultiDropdown options={TECH_SKILLS} values={d.techSkills} onChange={v => set(x => ({ ...x, techSkills: v }))} placeholder="Search and select technical skills..." />
    {d.techSkills.length > 0 && <div style={{ fontSize: 12, color: C.gray400, marginTop: 6, fontFamily: F }}>{d.techSkills.length} selected</div>}
    <Divider />
    <QLabel>Additional skills, tools, or technologies not listed</QLabel>
    <FInput value={d.otherSkills} onChange={v => set(x => ({ ...x, otherSkills: v }))} placeholder="e.g. Tableau, Six Sigma, Mandarin, Kubernetes..." />
    <Divider />
    <QLabel required>Overall experience level</QLabel>
    <RadioGroup options={["Entry — building foundational skills","Mid-level — solid independent contributor","Senior — deep expertise, sometimes leads others","Lead / Principal — sets direction, mentors others","Executive — organizational leadership"]} value={d.seniority} onChange={v => set(x => ({ ...x, seniority: v }))} />
  </>;
}

function S5({ d, set }) {
  const fmtSalary = v => v >= 500 ? "$500k+" : `$${v}k`;
  const fmtCommute = v => v >= 90 ? "90+ min" : `${v} min`;
  const noCommute = d.remotePreference === "Remote only — I will not commute";
  return <>
    <SLabel>Section 5</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Job Preferences & Critical Needs</h2>
    <Sub>Your ranges and non-negotiables. Be honest — this filters out roles that won't work for you.</Sub>
    <Divider />
    <QLabel required>Target job titles</QLabel>
    <FInput value={d.targetTitles} onChange={v => set(x => ({ ...x, targetTitles: v }))} placeholder="e.g. Product Manager, Director of Operations, Senior Analyst" />
    <Divider />
    <QLabel required>Acceptable salary range (base pay only)</QLabel>
    <Sub>We only show you roles within this range. Base salary — not total comp.</Sub>
    <RangeSlider minVal={d.salaryMin} maxVal={d.salaryMax} onMin={v => set(x => ({ ...x, salaryMin: v }))} onMax={v => set(x => ({ ...x, salaryMax: v }))} min={30} max={500} step={5} format={fmtSalary} />
    <Divider />
    <QLabel required>Remote work preference</QLabel>
    <RadioGroup options={["Remote only — I will not commute","Strongly prefer remote, open to occasional on-site","Hybrid — mix of remote and office is ideal","Flexible — whatever the role requires","On-site preferred"]} value={d.remotePreference} onChange={v => set(x => ({ ...x, remotePreference: v }))} />
    <Divider />
    {!noCommute && <>
      <QLabel>Maximum one-way commute time you'd accept</QLabel>
      <Sub>Based on your ZIP code, we filter roles by drive time.</Sub>
      <MaxSlider value={d.maxCommute} onChange={v => set(x => ({ ...x, maxCommute: v }))} min={10} max={90} step={5} format={fmtCommute} />
      <Divider />
    </>}
    <QLabel required>Employment type</QLabel>
    <MultiPill options={["Full-time (permanent)","Part-time","Contract / Freelance","Contract-to-hire","Internship","Temporary / Seasonal"]} values={d.employmentType} onChange={v => set(x => ({ ...x, employmentType: v }))} />
    <Divider />
    <QLabel required>When are you available to start?</QLabel>
    <RadioGroup options={["Immediately (within 2 weeks)","Within 1 month","1–3 months","3–6 months","Exploring — no fixed timeline"]} value={d.availability} onChange={v => set(x => ({ ...x, availability: v }))} />
    <Divider />
    <QLabel>Open to relocation?</QLabel>
    <RadioGroup options={["No — staying where I am","Yes — anywhere","Yes — specific regions only (describe below)"]} value={d.relocation} onChange={v => set(x => ({ ...x, relocation: v }))} />
    {d.relocation?.includes("specific regions") && <div style={{ marginTop: 9 }}><FInput value={d.relocationRegions} onChange={v => set(x => ({ ...x, relocationRegions: v }))} placeholder="e.g. Southeast US, New York metro, Pacific Northwest" /></div>}
    <Divider />
    <QLabel>Willing to travel for work?</QLabel>
    <RadioGroup options={["No travel","Occasional (under 10%)","Moderate (10–25%)","Frequent (25–50%)","Heavy (50%+)"]} value={d.travel} onChange={v => set(x => ({ ...x, travel: v }))} />
    <Divider />
    <QLabel>Preferred company size</QLabel>
    <MultiPill options={["Startup (1–50)","Small (51–200)","Mid-size (201–1,000)","Large (1,001–10,000)","Enterprise (10,000+)","No preference"]} values={d.companySize} onChange={v => set(x => ({ ...x, companySize: v }))} />
    <Divider />
    <QLabel>Industries you'd like to work in</QLabel>
    <Sub>Preferences — not hard filters. Leave blank to stay open to all.</Sub>
    <MultiDropdown options={ALL_INDUSTRIES} values={d.targetIndustries} onChange={v => set(x => ({ ...x, targetIndustries: v }))} placeholder="Search and select industries..." />
    {d.targetIndustries.length > 0 && <div style={{ fontSize: 12, color: C.gray400, marginTop: 6, fontFamily: F }}>{d.targetIndustries.length} selected</div>}
  </>;
}

function S6({ d, set }) {
  return <>
    <SLabel>Section 6</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Work Style & Environment</h2>
    <Sub>How you work matters as much as what you've done. This matches you with teams where you'll actually thrive.</Sub>
    <Divider />
    <QLabel required>How do you prefer to receive feedback?</QLabel>
    <RadioGroup options={["Real-time — as I go","Regular check-ins (weekly or bi-weekly)","Formal periodic reviews (quarterly)","Self-directed — I ask when I need it"]} value={d.feedback} onChange={v => set(x => ({ ...x, feedback: v }))} />
    <Divider />
    <QLabel required>Day-to-day work preference</QLabel>
    <RadioGroup options={["Independently — I own my work and run with it","Collaboratively — I do my best in a team","Both — I switch based on the task","Structured process with clear direction"]} value={d.workStyle} onChange={v => set(x => ({ ...x, workStyle: v }))} />
    <Divider />
    <QLabel required>What pace do you thrive in?</QLabel>
    <RadioGroup options={["Fast-paced, high-ambiguity startup energy","Structured and process-driven","Steady — quality over speed","Variable — depends on the project"]} value={d.pace} onChange={v => set(x => ({ ...x, pace: v }))} />
    <Divider />
    <QLabel required>Preferred management style from your direct manager</QLabel>
    <RadioGroup options={["Hands-off — give me goals and let me run","Collaborative — we figure things out together","Structured — clear expectations and regular guidance","Mentor-focused — I want to learn and grow from them"]} value={d.mgmtStyle} onChange={v => set(x => ({ ...x, mgmtStyle: v }))} />
    <Divider />
    <QLabel>What role do you naturally play on a team?</QLabel>
    <RadioGroup options={["The driver — I push things forward","The organizer — I keep everyone aligned","The creative — I generate ideas and solve uniquely","The executor — I get things done reliably","The connector — I build relationships and bridge gaps"]} value={d.teamRole} onChange={v => set(x => ({ ...x, teamRole: v }))} />
    <Divider />
    <QLabel>Work environment preferences</QLabel>
    <MultiPill options={["Open / collaborative space","Quiet / private environment","Casual culture","Formal / professional culture","Mission-driven org","High-growth company","Work-life balance is a priority","Performance & results-driven"]} values={d.envPrefs} onChange={v => set(x => ({ ...x, envPrefs: v }))} />
    <Divider />
    <QLabel>What motivates you most? (Pick top 3)</QLabel>
    <MultiPill options={["Meaningful impact / mission","Career growth & advancement","Compensation & financial rewards","Learning new skills","Creative freedom","Team & culture","Flexibility & autonomy","Recognition & visibility","Stability & security"]} values={d.motivators} onChange={v => set(x => ({ ...x, motivators: v }))} max={3} />
    <div style={{ fontSize: 12, color: C.gray400, marginTop: 7, fontFamily: F }}>{d.motivators.length}/3 selected</div>
  </>;
}

function S7({ d, set }) {
  const QS = [
    { id:"EI", q:"In social situations, I tend to...", low:"Prefer small groups or 1-on-1", high:"Energize in large groups" },
    { id:"SN", q:"When solving problems, I rely more on...", low:"Facts, data & past experience", high:"Intuition & future possibilities" },
    { id:"TF", q:"When making decisions, I prioritize...", low:"Logic and objective analysis", high:"People's feelings and values" },
    { id:"JP", q:"I prefer my work to be...", low:"Planned, structured & decided", high:"Flexible, open & spontaneous" },
    { id:"stress", q:"Under pressure, I typically...", low:"Stay calm and methodical", high:"Feel energized and speed up" },
    { id:"conflict", q:"When there's a disagreement at work...", low:"I prefer to accommodate and avoid tension", high:"I address it directly and advocate my view" },
    { id:"ambiguity", q:"My comfort with unclear or open-ended work is...", low:"Low — I need clear direction", high:"High — I thrive with open-ended problems" },
    { id:"risk", q:"My risk tolerance in professional decisions is...", low:"Conservative — I prefer proven paths", high:"High — I'm comfortable with bold bets" },
    { id:"detail", q:"My natural orientation toward detail is...", low:"Big picture — I delegate details", high:"Detail-oriented — I want to know everything" },
    { id:"change", q:"When the org changes direction suddenly...", low:"I find it stressful and disruptive", high:"I adapt quickly and see opportunity" },
    { id:"recognition", q:"I prefer recognition that is...", low:"Private — a personal thank-you is enough", high:"Public — I like being acknowledged openly" },
    { id:"collab", q:"My natural preference leans toward...", low:"Working independently", high:"Working as part of a team" },
  ];
  return <>
    <SLabel>Section 7</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Personality & Behavioral Profile</h2>
    <Sub>Our workplace-calibrated personality assessment. Used to match you with teams where people like you thrive. No right or wrong answers.</Sub>
    <Divider />
    <div style={{ background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 9, padding: "12px 14px", marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: C.teal, fontWeight: 600, margin: 0, fontFamily: F }}>Rate yourself 1–5. 1 = strongly left, 5 = strongly right, 3 = balanced between both.</p>
    </div>
    {QS.map(q => <ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality[q.id]} onChange={v => set(x => ({ ...x, personality: { ...x.personality, [q.id]: v } }))} />)}
    <Divider />
    <QLabel>Communication style</QLabel>
    <RadioGroup options={["Direct and concise — I say what I mean","Diplomatic — I'm mindful of how things land","Expressive — I bring energy and enthusiasm","Analytical — I lead with data and logic"]} value={d.commStyle} onChange={v => set(x => ({ ...x, commStyle: v }))} />
    <Divider />
    <QLabel>How do you handle making mistakes at work?</QLabel>
    <RadioGroup options={["I own it quickly, fix it, and move on","I analyze what went wrong before moving forward","I take it hard but learn from it","I focus on prevention to minimize future errors"]} value={d.mistakeStyle} onChange={v => set(x => ({ ...x, mistakeStyle: v }))} />
  </>;
}

function S8({ d, set }) {
  return <>
    <SLabel>Section 8</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Career Goals & Intentions</h2>
    <Sub>Understanding where you're headed helps us find roles that are a step forward — not ones you'll regret in 6 months.</Sub>
    <Divider />
    <QLabel required>Primary goal right now</QLabel>
    <RadioGroup options={["Find a better-paying role","Advance to a more senior position","Switch industries or functions","Find better work-life balance","Return to work after a break","Find more stability or security","Find more meaningful / mission-driven work","Still exploring — not sure yet"]} value={d.primaryGoal} onChange={v => set(x => ({ ...x, primaryGoal: v }))} />
    <Divider />
    <QLabel>Where do you see yourself in 3–5 years?</QLabel>
    <RadioGroup options={["In a leadership or management role","Deep subject-matter expert / individual contributor","Running my own business or freelancing","Still growing in my current function","Not sure yet — exploring"]} value={d.fiveYear} onChange={v => set(x => ({ ...x, fiveYear: v }))} />
    <Divider />
    <QLabel>How actively are you job searching right now?</QLabel>
    <RadioGroup options={["Actively — I want to move fast","Open to the right opportunity — not in a rush","Passively exploring — not actively applying","Employed and happy, but curious"]} value={d.searchIntensity} onChange={v => set(x => ({ ...x, searchIntensity: v }))} />
    <Divider />
    <QLabel>Currently interviewing elsewhere?</QLabel>
    <RadioGroup options={["Yes — actively in several processes","Yes — a few early conversations","No — Matcht is my starting point","No — I prefer to go one at a time"]} value={d.otherInterviews} onChange={v => set(x => ({ ...x, otherInterviews: v }))} />
    <Divider />
    <QLabel>What would make you stay at your current job? (if applicable)</QLabel>
    <MultiPill options={["Significant salary increase","Promotion or title change","More flexibility / remote options","Better management or culture","Nothing — I'm ready to leave","Not applicable"]} values={d.stayReasons} onChange={v => set(x => ({ ...x, stayReasons: v }))} />
    <Divider />
    <QLabel>Anything else you'd like employers to know? (Optional)</QLabel>
    <Sub>Shows up as a personal note on your profile — the human part a resume doesn't capture.</Sub>
    <FTextarea value={d.personalNote} onChange={v => set(x => ({ ...x, personalNote: v }))} placeholder="e.g. Relocating to Austin in Q3. Looking for a company that values autonomy. Portfolio at..." rows={4} />
  </>;
}

function Review({ data }) {
  const fmtSalary = v => v >= 500 ? "$500k+" : `$${v}k`;
  const rows = [
    ["Name", `${data.firstName} ${data.lastName}`.trim()],
    ["Location", data.location],
    ["Work authorization", data.workAuth],
    ["Education", data.education],
    ["Total experience", data.totalExp ? `${data.totalExp}+ yrs` : ""],
    ["Current title", data.currentTitle],
    ["Industries (worked in)", data.industries.slice(0,4).join(", ") + (data.industries.length > 4 ? ` +${data.industries.length - 4} more` : "")],
    ["Soft skills", data.softSkills.join(", ")],
    ["Technical skills", data.techSkills.slice(0,3).join(", ") + (data.techSkills.length > 3 ? "..." : "")],
    ["Target titles", data.targetTitles],
    ["Salary range", data.salaryMin && data.salaryMax ? `${fmtSalary(data.salaryMin)} – ${fmtSalary(data.salaryMax)}` : ""],
    ["Remote preference", data.remotePreference],
    ["Max commute", data.maxCommute && !data.remotePreference?.includes("Remote only") ? `${data.maxCommute} min` : "N/A"],
    ["Availability", data.availability],
    ["Work style", data.workStyle],
    ["Primary goal", data.primaryGoal],
    ["Search status", data.searchIntensity],
  ];
  return <>
    <SLabel>Almost done</SLabel>
    <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: "0 0 3px", letterSpacing: -0.5, fontFamily: F }}>Review your profile</h2>
    <Sub>Once you submit, your profile goes live and we start matching you immediately.</Sub>
    <Divider />
    {rows.filter(([,v]) => v).map(([l,v]) => (
      <div key={l} style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "10px 0", gap: 12 }}>
        <span style={{ fontSize: 13, color: C.gray600, width: 150, flexShrink: 0, fontFamily: F }}>{l}</span>
        <span style={{ fontSize: 13, color: C.slate, fontWeight: 600, fontFamily: F, lineHeight: 1.4 }}>{v}</span>
      </div>
    ))}
    <div style={{ marginTop: 22, background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 9, padding: "14px 16px" }}>
      <p style={{ fontSize: 13, color: C.teal, fontWeight: 600, margin: 0, fontFamily: F }}>✓ Your full profile is saved. You'll be notified the moment a role matches your criteria.</p>
    </div>
  </>;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const SECTIONS = [
  { label:"Basic Info",      C: S1 },
  { label:"Education",       C: S2 },
  { label:"Work History",    C: S3 },
  { label:"Skills",          C: S4 },
  { label:"Job Preferences", C: S5 },
  { label:"Work Style",      C: S6 },
  { label:"Personality",     C: S7 },
  { label:"Goals",           C: S8 },
];

const INIT = {
  firstName:"",lastName:"",email:"",phone:"",location:"",zip:"",workAuth:"",eeoc:[],
  education:"",major:"",university:"",certs:"",enrolled:"",
  currentTitle:"",currentEmployer:"",totalExp:0,fieldExp:0,longestTenure:0,industries:[],directReports:0,managedProjects:"",empStatus:"",gaps:"",
  softSkills:[],techSkills:[],otherSkills:"",seniority:"",
  targetTitles:"",salaryMin:60,salaryMax:150,remotePreference:"",maxCommute:30,employmentType:[],availability:"",relocation:"",relocationRegions:"",travel:"",companySize:[],targetIndustries:[],
  feedback:"",workStyle:"",pace:"",mgmtStyle:"",teamRole:"",envPrefs:[],motivators:[],
  personality:{},commStyle:"",mistakeStyle:"",
  primaryGoal:"",fiveYear:"",searchIntensity:"",otherInterviews:"",stayReasons:[],personalNote:"",
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INIT);
  const [done, setDone] = useState(false);
  const total = SECTIONS.length;
  const isReview = step === total;

  function go(n) { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (done) return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.slate, margin: "0 0 10px", letterSpacing: -0.5 }}>You're in the pool.</h1>
        <p style={{ color: C.gray600, fontSize: 15, lineHeight: 1.65, margin: "0 0 22px" }}>Your profile is live. We'll notify you the moment a role matches. No applying. No forms. Just matches.</p>
        <div style={{ background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 10, padding: "16px 18px" }}>
          <p style={{ fontSize: 13, color: C.teal, fontWeight: 600, margin: 0 }}>Next up: upload a short video intro to boost your visibility by 4×.</p>
        </div>
      </div>
    </div>
  );

  const Sec = !isReview ? SECTIONS[step].C : null;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: F, paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10, color: C.white }}>M</div>
          <span style={{ fontWeight: 800, fontSize: 14, color: C.slate, letterSpacing: -0.3 }}>Matcht</span>
          <span style={{ fontSize: 11, color: C.gray400 }}>/ Candidate Profile</span>
        </div>
        <span style={{ fontSize: 12, color: C.gray600, fontWeight: 600 }}>{isReview ? "Review & submit" : `${step + 1} of ${total} — ${SECTIONS[step].label}`}</span>
      </div>

      {/* Section tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 20px", overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: "fit-content" }}>
          {SECTIONS.map((s, i) => (
            <button key={i} onClick={() => go(i)} style={{ padding: "9px 12px", border: "none", background: "none", borderBottom: `2.5px solid ${i === step ? C.teal : "transparent"}`, color: i === step ? C.teal : i < step ? C.green : C.gray400, fontWeight: i === step ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: F, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
              {i < step && <span style={{ fontSize: 9 }}>✓</span>}{s.label}
            </button>
          ))}
          <button onClick={() => go(total)} style={{ padding: "9px 12px", border: "none", background: "none", borderBottom: `2.5px solid ${isReview ? C.teal : "transparent"}`, color: isReview ? C.teal : C.gray400, fontWeight: isReview ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: F, whiteSpace: "nowrap" }}>Review</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "28px auto 0", padding: "0 16px" }}>
        <Progress step={step} total={total} />
        <Card style={{ marginBottom: 14 }}>
          {isReview ? <Review data={data} /> : <Sec d={data} set={setData} />}
        </Card>
        <div style={{ display: "flex", gap: 9 }}>
          {step > 0 && <button onClick={() => go(step - 1)} style={{ flex: 1, padding: "11px 0", borderRadius: 8, background: C.white, border: `1.5px solid ${C.border}`, color: C.gray600, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: F }}>← Back</button>}
          {!isReview
            ? <button onClick={() => go(step + 1)} style={{ flex: 2, padding: "11px 0", borderRadius: 8, background: C.teal, color: C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F }}>{step < total - 1 ? "Continue →" : "Review my answers →"}</button>
            : <button onClick={() => setDone(true)} style={{ flex: 2, padding: "11px 0", borderRadius: 8, background: C.teal, color: C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F }}>Submit & go live →</button>}
        </div>
      </div>
    </div>
  );
}

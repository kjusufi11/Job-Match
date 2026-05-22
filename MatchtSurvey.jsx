import { useState, useRef, useEffect } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "Active listening","Adaptability","Agile / Scrum","API integration","AWS","Azure",
  "A/B testing","Account management","Advanced Excel","Budget management","Business analysis",
  "Business development","C++","CI/CD","Change management","Client relations","Cloud architecture",
  "Coaching","Collaboration","Communication","Competitive analysis","Compliance",
  "Conflict resolution","Content strategy","Contract negotiation","Copywriting","Cost reduction",
  "CRM (HubSpot)","CRM (Salesforce)","Critical thinking","Cross-functional leadership",
  "Customer empathy","Customer success","Data analysis","Data engineering","Data modeling",
  "Data visualization","Decision-making","Delegation","DevOps","Digital marketing","Docker",
  "Due diligence","ERP (Oracle)","ERP (SAP)","Email marketing","Emotional intelligence",
  "Executive presence","Facilitation","Figma","Financial modeling","Financial reporting",
  "Forecasting","GCP","Git","Go-to-market strategy","Google Analytics","Google Workspace",
  "Growth strategy","HTML/CSS","HIPAA compliance","Influencing without authority","Innovation",
  "Investment analysis","JavaScript","Jira / Asana","KPI development","Kubernetes",
  "Labor law","Leadership","Lean / Six Sigma","Legal research","Litigation","Logistics",
  "Machine learning","Market research","Marketing automation","Media buying","Mentoring",
  "Microsoft Office","Mobile development","MongoDB","MySQL","Natural language processing",
  "Negotiation","Node.js","Operations management","Organizational skills","P&L ownership",
  "Paid media","Payroll","Performance management","Persuasion","PostgreSQL","Power BI",
  "Presentation skills","Private equity","Problem-solving","Process improvement",
  "Product roadmap","Program management","Project management","Public speaking","Python",
  "R","React","REST APIs","Recruiting","Regulatory affairs","Relationship building",
  "Resilience","Revenue operations","Risk management","SQL","Sales enablement","SEO/SEM",
  "Self-management","Six Sigma","Snowflake","Social media management","Software development",
  "Stakeholder management","Strategic planning","Strategic thinking","Storytelling",
  "Supply chain","Swift","Tableau","Tax preparation","Team building","Terraform","Time management",
  "Treasury management","TypeScript","UX research","Underwriting","Vendor management",
  "Video production","Vue.js","WordPress","Written communication",
];
const INDUSTRIES = [
  "Accounting & Tax","Advertising & PR","Agriculture & Farming","Architecture & Design",
  "Automotive","Aviation & Aerospace","Banking & Financial Services","Biotechnology",
  "Cannabis","Chemical Manufacturing","Clean Energy & Sustainability","Construction",
  "Consulting & Professional Services","Consumer Goods","Cybersecurity","Data & Analytics",
  "Defense & Military","E-commerce","Education & EdTech","Energy & Utilities","Engineering",
  "Entertainment & Media","Environmental Services","Fashion & Apparel","Film & TV Production",
  "FinTech","Food & Beverage","Gaming","Government & Public Sector","Healthcare — Clinical",
  "Healthcare — Admin & Operations","Healthcare Technology","Hospitality & Tourism",
  "Human Resources & Staffing","Insurance","Interior Design","Internet & Software",
  "Investment Management","Legal Services","Logistics & Supply Chain","Manufacturing",
  "Marketing & Growth","Mining & Natural Resources","Music & Audio","Non-profit & NGO",
  "Pharmaceuticals","Photography & Visual Arts","Publishing & Journalism","Real Estate",
  "Retail & Consumer","SaaS / Cloud","Security Services","Social Impact","Sports & Recreation",
  "Telecommunications","Transportation","Venture Capital & Private Equity",
  "Veterinary & Animal Services","Wellness & Fitness","Other",
];
const EDUCATION_LEVELS = [
  "High school diploma / GED","Some college (no degree)","Associate's degree",
  "Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree",
  "PhD or Doctorate","Vocational / Trade certification","Bootcamp or professional program",
];
const UNIVERSITIES = [
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
const TITLE_SUGGESTIONS = [
  "CEO","CFO","COO","CTO","CMO","CHRO","CRO","CPO","General Counsel","Managing Director",
  "President","Executive Director","Partner","VP of Product","VP of Engineering",
  "VP of Sales","VP of Marketing","VP of Operations","VP of Finance","VP of People",
  "VP of Customer Success","VP of Business Development","Vice President",
  "Director of Product","Director of Engineering","Director of Sales","Director of Marketing",
  "Director of Operations","Director of Finance","Director of People","Director of Design",
  "Director of Customer Success","Director of Data","Director of Strategy","Director",
  "Product Manager","Senior Product Manager","Principal Product Manager",
  "Group Product Manager","Engineering Manager","Senior Engineering Manager",
  "Project Manager","Program Manager","Marketing Manager","Sales Manager",
  "Account Manager","Customer Success Manager","Operations Manager","Finance Manager",
  "People Manager","Brand Manager","Content Manager","Social Media Manager",
  "Community Manager","Software Engineer","Senior Software Engineer","Staff Engineer",
  "Principal Engineer","Data Scientist","Senior Data Scientist","Data Analyst",
  "Senior Data Analyst","Data Engineer","Machine Learning Engineer","DevOps Engineer",
  "Security Engineer","UX Designer","Senior UX Designer","Product Designer",
  "Graphic Designer","UX Researcher","Content Strategist","Copywriter","Technical Writer",
  "Sales Representative","Account Executive","Business Development Representative",
  "Customer Success Specialist","Marketing Specialist","Financial Analyst",
  "Business Analyst","Operations Analyst","Recruiter","HR Generalist","HR Business Partner",
  "Accountant","Controller","Associate","Consultant","Analyst","Specialist","Coordinator",
];
const CULTURE_DESCRIPTORS = [
  "Fast-paced & high-energy","Collaborative & team-first","Data-driven & analytical",
  "Creative & experimental","Process-driven & structured","Mission-driven & purpose-led",
  "Performance & results-oriented","Autonomous & self-directed",
  "Transparent & flat hierarchy","Stable & predictable",
];
const EMPLOYMENT_TYPES = [
  "Full-time (permanent)","Part-time","Contract / Freelance",
  "Contract-to-hire","Internship","Temporary / Seasonal",
];
const PERSONALITY_DIMS = [
  { id:"EI", q:"In social situations, I tend to...", low:"Prefer small groups or 1-on-1", high:"Thrive in large groups & high-energy settings" },
  { id:"SN", q:"When solving problems, I rely more on...", low:"Facts, data & past experience", high:"Intuition & future possibilities" },
  { id:"TF", q:"When making decisions, I prioritize...", low:"Logic & objective analysis", high:"People's feelings & values" },
  { id:"JP", q:"I prefer my work to be...", low:"Planned, structured & decided", high:"Flexible, open & spontaneous" },
  { id:"stress", q:"Under pressure, I typically...", low:"Stay calm & methodical", high:"Feel energized & speed up" },
  { id:"conflict", q:"When there's a disagreement at work...", low:"I prefer to accommodate & avoid tension", high:"I address it directly & advocate my view" },
  { id:"ambiguity", q:"My comfort with unclear or open-ended work is...", low:"Low — I need clear direction", high:"High — I thrive with ambiguous problems" },
  { id:"risk", q:"My risk tolerance in professional decisions is...", low:"Conservative — prefer proven paths", high:"Bold — comfortable with high-risk bets" },
  { id:"detail", q:"My natural orientation toward detail is...", low:"Big picture — I delegate details", high:"Detail-oriented — want to know everything" },
  { id:"change", q:"When the org changes direction suddenly...", low:"I find it stressful & disruptive", high:"I adapt quickly & see it as opportunity" },
  { id:"recognition", q:"I prefer recognition that is...", low:"Private — a personal thank-you", high:"Public — acknowledged openly" },
  { id:"collab", q:"My natural preference leans toward...", low:"Working independently", high:"Working as part of a team" },
];
const MGMT_STYLES = [
  "Hands-off — sets goals and trusts the team",
  "Collaborative — involved but not directive",
  "Structured — clear expectations and regular feedback",
  "Mentor-focused — invested in growth and development",
  "Varies — adapts to each person",
];
const TRAVEL_LEVELS = ["No travel","Occasional (under 10%)","Moderate (10–25%)","Frequent (25–50%)","Heavy (50%+)"];
const LANGUAGES = [
  "Afrikaans","Arabic","Bengali","Bulgarian","Cantonese","Croatian","Czech","Danish","Dutch",
  "English","Filipino","Finnish","French","German","Greek","Hebrew","Hindi","Hungarian",
  "Indonesian","Italian","Japanese","Korean","Malay","Mandarin","Norwegian","Persian/Farsi",
  "Polish","Portuguese","Romanian","Russian","Serbian","Slovak","Spanish","Swahili","Swedish",
  "Tamil","Telugu","Thai","Turkish","Ukrainian","Urdu","Vietnamese",
];
const PROFICIENCY = ["Native / Bilingual","Full professional proficiency","Professional working proficiency","Limited working proficiency","Elementary"];

// ── DESIGN ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#F0F4F7",white:"#FFFFFF",teal:"#1A8C8C",tealDim:"#1A8C8C12",tealBorder:"#1A8C8C35",
  tealDark:"#116060",slate:"#1E2D3A",gray100:"#E3ECF1",gray200:"#C8D8E4",gray400:"#8FAABB",
  gray600:"#4E6475",gray800:"#2B3D4D",border:"#D4E3EC",green:"#19A87A",greenDim:"#19A87A14",
  amber:"#C9870C",amberDim:"#C9870C14",red:"#C0392B",redDim:"#C0392B14",purple:"#6B5EA8",
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function Card({children,style={}}){return <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"26px 24px",...style}}>{children}</div>;}

function FieldLabel({children,required,optional,hint}){
  return <div style={{marginBottom:6}}>
    <div style={{fontSize:14,fontWeight:600,color:C.slate,fontFamily:F,display:"flex",alignItems:"center",gap:6}}>
      {children}
      {required&&<span style={{color:C.red,fontSize:13}}>*</span>}
      {optional&&<span style={{fontSize:11,fontWeight:500,color:C.gray400,background:C.gray100,padding:"1px 7px",borderRadius:8}}>optional</span>}
    </div>
    {hint&&<div style={{fontSize:12,color:C.gray400,marginTop:2,fontFamily:F}}>{hint}</div>}
  </div>;
}

function SectionTitle({section,title,sub}){
  return <div style={{marginBottom:20}}>
    <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:1.4,marginBottom:4,fontFamily:F}}>{section}</div>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:"0 0 6px",letterSpacing:-0.5,fontFamily:F,lineHeight:1.2}}>{title}</h2>
    {sub&&<p style={{fontSize:14,color:C.gray600,margin:0,fontFamily:F,lineHeight:1.6}}>{sub}</p>}
  </div>;
}

function Divider({label}){
  if(label)return <div style={{display:"flex",alignItems:"center",gap:10,margin:"22px 0"}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.gray400,fontWeight:600,whiteSpace:"nowrap",fontFamily:F}}>{label}</span><div style={{flex:1,height:1,background:C.border}}/></div>;
  return <div style={{borderTop:`1px solid ${C.border}`,margin:"22px 0"}}/>;
}

function TextInput({value,onChange,placeholder,type="text",disabled=false}){
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    style={{width:"100%",padding:"11px 14px",borderRadius:8,background:disabled?C.gray100:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:F,transition:"border .15s"}}
    onFocus={e=>e.target.style.border=`1.5px solid ${C.teal}`}
    onBlur={e=>e.target.style.border=`1.5px solid ${C.border}`}/>;
}

function TextArea({value,onChange,placeholder,rows=3,hint}){
  return <div>
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{width:"100%",padding:"11px 14px",borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:F,resize:"vertical",lineHeight:1.6,transition:"border .15s"}}
      onFocus={e=>e.target.style.border=`1.5px solid ${C.teal}`}
      onBlur={e=>e.target.style.border=`1.5px solid ${C.border}`}/>
    {hint&&<div style={{fontSize:11,color:C.gray400,marginTop:3,fontFamily:F}}>{hint}</div>}
  </div>;
}

function Select({value,onChange,options,placeholder}){
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"11px 14px",borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:value?C.slate:C.gray400,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:F,cursor:"pointer"}}>
    <option value="">{placeholder||"Select..."}</option>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>;
}

function RadioGroup({options,value,onChange}){
  return <div style={{display:"flex",flexDirection:"column",gap:8}}>
    {options.map(o=><label key={o} onClick={()=>onChange(o)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:9,background:value===o?C.tealDim:C.bg,border:`1.5px solid ${value===o?C.teal:C.border}`,transition:"all .15s"}}>
      <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${value===o?C.teal:C.gray200}`,background:value===o?C.teal:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
        {value===o&&<div style={{width:7,height:7,borderRadius:"50%",background:C.white}}/>}
      </div>
      <span style={{fontSize:14,color:value===o?C.teal:C.slate,fontWeight:value===o?600:400,fontFamily:F}}>{o}</span>
    </label>)}
  </div>;
}

function CheckGroup({options,values,onChange,max,columns=1}){
  function toggle(v){if(values.includes(v))onChange(values.filter(x=>x!==v));else if(!max||values.length<max)onChange([...values,v]);}
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${columns},1fr)`,gap:8}}>
    {options.map(o=><label key={o} onClick={()=>toggle(o)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"10px 13px",borderRadius:9,background:values.includes(o)?C.tealDim:C.bg,border:`1.5px solid ${values.includes(o)?C.teal:C.border}`,transition:"all .15s"}}>
      <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
        {values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800,lineHeight:1}}>✓</span>}
      </div>
      <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F,lineHeight:1.3}}>{o}</span>
    </label>)}
  </div>;
}

// Searchable multi-select dropdown
function MultiDropdown({options,values,onChange,placeholder,max}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState("");
  const ref=useRef();
  useEffect(()=>{
    function handler(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener("mousedown",handler);return()=>document.removeEventListener("mousedown",handler);
  },[]);
  const filtered=options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  function toggle(o){if(values.includes(o))onChange(values.filter(x=>x!==o));else if(!max||values.length<max)onChange([...values,o]);}
  return <div ref={ref} style={{position:"relative"}}>
    <div onClick={()=>setOpen(o=>!o)} style={{minHeight:44,padding:"8px 12px",borderRadius:8,background:C.bg,border:`1.5px solid ${open?C.teal:C.border}`,cursor:"pointer",display:"flex",flexWrap:"wrap",gap:5,alignItems:"center",transition:"border .15s"}}>
      {values.length===0&&<span style={{color:C.gray400,fontSize:14,fontFamily:F}}>{placeholder}</span>}
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:"3px 10px",fontSize:12,fontWeight:600,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
        {v}<span onClick={e=>{e.stopPropagation();toggle(v);}} style={{cursor:"pointer",fontWeight:700,fontSize:14,lineHeight:1}}>×</span>
      </span>)}
      <span style={{marginLeft:"auto",color:C.gray400,fontSize:11,flexShrink:0}}>{open?"▲":"▼"}</span>
    </div>
    {open&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",maxHeight:260,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>
        <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
          style={{width:"100%",padding:"7px 11px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.slate,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:F}}/>
      </div>
      <div style={{overflowY:"auto",flex:1}}>
        {filtered.map(o=><div key={o} onClick={()=>toggle(o)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:values.includes(o)?C.tealDim:"none",transition:"background .1s"}}>
          <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F}}>{o}</span>
        </div>)}
        {filtered.length===0&&<div style={{padding:"14px",color:C.gray400,fontSize:13,textAlign:"center",fontFamily:F}}>No results</div>}
      </div>
      {max&&<div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.gray400,fontFamily:F}}>{values.length}{max?`/${max}`:""} selected</div>}
    </div>}
  </div>;
}

// Tag input — free-form with suggestions
function TagInput({values,onChange,suggestions=[],placeholder,max}){
  const [input,setInput]=useState("");
  const [showSug,setShowSug]=useState(false);
  const [focused,setFocused]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    function handler(e){if(ref.current&&!ref.current.contains(e.target)){setShowSug(false);setFocused(false);}}
    document.addEventListener("mousedown",handler);return()=>document.removeEventListener("mousedown",handler);
  },[]);
  const filtered=input.length>0?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())&&!values.includes(s)).slice(0,8):[];
  function add(val){const v=val.trim();if(!v||values.includes(v)||(max&&values.length>=max))return;onChange([...values,v]);setInput("");}
  function remove(v){onChange(values.filter(x=>x!==v));}
  return <div ref={ref} style={{position:"relative"}}>
    <div style={{minHeight:46,padding:"7px 10px",borderRadius:8,background:C.bg,border:`1.5px solid ${focused?C.teal:C.border}`,display:"flex",flexWrap:"wrap",gap:5,alignItems:"center",cursor:"text",transition:"border .15s"}}
      onClick={()=>document.getElementById("tag-inp-"+placeholder?.slice(0,5))?.focus()}>
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:"3px 10px",fontSize:12,fontWeight:600,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
        {v}<span onClick={()=>remove(v)} style={{cursor:"pointer",fontWeight:700,fontSize:14,lineHeight:1}}>×</span>
      </span>)}
      <input id={"tag-inp-"+placeholder?.slice(0,5)} value={input}
        onChange={e=>{setInput(e.target.value);setShowSug(true);}}
        onFocus={()=>{setFocused(true);setShowSug(true);}}
        onKeyDown={e=>{
          if((e.key==="Enter"||e.key===",")&&input){e.preventDefault();add(input);}
          if(e.key==="Backspace"&&!input&&values.length){remove(values[values.length-1]);}
        }}
        placeholder={values.length===0?placeholder:""}
        style={{border:"none",outline:"none",background:"none",fontSize:13,color:C.slate,fontFamily:F,minWidth:140,flex:1,padding:"2px 0"}}/>
    </div>
    {showSug&&(filtered.length>0||(input.length>0&&!suggestions.includes(input)))&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",overflow:"hidden"}}>
      {filtered.map(s=><div key={s} onClick={()=>add(s)} style={{padding:"10px 14px",cursor:"pointer",fontSize:13,color:C.slate,fontFamily:F,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.tealDim} onMouseLeave={e=>e.currentTarget.style.background="none"}>{s}</div>)}
      {input.length>0&&!values.includes(input)&&<div onClick={()=>add(input)} style={{padding:"10px 14px",cursor:"pointer",fontSize:13,color:C.teal,fontWeight:600,fontFamily:F,borderTop:filtered.length?`1px solid ${C.border}`:"none",background:C.tealDim}}>+ Add "{input}"</div>}
    </div>}
    {max&&<div style={{fontSize:11,color:values.length>=max?C.amber:C.gray400,marginTop:4,fontFamily:F}}>{values.length}/{max} added</div>}
  </div>;
}

// Autocomplete single input
function AutoInput({value,onChange,suggestions,placeholder}){
  const [show,setShow]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    function handler(e){if(ref.current&&!ref.current.contains(e.target))setShow(false);}
    document.addEventListener("mousedown",handler);return()=>document.removeEventListener("mousedown",handler);
  },[]);
  const filtered=value.length>1?suggestions.filter(s=>s.toLowerCase().includes(value.toLowerCase())).slice(0,8):[];
  return <div ref={ref} style={{position:"relative"}}>
    <TextInput value={value} onChange={v=>{onChange(v);setShow(true);}} placeholder={placeholder}/>
    {show&&filtered.length>0&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",maxHeight:200,overflowY:"auto"}}>
      {filtered.map(s=><div key={s} onClick={()=>{onChange(s);setShow(false);}} style={{padding:"10px 14px",cursor:"pointer",fontSize:13,color:C.slate,fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=C.tealDim} onMouseLeave={e=>e.currentTarget.style.background="none"}>{s}</div>)}
    </div>}
  </div>;
}

function SliderField({value,onChange,min,max,step=1,format,label}){
  return <div>
    {label&&<div style={{fontSize:13,color:C.gray600,marginBottom:6,fontFamily:F}}>{label}</div>}
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={{width:"100%",accentColor:C.teal,height:5}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(min)}</span>
      <span style={{fontSize:15,fontWeight:800,color:C.teal,fontFamily:F}}>{format(value)}</span>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(max)}</span>
    </div>
  </div>;
}

function ScaleQ({question,low,high,value,onChange}){
  return <div style={{marginBottom:22}}>
    <div style={{fontSize:14,color:C.slate,marginBottom:10,fontFamily:F,lineHeight:1.5,fontWeight:500}}>{question}</div>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:12,color:C.gray600,width:120,flexShrink:0,lineHeight:1.4,fontFamily:F}}>{low}</span>
      <div style={{display:"flex",gap:7,flex:1}}>
        {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)}
          style={{flex:1,height:38,borderRadius:8,border:`1.5px solid ${value===n?C.teal:C.border}`,background:value===n?C.teal:C.bg,color:value===n?C.white:C.gray600,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:F,transition:"all .15s"}}>{n}</button>)}
      </div>
      <span style={{fontSize:12,color:C.gray600,width:120,flexShrink:0,textAlign:"right",lineHeight:1.4,fontFamily:F}}>{high}</span>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:4,padding:"0 130px"}}>
      <span style={{fontSize:10,color:C.gray400,fontFamily:F}}>Strongly left</span>
      <span style={{fontSize:10,color:C.gray400,fontFamily:F}}>Balanced</span>
      <span style={{fontSize:10,color:C.gray400,fontFamily:F}}>Strongly right</span>
    </div>
  </div>;
}

// Repeatable block
function Block({title,children,onRemove,canRemove,accent=C.teal}){
  return <div style={{background:C.white,borderRadius:12,border:`1.5px solid ${C.border}`,padding:"20px 18px",marginBottom:12,position:"relative"}}>
    {title&&<div style={{fontSize:12,fontWeight:700,color:accent,textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontFamily:F}}>{title}</div>}
    {canRemove&&<button onClick={onRemove} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:C.gray400,fontSize:20,cursor:"pointer",lineHeight:1,padding:0}} title="Remove">×</button>}
    {children}
  </div>;
}

function AddButton({onClick,label}){
  return <button onClick={onClick} style={{width:"100%",padding:"11px 0",borderRadius:9,background:"none",border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:F,marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
    <span style={{fontSize:18,lineHeight:1}}>+</span> {label}
  </button>;
}

function Progress({step,total,sections}){
  const pct=Math.round(((step)/(total))*100);
  const estimatedMinutes=Math.max(1,Math.round((total-step)*2.5));
  return <div style={{marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:13,color:C.gray600,fontFamily:F,fontWeight:500}}>
        {step===0?"Starting up":step>=total?"Almost done":`Section ${step} of ${total}`}
      </span>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>
        {step>=total?"Review your answers":`~${estimatedMinutes} min remaining`}
      </span>
    </div>
    <div style={{height:6,background:C.gray100,borderRadius:3,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:`linear-gradient(90deg, ${C.teal}, ${C.tealDark})`,transition:"width .5s ease"}}/>
    </div>
    <div style={{display:"flex",gap:3,marginTop:6}}>
      {sections.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?C.teal:i===step-1?C.tealDim:C.gray100,transition:"background .3s"}}/>)}
    </div>
  </div>;
}

// ── RESUME UPLOAD ─────────────────────────────────────────────────────────────
function ResumeUpload({onSkip,onUpload}){
  const [dragging,setDragging]=useState(false);
  const [file,setFile]=useState(null);
  const ref=useRef();
  function handleFile(f){if(f&&(f.type==="application/pdf"||f.name?.endsWith(".docx")||f.name?.endsWith(".doc"))){setFile(f);}}
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{maxWidth:540,width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:28}}>
        <div style={{width:30,height:30,borderRadius:7,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:C.white}}>M</div>
        <span style={{fontWeight:800,fontSize:17,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
      </div>
      <Card style={{padding:"40px 36px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:16}}>📄</div>
          <h1 style={{fontSize:26,fontWeight:800,color:C.slate,margin:"0 0 12px",letterSpacing:-0.5,lineHeight:1.2}}>Got a resume?<br/>Let's use it one last time.</h1>
          <p style={{fontSize:15,color:C.gray600,margin:0,lineHeight:1.7}}>Upload it and we'll pre-fill your profile automatically. After this, your Matcht profile <em>is</em> your resume — and it works for you around the clock.</p>
        </div>
        <div
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={()=>ref.current?.click()}
          style={{border:`2px dashed ${dragging?C.teal:file?C.green:C.gray200}`,borderRadius:12,padding:"32px 24px",textAlign:"center",cursor:"pointer",background:dragging?C.tealDim:file?C.greenDim:C.bg,transition:"all .2s",marginBottom:16}}>
          <input ref={ref} type="file" accept=".pdf,.doc,.docx" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
          {file?<>
            <div style={{fontSize:32,marginBottom:8}}>✅</div>
            <div style={{fontWeight:700,fontSize:15,color:C.green,marginBottom:4}}>{file.name}</div>
            <div style={{fontSize:13,color:C.gray400}}>Click to choose a different file</div>
          </>:<>
            <div style={{fontSize:32,marginBottom:10}}>📎</div>
            <div style={{fontWeight:600,fontSize:15,color:C.slate,marginBottom:5}}>Drop your resume here</div>
            <div style={{fontSize:13,color:C.gray400,marginBottom:8}}>or click to browse your files</div>
            <div style={{display:"inline-block",background:C.gray100,borderRadius:20,padding:"4px 12px",fontSize:12,color:C.gray600}}>PDF, DOC, or DOCX · Max 10MB</div>
          </>}
        </div>
        {file&&<button onClick={()=>onUpload(file)} style={{width:"100%",padding:"13px 0",borderRadius:9,background:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:F,marginBottom:10}}>Pre-fill my profile from this resume →</button>}
        <button onClick={onSkip} style={{width:"100%",padding:"11px 0",borderRadius:9,background:"none",border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:F}}>
          {file?"Skip — I'll fill it in manually":"I don't have a resume — start from scratch"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:C.gray400,marginTop:14,lineHeight:1.5}}>Your resume is used only to pre-fill your profile.<br/>It is never shared with employers.</p>
      </Card>
    </div>
  </div>;
}

// ── SECTION 1: BASIC INFO & ONLINE PRESENCE ───────────────────────────────────
function S1({d,set}){
  return <>
    <SectionTitle section="Section 1 of 9" title="Basic Information" sub="Contact details and your online presence. Used for matching, communication, and your public profile."/>
    <Divider/>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
      <div><FieldLabel required>First name</FieldLabel><TextInput value={d.firstName} onChange={v=>set(x=>({...x,firstName:v}))} placeholder="Jane"/></div>
      <div><FieldLabel required>Last name</FieldLabel><TextInput value={d.lastName} onChange={v=>set(x=>({...x,lastName:v}))} placeholder="Smith"/></div>
    </div>
    <div style={{marginBottom:16}}><FieldLabel required>Email address</FieldLabel><TextInput value={d.email} onChange={v=>set(x=>({...x,email:v}))} placeholder="jane@example.com" type="email"/></div>
    <div style={{marginBottom:16}}><FieldLabel optional>Phone number</FieldLabel><TextInput value={d.phone} onChange={v=>set(x=>({...x,phone:v}))} placeholder="+1 (555) 000-0000"/></div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:16}}>
      <div><FieldLabel required>City & state</FieldLabel><TextInput value={d.location} onChange={v=>set(x=>({...x,location:v}))} placeholder="Chicago, IL"/></div>
      <div><FieldLabel required>ZIP code</FieldLabel><TextInput value={d.zip} onChange={v=>set(x=>({...x,zip:v}))} placeholder="60601"/></div>
    </div>

    <Divider label="Professional headline"/>
    <div style={{marginBottom:16}}>
      <FieldLabel optional hint="Your professional tagline — shown on your profile. 120 characters max.">Headline</FieldLabel>
      <TextInput value={d.headline} onChange={v=>set(x=>({...x,headline:v.slice(0,120)}))} placeholder="e.g. Senior Product Manager · Scaling B2B SaaS · Ex-Google"/>
      <div style={{fontSize:11,color:d.headline.length>100?C.amber:C.gray400,marginTop:3,textAlign:"right",fontFamily:F}}>{d.headline.length}/120</div>
    </div>

    <Divider label="Online presence"/>
    <div style={{marginBottom:12}}><FieldLabel optional>LinkedIn URL</FieldLabel><TextInput value={d.linkedin} onChange={v=>set(x=>({...x,linkedin:v}))} placeholder="https://linkedin.com/in/yourname"/></div>
    <div style={{marginBottom:12}}><FieldLabel optional>Personal website or portfolio</FieldLabel><TextInput value={d.website} onChange={v=>set(x=>({...x,website:v}))} placeholder="https://yourname.com"/></div>
    <div style={{marginBottom:16}}><FieldLabel optional>GitHub, Dribbble, Behance, or other</FieldLabel><TextInput value={d.otherLink} onChange={v=>set(x=>({...x,otherLink:v}))} placeholder="https://github.com/yourname"/></div>

    <Divider label="Eligibility"/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>Are you legally authorized to work in the United States?</FieldLabel>
      <RadioGroup options={["Yes, without sponsorship","Yes, but I require sponsorship","No"]} value={d.workAuth} onChange={v=>set(x=>({...x,workAuth:v}))}/>
    </div>

    <Divider label="Voluntary self-identification (optional)"/>
    <p style={{fontSize:13,color:C.gray400,margin:"0 0 12px",fontFamily:F,lineHeight:1.6}}>The following questions are entirely optional and used only for EEOC compliance reporting with enterprise clients. Your answers have absolutely no effect on your match score or visibility to recruiters.</p>
    <div style={{marginBottom:12}}>
      <FieldLabel optional>Gender identity</FieldLabel>
      <Select value={d.gender} onChange={v=>set(x=>({...x,gender:v}))} options={["Male","Female","Non-binary","Prefer to self-describe","Prefer not to answer"]} placeholder="Select..."/>
    </div>
    <div style={{marginBottom:12}}>
      <FieldLabel optional>Race / ethnicity</FieldLabel>
      <Select value={d.race} onChange={v=>set(x=>({...x,race:v}))} options={["American Indian or Alaska Native","Asian","Black or African American","Hispanic or Latino","Native Hawaiian or Other Pacific Islander","White","Two or more races","Prefer not to answer"]} placeholder="Select..."/>
    </div>
    <div style={{marginBottom:12}}>
      <FieldLabel optional>Veteran status</FieldLabel>
      <Select value={d.veteran} onChange={v=>set(x=>({...x,veteran:v}))} options={["Not a veteran","Active duty military","U.S. Military Veteran","Disabled veteran","Prefer not to answer"]} placeholder="Select..."/>
    </div>
    <div style={{marginBottom:4}}>
      <FieldLabel optional>Disability status</FieldLabel>
      <Select value={d.disability} onChange={v=>set(x=>({...x,disability:v}))} options={["No disability","Yes, I have a disability","Prefer not to answer"]} placeholder="Select..."/>
    </div>
  </>;
}

// ── SECTION 2: PROFESSIONAL SUMMARY ──────────────────────────────────────────
function S2({d,set}){
  return <>
    <SectionTitle section="Section 2 of 9" title="Professional Summary" sub="Your story in your own words. This is the most human part of your profile — the part a resume never captures well."/>
    <Divider/>
    <div style={{marginBottom:20}}>
      <FieldLabel optional hint="Write like you're introducing yourself to a hiring manager at a conference. Warm, direct, and backed by proof. 2,000 characters max.">About you</FieldLabel>
      <TextArea value={d.summary} onChange={v=>set(x=>({...x,summary:v.slice(0,2000)}))} placeholder="Who are you professionally? What drives you? What's your superpower? What are you looking for next?&#10;&#10;Example: 'I'm a product leader with 10 years building B2B SaaS at companies from seed to IPO. I'm at my best when there's a hard problem and a small, sharp team. I've shipped 3 products from zero to $10M ARR and I'm looking for my next challenge in FinTech or HealthTech where I can own the roadmap and build the team.'" rows={8}/>
      <div style={{fontSize:11,color:d.summary.length>1800?C.amber:C.gray400,marginTop:3,textAlign:"right",fontFamily:F}}>{d.summary.length}/2,000</div>
    </div>
    <div style={{marginBottom:20}}>
      <FieldLabel optional hint="Specific, quantifiable wins you want employers to notice immediately.">Top 3 career accomplishments (optional)</FieldLabel>
      {[0,1,2].map(i=><div key={i} style={{marginBottom:8}}>
        <TextInput value={d.accomplishments[i]||""} onChange={v=>set(x=>({...x,accomplishments:x.accomplishments.map((a,idx)=>idx===i?v:a)}))} placeholder={`e.g. Grew ARR from $2M to $18M in 24 months as Head of Growth at Acme`}/>
      </div>)}
    </div>
  </>;
}

// ── SECTION 3: EDUCATION ──────────────────────────────────────────────────────
function S3({d,set}){
  const hasDegree=level=>["Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree","PhD or Doctorate","Associate's degree"].includes(level);
  function addDegree(){set(x=>({...x,degrees:[...x.degrees,{level:"",field:"",university:"",gradYear:"",current:false,gpa:"",activities:"",honors:""}]}));}
  function upd(i,k,v){set(x=>({...x,degrees:x.degrees.map((d,idx)=>idx===i?{...d,[k]:v}:d)}));}
  function rem(i){set(x=>({...x,degrees:x.degrees.filter((_,idx)=>idx!==i)}));}

  function addCert(){set(x=>({...x,certifications:[...x.certifications,{name:"",issuer:"",date:"",expiry:"",credentialId:""}]}));}
  function updC(i,k,v){set(x=>({...x,certifications:x.certifications.map((c,idx)=>idx===i?{...c,[k]:v}:c)}));}
  function remC(i){set(x=>({...x,certifications:x.certifications.filter((_,idx)=>idx!==i)}));}

  return <>
    <SectionTitle section="Section 3 of 9" title="Education" sub="Add all degrees, certifications, and credentials. You don't need a degree to use Matcht — this is for matching accuracy only."/>
    <Divider label="Degrees & programs"/>
    {d.degrees.map((deg,i)=><Block key={i} title={i===0?"Primary degree":"Additional degree"} onRemove={()=>rem(i)} canRemove={d.degrees.length>1}>
      <div style={{marginBottom:12}}><FieldLabel>Degree level</FieldLabel><Select value={deg.level} onChange={v=>upd(i,"level",v)} options={EDUCATION_LEVELS} placeholder="Select level..."/></div>
      {hasDegree(deg.level)&&<>
        <div style={{marginBottom:12}}><FieldLabel>Field of study / Major</FieldLabel><TextInput value={deg.field} onChange={v=>upd(i,"field",v)} placeholder="e.g. Computer Science, Business Administration, Psychology"/></div>
        <div style={{marginBottom:12}}><FieldLabel>University or institution</FieldLabel><AutoInput value={deg.university} onChange={v=>upd(i,"university",v)} suggestions={UNIVERSITIES} placeholder="Start typing your school..."/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
          <div><FieldLabel>Graduation year</FieldLabel><TextInput value={deg.gradYear} onChange={v=>upd(i,"gradYear",v)} placeholder="2018"/></div>
          <div><FieldLabel>GPA (optional)</FieldLabel><TextInput value={deg.gpa} onChange={v=>upd(i,"gpa",v)} placeholder="3.8"/></div>
          <div style={{paddingTop:26}}><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={deg.current} onChange={e=>upd(i,"current",e.target.checked)} style={{accentColor:C.teal,width:16,height:16}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>Currently enrolled</span></label></div>
        </div>
        <div style={{marginBottom:8}}><FieldLabel optional>Activities, societies, or thesis topic</FieldLabel><TextInput value={deg.activities} onChange={v=>upd(i,"activities",v)} placeholder="e.g. Investment club president, Thesis: ML applications in credit risk"/></div>
      </>}
    </Block>)}
    <AddButton onClick={addDegree} label="Add another degree or program"/>

    <Divider label="Certifications & licenses"/>
    {d.certifications.map((cert,i)=><Block key={i} title={`Certification ${i+1}`} onRemove={()=>remC(i)} canRemove={true}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><FieldLabel>Certification name</FieldLabel><TextInput value={cert.name} onChange={v=>updC(i,"name",v)} placeholder="e.g. AWS Solutions Architect"/></div>
        <div><FieldLabel>Issuing organization</FieldLabel><TextInput value={cert.issuer} onChange={v=>updC(i,"issuer",v)} placeholder="e.g. Amazon Web Services"/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div><FieldLabel>Issue date</FieldLabel><TextInput value={cert.date} onChange={v=>updC(i,"date",v)} placeholder="MM/YYYY"/></div>
        <div><FieldLabel>Expiry date (if any)</FieldLabel><TextInput value={cert.expiry} onChange={v=>updC(i,"expiry",v)} placeholder="MM/YYYY or N/A"/></div>
        <div><FieldLabel>Credential ID (optional)</FieldLabel><TextInput value={cert.credentialId} onChange={v=>updC(i,"credentialId",v)} placeholder="ABC-12345"/></div>
      </div>
    </Block>)}
    <AddButton onClick={addCert} label="Add a certification or license"/>

    <Divider label="Test scores (optional)"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {[["GMAT","gmat"],["GRE","gre"],["LSAT","lsat"],["MCAT","mcat"],["Bar Exam","bar"],["CFA Level","cfa"]].map(([label,key])=><div key={key}><FieldLabel optional>{label}</FieldLabel><TextInput value={d.testScores[key]||""} onChange={v=>set(x=>({...x,testScores:{...x.testScores,[key]:v}}))} placeholder="Score or pass/fail"/></div>)}
    </div>
  </>;
}

// ── SECTION 4: WORK HISTORY ───────────────────────────────────────────────────
function S4({d,set}){
  function addJob(){set(x=>({...x,jobs:[...x.jobs,{company:"",title:"",location:"",startMonth:"",startYear:"",endMonth:"",endYear:"",current:false,employmentType:"",description:"",accomplishments:["","",""],reasonForLeaving:""}]}));}
  function upd(i,k,v){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,[k]:v}:j)}));}
  function updAcc(i,ai,v){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,accomplishments:j.accomplishments.map((a,aidx)=>aidx===ai?v:a)}:j)}));}
  function rem(i){set(x=>({...x,jobs:x.jobs.filter((_,idx)=>idx!==i)}));}

  function addVol(){set(x=>({...x,volunteer:[...x.volunteer,{org:"",role:"",cause:"",startYear:"",endYear:"",current:false,description:""}]}));}
  function updV(i,k,v){set(x=>({...x,volunteer:x.volunteer.map((v2,idx)=>idx===i?{...v2,[k]:v}:v2)}));}
  function remV(i){set(x=>({...x,volunteer:x.volunteer.filter((_,idx)=>idx!==i)}));}

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years=Array.from({length:40},(_,i)=>(new Date().getFullYear()-i).toString());

  return <>
    <SectionTitle section="Section 4 of 9" title="Work History" sub="This replaces your resume entirely. The more detail you provide, the better your matches — and the stronger your profile looks to recruiters."/>
    <Divider label="Professional experience"/>
    {d.jobs.map((job,i)=><Block key={i} title={i===0?"Most recent role":`Previous role ${i}`} onRemove={()=>rem(i)} canRemove={d.jobs.length>1}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><FieldLabel required>Job title</FieldLabel><TextInput value={job.title} onChange={v=>upd(i,"title",v)} placeholder="e.g. Senior Product Manager"/></div>
        <div><FieldLabel required>Company</FieldLabel><TextInput value={job.company} onChange={v=>upd(i,"company",v)} placeholder="e.g. Acme Corp"/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><FieldLabel optional>Location</FieldLabel><TextInput value={job.location} onChange={v=>upd(i,"location",v)} placeholder="e.g. Chicago, IL or Remote"/></div>
        <div><FieldLabel optional>Employment type</FieldLabel><Select value={job.employmentType} onChange={v=>upd(i,"employmentType",v)} options={["Full-time","Part-time","Contract","Internship","Freelance","Temporary"]} placeholder="Select..."/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <FieldLabel>Start date</FieldLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Select value={job.startMonth} onChange={v=>upd(i,"startMonth",v)} options={months} placeholder="Month"/>
            <Select value={job.startYear} onChange={v=>upd(i,"startYear",v)} options={years} placeholder="Year"/>
          </div>
        </div>
        <div>
          <FieldLabel>End date</FieldLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Select value={job.endMonth} onChange={v=>upd(i,"endMonth",v)} options={months} placeholder="Month" disabled={job.current}/>
            <Select value={job.endYear} onChange={v=>upd(i,"endYear",v)} options={years} placeholder="Year" disabled={job.current}/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:7,marginTop:7,cursor:"pointer"}}><input type="checkbox" checked={job.current} onChange={e=>upd(i,"current",e.target.checked)} style={{accentColor:C.teal,width:14,height:14}}/><span style={{fontSize:12,color:C.slate,fontFamily:F}}>I currently work here</span></label>
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <FieldLabel optional hint="What did you own? What were your core responsibilities?">Role description</FieldLabel>
        <TextArea value={job.description} onChange={v=>upd(i,"description",v)} placeholder="Describe your role, team size, scope of responsibilities, and what you owned..." rows={3}/>
      </div>
      <div style={{marginBottom:10}}>
        <FieldLabel optional hint="Use numbers where possible — revenue, growth %, team size, cost savings. Start with action verbs.">Key accomplishments</FieldLabel>
        {job.accomplishments.map((acc,ai)=><div key={ai} style={{marginBottom:7}}>
          <TextInput value={acc} onChange={v=>updAcc(i,ai,v)} placeholder={ai===0?"e.g. Grew ARR from $2M to $18M in 24 months by rebuilding the pricing model":ai===1?"e.g. Led a team of 12 engineers to ship the core platform 3 months ahead of schedule":"e.g. Reduced customer churn by 34% through a new onboarding program I designed and launched"}/>
        </div>)}
      </div>
      {!job.current&&<div>
        <FieldLabel optional>Reason for leaving (optional — not shown to recruiters)</FieldLabel>
        <Select value={job.reasonForLeaving} onChange={v=>upd(i,"reasonForLeaving",v)} options={["Better opportunity","Layoff / reduction in force","Company closed","Seeking career growth","Relocation","Personal reasons","Contract ended","Pursuing education","Other"]} placeholder="Select a reason..."/>
      </div>}
    </Block>)}
    <AddButton onClick={addJob} label="Add another role"/>

    <Divider label="Volunteer experience (optional)"/>
    <p style={{fontSize:13,color:C.gray400,margin:"0 0 12px",fontFamily:F}}>Volunteer work can be just as relevant as paid experience and is a significant factor for culture and mission-driven role matching.</p>
    {d.volunteer.map((v,i)=><Block key={i} title={`Volunteer role ${i+1}`} onRemove={()=>remV(i)} canRemove={true} accent={C.green}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><FieldLabel>Organization</FieldLabel><TextInput value={v.org} onChange={val=>updV(i,"org",val)} placeholder="e.g. Habitat for Humanity"/></div>
        <div><FieldLabel>Role</FieldLabel><TextInput value={v.role} onChange={val=>updV(i,"role",val)} placeholder="e.g. Board Member, Volunteer Coach"/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><FieldLabel>Cause / focus area</FieldLabel><TextInput value={v.cause} onChange={val=>updV(i,"cause",val)} placeholder="e.g. Housing, Education"/></div>
        <div><FieldLabel>Start year</FieldLabel><Select value={v.startYear} onChange={val=>updV(i,"startYear",val)} options={years} placeholder="Year"/></div>
        <div>
          <FieldLabel>End year</FieldLabel>
          <Select value={v.endYear} onChange={val=>updV(i,"endYear",val)} options={years} placeholder="Year" disabled={v.current}/>
          <label style={{display:"flex",alignItems:"center",gap:6,marginTop:5,cursor:"pointer"}}><input type="checkbox" checked={v.current} onChange={e=>updV(i,"current",e.target.checked)} style={{accentColor:C.teal,width:13,height:13}}/><span style={{fontSize:11,color:C.slate,fontFamily:F}}>Ongoing</span></label>
        </div>
      </div>
      <div><FieldLabel optional>Description</FieldLabel><TextArea value={v.description} onChange={val=>updV(i,"description",val)} placeholder="What did you do? What impact did it have?" rows={2}/></div>
    </Block>)}
    <AddButton onClick={addVol} label="Add volunteer experience"/>

    <Divider label="Employment gaps"/>
    <FieldLabel optional hint="Completely optional. Only share what you're comfortable with.">Any gaps in your work history you'd like to explain?</FieldLabel>
    <TextArea value={d.gaps} onChange={v=>set(x=>({...x,gaps:v}))} placeholder="e.g. Took 18 months off to care for a family member. Returned to work in 2023." rows={2}/>
    <div style={{marginTop:14}}>
      <FieldLabel>Current employment status</FieldLabel>
      <RadioGroup options={["Employed full-time","Employed part-time","Self-employed / Freelance","Currently unemployed","Student","Career break (planned)"]} value={d.empStatus} onChange={v=>set(x=>({...x,empStatus:v}))}/>
    </div>
  </>;
}

// ── SECTION 5: SKILLS & EXPERTISE ────────────────────────────────────────────
function S5({d,set}){
  function addProject(){set(x=>({...x,projects:[...x.projects,{name:"",description:"",url:"",startYear:"",endYear:"",current:false}]}));}
  function updP(i,k,v){set(x=>({...x,projects:x.projects.map((p,idx)=>idx===i?{...p,[k]:v}:p)}));}
  function remP(i){set(x=>({...x,projects:x.projects.filter((_,idx)=>idx!==i)}));}
  return <>
    <SectionTitle section="Section 5 of 9" title="Skills & Expertise" sub="Type any skill and press Enter. The more accurately you represent your skills, the better your matches. Overstating leads to bad fits for everyone."/>
    <Divider/>
    <div style={{marginBottom:20}}>
      <FieldLabel required hint="Include technical, functional, and interpersonal skills all in one place. Press Enter or comma to add each skill.">Your skills</FieldLabel>
      <TagInput values={d.skills} onChange={v=>set(x=>({...x,skills:v}))} suggestions={SKILL_SUGGESTIONS} placeholder="e.g. Product Management, SQL, Leadership, React, Negotiation..."/>
      {d.skills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.skills.length} skills added · type to add more</div>}
    </div>
    <div style={{marginBottom:20}}>
      <FieldLabel required>Overall seniority level</FieldLabel>
      <RadioGroup options={["Entry — building foundational skills (0–2 yrs)","Mid-level — solid independent contributor (3–5 yrs)","Senior — deep expertise, sometimes leads others (6–10 yrs)","Lead / Principal — sets direction, mentors others (10+ yrs)","Executive — organizational leadership"]} value={d.seniority} onChange={v=>set(x=>({...x,seniority:v}))}/>
    </div>

    <Divider label="Languages"/>
    {d.languages.map((lang,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8,alignItems:"end"}}>
      <div><FieldLabel>Language</FieldLabel><AutoInput value={lang.language} onChange={v=>set(x=>({...x,languages:x.languages.map((l,idx)=>idx===i?{...l,language:v}:l)}))} suggestions={LANGUAGES} placeholder="e.g. Spanish"/></div>
      <div><FieldLabel>Proficiency</FieldLabel><Select value={lang.proficiency} onChange={v=>set(x=>({...x,languages:x.languages.map((l,idx)=>idx===i?{...l,proficiency:v}:l)}))} options={PROFICIENCY} placeholder="Select level..."/></div>
      {d.languages.length>1&&<button onClick={()=>set(x=>({...x,languages:x.languages.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:C.gray400,fontSize:20,cursor:"pointer",paddingBottom:6}}>×</button>}
    </div>)}
    <AddButton onClick={()=>set(x=>({...x,languages:[...x.languages,{language:"",proficiency:""}]}))} label="Add a language"/>

    <Divider label="Projects & portfolio (optional)"/>
    <p style={{fontSize:13,color:C.gray400,margin:"0 0 12px",fontFamily:F}}>Personal projects, side projects, open source contributions, or notable work samples.</p>
    {d.projects.map((p,i)=><Block key={i} title={`Project ${i+1}`} onRemove={()=>remP(i)} canRemove={true} accent={C.purple}>
      <div style={{marginBottom:10}}><FieldLabel>Project name</FieldLabel><TextInput value={p.name} onChange={v=>updP(i,"name",v)} placeholder="e.g. OpenBudget, Personal Finance App"/></div>
      <div style={{marginBottom:10}}><FieldLabel>Description</FieldLabel><TextArea value={p.description} onChange={v=>updP(i,"description",v)} placeholder="What did you build? What problem does it solve? What was your role?" rows={3}/></div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
        <div><FieldLabel optional>URL</FieldLabel><TextInput value={p.url} onChange={v=>updP(i,"url",v)} placeholder="https://..."/></div>
        <div><FieldLabel>Start year</FieldLabel><TextInput value={p.startYear} onChange={v=>updP(i,"startYear",v)} placeholder="2022"/></div>
        <div><FieldLabel>End year</FieldLabel><TextInput value={p.endYear} onChange={v=>updP(i,"endYear",v)} placeholder="2023 or Present"/></div>
      </div>
    </Block>)}
    <AddButton onClick={addProject} label="Add a project"/>

    <Divider label="Honors, awards & publications (optional)"/>
    {d.awards.map((a,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,marginBottom:8,alignItems:"end"}}>
      <div><FieldLabel>Award or honor</FieldLabel><TextInput value={a.name} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,name:v}:aw)}))} placeholder="e.g. Forbes 30 Under 30, Dean's List"/></div>
      <div><FieldLabel>Issuer</FieldLabel><TextInput value={a.issuer} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,issuer:v}:aw)}))} placeholder="e.g. Forbes"/></div>
      <div><FieldLabel>Year</FieldLabel><TextInput value={a.year} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,year:v}:aw)}))} placeholder="2022"/></div>
      <button onClick={()=>set(x=>({...x,awards:x.awards.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:C.gray400,fontSize:20,cursor:"pointer",paddingBottom:6}}>×</button>
    </div>)}
    <AddButton onClick={()=>set(x=>({...x,awards:[...x.awards,{name:"",issuer:"",year:""}]}))} label="Add an award or publication"/>
  </>;
}

// ── SECTION 6: JOB PREFERENCES ───────────────────────────────────────────────
function S6({d,set}){
  const fmtS=v=>v>=500?"$500k+":`$${v}k`;
  const fmtC=v=>v>=90?"90+ min":`${v} min`;
  const noCommute=d.remotePreference==="Remote only — I will not commute";
  return <>
    <SectionTitle section="Section 6 of 9" title="Job Preferences & Critical Needs" sub="Your ranges and non-negotiables. These automatically filter out roles before you ever see them — so be honest."/>
    <Divider/>
    <div style={{marginBottom:20}}>
      <FieldLabel required hint="Add each title as a tag — press Enter after each one. Be specific. These are normalized so VP and Vice President are treated the same.">Target job titles</FieldLabel>
      <TagInput values={d.targetTitles} onChange={v=>set(x=>({...x,targetTitles:v}))} suggestions={TITLE_SUGGESTIONS} placeholder="e.g. Senior Product Manager, Director of Operations..."/>
    </div>

    <Divider label="Salary"/>
    <div style={{marginBottom:16}}>
      <FieldLabel required hint="The number you'd be thrilled to accept. Not your floor.">Ideal salary (base pay only)</FieldLabel>
      <SliderField value={d.idealSalary} onChange={v=>set(x=>({...x,idealSalary:Math.max(v,x.minSalary)}))} min={30} max={500} step={5} format={fmtS}/>
    </div>
    <div style={{marginBottom:20}}>
      <FieldLabel required hint="Your absolute floor. We will not show you anything below this number.">Minimum acceptable salary (base pay only)</FieldLabel>
      <SliderField value={d.minSalary} onChange={v=>set(x=>({...x,minSalary:Math.min(v,x.idealSalary)}))} min={30} max={500} step={5} format={fmtS}/>
      {d.idealSalary-d.minSalary>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>Your acceptable range: {fmtS(d.minSalary)} – {fmtS(d.idealSalary)}</div>}
    </div>

    <Divider label="Location & remote"/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>Remote work preference</FieldLabel>
      <RadioGroup options={["Remote only — I will not commute","Strongly prefer remote, open to occasional on-site","Hybrid — mix of remote and office is ideal","Flexible — whatever the role requires","On-site preferred"]} value={d.remotePreference} onChange={v=>set(x=>({...x,remotePreference:v}))}/>
    </div>
    {!noCommute&&<div style={{marginBottom:16}}>
      <FieldLabel hint="Based on your ZIP code, we filter roles by drive/transit time.">Maximum one-way commute you'd accept</FieldLabel>
      <SliderField value={d.maxCommute} onChange={v=>set(x=>({...x,maxCommute:v}))} min={10} max={90} step={5} format={fmtC}/>
    </div>}
    <div style={{marginBottom:16}}>
      <FieldLabel>Open to relocation?</FieldLabel>
      <RadioGroup options={["No — staying where I am","Yes — anywhere","Yes — specific regions only"]} value={d.relocation} onChange={v=>set(x=>({...x,relocation:v}))}/>
      {d.relocation?.includes("specific regions")&&<div style={{marginTop:8}}><TextInput value={d.relocationRegions} onChange={v=>set(x=>({...x,relocationRegions:v}))} placeholder="e.g. Southeast US, New York metro, Pacific Northwest"/></div>}
    </div>

    <Divider label="Role type & timing"/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>Employment type</FieldLabel>
      <CheckGroup options={EMPLOYMENT_TYPES} values={d.employmentType} onChange={v=>set(x=>({...x,employmentType:v}))} columns={2}/>
    </div>
    <div style={{marginBottom:16}}>
      <FieldLabel required>When are you available to start?</FieldLabel>
      <RadioGroup options={["Immediately (within 2 weeks)","Within 1 month","1–3 months","3–6 months","Exploring — no fixed timeline"]} value={d.availability} onChange={v=>set(x=>({...x,availability:v}))}/>
    </div>
    <div style={{marginBottom:16}}>
      <FieldLabel>Willing to travel for work?</FieldLabel>
      <RadioGroup options={TRAVEL_LEVELS} value={d.travel} onChange={v=>set(x=>({...x,travel:v}))}/>
    </div>

    <Divider label="Company preferences"/>
    <div style={{marginBottom:16}}>
      <FieldLabel>Preferred company size</FieldLabel>
      <CheckGroup options={["Startup (1–50)","Small (51–200)","Mid-size (201–1,000)","Large (1,001–10,000)","Enterprise (10,000+)","No preference"]} values={d.companySize} onChange={v=>set(x=>({...x,companySize:v}))} columns={2}/>
    </div>
    <div style={{marginBottom:16}}>
      <FieldLabel optional>Industries you'd like to work in</FieldLabel>
      <p style={{fontSize:13,color:C.gray400,margin:"0 0 8px",fontFamily:F}}>Leave blank to stay open to all.</p>
      <MultiDropdown options={INDUSTRIES} values={d.targetIndustries} onChange={v=>set(x=>({...x,targetIndustries:v}))} placeholder="Search and select industries..."/>
    </div>
  </>;
}

// ── SECTION 7: WORK STYLE & CULTURE ──────────────────────────────────────────
function S7({d,set}){
  return <>
    <SectionTitle section="Section 7 of 9" title="Work Style & Culture" sub="These answers are matched directly against how companies describe themselves and their teams. The more honest you are, the better your matches."/>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel required hint="These exact descriptors are what companies use to describe their culture — so overlap = culture match score.">What kind of culture are you looking for?</FieldLabel>
      <CheckGroup options={CULTURE_DESCRIPTORS} values={d.targetCulture} onChange={v=>set(x=>({...x,targetCulture:v}))} columns={2}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>Preferred management style from your direct manager</FieldLabel>
      <RadioGroup options={MGMT_STYLES} value={d.mgmtStyle} onChange={v=>set(x=>({...x,mgmtStyle:v}))}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>How do you prefer to receive feedback?</FieldLabel>
      <RadioGroup options={["Real-time — as I go","Regular check-ins (weekly or bi-weekly)","Formal periodic reviews (quarterly)","Self-directed — I ask when I need it"]} value={d.feedbackStyle} onChange={v=>set(x=>({...x,feedbackStyle:v}))}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel hint="Pick up to 3.">What motivates you most at work?</FieldLabel>
      <CheckGroup options={["Meaningful impact / mission","Career growth & advancement","Compensation & financial rewards","Learning new skills","Creative freedom","Team & culture","Flexibility & autonomy","Recognition & visibility","Stability & security","Ownership & autonomy"]} values={d.motivators} onChange={v=>set(x=>({...x,motivators:v}))} max={3} columns={2}/>
      <div style={{fontSize:11,color:C.gray400,marginTop:6,fontFamily:F}}>{d.motivators.length}/3 selected</div>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel optional>Industries you've worked in</FieldLabel>
      <MultiDropdown options={INDUSTRIES} values={d.industries} onChange={v=>set(x=>({...x,industries:v}))} placeholder="Search and select industries..."/>
    </div>
  </>;
}

// ── SECTION 8: PERSONALITY ────────────────────────────────────────────────────
function S8({d,set}){
  return <>
    <SectionTitle section="Section 8 of 9" title="Personality & Behavioral Profile" sub="Our workplace-calibrated personality assessment. Matched directly against how employers describe what their role requires. No right or wrong answers — just be honest."/>
    <Divider/>
    <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"14px 16px",marginBottom:24}}>
      <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>Rate yourself 1–5 on each scale. 1 = strongly left, 5 = strongly right, 3 = balanced between both sides. Your scores are compared against what employers say their role requires to compute personality fit %.</p>
    </div>
    {PERSONALITY_DIMS.map(q=><ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality[q.id]} onChange={v=>set(x=>({...x,personality:{...x.personality,[q.id]:v}}))}/>)}
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel>Communication style</FieldLabel>
      <RadioGroup options={["Direct and concise — I say exactly what I mean","Diplomatic — I'm very mindful of how things land","Expressive — I bring energy and enthusiasm to everything","Analytical — I lead with data, evidence, and logic"]} value={d.commStyle} onChange={v=>set(x=>({...x,commStyle:v}))}/>
    </div>
    <Divider/>
    <div>
      <FieldLabel>When you make a mistake at work, you typically...</FieldLabel>
      <RadioGroup options={["Own it immediately, fix it, and move on without dwelling","Analyze carefully what went wrong before moving forward","Take it hard personally but use it as fuel to improve","Focus energy on prevention systems so it doesn't happen again"]} value={d.mistakeStyle} onChange={v=>set(x=>({...x,mistakeStyle:v}))}/>
    </div>
  </>;
}

// ── SECTION 9: GOALS & INTENTIONS ────────────────────────────────────────────
function S9({d,set}){
  return <>
    <SectionTitle section="Section 9 of 9" title="Career Goals & Intentions" sub="Understanding where you're headed helps us find roles that are a genuine step forward — not lateral moves you'll regret."/>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel required>What's your primary goal right now?</FieldLabel>
      <RadioGroup options={["Find a significantly better-paying role","Advance to a more senior position","Switch industries or functions entirely","Find better work-life balance / less demanding pace","Return to work after a career break","Find more stability and job security","Find more meaningful or mission-driven work","Start something of my own — exploring options","Still figuring it out — open to conversations"]} value={d.primaryGoal} onChange={v=>set(x=>({...x,primaryGoal:v}))}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel>Where do you see yourself in 3–5 years?</FieldLabel>
      <RadioGroup options={["In a leadership or people management role","A deep subject-matter expert / senior individual contributor","Running my own business or freelancing full-time","Still growing within my current function and domain","I genuinely don't know yet — I'm keeping options open"]} value={d.fiveYear} onChange={v=>set(x=>({...x,fiveYear:v}))}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel>How actively are you searching right now?</FieldLabel>
      <RadioGroup options={["Actively — I want to move fast and am interviewing now","Open to the right opportunity — not in a rush","Passively exploring — not actively applying anywhere","Happily employed but curious what's out there"]} value={d.searchIntensity} onChange={v=>set(x=>({...x,searchIntensity:v}))}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel>What would it take for you to stay at your current job? (if applicable)</FieldLabel>
      <CheckGroup options={["Significant salary increase (20%+)","Promotion or meaningful title change","More remote flexibility","Better management or cultural changes","Nothing — I am ready to leave regardless","Not applicable (currently unemployed or in school)"]} values={d.stayReasons} onChange={v=>set(x=>({...x,stayReasons:v}))} columns={2}/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel optional>How did you hear about Matcht?</FieldLabel>
      <Select value={d.referralSource} onChange={v=>set(x=>({...x,referralSource:v}))} options={["Friend or colleague referral","LinkedIn","Google search","Instagram / TikTok / social media","Reddit","Newsletter or blog","News article","App store","Other"]} placeholder="Select..."/>
    </div>
    <Divider/>
    <div style={{marginBottom:16}}>
      <FieldLabel optional hint="This never appears to recruiters — it's your personal context for us.">Anything else we should know? (optional)</FieldLabel>
      <TextArea value={d.personalNote} onChange={v=>set(x=>({...x,personalNote:v}))} placeholder="e.g. I'm relocating to Austin in Q3 2026. I'm only looking at FinTech roles. I have a 3-month non-compete that ends in September. My portfolio is at..." rows={4}/>
    </div>
    <Divider label="Video intro"/>
    <div style={{border:`2px dashed ${C.gray200}`,borderRadius:12,padding:"28px 22px",textAlign:"center",background:C.bg}}>
      <div style={{fontSize:36,marginBottom:10}}>🎥</div>
      <div style={{fontWeight:700,fontSize:16,color:C.slate,marginBottom:6,fontFamily:F}}>Add a video intro</div>
      <p style={{fontSize:13,color:C.gray600,margin:"0 0 16px",lineHeight:1.6}}>2–3 minutes. Candidates with a video intro are <strong>4× more likely</strong> to hear back from recruiters. Let them see the real you before the first call.</p>
      <button style={{background:C.white,border:`1.5px solid ${C.border}`,color:C.slate,borderRadius:8,padding:"10px 22px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F}}>Upload video (MP4 or WebM)</button>
      <p style={{color:C.gray400,fontSize:12,marginTop:10,margin:"8px 0 0"}}>Max 500MB · You can always add this later from your profile settings</p>
    </div>
  </>;
}

// ── REVIEW ────────────────────────────────────────────────────────────────────
function Review({data}){
  const fmtS=v=>v>=500?"$500k+":`$${v}k`;
  const latestJob=data.jobs?.[0];
  const sections=[
    {title:"Contact & Identity",items:[["Name",`${data.firstName} ${data.lastName}`.trim()],["Location",data.location],["Headline",data.headline],["Work authorization",data.workAuth]]},
    {title:"Education",items:data.degrees?.filter(d=>d.level).map(d=>[d.level,d.university?`${d.university}${d.gradYear?`, ${d.gradYear}`:""}`:d.gradYear||""])},
    {title:"Work History",items:data.jobs?.filter(j=>j.company).map(j=>[j.title,`${j.company}${j.current?" (current)":""}`])},
    {title:"Skills",items:[["Total skills",`${data.skills?.length||0} added`],["Top skills",data.skills?.slice(0,5).join(", ")],["Seniority",data.seniority]]},
    {title:"Job Preferences",items:[["Target titles",data.targetTitles?.slice(0,3).join(", ")],["Ideal salary",data.idealSalary?fmtS(data.idealSalary):""],["Minimum salary",data.minSalary?fmtS(data.minSalary):""],["Remote preference",data.remotePreference],["Availability",data.availability]]},
    {title:"Work Style",items:[["Target culture",data.targetCulture?.slice(0,3).join(", ")],["Mgmt style",data.mgmtStyle],["Motivators",data.motivators?.join(", ")]]},
    {title:"Goals",items:[["Primary goal",data.primaryGoal],["Search status",data.searchIntensity]]},
  ];
  return <>
    <SectionTitle section="Final step" title="Review your profile" sub="Check everything looks right. Once you submit, your profile goes live and we start matching you immediately. You can edit anything at any time from your profile page."/>
    <Divider/>
    {sections.map(s=>s.items?.some(([,v])=>v)&&<div key={s.title} style={{marginBottom:20}}>
      <div style={{fontSize:12,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontFamily:F}}>{s.title}</div>
      {s.items?.filter(([,v])=>v).map(([l,v])=><div key={l} style={{display:"flex",borderBottom:`1px solid ${C.border}`,padding:"9px 0",gap:12}}>
        <span style={{fontSize:13,color:C.gray600,width:140,flexShrink:0,fontFamily:F}}>{l}</span>
        <span style={{fontSize:13,color:C.slate,fontWeight:500,fontFamily:F,lineHeight:1.4}}>{v}</span>
      </div>)}
    </div>)}
    <div style={{marginTop:20,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"16px 18px"}}>
      <p style={{fontSize:14,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>✓ Your Matcht profile is your new resume. It works for you 24/7 — no more applying blind, no more filling out forms from scratch.</p>
    </div>
  </>;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────
const INIT={
  // S1
  firstName:"",lastName:"",email:"",phone:"",location:"",zip:"",
  headline:"",linkedin:"",website:"",otherLink:"",workAuth:"",
  gender:"",race:"",veteran:"",disability:"",
  // S2
  summary:"",accomplishments:["","",""],
  // S3
  degrees:[{level:"",field:"",university:"",gradYear:"",current:false,gpa:"",activities:""}],
  certifications:[],testScores:{},
  // S4
  jobs:[{company:"",title:"",location:"",startMonth:"",startYear:"",endMonth:"",endYear:"",current:false,employmentType:"",description:"",accomplishments:["","",""],reasonForLeaving:""}],
  volunteer:[],gaps:"",empStatus:"",
  // S5
  skills:[],seniority:"",languages:[{language:"",proficiency:""}],projects:[],awards:[],
  // S6
  targetTitles:[],idealSalary:100,minSalary:75,remotePreference:"",maxCommute:30,
  employmentType:[],availability:"",relocation:"",relocationRegions:"",travel:"",
  companySize:[],targetIndustries:[],
  // S7
  targetCulture:[],mgmtStyle:"",feedbackStyle:"",motivators:[],industries:[],
  // S8
  personality:{},commStyle:"",mistakeStyle:"",
  // S9
  primaryGoal:"",fiveYear:"",searchIntensity:"",stayReasons:[],referralSource:"",personalNote:"",
};

const SECTIONS=[
  {label:"Basic Info",comp:S1},{label:"Summary",comp:S2},{label:"Education",comp:S3},
  {label:"Work History",comp:S4},{label:"Skills",comp:S5},{label:"Job Preferences",comp:S6},
  {label:"Work Style",comp:S7},{label:"Personality",comp:S8},{label:"Goals",comp:S9},
];

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [phase,setPhase]=useState("resume"); // resume | survey | done
  const [step,setStep]=useState(1);
  const [data,setData]=useState(INIT);
  const total=SECTIONS.length;
  const isReview=step>total;

  // Auto-save to localStorage
  useEffect(()=>{
    const t=setTimeout(()=>{try{localStorage.setItem("matcht_draft",JSON.stringify(data));}catch(e){}},800);
    return()=>clearTimeout(t);
  },[data]);

  // Restore draft
  useEffect(()=>{try{const d=localStorage.getItem("matcht_draft");if(d){const parsed=JSON.parse(d);if(parsed.firstName||parsed.skills?.length)setData(parsed);}}catch(e){};},[]);

  function go(n){setStep(n);window.scrollTo({top:0,behavior:"smooth"});}

  if(phase==="resume")return <ResumeUpload onSkip={()=>setPhase("survey")} onUpload={()=>setPhase("survey")}/>;

  if(phase==="done")return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center",maxWidth:440}}>
        <div style={{fontSize:60,marginBottom:16}}>🎉</div>
        <h1 style={{fontSize:26,fontWeight:800,color:C.slate,margin:"0 0 10px",letterSpacing:-0.5}}>You're live.</h1>
        <p style={{color:C.gray600,fontSize:15,lineHeight:1.7,margin:"0 0 8px"}}>Your Matcht profile is now your resume — and it's already working for you.</p>
        <p style={{color:C.gray400,fontSize:13,margin:"0 0 24px",lineHeight:1.6}}>We'll notify you the moment a strong match appears. No applying. No forms. Just matches.</p>
        <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:12,padding:"18px 20px",marginBottom:16}}>
          <p style={{fontSize:14,color:C.teal,fontWeight:600,margin:0}}>💡 Add a 2–3 min video intro to boost your callback rate by 4×. Takes less than 5 minutes.</p>
        </div>
        <button onClick={()=>{try{localStorage.removeItem("matcht_draft");}catch(e){}}} style={{background:"none",border:"none",color:C.gray400,fontSize:12,cursor:"pointer",fontFamily:F}}>Clear draft data</button>
      </div>
    </div>
  );

  const Sec=!isReview?SECTIONS[step-1]?.comp:null;

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,paddingBottom:100}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* Sticky header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:6,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:15,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
          <span style={{fontSize:12,color:C.gray400,marginLeft:2}}>/ Your Profile</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:11,color:C.green,fontWeight:600,fontFamily:F,opacity:0.8}}>✓ Auto-saving</span>
          <span style={{fontSize:12,color:C.gray600,fontWeight:500,fontFamily:F}}>{isReview?"Review & submit":`${step} of ${total} · ${SECTIONS[step-1]?.label}`}</span>
        </div>
      </div>

      {/* Section tab bar */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex",minWidth:"fit-content",padding:"0 12px"}}>
          {SECTIONS.map((s,i)=>{
            const n=i+1;
            const done=n<step;
            const active=n===step&&!isReview;
            return <button key={i} onClick={()=>go(n)} style={{padding:"10px 12px",border:"none",background:"none",borderBottom:`2.5px solid ${active?C.teal:done?C.green:"transparent"}`,color:active?C.teal:done?C.green:C.gray400,fontWeight:active?700:500,fontSize:12,cursor:"pointer",fontFamily:F,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
              {done&&<span style={{fontSize:10}}>✓</span>}{s.label}
            </button>;
          })}
          <button onClick={()=>go(total+1)} style={{padding:"10px 12px",border:"none",background:"none",borderBottom:`2.5px solid ${isReview?C.teal:"transparent"}`,color:isReview?C.teal:C.gray400,fontWeight:isReview?700:500,fontSize:12,cursor:"pointer",fontFamily:F,whiteSpace:"nowrap"}}>Review</button>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:680,margin:"28px auto 0",padding:"0 16px"}}>
        <Progress step={step-1} total={total} sections={SECTIONS}/>
        <Card style={{marginBottom:14}}>
          {isReview?<Review data={data}/>:<Sec d={data} set={setData}/>}
        </Card>

        {/* Nav buttons */}
        <div style={{display:"flex",gap:10}}>
          {step>1&&<button onClick={()=>go(step-1)} style={{flex:1,padding:"13px 0",borderRadius:9,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:F}}>← Back</button>}
          {!isReview
            ?<button onClick={()=>go(step+1)} style={{flex:2,padding:"13px 0",borderRadius:9,background:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:F,boxShadow:`0 2px 12px ${C.teal}44`}}>
                {step<total?"Continue →":"Review my profile →"}
              </button>
            :<button onClick={()=>setPhase("done")} style={{flex:2,padding:"13px 0",borderRadius:9,background:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:F,boxShadow:`0 2px 12px ${C.teal}44`}}>
                Submit & go live →
              </button>}
        </div>
        <p style={{textAlign:"center",fontSize:12,color:C.gray400,marginTop:10,fontFamily:F}}>Your answers auto-save as you go — you won't lose anything.</p>
      </div>
    </div>
  );
}

import { useState } from "react";

const C = {
  bg:"#F0F4F7",white:"#FFFFFF",teal:"#1A8C8C",tealDim:"#1A8C8C12",tealBorder:"#1A8C8C35",
  slate:"#1E2D3A",gray100:"#E3ECF1",gray200:"#C8D8E4",gray400:"#8FAABB",gray600:"#4E6475",
  gray800:"#2B3D4D",border:"#D4E3EC",green:"#19A87A",greenDim:"#19A87A14",
  amber:"#C9870C",amberDim:"#C9870C14",red:"#C0392B",redDim:"#C0392B14",
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

// ── FEEDBACK CONFIG ───────────────────────────────────────────────────────────
// Each reason maps to:
//   - what the candidate sees (category label)
//   - what add-on gets surfaced to them afterward
//   - whether recruiter notes are encouraged

const FEEDBACK_REASONS = [
  {
    id:"skills",
    label:"Skills don't match the role",
    candidateLabel:"Your skills weren't the right fit for this role.",
    detail:"Which specific skills were missing? (optional but helps the candidate improve)",
    detailPlaceholder:"e.g. We needed someone with hands-on Salesforce experience, SQL proficiency...",
    addon:{ name:"Skill Gap Report", price:"$9.99", icon:"🔍", desc:"A detailed breakdown of which skills are getting you passed on and what roles you'd score higher on." },
    encourageNotes:true,
  },
  {
    id:"salary",
    label:"Salary expectations are above our range",
    candidateLabel:"Your salary expectations didn't align with this role's compensation.",
    detail:"Any context you'd like to share? (optional)",
    detailPlaceholder:"e.g. Our range for this role is $90–110k base...",
    addon:{ name:"Salary Benchmarking Report", price:"$4.99", icon:"💰", desc:"See where your salary expectations sit vs. market rates for your title, experience, and location." },
    encourageNotes:false,
  },
  {
    id:"experience",
    label:"Not enough experience for this level",
    candidateLabel:"We were looking for someone with more experience for this particular role.",
    detail:"What experience level were you looking for? (optional)",
    detailPlaceholder:"e.g. We need someone with 7+ years in B2B SaaS sales specifically...",
    addon:{ name:"Profile Boost", price:"$4.99", icon:"🚀", desc:"Move to the top of recruiter search results for 48 hours while you build toward stronger matches." },
    encourageNotes:true,
  },
  {
    id:"education",
    label:"Education background doesn't meet our requirements",
    candidateLabel:"Your educational background wasn't the right fit for this role's requirements.",
    detail:"What was the specific requirement? (optional)",
    detailPlaceholder:"e.g. This role requires a CPA or active pursuit of CPA designation...",
    addon:{ name:"Profile & Resume Review", price:"$79", icon:"📄", desc:"A human recruiter reviews your full profile and gives written recommendations on how to position your background." },
    encourageNotes:true,
  },
  {
    id:"culture",
    label:"Work style or culture fit concerns",
    candidateLabel:"Based on your profile, we felt your work style or preferences weren't the right fit for our team.",
    detail:"Any context that would help them? (optional — keep it constructive)",
    detailPlaceholder:"e.g. We're a very fast-paced, high-autonomy team and the candidate indicated a preference for structured environments...",
    addon:{ name:"Personality & Culture Coaching", price:"$79", icon:"🧠", desc:"A coach reviews your behavioral answers and gives honest feedback on how your responses are coming across to employers." },
    encourageNotes:true,
  },
  {
    id:"location",
    label:"Location or availability doesn't work",
    candidateLabel:"Location or availability requirements for this role didn't align with your profile.",
    detail:null,
    addon:{ name:"Profile Boost", price:"$4.99", icon:"🚀", desc:"Boost your visibility with recruiters who do match your location and availability preferences." },
    encourageNotes:false,
  },
  {
    id:"overqualified",
    label:"Candidate appears overqualified",
    candidateLabel:"Based on your background, we felt this role might not be the right fit for your experience level.",
    detail:"Any context you'd like to share? (optional)",
    detailPlaceholder:"e.g. This is a junior-level role and we want to find someone who can grow into it...",
    addon:{ name:"Match Score Audit", price:"$14.99", icon:"📊", desc:"A review of why your profile is scoring on roles that may be below your level, with suggestions to refine your preferences." },
    encourageNotes:true,
  },
  {
    id:"filled",
    label:"Role has been filled",
    candidateLabel:"This role has been filled. Your profile is still active and we'll continue matching you to other opportunities.",
    detail:null,
    addon:{ name:"Profile Boost", price:"$4.99", icon:"🚀", desc:"Boost your visibility to recruiters with similar open roles." },
    encourageNotes:false,
  },
  {
    id:"video",
    label:"Video intro wasn't strong enough",
    candidateLabel:"We reviewed your video intro and felt it didn't give us enough to move forward.",
    detail:"Any constructive notes? (optional but very helpful)",
    detailPlaceholder:"e.g. The audio quality made it hard to hear. Try to be more specific about what you've built or accomplished...",
    addon:{ name:"Video Review", price:"$49", icon:"🎥", desc:"A recruiter watches your video intro and gives actionable feedback on delivery, content, and first impression." },
    encourageNotes:true,
  },
  {
    id:"other",
    label:"Other reason",
    candidateLabel:"The recruiter passed on your application for this role.",
    detail:"Please share any context you're comfortable providing (optional)",
    detailPlaceholder:"e.g. We went with an internal candidate, the role scope changed...",
    addon:{ name:"Unlock Full Feedback", price:"$2.99", icon:"💬", desc:"See the recruiter's specific notes and any additional context they shared." },
    encourageNotes:true,
  },
];

// ── SAMPLE CANDIDATE ──────────────────────────────────────────────────────────
const CANDIDATE = {
  name:"Maya Chen",
  title:"Senior PM",
  location:"Remote",
  exp:"8 yrs",
  match:96,
  salary:"$140k",
  video:true,
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function Card({children,style={}}){return <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"24px 22px",...style}}>{children}</div>;}
function Divider(){return <div style={{borderTop:`1px solid ${C.border}`,margin:"20px 0"}}/>;}

// ── VIEWS ─────────────────────────────────────────────────────────────────────

// Step 1: Recruiter selects reason + optional notes
function FeedbackForm({onSubmit}){
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [shareNotes, setShareNotes] = useState(true);
  const [error, setError] = useState(false);
  const reason = FEEDBACK_REASONS.find(r=>r.id===selected);

  function handleSubmit(){
    if(!selected){ setError(true); return; }
    onSubmit({ reason, notes: shareNotes ? notes : "", sharedNotes: shareNotes });
  }

  return (
    <div style={{maxWidth:560,margin:"0 auto",padding:"32px 16px",fontFamily:F}}>
      {/* Candidate card */}
      <Card style={{marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:C.tealDim,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:C.teal,flexShrink:0}}>
          {CANDIDATE.name.split(" ").map(n=>n[0]).join("")}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:C.slate}}>{CANDIDATE.name}</div>
          <div style={{fontSize:13,color:C.gray600}}>{CANDIDATE.title} · {CANDIDATE.location} · {CANDIDATE.exp} · Target {CANDIDATE.salary}</div>
        </div>
        <div style={{width:46,height:46,borderRadius:"50%",border:`2.5px solid ${C.green}`,background:C.greenDim,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:800,color:C.green,lineHeight:1}}>{CANDIDATE.match}%</div>
          <div style={{fontSize:8,color:C.green,fontWeight:700}}>Excellent</div>
        </div>
      </Card>

      <Card>
        {/* Required indicator */}
        <div style={{background:C.redDim,border:`1px solid ${C.red}22`,borderRadius:8,padding:"10px 14px",marginBottom:20,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
          <p style={{fontSize:13,color:C.red,fontWeight:600,margin:0,lineHeight:1.5}}>
            Selecting a reason is required. This feedback is shared with the candidate anonymously and helps them improve. It also keeps Matcht's matching quality high for everyone.
          </p>
        </div>

        <div style={{fontSize:15,fontWeight:700,color:C.slate,marginBottom:14}}>Why are you passing on {CANDIDATE.name.split(" ")[0]}?</div>

        {/* Reason options */}
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {FEEDBACK_REASONS.map(r=>(
            <button key={r.id} onClick={()=>{setSelected(r.id);setError(false);setNotes("");}}
              style={{background:selected===r.id?C.tealDim:C.bg,border:`1.5px solid ${selected===r.id?C.teal:C.border}`,borderRadius:8,padding:"11px 14px",color:selected===r.id?C.teal:C.gray800,fontWeight:selected===r.id?700:400,fontSize:13,cursor:"pointer",textAlign:"left",fontFamily:F,transition:"all .15s"}}>
              {r.label}
            </button>
          ))}
        </div>

        {error && <p style={{color:C.red,fontSize:13,margin:"0 0 14px",fontFamily:F}}>Please select a reason before submitting.</p>}

        {/* Optional notes */}
        {reason?.detail && (
          <div style={{marginBottom:16}}>
            <Divider/>
            <div style={{fontSize:14,fontWeight:600,color:C.slate,marginBottom:6}}>
              {reason.detail}
              {reason.encourageNotes && <span style={{fontSize:11,color:C.amber,fontWeight:600,background:C.amberDim,padding:"2px 7px",borderRadius:8,marginLeft:8}}>Recommended</span>}
            </div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={reason.detailPlaceholder} rows={3}
              style={{width:"100%",padding:"10px 13px",borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:F,resize:"vertical",lineHeight:1.55}}/>
            {notes.length > 0 && (
              <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,cursor:"pointer"}}>
                <input type="checkbox" checked={shareNotes} onChange={e=>setShareNotes(e.target.checked)} style={{accentColor:C.teal}}/>
                <span style={{fontSize:13,color:C.gray600,fontFamily:F}}>Share these notes with {CANDIDATE.name.split(" ")[0]} (they remain anonymous from you)</span>
              </label>
            )}
          </div>
        )}

        {/* What they'll see preview */}
        {reason && (
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>What {CANDIDATE.name.split(" ")[0]} will see</div>
            <p style={{fontSize:13,color:C.slate,margin:0,lineHeight:1.55,fontStyle:"italic"}}>"{reason.candidateLabel}"</p>
            {notes && shareNotes && <p style={{fontSize:13,color:C.gray600,margin:"8px 0 0",lineHeight:1.55,fontStyle:"italic"}}>Additional context: "{notes}"</p>}
          </div>
        )}

        <button onClick={handleSubmit} style={{width:"100%",padding:"12px 0",borderRadius:8,background:C.red,color:C.white,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:F}}>
          Confirm pass & send feedback →
        </button>
        <p style={{fontSize:12,color:C.gray400,textAlign:"center",margin:"10px 0 0",fontFamily:F}}>This action is final. The candidate will be notified.</p>
      </Card>
    </div>
  );
}

// Step 2: Confirmation + what happens next
function FeedbackConfirmed({result, onDone}){
  const {reason, notes} = result;
  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"32px 16px",fontFamily:F}}>
      <Card style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:40,marginBottom:12}}>✓</div>
        <h2 style={{fontSize:20,fontWeight:800,color:C.slate,margin:"0 0 6px",letterSpacing:-0.3}}>Feedback sent.</h2>
        <p style={{fontSize:14,color:C.gray600,margin:0,lineHeight:1.6}}>{CANDIDATE.name} has been notified. Your feedback was sent anonymously.</p>
        <Divider/>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>What you sent</div>
          <div style={{fontSize:14,color:C.slate,fontWeight:600,marginBottom:4}}>{reason.label}</div>
          {notes && <p style={{fontSize:13,color:C.gray600,margin:0,lineHeight:1.55,fontStyle:"italic"}}>"{notes}"</p>}
        </div>
      </Card>

      {/* Add-on preview (what the candidate sees) */}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.amber,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>What {CANDIDATE.name.split(" ")[0]} sees next</div>
        <p style={{fontSize:13,color:C.gray600,margin:"0 0 14px",lineHeight:1.55}}>
          Based on the reason you selected, {CANDIDATE.name.split(" ")[0]} will be offered this add-on to act on your feedback:
        </p>
        <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:26,flexShrink:0}}>{reason.addon.icon}</span>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontWeight:700,fontSize:14,color:C.slate}}>{reason.addon.name}</div>
              <div style={{fontWeight:800,fontSize:14,color:C.teal,marginLeft:10}}>{reason.addon.price}</div>
            </div>
            <div style={{fontSize:13,color:C.gray600,lineHeight:1.5}}>{reason.addon.desc}</div>
          </div>
        </div>
        <p style={{fontSize:12,color:C.gray400,margin:"10px 0 0",lineHeight:1.5}}>
          They're not required to purchase anything — this is offered as a resource tied directly to your feedback. It keeps job seekers free while giving them actionable next steps.
        </p>
      </Card>

      <button onClick={onDone} style={{width:"100%",padding:"12px 0",borderRadius:8,background:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:F}}>
        Back to candidate list →
      </button>
    </div>
  );
}

// What the candidate sees after getting feedback
function CandidateView({result}){
  const {reason, notes} = result;
  const [purchased, setPurchased] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"32px 16px",fontFamily:F}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:C.gray400,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>You're viewing as: candidate</div>
        <div style={{fontSize:13,color:C.gray600}}>This is what {CANDIDATE.name} sees in their dashboard</div>
      </div>

      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}>
          <span style={{fontSize:24,flexShrink:0}}>💬</span>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:C.slate,marginBottom:3}}>You received feedback</div>
            <div style={{fontSize:13,color:C.gray600}}>Senior Product Manager · Aether Technologies</div>
          </div>
        </div>
        <div style={{background:C.bg,borderRadius:9,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gray400,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Their feedback</div>
          <p style={{fontSize:14,color:C.slate,margin:0,lineHeight:1.6}}>{reason.candidateLabel}</p>
          {notes && unlocked && <p style={{fontSize:13,color:C.gray600,margin:"10px 0 0",lineHeight:1.55,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:10}}>Additional context: "{notes}"</p>}
          {notes && !unlocked && (
            <div style={{marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:13,color:C.gray400,fontStyle:"italic"}}>The recruiter left additional notes...</div>
                <button onClick={()=>setUnlocked(true)} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:7,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                  Unlock for $2.99
                </button>
              </div>
            </div>
          )}
        </div>
        <p style={{fontSize:13,color:C.gray600,lineHeight:1.65,margin:0}}>
          This is one data point, not a verdict on your candidacy. Your profile is still live and other roles are being matched to you right now.
        </p>
      </Card>

      {/* Add-on offer */}
      {!purchased && (
        <Card style={{border:`1.5px solid ${C.tealBorder}`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Based on this feedback</div>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
            <span style={{fontSize:28,flexShrink:0}}>{reason.addon.icon}</span>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontWeight:700,fontSize:15,color:C.slate}}>{reason.addon.name}</div>
                <div style={{fontWeight:800,fontSize:15,color:C.teal,marginLeft:10}}>{reason.addon.price}</div>
              </div>
              <div style={{fontSize:13,color:C.gray600,lineHeight:1.55}}>{reason.addon.desc}</div>
            </div>
          </div>
          <button onClick={()=>setPurchased(true)} style={{width:"100%",padding:"11px 0",borderRadius:8,background:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:F}}>
            Get {reason.addon.name} →
          </button>
          <p style={{fontSize:12,color:C.gray400,textAlign:"center",margin:"8px 0 0"}}>One-time purchase. No subscription.</p>
        </Card>
      )}

      {purchased && (
        <Card style={{border:`1.5px solid ${C.green}`,background:C.greenDim,marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div style={{fontWeight:700,fontSize:15,color:C.green,marginBottom:4}}>{reason.addon.name} purchased</div>
          <p style={{fontSize:13,color:C.gray600,margin:0,lineHeight:1.55}}>You'll receive your report or be contacted within 48 hours.</p>
        </Card>
      )}

      <button style={{width:"100%",padding:"11px 0",borderRadius:8,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:F}}>
        See my other matches →
      </button>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [view, setView] = useState("recruiter-form"); // recruiter-form | recruiter-confirmed | candidate-view
  const [result, setResult] = useState(null);

  function handleSubmit(data){
    setResult(data);
    setView("recruiter-confirmed");
  }

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,paddingBottom:60}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:24,height:24,borderRadius:5,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:14,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
          <span style={{fontSize:11,color:C.gray400}}>/ Feedback Flow</span>
        </div>
        {/* View switcher */}
        <div style={{display:"flex",gap:6}}>
          {[
            ["recruiter-form","Recruiter: Pass"],
            ["recruiter-confirmed","Recruiter: Confirmed",!!result],
            ["candidate-view","Candidate: Receives",!!result],
          ].map(([v,l,enabled=true])=>(
            <button key={v} onClick={()=>enabled&&setView(v)} style={{padding:"6px 12px",borderRadius:7,background:view===v?C.teal:"none",border:`1.5px solid ${view===v?C.teal:C.border}`,color:view===v?C.white:enabled?C.gray600:C.gray200,fontWeight:view===v?700:500,fontSize:12,cursor:enabled?"pointer":"default",fontFamily:F}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {view==="recruiter-form" && <FeedbackForm onSubmit={handleSubmit}/>}
      {view==="recruiter-confirmed" && result && <FeedbackConfirmed result={result} onDone={()=>setView("recruiter-form")}/>}
      {view==="candidate-view" && result && <CandidateView result={result}/>}
      {(view==="recruiter-confirmed"||view==="candidate-view") && !result && (
        <div style={{textAlign:"center",padding:"60px 24px",color:C.gray400,fontFamily:F}}>Submit a feedback form first to preview this view.</div>
      )}
    </div>
  );
}

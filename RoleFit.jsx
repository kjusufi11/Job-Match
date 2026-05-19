import { useState, useEffect } from "react";

const C = {
  bg:"#F2F6F8",bgCard:"#FFFFFF",teal:"#1A8C8C",tealLight:"#2AADAD",tealDark:"#116060",tealDim:"#1A8C8C14",tealBorder:"#1A8C8C40",slate:"#1E2D3A",slateLight:"#2E4255",gray100:"#E3ECF1",gray200:"#C8D8E4",gray400:"#8FAABB",gray600:"#4E6475",gray800:"#2B3D4D",border:"#D4E3EC",green:"#19A87A",greenDim:"#19A87A14",amber:"#C9870C",amberDim:"#C9870C14",red:"#C0392B",redDim:"#C0392B14",white:"#FFFFFF",purple:"#6B5EA8",purpleDim:"#6B5EA814",
};
const F="'Plus Jakarta Sans','Helvetica Neue',sans-serif";
const matchColor=p=>p>=85?C.green:p>=70?C.amber:C.red;
const matchDim=p=>p>=85?C.greenDim:p>=70?C.amberDim:C.redDim;
const matchLabel=p=>p>=85?"Excellent":p>=70?"Good":"Fair";

function Badge({children,color=C.teal,dim=C.tealDim,style={}}){return <span style={{fontSize:11,fontWeight:700,background:dim,color,padding:"2px 9px",borderRadius:10,...style}}>{children}</span>;}
function Pill({children,active,onClick}){return <button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,background:active?C.tealDim:C.bg,border:`1.5px solid ${active?C.teal:C.border}`,color:active?C.teal:C.gray600,fontWeight:active?700:400,fontSize:13,cursor:"pointer",fontFamily:F,transition:"all .15s"}}>{children}</button>;}
function FLabel({children}){return <div style={{fontSize:13,fontWeight:600,color:C.gray800,marginBottom:5,fontFamily:F}}>{children}</div>;}
function FField({label,value,onChange,placeholder,type="text",rows}){const s={width:"100%",padding:"10px 13px",borderRadius:7,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:F};return <div style={{marginBottom:14}}>{label&&<FLabel>{label}</FLabel>}{rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...s,resize:"vertical",lineHeight:1.55}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>}</div>;}
function PBtn({onClick,children,full=false,style={},disabled=false}){return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:"11px 22px",borderRadius:8,background:disabled?C.gray400:C.teal,color:C.white,border:"none",fontWeight:700,fontSize:14,cursor:disabled?"default":"pointer",fontFamily:F,...style}}>{children}</button>;}
function GBtn({onClick,children,style={}}){return <button onClick={onClick} style={{padding:"11px 18px",borderRadius:8,background:"none",border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:F,...style}}>{children}</button>;}
function Card({children,style={}}){return <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"22px",...style}}>{children}</div>;}
function SHead({title,sub}){return <div style={{marginBottom:24}}><h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:"0 0 4px",letterSpacing:-0.5}}>{title}</h2>{sub&&<p style={{color:C.gray600,fontSize:14,margin:0}}>{sub}</p>}</div>;}
function Toggle({label,sub,value,onChange}){return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:14,fontWeight:600,color:C.slate}}>{label}</div>{sub&&<div style={{fontSize:12,color:C.gray400,marginTop:2}}>{sub}</div>}</div><div onClick={()=>onChange(!value)} style={{width:42,height:24,borderRadius:12,background:value?C.teal:C.gray200,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:18,height:18,borderRadius:"50%",background:C.white,position:"absolute",top:3,left:value?21:3,transition:"left .2s"}}/></div></div>;}

const SKILLS_ALL=["Leadership","Communication","Data Analysis","Project Management","Sales","Marketing","Engineering","Design","Finance","Operations","Customer Success","Product Management","Strategy","Recruiting","Legal","Logistics"];
const INDS_ALL=["Technology","Finance","Healthcare","Education","Retail","Manufacturing","Media","Legal","Consulting","Non-profit","Real Estate","Government"];
const PQAS=[{q:"Work style",opts:["Structured & process-driven","Flexible & adaptive","Collaborative & team-focused","Independent & self-directed"]},{q:"Ideal environment",opts:["Fast-paced startup","Established corporation","Remote-first culture","Hybrid / flexible"]},{q:"Feedback preference",opts:["Frequent check-ins","Periodic reviews","As-needed only","Peer-based feedback"]}];
const SEEKER_JOBS=[{id:1,title:"Senior Product Manager",company:"Aether Technologies",location:"Remote",salary:"$130–160k",match:94,tags:["Product Management","Leadership"],status:null,logo:"AT"},{id:2,title:"Director of Marketing",company:"Nova Brands",location:"Chicago, IL",salary:"$110–140k",match:88,tags:["Marketing","Leadership"],status:null,logo:"NB"},{id:3,title:"Operations Lead",company:"Meridian Health",location:"Hybrid",salary:"$90–115k",match:81,tags:["Operations","Project Management"],status:"viewed",logo:"MH"},{id:4,title:"Product Analyst",company:"Stackwise",location:"Remote",salary:"$85–105k",match:77,tags:["Data Analysis","Product Management"],status:null,logo:"SW"},{id:5,title:"Head of Customer Success",company:"Volta Finance",location:"New York, NY",salary:"$100–130k",match:72,tags:["Customer Success","Leadership"],status:null,logo:"VF"},{id:6,title:"Strategy Associate",company:"Cornerstone Consulting",location:"Hybrid",salary:"$95–120k",match:68,tags:["Strategy","Communication"],status:null,logo:"CC"}];
const CANDIDATES=[{id:101,name:"Maya Chen",title:"Senior PM",location:"Remote",exp:"8 yrs",salary:"$140k",match:96,skills:["Product Management","Leadership","Data Analysis"],status:null,video:true},{id:102,name:"Jordan Ellis",title:"Product Lead",location:"Chicago, IL",exp:"6 yrs",salary:"$125k",match:91,skills:["Product Management","Strategy"],status:null,video:true},{id:103,name:"Priya Nair",title:"Product Manager",location:"Remote",exp:"5 yrs",salary:"$115k",match:87,skills:["Product Management","Communication"],status:"shortlisted",video:false},{id:104,name:"Sam Torres",title:"Growth PM",location:"New York, NY",exp:"4 yrs",salary:"$108k",match:79,skills:["Marketing","Product Management"],status:null,video:true},{id:105,name:"Alex Kim",title:"Associate PM",location:"Hybrid",exp:"3 yrs",salary:"$92k",match:71,skills:["Product Management","Communication"],status:null,video:false},{id:106,name:"Taylor Brooks",title:"PM Contractor",location:"Remote",exp:"5 yrs",salary:"$118k",match:65,skills:["Operations","Project Management"],status:"rejected",video:true}];
const REC_JOBS_MOCK=[{id:"j1",title:"Senior Product Manager",status:"active",applicants:47,shortlisted:3,posted:"May 12, 2026"},{id:"j2",title:"Product Analyst",status:"active",applicants:31,shortlisted:1,posted:"May 8, 2026"},{id:"j3",title:"UX Researcher",status:"paused",applicants:18,shortlisted:0,posted:"Apr 29, 2026"}];
const NOTIFS_INIT=[{id:1,type:"match",text:"You have 3 new excellent matches for Senior Product Manager.",time:"2h ago",read:false},{id:2,type:"viewed",text:"Meridian Health's recruiter viewed your profile.",time:"5h ago",read:false},{id:3,type:"feedback",text:'You received feedback from Volta Finance: "Strong background but looking for more FinTech experience."',time:"Yesterday",read:false},{id:4,type:"match",text:"2 new Good matches appeared for roles in Technology.",time:"2 days ago",read:true},{id:5,type:"shortlist",text:"You were shortlisted by Aether Technologies for Senior Product Manager!",time:"3 days ago",read:true}];

// NAV
function Nav({page,setPage,user,setUser,nc}){
  const isR=user?.role==="recruiter";
  const links=user?(isR?[{l:"Job Postings",p:"rec-jobs"},{l:"Candidates",p:"rec-candidates"},{l:"Post a Job",p:"rec-post"}]:[{l:"My Matches",p:"dashboard"},{l:"My Profile",p:"profile"},{l:"Notifications",p:"notifications"}]):[{l:"Pricing",p:"pricing"}];
  return <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:56,background:C.white,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100,fontFamily:F}}>
    <div onClick={()=>setPage(user?(isR?"rec-jobs":"dashboard"):"landing")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:27,height:27,borderRadius:6,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:C.white}}>RF</div>
      <span style={{fontWeight:800,fontSize:15,color:C.slate,letterSpacing:-0.3}}>RoleFit</span>
      {isR&&<Badge color={C.purple} dim={C.purpleDim} style={{fontSize:10,marginLeft:2}}>Recruiter</Badge>}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      {links.map(l=><button key={l.p} onClick={()=>setPage(l.p)} style={{background:page===l.p?C.tealDim:"none",border:"none",color:page===l.p?C.teal:C.gray600,fontWeight:page===l.p?700:500,fontSize:13,cursor:"pointer",padding:"7px 11px",borderRadius:7,fontFamily:F,position:"relative"}}>
        {l.l}{l.p==="notifications"&&nc>0&&<span style={{position:"absolute",top:4,right:6,width:7,height:7,background:C.red,borderRadius:"50%",border:`2px solid ${C.white}`}}/>}
      </button>)}
      {!user&&<PBtn onClick={()=>setPage("signup")} style={{padding:"7px 14px",fontSize:13,marginLeft:4}}>Get started free</PBtn>}
      {user&&<><button onClick={()=>setPage("settings")} style={{background:"none",border:"none",color:C.gray600,fontWeight:500,fontSize:13,cursor:"pointer",padding:"7px 11px",borderRadius:7,fontFamily:F}}>Settings</button>
      <div onClick={()=>setPage("settings")} style={{width:30,height:30,borderRadius:"50%",background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:C.white,cursor:"pointer",marginLeft:2}}>{user.name[0]}</div>
      <GBtn onClick={()=>{setUser(null);setPage("landing");}} style={{padding:"6px 11px",fontSize:12}}>Sign out</GBtn></>}
    </div>
  </nav>;
}

// LANDING
function Landing({setPage}){
  const steps=[{icon:"📝",n:1,t:"One profile, forever",d:"Enter your skills, experience, salary, and personality once. Never fill out another job application form."},{icon:"🎯",n:2,t:"Ranked matches, automatically",d:"Our scoring engine matches you across 8 dimensions of fit. You see a percentage, not just a title."},{icon:"🎥",n:3,t:"Show your personality",d:"Record a 2-minute video intro. Recruiters see the real you before the first call — 4× more callbacks."},{icon:"📬",n:4,t:"Track every step",d:"Know exactly where you stand — match score, status, and recruiter feedback in one clean place."}];
  return <div style={{fontFamily:F,background:C.bg}}>
    <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"80px 24px 64px",textAlign:"center"}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:7,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:"5px 14px",marginBottom:24,fontSize:13,color:C.teal,fontWeight:700}}>✦ Built for job seekers — free, always</div>
      <h1 style={{fontSize:"clamp(34px,6vw,64px)",fontWeight:800,lineHeight:1.08,letterSpacing:-2,maxWidth:720,margin:"0 auto 18px",color:C.slate}}>Find the job that{" "}<span style={{color:C.teal,borderBottom:`4px solid ${C.teal}`,paddingBottom:2}}>actually fits you</span></h1>
      <p style={{fontSize:17,color:C.gray600,maxWidth:460,margin:"0 auto 34px",lineHeight:1.65}}>Build your profile once. Get matched to roles based on skills, personality, salary, and culture — not just keywords.</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <PBtn onClick={()=>setPage("signup")} style={{padding:"13px 26px",fontSize:15}}>Create free profile →</PBtn>
        <GBtn onClick={()=>setPage("demo")} style={{padding:"13px 20px",fontSize:15,border:`1.5px solid ${C.teal}`,color:C.teal}}>See a live demo</GBtn>
      </div>
      <div style={{display:"flex",gap:0,justifyContent:"center",marginTop:52,borderTop:`1px solid ${C.border}`,paddingTop:36,flexWrap:"wrap"}}>
        {[["83%","Faster than job boards"],["4.7×","More likely to get an interview"],["Free","For job seekers, forever"]].map(([v,l],i)=>(
          <div key={i} style={{textAlign:"center",padding:"0 36px",borderRight:i<2?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:30,fontWeight:800,color:C.teal,letterSpacing:-1}}>{v}</div>
            <div style={{fontSize:13,color:C.gray600,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:"64px 24px",maxWidth:1020,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:40}}><h2 style={{fontSize:32,fontWeight:800,color:C.slate,letterSpacing:-1,margin:"0 0 8px"}}>How RoleFit works</h2><p style={{color:C.gray600,fontSize:15,margin:0}}>Designed so you never start from scratch again.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
        {steps.map(s=><Card key={s.n}><div style={{fontSize:24,marginBottom:9}}>{s.icon}</div><div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:C.teal,textTransform:"uppercase",marginBottom:5}}>Step {s.n}</div><h3 style={{fontSize:15,fontWeight:700,color:C.slate,margin:"0 0 6px"}}>{s.t}</h3><p style={{color:C.gray600,fontSize:13,lineHeight:1.6,margin:0}}>{s.d}</p></Card>)}
      </div>
    </div>
    <div style={{background:C.white,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"60px 24px"}}>
      <div style={{maxWidth:660,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}><h2 style={{fontSize:28,fontWeight:800,color:C.slate,letterSpacing:-1,margin:"0 0 8px"}}>Why not just use LinkedIn?</h2><p style={{color:C.gray600,fontSize:14,margin:0}}>LinkedIn is great for networking. RoleFit is built for matching.</p></div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`2px solid ${C.border}`}}><th style={{padding:"9px 12px",textAlign:"left",color:C.gray600,fontWeight:600}}>Feature</th>{["RoleFit","LinkedIn","Indeed","Hired"].map(n=><th key={n} style={{padding:"9px 10px",textAlign:"center",color:n==="RoleFit"?C.teal:C.slate,fontWeight:700,background:n==="RoleFit"?C.tealDim:"none"}}>{n}</th>)}</tr></thead>
          <tbody>{[["Match score per job",[true,false,false,true]],["Automatic matching",[true,false,false,false]],["Personality-based fit",[true,false,false,false]],["Rejection feedback",[true,false,false,false]],["Free for job seekers",[true,false,true,false]]].map(([label,vals])=>(
            <tr key={label} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 12px",color:C.slate,fontWeight:500}}>{label}</td>{vals.map((v,i)=><td key={i} style={{padding:"10px 10px",textAlign:"center",background:i===0?C.tealDim:"none"}}>{v?<span style={{color:C.green,fontWeight:700}}>✓</span>:<span style={{color:C.gray400}}>—</span>}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
    <div style={{padding:"56px 24px"}}>
      <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:C.teal,borderRadius:14,padding:"40px 32px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>For job seekers</div>
          <h3 style={{fontSize:20,fontWeight:800,color:C.white,margin:"0 0 10px",lineHeight:1.2}}>Find your fit. Free, forever.</h3>
          <p style={{color:"rgba(255,255,255,.7)",fontSize:13,lineHeight:1.6,margin:"0 0 20px"}}>Build one profile. Get automatically matched to roles that fit your skills, salary, and personality.</p>
          <button onClick={()=>setPage("signup")} style={{background:C.white,color:C.teal,border:"none",borderRadius:7,padding:"10px 20px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:F}}>Create free profile →</button>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"40px 32px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>For recruiters</div>
          <h3 style={{fontSize:20,fontWeight:800,color:C.slate,margin:"0 0 10px",lineHeight:1.2}}>Find ranked candidates, fast.</h3>
          <p style={{color:C.gray600,fontSize:13,lineHeight:1.6,margin:"0 0 20px"}}>Post a job and get a ranked list of pre-scored candidates with video intros and personality data built in.</p>
          <button onClick={()=>setPage("pricing")} style={{background:C.teal,color:C.white,border:"none",borderRadius:7,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:F}}>See recruiter plans →</button>
        </div>
      </div>
    </div>
  </div>;
}

// PRICING
function Pricing({setPage}){
  const [annual,setAnnual]=useState(false);
  const plans=[{name:"Job Seeker",price:0,aPrice:0,badge:null,color:C.teal,features:["Unlimited job matching","Match score per role","4-step profile builder","Video intro upload","Application status tracking","Rejection feedback","1 profile boost/month"],cta:"Create free account",cp:"signup"},{name:"Seeker Pro",price:19.99,aPrice:14.99,badge:"Most popular",color:C.green,features:["Everything in Free","See who viewed your profile","5 profile boosts/month","Priority in recruiter search","Detailed match breakdown","Skill-gap recommendations","Early access to new roles"],cta:"Start free trial",cp:"signup"},{name:"Recruiter Starter",price:99,aPrice:79,badge:null,color:C.teal,features:["5 active job postings","Unlimited candidate swipes","Ranked candidate list","Video profile access","Candidate messaging","Basic analytics","Accept/reject with feedback"],cta:"Start free trial",cp:"signup"},{name:"Recruiter Pro",price:299,aPrice:239,badge:"Best value",color:C.purple,features:["25 active job postings","Everything in Starter","Smart filters","Advanced analytics","Early access to top candidates","Company branding page","Priority support"],cta:"Start free trial",cp:"signup"}];
  const addons=[{name:"Profile Boost",price:"$4.99",desc:"Move to top of recruiter search for 48 hrs"},{name:"Resume Review",price:"$79",desc:"Professional human review of your profile and video"},{name:"Unlock Top Matches",price:"$9.99",desc:"See which of your top 10 matches are hiring now"},{name:"Featured Job Post",price:"$49",desc:"Highlight your role to top-matching candidates"}];
  return <div style={{background:C.bg,fontFamily:F,minHeight:"100vh",padding:"56px 20px 72px"}}>
    <div style={{textAlign:"center",marginBottom:44}}>
      <h1 style={{fontSize:36,fontWeight:800,color:C.slate,letterSpacing:-1.5,margin:"0 0 10px"}}>Simple, transparent pricing</h1>
      <p style={{color:C.gray600,fontSize:15,margin:"0 0 24px"}}>Job seekers are always free. Recruiters pay for quality matches.</p>
      <div style={{display:"inline-flex",background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:3,gap:3}}>
        {["Monthly","Annual (save 20%)"].map((l,i)=><button key={l} onClick={()=>setAnnual(i===1)} style={{padding:"7px 16px",borderRadius:7,background:annual===(i===1)?C.teal:"none",color:annual===(i===1)?C.white:C.gray600,border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F}}>{l}</button>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,maxWidth:980,margin:"0 auto 48px"}}>
      {plans.map(p=><div key={p.name} style={{background:C.white,borderRadius:13,border:`2px solid ${p.badge?p.color:C.border}`,padding:"26px 20px",position:"relative",display:"flex",flexDirection:"column"}}>
        {p.badge&&<div style={{position:"absolute",top:-1,right:14,background:p.color,color:C.white,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:"0 0 7px 7px"}}>{p.badge}</div>}
        <div style={{fontSize:12,fontWeight:700,color:p.color,marginBottom:5}}>{p.name}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:3}}><span style={{fontSize:33,fontWeight:800,color:C.slate,letterSpacing:-1}}>${annual?p.aPrice:p.price}</span>{p.price>0&&<span style={{color:C.gray400,fontSize:12}}>/mo</span>}</div>
        {p.price===0&&<div style={{fontSize:12,color:C.gray400,marginBottom:10}}>Free forever</div>}
        {annual&&p.price>0&&<div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:10}}>Save ${((p.price-p.aPrice)*12).toFixed(0)}/yr</div>}
        <ul style={{listStyle:"none",padding:0,margin:"14px 0 20px",flex:1}}>
          {p.features.map(f=><li key={f} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:8,fontSize:12,color:C.gray800,lineHeight:1.4}}><span style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</span>{f}</li>)}
        </ul>
        <button onClick={()=>setPage(p.cp)} style={{width:"100%",padding:"10px 0",borderRadius:7,background:p.badge?p.color:C.tealDim,color:p.badge?C.white:C.teal,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:F}}>{p.cta}</button>
      </div>)}
    </div>
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <h3 style={{fontSize:18,fontWeight:800,color:C.slate,textAlign:"center",marginBottom:16}}>Add-ons & à la carte</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {addons.map(a=><Card key={a.name} style={{padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{fontSize:13,fontWeight:700,color:C.slate}}>{a.name}</div><div style={{fontSize:13,fontWeight:800,color:C.teal}}>{a.price}</div></div><div style={{fontSize:12,color:C.gray600,marginTop:4,lineHeight:1.5}}>{a.desc}</div></Card>)}
      </div>
    </div>
  </div>;
}

// SIGNUP
function SignUp({setPage,setUser}){
  const [form,setForm]=useState({name:"",email:"",password:"",role:"seeker"});
  const [step,setStep]=useState(1);const [err,setErr]=useState("");
  function next(){if(!form.name.trim()||!form.email.trim()){setErr("Please fill in all fields.");return;}setErr("");setStep(2);}
  function create(){if(!form.password||form.password.length<6){setErr("Min. 6 characters.");return;}setUser({name:form.name,email:form.email,role:form.role,profileComplete:false});setPage(form.role==="recruiter"?"rec-post":"profile");}
  return <div style={{minHeight:"88vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:C.bg,fontFamily:F}}>
    <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"40px 32px",width:"100%",maxWidth:400}}>
      <div style={{marginBottom:24}}>
        <p style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 5px"}}>Step {step} of 2</p>
        <div style={{display:"flex",gap:5,marginBottom:16}}>{[1,2].map(n=><div key={n} style={{flex:1,height:3,borderRadius:2,background:n<=step?C.teal:C.gray100,transition:"background .3s"}}/>)}</div>
        <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:"0 0 3px",letterSpacing:-0.5}}>{step===1?"Create your account":"Secure your account"}</h2>
        <p style={{color:C.gray600,fontSize:13,margin:0}}>{step===1?"Free for job seekers — no card needed.":"Pick a strong password."}</p>
      </div>
      {step===1?<>
        <div style={{marginBottom:12}}><FLabel>I am a...</FLabel><div style={{display:"flex",gap:7,marginTop:5}}>{[["seeker","Job Seeker"],["recruiter","Recruiter"]].map(([v,l])=><button key={v} onClick={()=>setForm(f=>({...f,role:v}))} style={{flex:1,padding:"8px 0",borderRadius:7,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:F,background:form.role===v?C.tealDim:C.bg,color:form.role===v?C.teal:C.gray600,border:`1.5px solid ${form.role===v?C.teal:C.border}`}}>{l}</button>)}</div></div>
        <FField label="Full name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Jane Smith"/>
        <FField label="Email address" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="jane@example.com" type="email"/>
        {err&&<p style={{color:C.red,fontSize:13,margin:"0 0 8px"}}>{err}</p>}
        <PBtn onClick={next} full style={{marginTop:3}}>Continue →</PBtn>
      </>:<>
        <FField label="Password" value={form.password} onChange={v=>setForm(f=>({...f,password:v}))} placeholder="Min. 6 characters" type="password"/>
        {err&&<p style={{color:C.red,fontSize:13,margin:"0 0 8px"}}>{err}</p>}
        <PBtn onClick={create} full>Create account →</PBtn>
        <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:C.gray600,fontSize:13,cursor:"pointer",marginTop:8,fontFamily:F}}>← Back</button>
      </>}
      <p style={{textAlign:"center",color:C.gray400,fontSize:12,marginTop:14}}>Have an account?{" "}<span onClick={()=>{setUser({name:"Alex Johnson",email:"alex@demo.com",role:"seeker",profileComplete:true});setPage("dashboard");}} style={{color:C.teal,cursor:"pointer",fontWeight:600}}>Sign in (demo)</span></p>
    </div>
  </div>;
}

// PROFILE BUILDER
function ProfileBuilder({user,setUser,setPage}){
  const [step,setStep]=useState(0);
  const [d,setD]=useState({title:"",location:"",remote:"",salaryLabel:"",exp:"",skills:[],industries:[],personality:{},bio:""});
  const STEPS=["Basic info","Skills & industry","Work style","Bio & video"];
  const tog=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
  function finish(){setUser(u=>({...u,profile:d,profileComplete:true}));setPage("dashboard");}
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"36px 16px"}}>
    <div style={{maxWidth:580,margin:"0 auto"}}>
      <div style={{marginBottom:22}}>
        <p style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 4px"}}>{step+1} of {STEPS.length} — {STEPS[step]}</p>
        <div style={{display:"flex",gap:5,marginBottom:16}}>{STEPS.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.teal:C.gray100,transition:"background .3s"}}/>)}</div>
        <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:0,letterSpacing:-0.5}}>{["Tell us about yourself","What do you bring?","How do you work best?","Final touches"][step]}</h2>
      </div>
      <Card style={{marginBottom:12}}>
        {step===0&&<><FField label="Current or most recent job title" value={d.title} onChange={v=>setD(x=>({...x,title:v}))} placeholder="e.g. Senior Product Manager"/>
          <FField label="City / location" value={d.location} onChange={v=>setD(x=>({...x,location:v}))} placeholder="e.g. Chicago, IL"/>
          <div style={{marginBottom:12}}><FLabel>Remote preference</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{["Remote only","Hybrid","On-site","Open to anything"].map(o=><Pill key={o} active={d.remote===o} onClick={()=>setD(x=>({...x,remote:o}))}>{o}</Pill>)}</div></div>
          <div style={{marginBottom:12}}><FLabel>Years of experience</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{["0–2 yrs","3–5 yrs","6–10 yrs","10+ yrs"].map(o=><Pill key={o} active={d.exp===o} onClick={()=>setD(x=>({...x,exp:o}))}>{o}</Pill>)}</div></div>
          <div><FLabel>Target annual salary</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{["Under $60k","$60–100k","$100–150k","$150–200k","$200k+"].map(o=><Pill key={o} active={d.salaryLabel===o} onClick={()=>setD(x=>({...x,salaryLabel:o}))}>{o}</Pill>)}</div></div></>}
        {step===1&&<><div style={{marginBottom:18}}><FLabel>Top skills — pick up to 6</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:7}}>{SKILLS_ALL.map(s=><Pill key={s} active={d.skills.includes(s)} onClick={()=>{if(!d.skills.includes(s)&&d.skills.length>=6)return;setD(x=>({...x,skills:tog(x.skills,s)}));}}>{s}</Pill>)}</div><p style={{fontSize:11,color:C.gray400,margin:"6px 0 0"}}>{d.skills.length}/6 selected</p></div>
          <div><FLabel>Industries you've worked in</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:7}}>{INDS_ALL.map(ind=><Pill key={ind} active={d.industries.includes(ind)} onClick={()=>setD(x=>({...x,industries:tog(x.industries,ind)}))}>{ind}</Pill>)}</div></div></>}
        {step===2&&PQAS.map(({q,opts})=><div key={q} style={{marginBottom:18}}><FLabel>{q}</FLabel><div style={{display:"flex",flexDirection:"column",gap:6,marginTop:7}}>{opts.map(o=><button key={o} onClick={()=>setD(x=>({...x,personality:{...x.personality,[q]:o}}))} style={{background:d.personality[q]===o?C.tealDim:C.bg,border:`1.5px solid ${d.personality[q]===o?C.teal:C.border}`,borderRadius:7,padding:"9px 12px",color:d.personality[q]===o?C.teal:C.gray600,fontWeight:d.personality[q]===o?600:400,fontSize:13,cursor:"pointer",textAlign:"left",fontFamily:F}}>{o}</button>)}</div></div>)}
        {step===3&&<><FField label="Short bio (2–3 sentences)" value={d.bio} onChange={v=>setD(x=>({...x,bio:v}))} placeholder="Tell recruiters what makes you unique. What's your superpower at work?" rows={4}/>
          <div style={{border:`2px dashed ${C.gray200}`,borderRadius:9,padding:"24px 18px",textAlign:"center",background:C.bg,marginTop:4}}>
            <div style={{fontSize:28,marginBottom:7}}>🎥</div>
            <p style={{color:C.slate,fontWeight:600,fontSize:13,margin:"0 0 4px"}}>Add a video intro</p>
            <p style={{color:C.gray600,fontSize:12,margin:"0 0 12px"}}>2–3 min. Candidates with video get 4× more callbacks.</p>
            <GBtn onClick={()=>{}}>Upload video (MP4 / WebM)</GBtn>
            <p style={{color:C.gray400,fontSize:11,marginTop:6}}>Optional — add later in your profile</p>
          </div></>}
      </Card>
      <div style={{display:"flex",gap:9}}>{step>0&&<GBtn onClick={()=>setStep(s=>s-1)} style={{flex:1}}>← Back</GBtn>}<PBtn onClick={step<STEPS.length-1?()=>setStep(s=>s+1):finish} style={{flex:2}}>{step<STEPS.length-1?"Continue →":"See my matches →"}</PBtn></div>
    </div>
  </div>;
}

// SEEKER DASHBOARD
function SeekerDashboard({user,setPage}){
  const [jobs,setJobs]=useState(SEEKER_JOBS);
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("All");
  function act(id,action){setJobs(prev=>prev.map(j=>j.id===id?{...j,status:action}:j));setSel(null);}
  const vis=jobs.filter(j=>{if(filter==="All")return j.status!=="pass";if(filter==="Applied")return j.status==="applied";if(filter==="Passed")return j.status==="pass";if(filter==="Excellent")return j.match>=85&&j.status!=="pass";if(filter==="Good")return j.match>=70&&j.match<85&&j.status!=="pass";return true;});
  if(!user?.profileComplete)return <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24,background:C.bg,fontFamily:F}}><div style={{fontSize:40,marginBottom:14}}>📋</div><h2 style={{fontSize:20,fontWeight:800,color:C.slate,margin:"0 0 7px"}}>Complete your profile first</h2><p style={{color:C.gray600,fontSize:14,maxWidth:320,margin:"0 auto 20px",lineHeight:1.6}}>Your profile is how we score and rank you against open roles. Takes about 5 minutes.</p><PBtn onClick={()=>setPage("profile")}>Build my profile →</PBtn></div>;
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:C.slate,margin:"0 0 3px",letterSpacing:-0.5}}>Hey {user.name.split(" ")[0]} 👋</h1><p style={{color:C.gray600,margin:0,fontSize:13}}>You have <strong style={{color:C.teal}}>{jobs.filter(j=>j.match>=70&&j.status!=="pass").length} strong matches</strong> waiting.</p></div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["All","Excellent","Good","Applied","Passed"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.teal:C.white,border:`1.5px solid ${filter===f?C.teal:C.border}`,color:filter===f?C.white:C.gray600,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{f}</button>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:16}}>
        {[["Profile views","47",C.teal],["Total matches",jobs.filter(j=>j.status!=="pass").length,C.slate],["Strong matches",jobs.filter(j=>j.match>=85).length,C.green],["Applied",jobs.filter(j=>j.status==="applied").length,C.amber]].map(([l,v,col])=><Card key={l} style={{padding:"12px 14px"}}><div style={{fontSize:22,fontWeight:800,color:col}}>{v}</div><div style={{fontSize:11,color:C.gray600,marginTop:2}}>{l}</div></Card>)}
      </div>
      <Card style={{marginBottom:16,padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700,fontSize:13,color:C.slate}}>Profile strength</span><span style={{fontSize:12,color:C.teal,fontWeight:600}}>78% — Add a video to reach 100%</span></div>
        <div style={{height:5,background:C.gray100,borderRadius:3}}><div style={{width:"78%",height:"100%",borderRadius:3,background:C.teal}}/></div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {vis.map(job=><div key={job.id} onClick={()=>setSel(job)} style={{background:C.white,borderRadius:11,border:`1.5px solid ${sel?.id===job.id?C.teal:C.border}`,padding:"14px 16px",cursor:"pointer",transition:"border-color .18s",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{width:50,height:50,borderRadius:"50%",border:`2.5px solid ${matchColor(job.match)}`,background:matchDim(job.match),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{fontSize:13,fontWeight:800,color:matchColor(job.match),lineHeight:1}}>{job.match}%</div><div style={{fontSize:8,color:matchColor(job.match),fontWeight:700}}>{matchLabel(job.match)}</div></div>
          <div style={{flex:1,minWidth:150}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13,color:C.slate}}>{job.title}</span>{job.status==="applied"&&<Badge color={C.green} dim={C.greenDim}>Applied</Badge>}{job.status==="viewed"&&<Badge color={C.teal} dim={C.tealDim}>Recruiter viewed</Badge>}{job.status==="pass"&&<Badge color={C.gray400} dim={C.gray100}>Passed</Badge>}</div><div style={{color:C.gray600,fontSize:12}}>{job.company} · {job.location} · {job.salary}</div><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{job.tags.map(t=><span key={t} style={{fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",color:C.gray600}}>{t}</span>)}</div></div>
          <div style={{display:"flex",gap:5,flexShrink:0}}><GBtn onClick={e=>{e.stopPropagation();act(job.id,"pass");}} style={{padding:"6px 11px",fontSize:11}}>Pass</GBtn><PBtn onClick={e=>{e.stopPropagation();act(job.id,"applied");}} style={{padding:"6px 12px",fontSize:11}}>Apply →</PBtn></div>
        </div>)}
        {vis.length===0&&<div style={{textAlign:"center",padding:"44px 0",color:C.gray400,fontSize:14}}>No matches in this filter.</div>}
      </div>
    </div>
    {sel&&<div style={{position:"fixed",inset:0,background:"rgba(30,45,58,.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setSel(null)}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"16px 16px 0 0",border:`1px solid ${C.border}`,padding:"24px 22px 32px",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",fontFamily:F}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}><div><h2 style={{fontSize:18,fontWeight:800,color:C.slate,margin:"0 0 2px"}}>{sel.title}</h2><p style={{color:C.gray600,margin:0,fontSize:12}}>{sel.company} · {sel.location} · {sel.salary}</p></div><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.gray400,fontSize:20,cursor:"pointer"}}>×</button></div>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:matchDim(sel.match),border:`1.5px solid ${matchColor(sel.match)}44`,borderRadius:9,padding:"9px 13px",marginBottom:18}}><span style={{fontSize:22,fontWeight:800,color:matchColor(sel.match)}}>{sel.match}%</span><div><div style={{fontWeight:700,color:matchColor(sel.match),fontSize:12}}>{matchLabel(sel.match)} Match</div><div style={{fontSize:11,color:C.gray600}}>Scored across 8 dimensions</div></div></div>
        <div style={{marginBottom:18}}><p style={{fontSize:10,fontWeight:700,color:C.gray600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 9px"}}>Match breakdown</p>{[["Skills alignment",96],["Salary fit",90],["Work style",88],["Location",85],["Industry experience",78]].map(([dim,pct])=><div key={dim} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><span style={{fontSize:12,color:C.gray600,width:130,flexShrink:0}}>{dim}</span><div style={{flex:1,height:4,background:C.gray100,borderRadius:2}}><div style={{width:`${pct}%`,height:"100%",borderRadius:2,background:matchColor(pct)}}/></div><span style={{fontSize:11,fontWeight:700,color:matchColor(pct),width:28,textAlign:"right"}}>{pct}%</span></div>)}</div>
        <p style={{color:C.gray600,fontSize:13,lineHeight:1.65,marginBottom:18}}>This role aligns strongly with your background in {sel.tags.join(" and ")}. The salary range of {sel.salary} matches your target, and the {sel.location.toLowerCase()} arrangement fits your preference.</p>
        <div style={{display:"flex",gap:7}}><GBtn onClick={()=>act(sel.id,"pass")} style={{flex:1}}>Not interested</GBtn><PBtn onClick={()=>act(sel.id,"applied")} style={{flex:2}}>Apply to this role →</PBtn></div>
      </div>
    </div>}
  </div>;
}

// RECRUITER: JOB POSTINGS
function RecJobs({user,setPage,setRecJob}){
  const [jobs,setJobs]=useState(REC_JOBS_MOCK);
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:820,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><SHead title="Job Postings" sub={`Welcome back, ${user?.name?.split(" ")[0]||"recruiter"}.`}/><PBtn onClick={()=>setPage("rec-post")}>+ Post a job</PBtn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:18}}>
        {[["Active jobs",jobs.filter(j=>j.status==="active").length,C.teal],["Total applicants",jobs.reduce((a,j)=>a+j.applicants,0),C.slate],["Shortlisted",jobs.reduce((a,j)=>a+j.shortlisted,0),C.green]].map(([l,v,col])=><Card key={l} style={{padding:"12px 14px"}}><div style={{fontSize:22,fontWeight:800,color:col}}>{v}</div><div style={{fontSize:11,color:C.gray600,marginTop:2}}>{l}</div></Card>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {jobs.map(j=><Card key={j.id} style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:"16px 18px"}}>
          <div style={{flex:1,minWidth:150}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontWeight:700,fontSize:14,color:C.slate}}>{j.title}</span><Badge color={j.status==="active"?C.green:C.amber} dim={j.status==="active"?C.greenDim:C.amberDim}>{j.status==="active"?"Active":"Paused"}</Badge></div><div style={{fontSize:12,color:C.gray600}}>Posted {j.posted} · {j.applicants} applicants · {j.shortlisted} shortlisted</div></div>
          <div style={{display:"flex",gap:6}}><GBtn onClick={()=>{setRecJob(j);setPage("rec-candidates");}} style={{padding:"6px 12px",fontSize:12}}>View candidates</GBtn><GBtn onClick={()=>setJobs(prev=>prev.map(x=>x.id===j.id?{...x,status:x.status==="active"?"paused":"active"}:x))} style={{padding:"6px 12px",fontSize:12}}>{j.status==="active"?"Pause":"Resume"}</GBtn></div>
        </Card>)}
      </div>
    </div>
  </div>;
}

// RECRUITER: POST JOB
function RecPost({setPage}){
  const [step,setStep]=useState(0);
  const [d,setD]=useState({title:"",industry:"",location:"",remote:"",salaryMin:"",salaryMax:"",exp:"",description:"",skills:[],weights:{skills:3,salary:3,experience:2,culture:2,location:1}});
  const STEPS=["Role details","Requirements","Scoring weights","Review & post"];
  const tog=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
  const WL={skills:"Skills match",salary:"Salary alignment",experience:"Years of experience",culture:"Culture / personality",location:"Location fit"};
  function publish(){alert("Job posted! Candidates are being ranked now.");setPage("rec-jobs");}
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"32px 16px"}}>
    <div style={{maxWidth:580,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <p style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 4px"}}>{step+1} of {STEPS.length} — {STEPS[step]}</p>
        <div style={{display:"flex",gap:5,marginBottom:14}}>{STEPS.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.teal:C.gray100,transition:"background .3s"}}/>)}</div>
        <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:0,letterSpacing:-0.5}}>{["Tell us about the role","What are you looking for?","Weight your priorities","Review & go live"][step]}</h2>
      </div>
      <Card style={{marginBottom:12}}>
        {step===0&&<><FField label="Job title" value={d.title} onChange={v=>setD(x=>({...x,title:v}))} placeholder="e.g. Senior Product Manager"/>
          <div style={{marginBottom:12}}><FLabel>Industry</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{INDS_ALL.slice(0,8).map(o=><Pill key={o} active={d.industry===o} onClick={()=>setD(x=>({...x,industry:o}))}>{o}</Pill>)}</div></div>
          <FField label="Location" value={d.location} onChange={v=>setD(x=>({...x,location:v}))} placeholder="e.g. Chicago, IL"/>
          <div style={{marginBottom:12}}><FLabel>Remote policy</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{["Remote only","Hybrid","On-site"].map(o=><Pill key={o} active={d.remote===o} onClick={()=>setD(x=>({...x,remote:o}))}>{o}</Pill>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><FField label="Salary min (USD)" value={d.salaryMin} onChange={v=>setD(x=>({...x,salaryMin:v}))} placeholder="e.g. 120000"/><FField label="Salary max (USD)" value={d.salaryMax} onChange={v=>setD(x=>({...x,salaryMax:v}))} placeholder="e.g. 160000"/></div>
          <div><FLabel>Required experience</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>{["0–2 yrs","3–5 yrs","5–8 yrs","8+ yrs"].map(o=><Pill key={o} active={d.exp===o} onClick={()=>setD(x=>({...x,exp:o}))}>{o}</Pill>)}</div></div></>}
        {step===1&&<><div style={{marginBottom:16}}><FLabel>Required skills (up to 8)</FLabel><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:7}}>{SKILLS_ALL.map(s=><Pill key={s} active={d.skills.includes(s)} onClick={()=>{if(!d.skills.includes(s)&&d.skills.length>=8)return;setD(x=>({...x,skills:tog(x.skills,s)}));}}>{s}</Pill>)}</div><p style={{fontSize:11,color:C.gray400,margin:"6px 0 0"}}>{d.skills.length}/8 selected</p></div>
          <FField label="Job description" value={d.description} onChange={v=>setD(x=>({...x,description:v}))} placeholder="Describe the role, team, and responsibilities..." rows={5}/></>}
        {step===2&&<div><p style={{color:C.gray600,fontSize:13,margin:"0 0 16px",lineHeight:1.55}}>Adjust how much weight each dimension carries in candidate match scores.</p>{Object.entries(d.weights).map(([k,v])=><div key={k} style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><FLabel>{WL[k]}</FLabel><span style={{fontSize:13,fontWeight:700,color:C.teal}}>{["Low","Low","Medium","High","Critical"][v-1]}</span></div><input type="range" min={1} max={5} step={1} value={v} onChange={e=>setD(x=>({...x,weights:{...x.weights,[k]:+e.target.value}}))} style={{width:"100%",accentColor:C.teal}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray400,marginTop:2}}><span>Low</span><span>Critical</span></div></div>)}</div>}
        {step===3&&<div>{[["Job title",d.title||"—"],["Industry",d.industry||"—"],["Location",d.location||"—"],["Remote",d.remote||"—"],["Salary",d.salaryMin&&d.salaryMax?`$${(+d.salaryMin/1000).toFixed(0)}k–$${(+d.salaryMax/1000).toFixed(0)}k`:"—"],["Experience",d.exp||"—"],["Required skills",d.skills.join(", ")||"—"]].map(([l,v])=><div key={l} style={{display:"flex",borderBottom:`1px solid ${C.border}`,padding:"9px 0"}}><span style={{fontSize:13,color:C.gray600,width:130}}>{l}</span><span style={{fontSize:13,color:C.slate,fontWeight:600}}>{v}</span></div>)}<div style={{marginTop:16,padding:12,background:C.tealDim,borderRadius:7,border:`1px solid ${C.tealBorder}`}}><p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0}}>✓ Once posted, candidates will be ranked automatically based on your weights.</p></div></div>}
      </Card>
      <div style={{display:"flex",gap:9}}>{step>0&&<GBtn onClick={()=>setStep(s=>s-1)} style={{flex:1}}>← Back</GBtn>}<PBtn onClick={step<STEPS.length-1?()=>setStep(s=>s+1):publish} style={{flex:2}}>{step<STEPS.length-1?"Continue →":"Post job & go live"}</PBtn></div>
    </div>
  </div>;
}

// RECRUITER: CANDIDATES
function RecCandidates({recJob,setPage}){
  const [cands,setCands]=useState(CANDIDATES);
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("All");
  const [fbFor,setFbFor]=useState(null);
  const [fbText,setFbText]=useState("");
  function act(id,action){setCands(prev=>prev.map(c=>c.id===id?{...c,status:action}:c));setSel(null);}
  function sendFb(id){setCands(prev=>prev.map(c=>c.id===id?{...c,status:"rejected",feedback:fbText}:c));setFbFor(null);setFbText("");}
  const vis=cands.filter(c=>{if(filter==="All")return c.status!=="rejected";if(filter==="Shortlisted")return c.status==="shortlisted";if(filter==="Rejected")return c.status==="rejected";if(filter==="Excellent")return c.match>=85;return true;});
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <button onClick={()=>setPage("rec-jobs")} style={{background:"none",border:"none",color:C.teal,fontSize:13,cursor:"pointer",fontFamily:F,fontWeight:600,marginBottom:6}}>← Job Postings</button>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:8}}>
        <div><h1 style={{fontSize:21,fontWeight:800,color:C.slate,margin:"0 0 2px",letterSpacing:-0.5}}>{recJob?.title||"Senior Product Manager"}</h1><p style={{color:C.gray600,margin:0,fontSize:12}}>{cands.filter(c=>c.status!=="rejected").length} candidates · {cands.filter(c=>c.match>=85).length} excellent matches</p></div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["All","Excellent","Shortlisted","Rejected"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.teal:C.white,border:`1.5px solid ${filter===f?C.teal:C.border}`,color:filter===f?C.white:C.gray600,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{f}</button>)}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {vis.map(c=><div key={c.id} onClick={()=>setSel(c)} style={{background:C.white,borderRadius:11,border:`1.5px solid ${sel?.id===c.id?C.teal:C.border}`,padding:"14px 16px",cursor:"pointer",transition:"border-color .18s",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:C.tealDim,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:C.teal,flexShrink:0}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
          <div style={{flex:1,minWidth:150}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13,color:C.slate}}>{c.name}</span>{c.video&&<Badge color={C.purple} dim={C.purpleDim}>🎥 Video</Badge>}{c.status==="shortlisted"&&<Badge color={C.green} dim={C.greenDim}>Shortlisted</Badge>}{c.status==="rejected"&&<Badge color={C.red} dim={C.redDim}>Rejected</Badge>}</div><div style={{color:C.gray600,fontSize:12}}>{c.title} · {c.location} · {c.exp} · Target {c.salary}</div><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{c.skills.map(s=><span key={s} style={{fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",color:C.gray600}}>{s}</span>)}</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            <div style={{width:46,height:46,borderRadius:"50%",border:`2.5px solid ${matchColor(c.match)}`,background:matchDim(c.match),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:12,fontWeight:800,color:matchColor(c.match),lineHeight:1}}>{c.match}%</div><div style={{fontSize:8,color:matchColor(c.match),fontWeight:700}}>{matchLabel(c.match)}</div></div>
            {c.status!=="rejected"&&<div style={{display:"flex",gap:4}}><button onClick={e=>{e.stopPropagation();setFbFor(c);}} style={{background:C.redDim,border:`1px solid ${C.red}44`,color:C.red,borderRadius:5,padding:"4px 9px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>Pass</button><button onClick={e=>{e.stopPropagation();act(c.id,"shortlisted");}} style={{background:C.greenDim,border:`1px solid ${C.green}44`,color:C.green,borderRadius:5,padding:"4px 9px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>Shortlist</button></div>}
          </div>
        </div>)}
        {vis.length===0&&<div style={{textAlign:"center",padding:"44px 0",color:C.gray400,fontSize:13}}>No candidates in this filter.</div>}
      </div>
    </div>
    {sel&&<div style={{position:"fixed",inset:0,background:"rgba(30,45,58,.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setSel(null)}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"16px 16px 0 0",border:`1px solid ${C.border}`,padding:"24px 22px 32px",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",fontFamily:F}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:40,borderRadius:"50%",background:C.tealDim,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:C.teal}}>{sel.name.split(" ").map(n=>n[0]).join("")}</div><div><h2 style={{fontSize:17,fontWeight:800,color:C.slate,margin:"0 0 1px"}}>{sel.name}</h2><p style={{color:C.gray600,margin:0,fontSize:12}}>{sel.title} · {sel.location}</p></div></div>
          <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.gray400,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {sel.video&&<div style={{background:C.bg,borderRadius:9,padding:"16px",textAlign:"center",marginBottom:16,border:`1px solid ${C.border}`}}><div style={{fontSize:28,marginBottom:5}}>▶️</div><p style={{color:C.slate,fontWeight:600,fontSize:13,margin:"0 0 3px"}}>Video intro available</p><p style={{color:C.gray600,fontSize:11,margin:0}}>2 min 14 sec</p></div>}
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:matchDim(sel.match),border:`1.5px solid ${matchColor(sel.match)}44`,borderRadius:8,padding:"8px 12px",marginBottom:16}}><span style={{fontSize:20,fontWeight:800,color:matchColor(sel.match)}}>{sel.match}%</span><div><div style={{fontWeight:700,color:matchColor(sel.match),fontSize:12}}>{matchLabel(sel.match)} match</div><div style={{fontSize:10,color:C.gray600}}>for this role</div></div></div>
        <div style={{marginBottom:16}}><p style={{fontSize:10,fontWeight:700,color:C.gray600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>Dimension scores</p>{[["Skills",sel.match],["Salary",Math.min(sel.match+3,100)],["Experience",Math.max(sel.match-5,0)],["Culture fit",Math.max(sel.match-8,0)],["Location",Math.min(sel.match+5,100)]].map(([dim,pct])=><div key={dim} style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}><span style={{fontSize:11,color:C.gray600,width:110,flexShrink:0}}>{dim}</span><div style={{flex:1,height:4,background:C.gray100,borderRadius:2}}><div style={{width:`${pct}%`,height:"100%",borderRadius:2,background:matchColor(pct)}}/></div><span style={{fontSize:11,fontWeight:700,color:matchColor(pct),width:27,textAlign:"right"}}>{pct}%</span></div>)}</div>
        {sel.status!=="rejected"&&<div style={{display:"flex",gap:7}}><button onClick={()=>{setFbFor(sel);setSel(null);}} style={{flex:1,padding:"10px 0",borderRadius:7,background:"none",border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,cursor:"pointer",fontFamily:F,fontSize:13}}>Pass with feedback</button><PBtn onClick={()=>act(sel.id,"shortlisted")} style={{flex:2}}>Shortlist →</PBtn></div>}
      </div>
    </div>}
    {fbFor&&<div style={{position:"fixed",inset:0,background:"rgba(30,45,58,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
      <div style={{background:C.white,borderRadius:14,padding:"26px 22px",width:"100%",maxWidth:400,fontFamily:F}}>
        <h3 style={{fontSize:15,fontWeight:800,color:C.slate,margin:"0 0 5px"}}>Pass on {fbFor.name}</h3>
        <p style={{color:C.gray600,fontSize:12,margin:"0 0 14px"}}>This feedback is shared with the candidate to help them improve.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {["Skills don't fully match","Salary expectations too high","Looking for more experience","Culture fit concerns","Role has been filled"].map(o=><button key={o} onClick={()=>setFbText(o)} style={{background:fbText===o?C.tealDim:C.bg,border:`1.5px solid ${fbText===o?C.teal:C.border}`,borderRadius:7,padding:"8px 11px",color:fbText===o?C.teal:C.gray600,fontWeight:fbText===o?600:400,fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:F}}>{o}</button>)}
        </div>
        <div style={{display:"flex",gap:7}}><GBtn onClick={()=>setFbFor(null)} style={{flex:1,padding:"9px 0",fontSize:13}}>Cancel</GBtn><PBtn onClick={()=>sendFb(fbFor.id)} style={{flex:2}} disabled={!fbText}>Send & pass</PBtn></div>
      </div>
    </div>}
  </div>;
}

// NOTIFICATIONS
function Notifications({notifs,setNotifs}){
  const icons={match:"🎯",viewed:"👁",feedback:"💬",shortlist:"⭐"};
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}><SHead title="Notifications" sub={`${notifs.filter(n=>!n.read).length} unread`}/><button onClick={()=>setNotifs(prev=>prev.map(n=>({...n,read:true})))} style={{background:"none",border:"none",color:C.teal,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>Mark all read</button></div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {notifs.map(n=><div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} style={{background:n.read?C.white:C.tealDim,borderRadius:11,border:`1.5px solid ${n.read?C.border:C.tealBorder}`,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{fontSize:18,flexShrink:0,marginTop:1}}>{icons[n.type]||"🔔"}</div>
          <div style={{flex:1}}><p style={{fontSize:13,color:C.slate,fontWeight:n.read?400:600,margin:"0 0 3px",lineHeight:1.5}}>{n.text}</p><p style={{fontSize:11,color:C.gray400,margin:0}}>{n.time}</p></div>
          {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:C.teal,flexShrink:0,marginTop:5}}/>}
        </div>)}
      </div>
    </div>
  </div>;
}

// SETTINGS
function Settings({user,setUser,setPage}){
  const [tab,setTab]=useState("account");
  const [saved,setSaved]=useState(false);
  const [form,setForm]=useState({name:user?.name||"",email:user?.email||"",currentPw:"",newPw:""});
  const [prefs,setPrefs]=useState({emailMatches:true,emailViewed:true,emailFeedback:true,smsAlerts:false,visibility:"recruiters",searchable:true});
  function save(){setUser(u=>({...u,name:form.name,email:form.email}));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  const TABS=[["account","Account"],["notifications","Notifications"],["privacy","Privacy"],["billing","Billing"]];
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:660,margin:"0 auto"}}>
      <SHead title="Settings"/>
      <div style={{display:"flex",gap:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:3,marginBottom:20,width:"fit-content"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:7,background:tab===k?C.teal:"none",color:tab===k?C.white:C.gray600,border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F}}>{l}</button>)}
      </div>
      {tab==="account"&&<Card><h3 style={{fontSize:15,fontWeight:700,color:C.slate,margin:"0 0 16px"}}>Account details</h3>
        <FField label="Full name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Jane Smith"/>
        <FField label="Email address" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="jane@example.com" type="email"/>
        <div style={{borderTop:`1px solid ${C.border}`,margin:"16px 0",paddingTop:16}}><h4 style={{fontSize:13,fontWeight:700,color:C.slate,margin:"0 0 10px"}}>Change password</h4><FField label="Current password" value={form.currentPw} onChange={v=>setForm(f=>({...f,currentPw:v}))} placeholder="Current password" type="password"/><FField label="New password" value={form.newPw} onChange={v=>setForm(f=>({...f,newPw:v}))} placeholder="New password (min. 6 chars)" type="password"/></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><PBtn onClick={save}>Save changes</PBtn>{saved&&<span style={{color:C.green,fontWeight:600,fontSize:13}}>✓ Saved</span>}</div>
        <div style={{marginTop:24,paddingTop:16,borderTop:`1px solid ${C.border}`}}><h4 style={{fontSize:13,fontWeight:700,color:C.red,margin:"0 0 8px"}}>Danger zone</h4><button onClick={()=>{setUser(null);setPage("landing");}} style={{background:C.redDim,border:`1px solid ${C.red}44`,color:C.red,borderRadius:7,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>Delete account</button></div>
      </Card>}
      {tab==="notifications"&&<Card><h3 style={{fontSize:15,fontWeight:700,color:C.slate,margin:"0 0 16px"}}>Notification preferences</h3>{[["emailMatches","New job matches","Email"],["emailViewed","Recruiter viewed my profile","Email"],["emailFeedback","I receive feedback","Email"]].map(([k,l,s])=><Toggle key={k} label={l} sub={s} value={prefs[k]} onChange={v=>setPrefs(p=>({...p,[k]:v}))}/>)}<div style={{borderTop:`1px solid ${C.border}`,margin:"12px 0"}}/><Toggle label="SMS alerts" sub="Text for urgent notifications" value={prefs.smsAlerts} onChange={v=>setPrefs(p=>({...p,smsAlerts:v}))}/></Card>}
      {tab==="privacy"&&<Card><h3 style={{fontSize:15,fontWeight:700,color:C.slate,margin:"0 0 16px"}}>Privacy settings</h3><div style={{marginBottom:16}}><FLabel>Profile visibility</FLabel>{["recruiters","everyone","nobody"].map(o=><label key={o} style={{display:"flex",alignItems:"center",gap:9,marginTop:9,cursor:"pointer"}}><input type="radio" name="vis" checked={prefs.visibility===o} onChange={()=>setPrefs(p=>({...p,visibility:o}))} style={{accentColor:C.teal}}/><span style={{fontSize:13,color:C.slate,fontWeight:prefs.visibility===o?600:400}}>{{recruiters:"Recruiters only",everyone:"Everyone",nobody:"Nobody (hidden)"}[o]}</span></label>)}</div><Toggle label="Appear in recruiter search" sub="Allow recruiters to find your profile" value={prefs.searchable} onChange={v=>setPrefs(p=>({...p,searchable:v}))}/></Card>}
      {tab==="billing"&&<Card><h3 style={{fontSize:15,fontWeight:700,color:C.slate,margin:"0 0 4px"}}>Current plan</h3><div style={{display:"inline-flex",alignItems:"center",gap:9,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:"11px 14px",margin:"10px 0 18px"}}><div><div style={{fontWeight:800,color:C.teal,fontSize:15}}>Job Seeker Free</div><div style={{fontSize:12,color:C.gray600,marginTop:2}}>Free forever · Unlimited matching</div></div></div><p style={{color:C.gray600,fontSize:13,margin:"0 0 16px"}}>Upgrade to Seeker Pro to see who viewed your profile, get priority placement, and unlock 5 boosts/month.</p><PBtn onClick={()=>setPage("pricing")}>View upgrade options →</PBtn></Card>}
    </div>
  </div>;
}

// ADMIN
function Admin(){
  const [tab,setTab]=useState("overview");
  const users=[{id:1,name:"Alex Johnson",email:"alex@demo.com",role:"seeker",status:"active",joined:"May 1"},{id:2,name:"Maya Chen",email:"maya@demo.com",role:"seeker",status:"active",joined:"May 3"},{id:3,name:"Hiring Corp",email:"hr@corp.com",role:"recruiter",status:"active",joined:"May 5"},{id:4,name:"Bad Actor",email:"spam@spam.com",role:"seeker",status:"flagged",joined:"May 10"}];
  const TABS=[["overview","Overview"],["users","Users"],["jobs","Jobs"],["flags","Flags"]];
  return <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,padding:"28px 16px"}}>
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}><SHead title="Admin Dashboard" sub="Internal view — manage users, jobs, and flags."/><Badge color={C.purple} dim={C.purpleDim} style={{fontSize:12,padding:"4px 10px"}}>Admin</Badge></div>
      <div style={{display:"flex",gap:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:3,marginBottom:20,width:"fit-content"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:7,background:tab===k?C.teal:"none",color:tab===k?C.white:C.gray600,border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F}}>{l}</button>)}
      </div>
      {tab==="overview"&&<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:18}}>{[["Total users","1,847",C.teal],["Job seekers","1,592",C.green],["Recruiters","255",C.purple],["Active jobs","312",C.amber],["Matches made","9,410",C.slate],["Flagged","3",C.red]].map(([l,v,col])=><Card key={l} style={{padding:"12px 14px"}}><div style={{fontSize:20,fontWeight:800,color:col}}>{v}</div><div style={{fontSize:11,color:C.gray600,marginTop:2}}>{l}</div></Card>)}</div>
        <Card><h3 style={{fontSize:14,fontWeight:700,color:C.slate,margin:"0 0 14px"}}>Platform activity (last 7 days)</h3>{[["New signups","143","+12%",C.green],["Profiles completed","97","67%",C.teal],["Jobs posted","28","+4%",C.green],["Matches generated","1,204","+8%",C.green],["Videos uploaded","41","29%",C.amber]].map(([l,v,ch,col])=><div key={l} style={{display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,padding:"9px 0",alignItems:"center"}}><span style={{fontSize:13,color:C.slate}}>{l}</span><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:C.slate}}>{v}</span><span style={{fontSize:11,fontWeight:600,color:col}}>{ch}</span></div></div>)}</Card></>}
      {tab==="users"&&<Card><h3 style={{fontSize:14,fontWeight:700,color:C.slate,margin:"0 0 14px"}}>All users</h3>{users.map(u=><div key={u.id} style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${C.border}`,padding:"11px 0",gap:10,flexWrap:"wrap"}}><div style={{width:33,height:33,borderRadius:"50%",background:C.tealDim,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:C.teal,flexShrink:0}}>{u.name[0]}</div><div style={{flex:1,minWidth:130}}><div style={{fontWeight:600,fontSize:13,color:C.slate}}>{u.name}</div><div style={{fontSize:11,color:C.gray600}}>{u.email} · Joined {u.joined}</div></div><Badge color={u.role==="recruiter"?C.purple:C.teal} dim={u.role==="recruiter"?C.purpleDim:C.tealDim}>{u.role}</Badge><Badge color={u.status==="flagged"?C.red:C.green} dim={u.status==="flagged"?C.redDim:C.greenDim}>{u.status}</Badge>{u.status==="flagged"&&<button style={{background:C.redDim,border:`1px solid ${C.red}44`,color:C.red,borderRadius:5,padding:"3px 9px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>Suspend</button>}</div>)}</Card>}
      {tab==="jobs"&&<Card><h3 style={{fontSize:14,fontWeight:700,color:C.slate,margin:"0 0 14px"}}>All job postings</h3>{REC_JOBS_MOCK.map(j=><div key={j.id} style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${C.border}`,padding:"11px 0",gap:10,flexWrap:"wrap"}}><div style={{flex:1,minWidth:130}}><div style={{fontWeight:600,fontSize:13,color:C.slate}}>{j.title}</div><div style={{fontSize:11,color:C.gray600}}>Posted {j.posted} · {j.applicants} applicants</div></div><Badge color={j.status==="active"?C.green:C.amber} dim={j.status==="active"?C.greenDim:C.amberDim}>{j.status}</Badge><button style={{background:C.redDim,border:`1px solid ${C.red}44`,color:C.red,borderRadius:5,padding:"3px 9px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>Remove</button></div>)}</Card>}
      {tab==="flags"&&<div style={{display:"flex",flexDirection:"column",gap:9}}>{[{id:1,type:"Profile",user:"Bad Actor (spam@spam.com)",reason:"Suspicious profile — no real experience listed",date:"May 10"},{id:2,type:"Video",user:"Unknown User",reason:"Video flagged by AI — possible inappropriate content",date:"May 11"},{id:3,type:"Job Post",user:"Shady Recruiter Co.",reason:"Reported by 2 users as fake/misleading posting",date:"May 14"}].map(f=><div key={f.id} style={{background:C.redDim,border:`1px solid ${C.red}22`,borderRadius:9,padding:"13px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><Badge color={C.red} dim={C.redDim}>{f.type}</Badge><span style={{fontSize:10,color:C.gray400}}>{f.date}</span></div><div style={{fontSize:12,fontWeight:600,color:C.slate,margin:"5px 0 2px"}}>{f.user}</div><div style={{fontSize:12,color:C.gray600}}>{f.reason}</div><div style={{display:"flex",gap:6,marginTop:9}}><button style={{background:C.redDim,border:`1px solid ${C.red}44`,color:C.red,borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>Suspend</button><button style={{background:C.greenDim,border:`1px solid ${C.green}44`,color:C.green,borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>Dismiss</button></div></div>)}</div>}
    </div>
  </div>;
}

// ROOT
export default function App(){
  const [page,setPage]=useState("landing");
  const [user,setUser]=useState(null);
  const [notifs,setNotifs]=useState(NOTIFS_INIT);
  const [recJob,setRecJob]=useState(null);
  const nc=notifs.filter(n=>!n.read).length;
  useEffect(()=>{
    if(page==="demo"){setUser({name:"Alex Johnson",email:"alex@demo.com",role:"seeker",profileComplete:true});setPage("dashboard");}
    if(page==="demo-recruiter"){setUser({name:"Sarah Lee",email:"sarah@corp.com",role:"recruiter",profileComplete:true});setPage("rec-jobs");}
  },[page]);
  return <div style={{fontFamily:F,background:C.bg,minHeight:"100vh"}}>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    {page!=="admin"&&<Nav page={page} setPage={setPage} user={user} setUser={setUser} nc={nc}/>}
    {page==="landing"&&<Landing setPage={setPage}/>}
    {page==="pricing"&&<Pricing setPage={setPage}/>}
    {page==="signup"&&<SignUp setPage={setPage} setUser={setUser}/>}
    {page==="profile"&&<ProfileBuilder user={user} setUser={setUser} setPage={setPage}/>}
    {page==="dashboard"&&<SeekerDashboard user={user} setPage={setPage}/>}
    {page==="notifications"&&<Notifications notifs={notifs} setNotifs={setNotifs}/>}
    {page==="settings"&&<Settings user={user} setUser={setUser} setPage={setPage}/>}
    {page==="rec-jobs"&&<RecJobs user={user} setPage={setPage} setRecJob={setRecJob}/>}
    {page==="rec-candidates"&&<RecCandidates recJob={recJob} setPage={setPage}/>}
    {page==="rec-post"&&<RecPost setPage={setPage} user={user}/>}
    {page==="admin"&&<Admin/>}
  </div>;
}

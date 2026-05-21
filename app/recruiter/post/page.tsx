'use client';
import { useState, useMemo, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import {
  INDUSTRIES, SOFT_SKILLS, TECH_SKILLS, EDUCATION_LEVELS, CULTURE_DESCRIPTORS,
  EMPLOYMENT_TYPES, MGMT_STYLES, TRAVEL_LEVELS, SCORE_DIMS,
  PERSONALITY_DIMS_RECRUITER, REMOTE_OPTIONS_RECRUITER,
} from '@/lib/constants';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:'#F0F4F7',white:'#FFFFFF',teal:'#1A8C8C',tealDim:'#1A8C8C12',tealBorder:'#1A8C8C35',
  slate:'#1E2D3A',gray100:'#E3ECF1',gray200:'#C8D8E4',gray400:'#8FAABB',gray600:'#4E6475',
  gray800:'#2B3D4D',border:'#D4E3EC',green:'#19A87A',greenDim:'#19A87A14',
  amber:'#C9870C',amberDim:'#C9870C14',red:'#C0392B',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

// ── UI components ─────────────────────────────────────────────────────────────
function Card({children,style={}}:{children:React.ReactNode;style?:CSSProperties}){return<div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'26px 24px',...style}}>{children}</div>;}
function SLabel({children}:{children:React.ReactNode}){return<div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:1.4,marginBottom:5,fontFamily:F}}>{children}</div>;}
function QLabel({children,required,optional}:{children:React.ReactNode;required?:boolean;optional?:boolean}){return<div style={{fontSize:15,fontWeight:600,color:C.slate,marginBottom:8,fontFamily:F,lineHeight:1.4,display:'flex',alignItems:'center',gap:8}}><span>{children}</span>{required&&<span style={{color:C.red,fontSize:12}}>*</span>}{optional&&<span style={{fontSize:11,fontWeight:600,color:C.gray400,background:C.gray100,padding:'2px 7px',borderRadius:8}}>optional</span>}</div>;}
function Sub({children}:{children:React.ReactNode}){return<div style={{fontSize:13,color:C.gray600,marginBottom:11,fontFamily:F,lineHeight:1.5}}>{children}</div>;}
function Divider(){return<div style={{borderTop:`1px solid ${C.border}`,margin:'22px 0'}}/>;}
function FInput({value,onChange,placeholder,type='text'}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}){const s:CSSProperties={width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:F};return<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>;}
function FTextarea({value,onChange,placeholder,rows=3}:{value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number}){return<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,resize:'vertical',lineHeight:1.55}}/>;}
function FSelect({value,onChange,options,placeholder}:{value:string;onChange:(v:string)=>void;options:string[];placeholder?:string}){return<select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:value?C.slate:C.gray400,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,cursor:'pointer'}}><option value="">{placeholder||'Select...'}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>;}
function RadioGroup({options,value,onChange}:{options:string[];value:string;onChange:(v:string)=>void}){return<div style={{display:'flex',flexDirection:'column',gap:7}}>{options.map(o=><button key={o} onClick={()=>onChange(o)} style={{background:value===o?C.tealDim:C.bg,border:`1.5px solid ${value===o?C.teal:C.border}`,borderRadius:8,padding:'10px 13px',color:value===o?C.teal:C.gray600,fontWeight:value===o?600:400,fontSize:13,cursor:'pointer',textAlign:'left',fontFamily:F,transition:'all .15s'}}>{o}</button>)}</div>;}
function MultiPill({options,values,onChange,max}:{options:string[];values:string[];onChange:(v:string[])=>void;max?:number}){function toggle(v:string){if(values.includes(v))onChange(values.filter(x=>x!==v));else if(!max||values.length<max)onChange([...values,v]);}return<div style={{display:'flex',flexWrap:'wrap',gap:7}}>{options.map(o=><button key={o} onClick={()=>toggle(o)} style={{padding:'6px 13px',borderRadius:20,background:values.includes(o)?C.tealDim:C.bg,border:`1.5px solid ${values.includes(o)?C.teal:C.border}`,color:values.includes(o)?C.teal:C.gray600,fontWeight:values.includes(o)?700:400,fontSize:13,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{o}</button>)}</div>;}

function MultiDropdown({options,values,onChange,placeholder,max}:{options:string[];values:string[];onChange:(v:string[])=>void;placeholder?:string;max?:number}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const filtered=options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  function toggle(o:string){if(values.includes(o))onChange(values.filter(x=>x!==o));else if(!max||values.length<max)onChange([...values,o]);}
  return<div style={{position:'relative'}}>
    <div onClick={()=>setOpen(o=>!o)} style={{minHeight:42,padding:'8px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${open?C.teal:C.border}`,cursor:'pointer',display:'flex',flexWrap:'wrap',gap:5,alignItems:'center'}}>
      {values.length===0&&<span style={{color:C.gray400,fontSize:14,fontFamily:F}}>{placeholder}</span>}
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'2px 9px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>{v}<span onClick={e=>{e.stopPropagation();toggle(v);}} style={{cursor:'pointer',fontWeight:700,fontSize:13}}>×</span></span>)}
      <span style={{marginLeft:'auto',color:C.gray400,fontSize:11}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:4,zIndex:50,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',maxHeight:240,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`}}><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:'100%',padding:'6px 10px',borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.slate,fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:F}}/></div>
      <div style={{overflowY:'auto',flex:1}}>
        {filtered.map(o=><div key={o} onClick={()=>toggle(o)} style={{padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:9,background:values.includes(o)?C.tealDim:'none'}}>
          <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800}}>✓</span>}</div>
          <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F}}>{o}</span>
        </div>)}
        {filtered.length===0&&<div style={{padding:'14px',color:C.gray400,fontSize:13,textAlign:'center',fontFamily:F}}>No results</div>}
      </div>
    </div>}
  </div>;
}

function MaxSlider({value,onChange,min,max,step=1,format}:{value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;format:(v:number)=>string}){return<div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={{width:'100%',accentColor:C.teal}}/><div style={{display:'flex',justifyContent:'space-between',marginTop:3}}><span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(min)}</span><span style={{fontSize:14,fontWeight:800,color:C.teal,fontFamily:F}}>{format(value)}</span><span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(max)}</span></div></div>;}
function RangeSlider({minVal,maxVal,onMin,onMax,min,max,step=1,format}:{minVal:number;maxVal:number;onMin:(v:number)=>void;onMax:(v:number)=>void;min:number;max:number;step?:number;format:(v:number)=>string}){return<div style={{display:'flex',gap:18}}><div style={{flex:1}}><div style={{fontSize:11,color:C.gray600,marginBottom:4,fontFamily:F}}>Minimum</div><input type="range" min={min} max={max} step={step} value={minVal} onChange={e=>onMin(Math.min(+e.target.value,maxVal-step))} style={{width:'100%',accentColor:C.teal}}/><div style={{fontSize:14,fontWeight:800,color:C.teal,marginTop:3,fontFamily:F}}>{format(minVal)}</div></div><div style={{flex:1}}><div style={{fontSize:11,color:C.gray600,marginBottom:4,fontFamily:F}}>Maximum</div><input type="range" min={min} max={max} step={step} value={maxVal} onChange={e=>onMax(Math.max(+e.target.value,minVal+step))} style={{width:'100%',accentColor:C.teal}}/><div style={{fontSize:14,fontWeight:800,color:C.teal,marginTop:3,fontFamily:F}}>{format(maxVal)}</div></div></div>;}

function ScaleQ({question,low,high,value,onChange}:{question:string;low:string;high:string;value:number|undefined;onChange:(v:number)=>void}){return<div style={{marginBottom:20}}>
  <div style={{fontSize:14,fontWeight:500,color:C.slate,marginBottom:8,fontFamily:F,lineHeight:1.45}}>{question}</div>
  <div style={{display:'flex',alignItems:'center',gap:8}}>
    <span style={{fontSize:11,color:C.gray600,width:110,flexShrink:0,lineHeight:1.3}}>{low}</span>
    <div style={{display:'flex',gap:6,flex:1}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,height:36,borderRadius:7,border:`1.5px solid ${value===n?C.teal:C.border}`,background:value===n?C.teal:C.bg,color:value===n?C.white:C.gray600,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{n}</button>)}</div>
    <span style={{fontSize:11,color:C.gray600,width:110,flexShrink:0,textAlign:'right',lineHeight:1.3}}>{high}</span>
  </div>
</div>;}

function WeightSlider({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){
  const labels=['Not important','Low','Medium','High','Critical'];
  const colors=[C.gray400,C.gray400,C.amber,C.teal,C.green];
  return<div style={{marginBottom:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><span style={{fontSize:14,fontWeight:600,color:C.slate,fontFamily:F}}>{label}</span><span style={{fontSize:13,fontWeight:700,color:colors[value-1],fontFamily:F}}>{labels[value-1]}</span></div>
    <input type="range" min={1} max={5} step={1} value={value} onChange={e=>onChange(+e.target.value)} style={{width:'100%',accentColor:C.teal}}/>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.gray400,marginTop:2,fontFamily:F}}><span>Not important</span><span>Critical</span></div>
  </div>;
}

function Toggle({label,sub,value,onChange}:{label:string;sub?:string;value:boolean;onChange:(v:boolean)=>void}){return<div onClick={()=>onChange(!value)} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:10}}>
  <div style={{width:40,height:22,borderRadius:11,background:value?C.teal:C.gray200,position:'relative',transition:'background .2s',flexShrink:0}}><div style={{width:16,height:16,borderRadius:'50%',background:C.white,position:'absolute',top:3,left:value?21:3,transition:'left .2s'}}/></div>
  <div><div style={{fontSize:14,color:C.slate,fontWeight:value?600:400,fontFamily:F}}>{label}</div>{sub&&<div style={{fontSize:12,color:C.gray400,fontFamily:F}}>{sub}</div>}</div>
</div>;}

function NudgeBanner({children}:{children:React.ReactNode}){return<div style={{background:C.amberDim,border:`1px solid ${C.amber}33`,borderRadius:9,padding:'11px 14px',marginBottom:14,display:'flex',gap:8,alignItems:'flex-start'}}><span style={{fontSize:16,flexShrink:0}}>💡</span><span style={{fontSize:13,color:C.amber,fontWeight:600,fontFamily:F,lineHeight:1.5}}>{children}</span></div>;}

function Progress({step,total}:{step:number;total:number}){const pct=Math.round(((step+1)/(total+1))*100);return<div style={{marginBottom:24}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:C.gray600,fontFamily:F}}>{step<total?`Section ${step+1} of ${total}`:'Review'}</span><span style={{fontSize:12,fontWeight:700,color:C.teal,fontFamily:F}}>{pct}% complete</span></div><div style={{height:5,background:C.gray100,borderRadius:3}}><div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:C.teal,transition:'width .4s'}}/></div></div>;}

// ── Type ──────────────────────────────────────────────────────────────────────
type RecruiterDraft = {
  companyName:string; website:string; industry:string[]; companySize:string;
  stage:string; hqLocation:string; companyDesc:string;
  jobTitle:string; department:string; reportsTo:string; employmentType:string[];
  remotePolicy:string; officeLocation:string; startDate:string; managingReports:string;
  travel:string; jobDesc:string;
  minExp:number; minEducation:string; requiredSkills:string[]; niceSkills:string[];
  softSkills:string[]; preferredIndustries:string[]; requiredCerts:string; workAuth:string;
  showSalary:boolean; salaryMin:number; salaryMax:number; bonus:string;
  showEquity:boolean; equityType:string; benefits:string[]; compNotes:string;
  teamCulture:string[]; mgmtStyle:string; feedbackCulture:string;
  personality:Record<string,number>; successIn90:string; whoStruggles:string;
  weights:Record<string,number>; otherNotes:string;
};

const INIT:RecruiterDraft={
  companyName:'',website:'',industry:[],companySize:'',stage:'',hqLocation:'',companyDesc:'',
  jobTitle:'',department:'',reportsTo:'',employmentType:[],remotePolicy:'',officeLocation:'',
  startDate:'',managingReports:'',travel:'',jobDesc:'',
  minExp:2,minEducation:'',requiredSkills:[],niceSkills:[],softSkills:[],
  preferredIndustries:[],requiredCerts:'',workAuth:'',
  showSalary:false,salaryMin:80,salaryMax:150,bonus:'',
  showEquity:false,equityType:'',benefits:[],compNotes:'',
  teamCulture:[],mgmtStyle:'',feedbackCulture:'',personality:{},successIn90:'',whoStruggles:'',
  weights:{skills:3,salary:3,experience:3,education:2,culture:3,location:2,availability:2,workStyle:3},
  otherNotes:'',
};

// ── Sections ──────────────────────────────────────────────────────────────────
function S1({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){return<>
  <SLabel>Section 1</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Company Information</h2>
  <Sub>Appears on your company profile and all job posts. Helps candidates understand who they'd work for.</Sub>
  <Divider/>
  <div style={{marginBottom:12}}><QLabel required>Company name</QLabel><FInput value={d.companyName} onChange={v=>set(x=>({...x,companyName:v}))} placeholder="e.g. Acme Corp"/></div>
  <div style={{marginBottom:12}}><QLabel optional>Company website</QLabel><FInput value={d.website} onChange={v=>set(x=>({...x,website:v}))} placeholder="https://yourcompany.com"/></div>
  <div style={{marginBottom:12}}><QLabel required>Industry (up to 3)</QLabel><MultiDropdown options={INDUSTRIES} values={d.industry} onChange={v=>v.length<=3&&set(x=>({...x,industry:v}))} placeholder="Select up to 3 industries..." max={3}/>{d.industry.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.industry.length}/3 selected</div>}</div>
  <Divider/>
  <QLabel required>Company size</QLabel>
  <RadioGroup options={['1–10 employees','11–50 employees','51–200 employees','201–1,000 employees','1,001–10,000 employees','10,000+ employees']} value={d.companySize} onChange={v=>set(x=>({...x,companySize:v}))}/>
  <Divider/>
  <QLabel required>Stage / type</QLabel>
  <RadioGroup options={['Early-stage startup (pre-Series A)','Growth-stage startup (Series A–C)','Late-stage / pre-IPO','Publicly traded','Private company (established)','Non-profit / NGO','Government / Public sector','Family-owned business']} value={d.stage} onChange={v=>set(x=>({...x,stage:v}))}/>
  <Divider/>
  <div style={{marginBottom:12}}><QLabel required>Headquarters location</QLabel><FInput value={d.hqLocation} onChange={v=>set(x=>({...x,hqLocation:v}))} placeholder="e.g. Chicago, IL"/></div>
  <Divider/>
  <QLabel optional>Company description</QLabel>
  <NudgeBanner>Companies with a description get 40% more candidate interest. Takes 2 minutes.</NudgeBanner>
  <FTextarea value={d.companyDesc} onChange={v=>set(x=>({...x,companyDesc:v}))} placeholder="What do you do and why does it matter? 2–3 sentences." rows={4}/>
</>;}

function S2({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){return<>
  <SLabel>Section 2</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Role Details</h2>
  <Sub>The specifics of the position you're hiring for.</Sub>
  <Divider/>
  <div style={{marginBottom:12}}><QLabel required>Job title</QLabel><FInput value={d.jobTitle} onChange={v=>set(x=>({...x,jobTitle:v}))} placeholder="e.g. Senior Product Manager"/></div>
  <div style={{marginBottom:12}}><QLabel optional>Department</QLabel><FInput value={d.department} onChange={v=>set(x=>({...x,department:v}))} placeholder="e.g. Product, Engineering, Sales"/></div>
  <div style={{marginBottom:12}}><QLabel optional>This role reports to</QLabel><FInput value={d.reportsTo} onChange={v=>set(x=>({...x,reportsTo:v}))} placeholder="e.g. VP of Product, Chief Marketing Officer"/></div>
  <Divider/>
  <QLabel required>Employment type</QLabel>
  <MultiPill options={EMPLOYMENT_TYPES} values={d.employmentType} onChange={v=>set(x=>({...x,employmentType:v}))}/>
  <Divider/>
  <QLabel required>Remote policy for this role</QLabel>
  <RadioGroup options={REMOTE_OPTIONS_RECRUITER} value={d.remotePolicy} onChange={v=>set(x=>({...x,remotePolicy:v}))}/>
  {(d.remotePolicy?.includes('Hybrid')||d.remotePolicy?.includes('On-site'))&&<div style={{marginTop:10}}><QLabel optional>Office location(s)</QLabel><FInput value={d.officeLocation} onChange={v=>set(x=>({...x,officeLocation:v}))} placeholder="e.g. Chicago, IL — 3 days/week in office"/></div>}
  <Divider/>
  <QLabel required>Target start date</QLabel>
  <RadioGroup options={['Immediately — ASAP','Within 30 days','1–3 months','3–6 months','Flexible — right person over right timing']} value={d.startDate} onChange={v=>set(x=>({...x,startDate:v}))}/>
  <Divider/>
  <QLabel optional>Will this role manage direct reports?</QLabel>
  <RadioGroup options={['No — individual contributor','Yes — small team (1–5)','Yes — mid-size team (6–15)','Yes — large team (15+)','To be determined']} value={d.managingReports} onChange={v=>set(x=>({...x,managingReports:v}))}/>
  <Divider/>
  <QLabel optional>Travel requirements</QLabel>
  <RadioGroup options={TRAVEL_LEVELS} value={d.travel} onChange={v=>set(x=>({...x,travel:v}))}/>
  <Divider/>
  <QLabel required>Job description</QLabel>
  <Sub>Describe the role, responsibilities, and what success looks like in the first 6–12 months.</Sub>
  <FTextarea value={d.jobDesc} onChange={v=>set(x=>({...x,jobDesc:v}))} placeholder="What will this person own? What problems will they solve? What does a great day look like?" rows={6}/>
</>;}

function S3({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){
  const fmtYrs=(v:number)=>v>=15?'15+ yrs':`${v} yr${v===1?'':'s'}`;
  return<>
    <SLabel>Section 3</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Requirements</h2>
    <Sub>What does the right person actually need? Be honest — over-specifying filters out great candidates.</Sub>
    <Divider/>
    <QLabel required>Minimum years of experience</QLabel>
    <Sub>The floor, not the ideal. If someone with less could still do the job well, set it lower.</Sub>
    <MaxSlider value={d.minExp} onChange={v=>set(x=>({...x,minExp:v}))} min={0} max={15} step={1} format={fmtYrs}/>
    <Divider/>
    <QLabel required>Minimum education level</QLabel>
    <FSelect value={d.minEducation} onChange={v=>set(x=>({...x,minEducation:v}))} options={EDUCATION_LEVELS} placeholder="Select minimum education..."/>
    <Divider/>
    <QLabel required>Required hard skills</QLabel>
    <Sub>Only include skills that are genuinely required — not a wishlist.</Sub>
    <MultiDropdown options={TECH_SKILLS} values={d.requiredSkills} onChange={v=>set(x=>({...x,requiredSkills:v}))} placeholder="Search and select required skills..."/>
    {d.requiredSkills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.requiredSkills.length} selected</div>}
    <Divider/>
    <QLabel optional>Nice-to-have skills</QLabel>
    <MultiDropdown options={TECH_SKILLS} values={d.niceSkills} onChange={v=>set(x=>({...x,niceSkills:v}))} placeholder="Search and select nice-to-have skills..."/>
    {d.niceSkills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.niceSkills.length} selected</div>}
    <Divider/>
    <QLabel optional>Soft skills you're prioritizing (up to 5)</QLabel>
    <MultiDropdown options={SOFT_SKILLS} values={d.softSkills} onChange={v=>v.length<=5&&set(x=>({...x,softSkills:v}))} placeholder="Search and select soft skills..." max={5}/>
    {d.softSkills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.softSkills.length}/5 selected</div>}
    <Divider/>
    <QLabel optional>Preferred industries candidates have worked in</QLabel>
    <Sub>Leave blank if you're open to any background.</Sub>
    <MultiDropdown options={INDUSTRIES} values={d.preferredIndustries} onChange={v=>set(x=>({...x,preferredIndustries:v}))} placeholder="Search and select industries..."/>
    <Divider/>
    <QLabel optional>Required certifications, licenses, or credentials</QLabel>
    <FInput value={d.requiredCerts} onChange={v=>set(x=>({...x,requiredCerts:v}))} placeholder="e.g. PMP, CPA, Series 7, Bar license..."/>
    <Divider/>
    <QLabel required>Work authorization requirement</QLabel>
    <RadioGroup options={['Must be authorized without sponsorship','We can sponsor H-1B visas','We can sponsor all visa types','No restriction']} value={d.workAuth} onChange={v=>set(x=>({...x,workAuth:v}))}/>
  </>;}

function S4({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){
  const fmtSalary=(v:number)=>v>=500?'$500k+':`$${v}k`;
  return<>
    <SLabel>Section 4</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Compensation & Benefits</h2>
    <Sub>You're never required to share this — but candidates who see salary ranges are 3× more likely to apply.</Sub>
    <Divider/>
    <QLabel optional>Base salary range</QLabel>
    <NudgeBanner>Roles with salary ranges get significantly more qualified applicants. Candidates self-select in and out — saving everyone time.</NudgeBanner>
    <Toggle label="Share salary range with candidates" value={d.showSalary} onChange={v=>set(x=>({...x,showSalary:v}))}/>
    {d.showSalary&&<div style={{marginTop:12}}><RangeSlider minVal={d.salaryMin} maxVal={d.salaryMax} onMin={v=>set(x=>({...x,salaryMin:v}))} onMax={v=>set(x=>({...x,salaryMax:v}))} min={30} max={500} step={5} format={fmtSalary}/></div>}
    <Divider/>
    <QLabel optional>Bonus structure</QLabel>
    <RadioGroup options={['No bonus','Discretionary bonus','Performance-based bonus','Commission-based','Profit sharing','Prefer not to share']} value={d.bonus} onChange={v=>set(x=>({...x,bonus:v}))}/>
    <Divider/>
    <QLabel optional>Equity / stock options</QLabel>
    <NudgeBanner>Equity is a major differentiator for top candidates, especially at startups. Even a rough range helps.</NudgeBanner>
    <Toggle label="Share equity information" value={d.showEquity} onChange={v=>set(x=>({...x,showEquity:v}))}/>
    {d.showEquity&&<div style={{marginTop:10}}><RadioGroup options={['Stock options (ISO/NSO)','RSUs (Restricted Stock Units)','Phantom equity / profit interest','No equity for this role']} value={d.equityType} onChange={v=>set(x=>({...x,equityType:v}))}/></div>}
    <Divider/>
    <QLabel optional>Benefits offered</QLabel>
    <MultiPill options={['Health insurance (medical)','Dental & vision','401(k) / retirement','401(k) matching','Unlimited PTO','Paid parental leave','Life insurance','Disability insurance','HSA / FSA','Remote work stipend','Home office stipend','Learning & development budget','Gym / wellness reimbursement','Commuter benefits','Stock purchase plan','Mental health benefits','Flexible hours','4-day work week']} values={d.benefits} onChange={v=>set(x=>({...x,benefits:v}))}/>
    <Divider/>
    <QLabel optional>Anything else about compensation worth sharing?</QLabel>
    <FTextarea value={d.compNotes} onChange={v=>set(x=>({...x,compNotes:v}))} placeholder="e.g. We benchmark to the 75th percentile. Salary reviewed annually. Signing bonus available for senior hires..." rows={3}/>
  </>;}

function S5({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){return<>
  <SLabel>Section 5</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Culture & Personality Fit</h2>
  <Sub>This is how we match candidates to your team's actual dynamic. The more honest you are, the better the matches.</Sub>
  <Divider/>
  <QLabel required>How would you describe your team's culture?</QLabel>
  <Sub>These exact descriptors are what candidates use to describe what they're looking for — so overlap = culture match score.</Sub>
  <MultiPill options={CULTURE_DESCRIPTORS} values={d.teamCulture} onChange={v=>set(x=>({...x,teamCulture:v}))}/>
  {d.teamCulture.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:7,fontFamily:F}}>{d.teamCulture.length} selected</div>}
  <Divider/>
  <QLabel required>Management style of the direct manager for this role</QLabel>
  <RadioGroup options={MGMT_STYLES} value={d.mgmtStyle} onChange={v=>set(x=>({...x,mgmtStyle:v}))}/>
  <Divider/>
  <QLabel required>How does the team typically give feedback?</QLabel>
  <RadioGroup options={['Real-time — as things happen','Regular check-ins (weekly or bi-weekly)','Formal periodic reviews (quarterly)','As-needed — people ask when they want it']} value={d.feedbackCulture} onChange={v=>set(x=>({...x,feedbackCulture:v}))}/>
  <Divider/>
  <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'12px 14px',marginBottom:20}}>
    <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>Rate what this role actually requires 1–5. 1 = strongly left, 5 = strongly right, 3 = balanced. These are matched against how candidates rate themselves.</p>
  </div>
  {PERSONALITY_DIMS_RECRUITER.map(q=><ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality?.[q.id]} onChange={v=>set(x=>({...x,personality:{...x.personality,[q.id]:v}}))}/>)}
  <Divider/>
  <QLabel optional>What does success look like in the first 90 days?</QLabel>
  <FTextarea value={d.successIn90} onChange={v=>set(x=>({...x,successIn90:v}))} placeholder="e.g. By day 30, completed onboarding. By day 60, shipped their first feature. By day 90, operating independently..." rows={4}/>
  <Divider/>
  <QLabel optional>What type of person struggles in this role?</QLabel>
  <Sub>Honest answers here save everyone time — candidates who aren't a fit will self-select out.</Sub>
  <FTextarea value={d.whoStruggles} onChange={v=>set(x=>({...x,whoStruggles:v}))} placeholder="e.g. Someone who needs a lot of direction or prefers a structured, predictable environment may find this role challenging..." rows={3}/>
</>;}

function S6({d,set}:{d:RecruiterDraft;set:React.Dispatch<React.SetStateAction<RecruiterDraft>>}){return<>
  <SLabel>Section 6</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Scoring Weights</h2>
  <Sub>How much should each dimension matter when we rank candidates for this role? A sales role might weight personality highly. An engineering role might make hard skills critical.</Sub>
  <Divider/>
  <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'12px 14px',marginBottom:22}}>
    <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>These weights are unique to this job posting and directly affect who shows up at the top of your candidate list.</p>
  </div>
  {SCORE_DIMS.map(({key,label})=><WeightSlider key={key} label={label} value={d.weights[key]??3} onChange={v=>set(x=>({...x,weights:{...x.weights,[key]:v}}))}/>)}
  <Divider/>
  <QLabel optional>Anything else that matters for this role that we haven't asked?</QLabel>
  <FTextarea value={d.otherNotes} onChange={v=>set(x=>({...x,otherNotes:v}))} placeholder="e.g. Must be based in CST/EST time zone. Experience with Series A companies strongly preferred. Bilingual Spanish a major plus..." rows={3}/>
</>;}

function Review({data}:{data:RecruiterDraft}){
  const fmtSalary=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const rows:[string,string][]=[
    ['Company',data.companyName],
    ['Industry',data.industry?.join(', ')??''],
    ['Company size',data.companySize],
    ['Job title',data.jobTitle],
    ['Employment type',data.employmentType?.join(', ')??''],
    ['Remote policy',data.remotePolicy],
    ['Start date',data.startDate],
    ['Min. experience',data.minExp!==undefined?`${data.minExp}+ yrs`:''],
    ['Min. education',data.minEducation],
    ['Required skills',data.requiredSkills?.slice(0,3).join(', ')+(data.requiredSkills?.length>3?` +${data.requiredSkills.length-3} more`:'')],
    ['Salary range',data.showSalary&&data.salaryMin&&data.salaryMax?`${fmtSalary(data.salaryMin)} – ${fmtSalary(data.salaryMax)}`:'Not shared'],
    ['Equity',data.showEquity?data.equityType||'Will share':'Not shared'],
    ['Team culture',data.teamCulture?.slice(0,3).join(', ')??''],
    ['Management style',data.mgmtStyle],
    ['Work authorization',data.workAuth],
  ];
  return<>
    <SLabel>Almost done</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Review your job posting</h2>
    <Sub>Once posted, candidates are ranked automatically based on your scoring weights. You can edit anytime.</Sub>
    <Divider/>
    {rows.filter(([,v])=>v).map(([l,v])=>(
      <div key={l} style={{display:'flex',borderBottom:`1px solid ${C.border}`,padding:'10px 0',gap:12}}>
        <span style={{fontSize:13,color:C.gray600,width:150,flexShrink:0,fontFamily:F}}>{l}</span>
        <span style={{fontSize:13,color:C.slate,fontWeight:600,fontFamily:F,lineHeight:1.4}}>{v}</span>
      </div>
    ))}
    <div style={{marginTop:22,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'14px 16px'}}>
      <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>✓ Once posted, candidates are ranked in real time. You'll be notified when strong matches appear.</p>
    </div>
  </>;}

// ── Sections registry ─────────────────────────────────────────────────────────
const SECTIONS=[
  {label:'Company',    Comp:S1},
  {label:'Role Details',Comp:S2},
  {label:'Requirements',Comp:S3},
  {label:'Compensation',Comp:S4},
  {label:'Culture & Fit',Comp:S5},
  {label:'Scoring',   Comp:S6},
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecruiterPost(){
  const {profile,loading}=useUser();
  const router=useRouter();
  const supabase=useMemo(()=>createClient(),[]);
  const [step,setStep]=useState(0);
  const [data,setData]=useState<RecruiterDraft>(INIT);
  const [posting,setPosting]=useState(false);
  const [done,setDone]=useState(false);
  const total=SECTIONS.length;
  const isReview=step===total;

  function go(n:number){setStep(n);window.scrollTo({top:0,behavior:'smooth'});}

  async function post(){
    if(!profile)return;
    setPosting(true);

    // Update recruiter profile with company info
    await supabase.from('profiles').update({
      company_name:data.companyName||null,
      company_website:data.website||null,
      company_stage:data.stage||null,
      company_desc:data.companyDesc||null,
      location:data.hqLocation||null,
    }).eq('id',profile.id);

    // Insert job posting
    const {data:job,error}=await supabase.from('jobs').insert({
      recruiter_id:profile.id,
      // S1: Company
      company_name:data.companyName||null,
      company_website:data.website||null,
      company_industries:data.industry,
      company_size:data.companySize||null,
      company_stage:data.stage||null,
      hq_location:data.hqLocation||null,
      company_desc:data.companyDesc||null,
      // S2: Role
      title:data.jobTitle,
      department:data.department||null,
      reports_to:data.reportsTo||null,
      employment_type:data.employmentType,
      remote_policy:data.remotePolicy||null,
      office_location:data.officeLocation||null,
      start_date:data.startDate||null,
      managing_reports:data.managingReports||null,
      travel:data.travel||null,
      description:data.jobDesc||null,
      // S3: Requirements
      min_exp:data.minExp,
      min_education:data.minEducation||null,
      required_skills:data.requiredSkills,
      nice_skills:data.niceSkills,
      soft_skills_required:data.softSkills,
      preferred_industries:data.preferredIndustries,
      required_certs:data.requiredCerts||null,
      work_auth:data.workAuth||null,
      // S4: Compensation
      show_salary:data.showSalary,
      salary_min:data.showSalary?(data.salaryMin*1000):null,
      salary_max:data.showSalary?(data.salaryMax*1000):null,
      bonus:data.bonus||null,
      show_equity:data.showEquity,
      equity_type:data.showEquity?(data.equityType||null):null,
      benefits:data.benefits,
      comp_notes:data.compNotes||null,
      // S5: Culture & Personality
      team_culture:data.teamCulture,
      mgmt_style:data.mgmtStyle||null,
      feedback_culture:data.feedbackCulture||null,
      personality_required:Object.keys(data.personality).length>0?data.personality:null,
      success_in_90:data.successIn90||null,
      who_struggles:data.whoStruggles||null,
      // S6: Weights
      weight_skills:data.weights.skills??3,
      weight_salary:data.weights.salary??3,
      weight_experience:data.weights.experience??3,
      weight_education:data.weights.education??2,
      weight_culture:data.weights.culture??3,
      weight_location:data.weights.location??2,
      weight_availability:data.weights.availability??2,
      weight_work_style:data.weights.workStyle??3,
      weight_personality:2,
      weight_industry:2,
      other_notes:data.otherNotes||null,
    }).select('id').single();

    if(error||!job){setPosting(false);alert('Error posting job: '+(error?.message??'Unknown'));return;}

    // Trigger match scoring in background
    fetch('/api/match-scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId:job.id})});

    // Send recruiter "job is live" email (non-blocking)
    fetch('/api/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'recruiter-job-live',recruiterId:profile.id,jobId:job.id})});

    setDone(true);
    setPosting(false);
  }

  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',fontFamily:F,color:C.teal}}>Loading…</div>;

  if(done)return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',maxWidth:420}}>
        <div style={{fontSize:52,marginBottom:14}}>🚀</div>
        <h1 style={{fontSize:24,fontWeight:800,color:C.slate,margin:'0 0 10px',letterSpacing:-0.5}}>Your role is live.</h1>
        <p style={{color:C.gray600,fontSize:15,lineHeight:1.65,margin:'0 0 22px'}}>Candidates are being ranked right now based on your scoring weights. We'll notify you when strong matches appear.</p>
        <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:'16px 18px',marginBottom:20}}>
          <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0}}>Next: review your ranked candidate list and shortlist your top picks.</p>
        </div>
        <button onClick={()=>router.push('/recruiter/jobs')} style={{padding:'12px 28px',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F}}>View candidate pipeline →</button>
      </div>
    </div>
  );

  const SecComp=!isReview?SECTIONS[step].Comp:null;

  return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,paddingBottom:80}}>
      {/* Sticky header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:56,zIndex:99}}>
        <span style={{fontSize:12,color:C.gray400,fontWeight:600,fontFamily:F}}>Post a Job</span>
        <span style={{fontSize:12,color:C.gray600,fontWeight:600,fontFamily:F}}>{isReview?'Review & post':`${step+1} of ${total} — ${SECTIONS[step].label}`}</span>
      </div>

      {/* Section tabs */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 20px',overflowX:'auto',position:'sticky',top:108,zIndex:98}}>
        <div style={{display:'flex',minWidth:'fit-content'}}>
          {SECTIONS.map((s,i)=>(
            <button key={i} onClick={()=>go(i)} style={{padding:'9px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${i===step?C.teal:'transparent'}`,color:i===step?C.teal:i<step?C.green:C.gray400,fontWeight:i===step?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4}}>
              {i<step&&<span style={{fontSize:9}}>✓</span>}{s.label}
            </button>
          ))}
          <button onClick={()=>go(total)} style={{padding:'9px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${isReview?C.teal:'transparent'}`,color:isReview?C.teal:C.gray400,fontWeight:isReview?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Review</button>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:640,margin:'28px auto 0',padding:'0 16px'}}>
        <Progress step={step} total={total}/>
        <Card style={{marginBottom:14}}>
          {isReview?<Review data={data}/>:SecComp&&<SecComp d={data} set={setData}/>}
        </Card>
        <div style={{display:'flex',gap:9}}>
          {step>0&&<button onClick={()=>go(step-1)} style={{flex:1,padding:'11px 0',borderRadius:8,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:F}}>← Back</button>}
          {!isReview
            ?<button onClick={()=>go(step+1)} style={{flex:2,padding:'11px 0',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F}}>{step<total-1?'Continue →':'Review posting →'}</button>
            :<button onClick={post} disabled={posting} style={{flex:2,padding:'11px 0',borderRadius:8,background:posting?C.gray400:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:posting?'default':'pointer',fontFamily:F}}>{posting?'Posting…':'Post job & go live →'}</button>}
        </div>
      </div>
    </div>
  );
}

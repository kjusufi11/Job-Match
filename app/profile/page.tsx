'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import {
  INDUSTRIES, CULTURE_DESCRIPTORS, EMPLOYMENT_TYPES, MGMT_STYLES, TRAVEL_LEVELS,
  SKILL_SUGGESTIONS, UNIVERSITIES, TITLE_SUGGESTIONS, EDUCATION_LEVELS_SEEKER,
  PERSONALITY_DIMS_SEEKER,
} from '@/lib/constants';

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:'#F0F4F7',white:'#FFFFFF',teal:'#1A8C8C',tealDim:'#1A8C8C12',tealBorder:'#1A8C8C35',
  slate:'#1E2D3A',gray100:'#E3ECF1',gray200:'#C8D8E4',gray400:'#8FAABB',gray600:'#4E6475',
  gray800:'#2B3D4D',border:'#D4E3EC',green:'#19A87A',greenDim:'#19A87A14',
  amber:'#C9870C',amberDim:'#C9870C14',red:'#C0392B',redDim:'#C0392B14',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

// ── Types ──────────────────────────────────────────────────────────────────────
type Degree = { level:string; field:string; university:string; gradYear:string; current:boolean };
type WorkJob = { company:string; title:string; startDate:string; endDate:string; current:boolean; responsibilities:string; accomplishments:string };
type SurveyData = {
  firstName:string; lastName:string; email:string; phone:string; location:string; zip:string; workAuth:string; eeoc:string[];
  degrees:Degree[]; certs:string;
  jobs:WorkJob[]; gaps:string; empStatus:string;
  skills:string[]; seniority:string; industries:string[];
  targetTitles:string[]; idealSalary:number; minSalary:number;
  remotePreference:string; maxCommute:number; employmentType:string[];
  availability:string; relocation:string; relocationRegions:string; travel:string;
  companySize:string[]; targetIndustries:string[];
  targetCulture:string[]; mgmtStyle:string; feedbackStyle:string; motivators:string[];
  personality:Record<string,number>;
  primaryGoal:string; fiveYear:string; searchIntensity:string; stayReasons:string[]; personalNote:string;
};
type SetData = React.Dispatch<React.SetStateAction<SurveyData>>;
type SecProps = { d:SurveyData; set:SetData };

const BLANK_DEGREE: Degree = { level:'', field:'', university:'', gradYear:'', current:false };
const BLANK_JOB: WorkJob = { company:'', title:'', startDate:'', endDate:'', current:false, responsibilities:'', accomplishments:'' };
const INIT: SurveyData = {
  firstName:'',lastName:'',email:'',phone:'',location:'',zip:'',workAuth:'',eeoc:[],
  degrees:[{...BLANK_DEGREE}],certs:'',
  jobs:[{...BLANK_JOB}],gaps:'',empStatus:'',
  skills:[],seniority:'',industries:[],
  targetTitles:[],idealSalary:100,minSalary:80,
  remotePreference:'',maxCommute:30,employmentType:[],
  availability:'',relocation:'',relocationRegions:'',travel:'',
  companySize:[],targetIndustries:[],
  targetCulture:[],mgmtStyle:'',feedbackStyle:'',motivators:[],
  personality:{},
  primaryGoal:'',fiveYear:'',searchIntensity:'',stayReasons:[],personalNote:'',
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Card({children,style={}}:{children:React.ReactNode;style?:React.CSSProperties}){return<div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'24px 22px',...style}}>{children}</div>;}
function SLabel({children}:{children:React.ReactNode}){return<div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:1.4,marginBottom:5,fontFamily:F}}>{children}</div>;}
function QLabel({children,required}:{children:React.ReactNode;required?:boolean}){return<div style={{fontSize:15,fontWeight:600,color:C.slate,marginBottom:8,fontFamily:F,lineHeight:1.4}}>{children}{required&&<span style={{color:C.red,marginLeft:3}}>*</span>}</div>;}
function Sub({children}:{children:React.ReactNode}){return<div style={{fontSize:13,color:C.gray600,marginBottom:10,fontFamily:F,lineHeight:1.5}}>{children}</div>;}
function Divider(){return<div style={{borderTop:`1px solid ${C.border}`,margin:'20px 0'}}/>;}
function FInput({value,onChange,placeholder,type='text',style={}}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;style?:React.CSSProperties}){return<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:F,...style}}/>;}
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
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'2px 9px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>{v}<span onClick={e=>{e.stopPropagation();toggle(v);}} style={{cursor:'pointer',fontWeight:700}}>×</span></span>)}
      <span style={{marginLeft:'auto',color:C.gray400,fontSize:11}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:4,zIndex:50,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',maxHeight:240,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`}}><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:'100%',padding:'6px 10px',borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.slate,fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:F}}/></div>
      <div style={{overflowY:'auto',flex:1}}>
        {filtered.map(o=><div key={o} onClick={()=>toggle(o)} style={{padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:9,background:values.includes(o)?C.tealDim:'none'}}>
          <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800}}>✓</span>}</div>
          <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F}}>{o}</span>
        </div>)}
        {filtered.length===0&&<div style={{padding:'14px',color:C.gray400,fontSize:13,textAlign:'center',fontFamily:F}}>No results — type to add custom</div>}
      </div>
    </div>}
  </div>;
}

function TagInput({values,onChange,suggestions,placeholder,max}:{values:string[];onChange:(v:string[])=>void;suggestions:string[];placeholder?:string;max?:number}){
  const [input,setInput]=useState('');
  const [showSug,setShowSug]=useState(false);
  const filtered=input.length>1?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())&&!values.includes(s)).slice(0,8):[];
  function add(val:string){const v=val.trim();if(!v||values.includes(v)||(max&&values.length>=max))return;onChange([...values,v]);setInput('');setShowSug(false);}
  function remove(v:string){onChange(values.filter(x=>x!==v));}
  return<div style={{position:'relative'}}>
    <div style={{minHeight:44,padding:'6px 10px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,display:'flex',flexWrap:'wrap',gap:5,alignItems:'center',cursor:'text'}} onClick={()=>document.getElementById('tag-input')?.focus()}>
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'3px 10px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>{v}<span onClick={()=>remove(v)} style={{cursor:'pointer',fontWeight:700,fontSize:13}}>×</span></span>)}
      <input id="tag-input" value={input} onChange={e=>{setInput(e.target.value);setShowSug(true);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add(input);}if(e.key==='Backspace'&&!input&&values.length){remove(values[values.length-1]);}}} onFocus={()=>setShowSug(true)} placeholder={values.length===0?placeholder:''} style={{border:'none',outline:'none',background:'none',fontSize:13,color:C.slate,fontFamily:F,minWidth:120,flex:1}}/>
    </div>
    {showSug&&filtered.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:3,zIndex:50,boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
      {filtered.map(s=><div key={s} onClick={()=>add(s)} style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}}>{s}</div>)}
      {input.length>1&&!suggestions.includes(input)&&<div onClick={()=>add(input)} style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:C.teal,fontWeight:600,fontFamily:F,borderTop:`1px solid ${C.border}`}}>+ Add "{input}"</div>}
    </div>}
  </div>;
}

function AutocompleteInput({value,onChange,suggestions,placeholder}:{value:string;onChange:(v:string)=>void;suggestions:string[];placeholder?:string}){
  const [input,setInput]=useState(value||'');
  const [show,setShow]=useState(false);
  const filtered=input.length>1?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())).slice(0,8):[];
  function select(v:string){setInput(v);onChange(v);setShow(false);}
  return<div style={{position:'relative'}}>
    <input value={input} onChange={e=>{setInput(e.target.value);onChange(e.target.value);setShow(true);}} onFocus={()=>setShow(true)} placeholder={placeholder} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F}}/>
    {show&&filtered.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:3,zIndex:50,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',maxHeight:200,overflowY:'auto'}}>
      {filtered.map(s=><div key={s} onClick={()=>select(s)} style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}}>{s}</div>)}
    </div>}
  </div>;
}

function ScaleQ({question,low,high,value,onChange}:{question:string;low:string;high:string;value:number|undefined;onChange:(v:number)=>void}){return<div style={{marginBottom:20}}>
  <div style={{fontSize:14,fontWeight:500,color:C.slate,marginBottom:8,fontFamily:F,lineHeight:1.45}}>{question}</div>
  <div style={{display:'flex',alignItems:'center',gap:8}}>
    <span style={{fontSize:11,color:C.gray600,width:110,flexShrink:0,lineHeight:1.3}}>{low}</span>
    <div style={{display:'flex',gap:6,flex:1}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,height:36,borderRadius:7,border:`1.5px solid ${value===n?C.teal:C.border}`,background:value===n?C.teal:C.bg,color:value===n?C.white:C.gray600,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{n}</button>)}</div>
    <span style={{fontSize:11,color:C.gray600,width:110,flexShrink:0,textAlign:'right',lineHeight:1.3}}>{high}</span>
  </div>
</div>;}

function MaxSlider({value,onChange,min,max,step=1,format}:{value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;format:(v:number)=>string}){return<div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={{width:'100%',accentColor:C.teal}}/><div style={{display:'flex',justifyContent:'space-between',marginTop:3}}><span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(min)}</span><span style={{fontSize:14,fontWeight:800,color:C.teal,fontFamily:F}}>{format(value)}</span><span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(max)}</span></div></div>;}

function Progress({step,total}:{step:number;total:number}){const pct=Math.round(((step+1)/(total+1))*100);return<div style={{marginBottom:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:C.gray600,fontFamily:F}}>{step<total?`Section ${step+1} of ${total}`:'Review'}</span><span style={{fontSize:12,fontWeight:700,color:C.teal,fontFamily:F}}>{pct}% complete</span></div><div style={{height:5,background:C.gray100,borderRadius:3}}><div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:C.teal,transition:'width .4s'}}/></div></div>;}

function RepeatBlock({children,onRemove,canRemove}:{children:React.ReactNode;onRemove:()=>void;canRemove:boolean}){return<div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:'16px 16px 10px',marginBottom:10,position:'relative'}}>
  {canRemove&&<button onClick={onRemove} style={{position:'absolute',top:10,right:12,background:'none',border:'none',color:C.gray400,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>}
  {children}
</div>;}

// ── Step 0: Resume Upload ──────────────────────────────────────────────────────
function ResumeUpload({onSkip}:{onSkip:()=>void}){
  const [dragging,setDragging]=useState(false);
  const [file,setFile]=useState<File|null>(null);
  const ref=useRef<HTMLInputElement>(null);
  function handleFile(f:File|null){if(f&&(f.type==='application/pdf'||f.name.endsWith('.docx'))){setFile(f);}}
  return<div style={{background:C.bg,minHeight:'100vh',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
    <div style={{maxWidth:520,width:'100%'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:20}}>
          <div style={{width:28,height:28,borderRadius:6,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:16,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
        </div>
        <h1 style={{fontSize:28,fontWeight:800,color:C.slate,margin:'0 0 10px',letterSpacing:-0.5,lineHeight:1.2}}>Got a resume?<br/>Let's use it one last time.</h1>
        <p style={{fontSize:15,color:C.gray600,margin:'0 auto',lineHeight:1.65,maxWidth:400}}>Upload it and we'll pre-fill your profile automatically. After this, you'll never need a resume again — your Matcht profile does the work for you.</p>
      </div>
      <Card>
        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]??null);}} onClick={()=>ref.current?.click()} style={{border:`2px dashed ${dragging?C.teal:C.gray200}`,borderRadius:12,padding:'40px 24px',textAlign:'center',cursor:'pointer',background:dragging?C.tealDim:C.bg,transition:'all .2s'}}>
          <input ref={ref} type="file" accept=".pdf,.docx" onChange={e=>handleFile(e.target.files?.[0]??null)} style={{display:'none'}}/>
          {file?<><div style={{fontSize:36,marginBottom:8}}>📄</div><div style={{fontWeight:700,fontSize:15,color:C.teal,marginBottom:4}}>{file.name}</div><div style={{fontSize:13,color:C.gray400}}>Ready to upload</div></>:<><div style={{fontSize:36,marginBottom:8}}>📎</div><div style={{fontWeight:600,fontSize:15,color:C.slate,marginBottom:6}}>Drop your resume here</div><div style={{fontSize:13,color:C.gray400,marginBottom:12}}>or click to browse</div><div style={{fontSize:12,color:C.gray400}}>PDF or Word doc · Max 10MB</div></>}
        </div>
        {file&&<button onClick={onSkip} style={{width:'100%',padding:'12px 0',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F,marginTop:12}}>Pre-fill my profile →</button>}
        <button onClick={onSkip} style={{width:'100%',padding:'10px 0',borderRadius:8,background:'none',border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginTop:8}}>{file?'Skip — I\'ll fill it in manually':'I don\'t have a resume — start fresh'}</button>
      </Card>
      <p style={{textAlign:'center',fontSize:12,color:C.gray400,marginTop:14,fontFamily:F}}>Your resume is used only to pre-fill your profile and is never shared with employers.</p>
    </div>
  </div>;
}

// ── Sections ──────────────────────────────────────────────────────────────────
function S1({d,set}:SecProps){return<>
  <SLabel>Section 1</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Basic Information</h2>
  <Sub>The fundamentals. Used for location-based matching and contact.</Sub>
  <Divider/>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
    <div><QLabel required>First name</QLabel><FInput value={d.firstName} onChange={v=>set(x=>({...x,firstName:v}))} placeholder="Jane"/></div>
    <div><QLabel required>Last name</QLabel><FInput value={d.lastName} onChange={v=>set(x=>({...x,lastName:v}))} placeholder="Smith"/></div>
  </div>
  <div style={{marginBottom:12}}><QLabel required>Email address</QLabel><FInput value={d.email} onChange={v=>set(x=>({...x,email:v}))} placeholder="jane@example.com" type="email"/></div>
  <div style={{marginBottom:12}}><QLabel>Phone number</QLabel><FInput value={d.phone} onChange={v=>set(x=>({...x,phone:v}))} placeholder="+1 (555) 000-0000"/></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,marginBottom:12}}>
    <div><QLabel required>City & state</QLabel><FInput value={d.location} onChange={v=>set(x=>({...x,location:v}))} placeholder="Chicago, IL"/></div>
    <div><QLabel required>ZIP code</QLabel><FInput value={d.zip} onChange={v=>set(x=>({...x,zip:v}))} placeholder="60601"/></div>
  </div>
  <Divider/>
  <QLabel required>Are you legally authorized to work in the United States?</QLabel>
  <RadioGroup options={['Yes, without sponsorship','Yes, but I require sponsorship','No']} value={d.workAuth} onChange={v=>set(x=>({...x,workAuth:v}))}/>
  <Divider/>
  <QLabel>Veteran / disability status (optional)</QLabel>
  <Sub>Used only for EEOC reporting. Has no effect on your match score.</Sub>
  <MultiPill options={['U.S. Military Veteran','Person with a disability','Not a veteran / does not apply','Prefer not to answer']} values={d.eeoc} onChange={v=>set(x=>({...x,eeoc:v}))}/>
</>;}

function S2({d,set}:SecProps){
  function addDegree(){set(x=>({...x,degrees:[...x.degrees,{...BLANK_DEGREE}]}));}
  function updateDegree(i:number,field:keyof Degree,val:string|boolean){set(x=>({...x,degrees:x.degrees.map((deg,idx)=>idx===i?{...deg,[field]:val}:deg)}));}
  function removeDegree(i:number){set(x=>({...x,degrees:x.degrees.filter((_,idx)=>idx!==i)}));}
  const hasDegree=(level:string)=>["Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree","PhD or Doctorate","Associate's degree"].includes(level);
  return<>
    <SLabel>Section 2</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Education</h2>
    <Sub>Add all degrees and certifications. You don't need a degree to use Matcht — this is purely for matching accuracy.</Sub>
    <Divider/>
    {d.degrees.map((deg,i)=><RepeatBlock key={i} onRemove={()=>removeDegree(i)} canRemove={d.degrees.length>1}>
      <div style={{fontWeight:700,fontSize:13,color:C.teal,marginBottom:10,fontFamily:F}}>Degree {i+1}</div>
      <div style={{marginBottom:10}}><QLabel>Level</QLabel><FSelect value={deg.level} onChange={v=>updateDegree(i,'level',v)} options={EDUCATION_LEVELS_SEEKER} placeholder="Select level..."/></div>
      {hasDegree(deg.level)&&<>
        <div style={{marginBottom:10}}><QLabel>Field of study / Major</QLabel><FInput value={deg.field} onChange={v=>updateDegree(i,'field',v)} placeholder="e.g. Computer Science, Finance, Marketing"/></div>
        <div style={{marginBottom:10}}><QLabel>University or institution</QLabel><AutocompleteInput value={deg.university} onChange={v=>updateDegree(i,'university',v)} suggestions={UNIVERSITIES} placeholder="Start typing your school..."/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:6}}>
          <div><QLabel>Graduation year</QLabel><FInput value={deg.gradYear} onChange={v=>updateDegree(i,'gradYear',v)} placeholder="e.g. 2018"/></div>
          <div style={{paddingTop:28}}><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={deg.current} onChange={e=>updateDegree(i,'current',e.target.checked)} style={{accentColor:C.teal}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>Currently enrolled</span></label></div>
        </div>
      </>}
    </RepeatBlock>)}
    <button onClick={addDegree} style={{width:'100%',padding:'10px 0',borderRadius:8,background:'none',border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginBottom:16}}>+ Add another degree or certification</button>
    <Divider/>
    <QLabel>Professional certifications or licenses</QLabel>
    <Sub>Any not captured above — separate with commas.</Sub>
    <FInput value={d.certs} onChange={v=>set(x=>({...x,certs:v}))} placeholder="e.g. PMP, CPA, AWS Solutions Architect, SHRM-CP, Series 7"/>
  </>;}

function S3({d,set}:SecProps){
  function addJob(){set(x=>({...x,jobs:[...x.jobs,{...BLANK_JOB}]}));}
  function updateJob(i:number,field:keyof WorkJob,val:string|boolean){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,[field]:val}:j)}));}
  function removeJob(i:number){set(x=>({...x,jobs:x.jobs.filter((_,idx)=>idx!==i)}));}
  return<>
    <SLabel>Section 3</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Work History</h2>
    <Sub>Add your work experience starting with the most recent. This replaces a resume — be as thorough as you'd like.</Sub>
    <Divider/>
    {d.jobs.map((job,i)=><RepeatBlock key={i} onRemove={()=>removeJob(i)} canRemove={d.jobs.length>1}>
      <div style={{fontWeight:700,fontSize:13,color:C.teal,marginBottom:10,fontFamily:F}}>{i===0?'Most recent role':`Role ${i+1}`}</div>
      <div style={{marginBottom:10}}><QLabel required>Job title</QLabel><FInput value={job.title} onChange={v=>updateJob(i,'title',v)} placeholder="e.g. Senior Product Manager"/></div>
      <div style={{marginBottom:10}}><QLabel required>Company</QLabel><FInput value={job.company} onChange={v=>updateJob(i,'company',v)} placeholder="e.g. Acme Corp"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:6}}>
        <div><QLabel>Start date</QLabel><FInput value={job.startDate} onChange={v=>updateJob(i,'startDate',v)} placeholder="MM/YYYY"/></div>
        <div><QLabel>End date</QLabel><FInput value={job.endDate} onChange={v=>updateJob(i,'endDate',v)} placeholder="MM/YYYY" style={{opacity:job.current?0.4:1}}/></div>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:10}}><input type="checkbox" checked={job.current} onChange={e=>updateJob(i,'current',e.target.checked)} style={{accentColor:C.teal}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>I currently work here</span></label>
      <div style={{marginBottom:10}}><QLabel>Key responsibilities</QLabel><FTextarea value={job.responsibilities} onChange={v=>updateJob(i,'responsibilities',v)} placeholder="What did you own? What were your core duties?" rows={3}/></div>
      <div><QLabel>Key accomplishments</QLabel><FTextarea value={job.accomplishments} onChange={v=>updateJob(i,'accomplishments',v)} placeholder="What did you achieve? Use numbers where possible — e.g. grew revenue 40%, reduced churn by 12%..." rows={3}/></div>
    </RepeatBlock>)}
    <button onClick={addJob} style={{width:'100%',padding:'10px 0',borderRadius:8,background:'none',border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginBottom:16}}>+ Add another role</button>
    <Divider/>
    <QLabel>Any gaps in your work history? (optional)</QLabel>
    <FTextarea value={d.gaps} onChange={v=>set(x=>({...x,gaps:v}))} placeholder="e.g. Took time off to care for family, pursued freelance work, traveled..." rows={2}/>
    <Divider/>
    <QLabel>Current employment status</QLabel>
    <RadioGroup options={['Employed full-time','Employed part-time','Self-employed / Freelance','Currently unemployed','Student','Career break']} value={d.empStatus} onChange={v=>set(x=>({...x,empStatus:v}))}/>
  </>;}

function S4({d,set}:SecProps){return<>
  <SLabel>Section 4</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Skills</h2>
  <Sub>Type any skill and press Enter to add it. We'll suggest common skills as you type. Be honest — overstating leads to bad matches.</Sub>
  <Divider/>
  <QLabel required>Your skills</QLabel>
  <Sub>Add as many as are genuinely relevant — technical, functional, and soft skills all in one place. Type + Enter to add.</Sub>
  <TagInput values={d.skills} onChange={v=>set(x=>({...x,skills:v}))} suggestions={SKILL_SUGGESTIONS} placeholder="e.g. Product Management, SQL, Leadership, Figma..."/>
  {d.skills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.skills.length} skills added</div>}
  <Divider/>
  <QLabel required>Overall experience level</QLabel>
  <RadioGroup options={['Entry — building foundational skills','Mid-level — solid independent contributor','Senior — deep expertise, sometimes leads others','Lead / Principal — sets direction, mentors others','Executive — organizational leadership']} value={d.seniority} onChange={v=>set(x=>({...x,seniority:v}))}/>
  <Divider/>
  <QLabel>Industries you've worked in</QLabel>
  <MultiDropdown options={INDUSTRIES} values={d.industries} onChange={v=>set(x=>({...x,industries:v}))} placeholder="Search and select industries..."/>
  {d.industries.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.industries.length} selected</div>}
</>;}

function S5({d,set}:SecProps){
  const fmtSalary=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const fmtCommute=(v:number)=>v>=90?'90+ min':`${v} min`;
  const noCommute=d.remotePreference==='Remote only — I will not commute';
  return<>
    <SLabel>Section 5</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Job Preferences & Critical Needs</h2>
    <Sub>Your ranges and non-negotiables. These filter out roles that don't work for you before you ever see them.</Sub>
    <Divider/>
    <QLabel required>Target job titles</QLabel>
    <Sub>Add each title as a tag — press Enter after each one.</Sub>
    <TagInput values={d.targetTitles} onChange={v=>set(x=>({...x,targetTitles:v}))} suggestions={TITLE_SUGGESTIONS} placeholder="e.g. Senior Product Manager, Director of Operations..."/>
    <Divider/>
    <QLabel required>Ideal salary (base pay)</QLabel>
    <Sub>What you're targeting — the number you'd be excited about.</Sub>
    <MaxSlider value={d.idealSalary} onChange={v=>set(x=>({...x,idealSalary:v}))} min={30} max={500} step={5} format={fmtSalary}/>
    <div style={{marginTop:20}}>
      <QLabel required>Minimum acceptable salary (base pay)</QLabel>
      <Sub>Your floor — the least you'd accept. We won't show you anything below this.</Sub>
      <MaxSlider value={d.minSalary} onChange={v=>set(x=>({...x,minSalary:Math.min(v,d.idealSalary)}))} min={30} max={500} step={5} format={fmtSalary}/>
    </div>
    <Divider/>
    <QLabel required>Remote work preference</QLabel>
    <RadioGroup options={['Remote only — I will not commute','Strongly prefer remote, open to occasional on-site','Hybrid — mix of remote and office is ideal','Flexible — whatever the role requires','On-site preferred']} value={d.remotePreference} onChange={v=>set(x=>({...x,remotePreference:v}))}/>
    {!noCommute&&<div style={{marginTop:16}}><QLabel>Maximum one-way commute time</QLabel><MaxSlider value={d.maxCommute} onChange={v=>set(x=>({...x,maxCommute:v}))} min={10} max={90} step={5} format={fmtCommute}/></div>}
    <Divider/>
    <QLabel required>Employment type</QLabel>
    <MultiPill options={EMPLOYMENT_TYPES} values={d.employmentType} onChange={v=>set(x=>({...x,employmentType:v}))}/>
    <Divider/>
    <QLabel required>When are you available to start?</QLabel>
    <RadioGroup options={['Immediately (within 2 weeks)','Within 1 month','1–3 months','3–6 months','Exploring — no fixed timeline']} value={d.availability} onChange={v=>set(x=>({...x,availability:v}))}/>
    <Divider/>
    <QLabel>Open to relocation?</QLabel>
    <RadioGroup options={['No — staying where I am','Yes — anywhere','Yes — specific regions only (describe below)']} value={d.relocation} onChange={v=>set(x=>({...x,relocation:v}))}/>
    {d.relocation?.includes('specific regions')&&<div style={{marginTop:8}}><FInput value={d.relocationRegions} onChange={v=>set(x=>({...x,relocationRegions:v}))} placeholder="e.g. Southeast US, New York metro, Pacific Northwest"/></div>}
    <Divider/>
    <QLabel>Willing to travel for work?</QLabel>
    <RadioGroup options={TRAVEL_LEVELS} value={d.travel} onChange={v=>set(x=>({...x,travel:v}))}/>
    <Divider/>
    <QLabel>Preferred company size</QLabel>
    <MultiPill options={['Startup (1–50)','Small (51–200)','Mid-size (201–1,000)','Large (1,001–10,000)','Enterprise (10,000+)','No preference']} values={d.companySize} onChange={v=>set(x=>({...x,companySize:v}))}/>
    <Divider/>
    <QLabel>Industries you'd like to work in</QLabel>
    <Sub>Leave blank to stay open to all.</Sub>
    <MultiDropdown options={INDUSTRIES} values={d.targetIndustries} onChange={v=>set(x=>({...x,targetIndustries:v}))} placeholder="Search and select industries..."/>
    {d.targetIndustries.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.targetIndustries.length} selected</div>}
  </>;}

function S6({d,set}:SecProps){return<>
  <SLabel>Section 6</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Work Style & Culture</h2>
  <Sub>These answers are matched directly against how companies describe themselves. The more honest you are, the better your matches.</Sub>
  <Divider/>
  <QLabel required>What kind of culture are you looking for?</QLabel>
  <Sub>These exact descriptors are what companies use to describe their teams.</Sub>
  <MultiPill options={CULTURE_DESCRIPTORS} values={d.targetCulture} onChange={v=>set(x=>({...x,targetCulture:v}))}/>
  <Divider/>
  <QLabel required>Preferred management style from your direct manager</QLabel>
  <RadioGroup options={MGMT_STYLES} value={d.mgmtStyle} onChange={v=>set(x=>({...x,mgmtStyle:v}))}/>
  <Divider/>
  <QLabel required>How do you prefer to receive feedback?</QLabel>
  <RadioGroup options={['Real-time — as I go','Regular check-ins (weekly or bi-weekly)','Formal periodic reviews (quarterly)','Self-directed — I ask when I need it']} value={d.feedbackStyle} onChange={v=>set(x=>({...x,feedbackStyle:v}))}/>
  <Divider/>
  <QLabel>What motivates you most? (Pick top 3)</QLabel>
  <MultiPill options={['Meaningful impact / mission','Career growth & advancement','Compensation & financial rewards','Learning new skills','Creative freedom','Team & culture','Flexibility & autonomy','Recognition & visibility','Stability & security']} values={d.motivators} onChange={v=>set(x=>({...x,motivators:v}))} max={3}/>
  <div style={{fontSize:12,color:C.gray400,marginTop:7,fontFamily:F}}>{d.motivators.length}/3 selected</div>
</>;}

function S7({d,set}:SecProps){return<>
  <SLabel>Section 7</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Personality & Behavioral Profile</h2>
  <Sub>Matched directly against how employers describe what their role requires. No right or wrong answers.</Sub>
  <Divider/>
  <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'12px 14px',marginBottom:20}}>
    <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>Rate yourself 1–5. 1 = strongly left, 5 = strongly right, 3 = balanced.</p>
  </div>
  {PERSONALITY_DIMS_SEEKER.map(q=><ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality[q.id]} onChange={v=>set(x=>({...x,personality:{...x.personality,[q.id]:v}}))}/>)}
</>;}

function S8({d,set}:SecProps){return<>
  <SLabel>Section 8</SLabel>
  <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Career Goals & Intentions</h2>
  <Sub>Understanding where you're headed helps us find roles that move you forward — not ones you'll regret in 6 months.</Sub>
  <Divider/>
  <QLabel required>Primary goal right now</QLabel>
  <RadioGroup options={['Find a better-paying role','Advance to a more senior position','Switch industries or functions','Find better work-life balance','Return to work after a break','Find more stability or security','Find more meaningful / mission-driven work','Still exploring — not sure yet']} value={d.primaryGoal} onChange={v=>set(x=>({...x,primaryGoal:v}))}/>
  <Divider/>
  <QLabel>Where do you see yourself in 3–5 years?</QLabel>
  <RadioGroup options={['In a leadership or management role','Deep subject-matter expert / individual contributor','Running my own business or freelancing','Still growing in my current function','Not sure yet — exploring']} value={d.fiveYear} onChange={v=>set(x=>({...x,fiveYear:v}))}/>
  <Divider/>
  <QLabel>How actively are you job searching right now?</QLabel>
  <RadioGroup options={['Actively — I want to move fast','Open to the right opportunity — not in a rush','Passively exploring — not actively applying','Employed and happy, but curious']} value={d.searchIntensity} onChange={v=>set(x=>({...x,searchIntensity:v}))}/>
  <Divider/>
  <QLabel>What would make you stay at your current job? (if applicable)</QLabel>
  <MultiPill options={['Significant salary increase','Promotion or title change','More flexibility / remote options','Better management or culture','Nothing — I\'m ready to leave','Not applicable']} values={d.stayReasons} onChange={v=>set(x=>({...x,stayReasons:v}))}/>
  <Divider/>
  <QLabel>Anything else you'd like employers to know? (Optional)</QLabel>
  <Sub>Your personal note — the human part a resume never captures.</Sub>
  <FTextarea value={d.personalNote} onChange={v=>set(x=>({...x,personalNote:v}))} placeholder="e.g. Relocating to Austin in Q3. Looking for a company that values autonomy. Portfolio at..." rows={4}/>
</>;}

function ReviewScreen({data}:{data:SurveyData}){
  const fmtSalary=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const latestJob=data.jobs[0];
  const rows:[string,string][]=[
    ['Name',`${data.firstName} ${data.lastName}`.trim()],
    ['Location',data.location],
    ['Work authorization',data.workAuth],
    ['Most recent role',latestJob?`${latestJob.title} at ${latestJob.company}`:''],
    ['Education',data.degrees[0]?.level??''],
    ['Total skills',data.skills.length?`${data.skills.length} skills added`:''],
    ['Top skills',data.skills.slice(0,4).join(', ')+(data.skills.length>4?'...':'')],
    ['Target titles',data.targetTitles.join(', ')],
    ['Ideal salary',data.idealSalary?fmtSalary(data.idealSalary):''],
    ['Minimum salary',data.minSalary?fmtSalary(data.minSalary):''],
    ['Remote preference',data.remotePreference],
    ['Max commute',data.maxCommute&&!data.remotePreference?.includes('Remote only')?`${data.maxCommute} min`:'N/A'],
    ['Availability',data.availability],
    ['Target culture',data.targetCulture.slice(0,3).join(', ')],
    ['Preferred mgmt style',data.mgmtStyle],
    ['Primary goal',data.primaryGoal],
    ['Search status',data.searchIntensity],
  ];
  return<>
    <SLabel>Almost done</SLabel>
    <h2 style={{fontSize:21,fontWeight:800,color:C.slate,margin:'0 0 3px',letterSpacing:-0.5,fontFamily:F}}>Review your profile</h2>
    <Sub>Once you submit, your profile goes live and we start matching you immediately. You can edit anything at any time.</Sub>
    <Divider/>
    {rows.filter(([,v])=>v).map(([l,v])=>(
      <div key={l} style={{display:'flex',borderBottom:`1px solid ${C.border}`,padding:'10px 0',gap:12}}>
        <span style={{fontSize:13,color:C.gray600,width:150,flexShrink:0,fontFamily:F}}>{l}</span>
        <span style={{fontSize:13,color:C.slate,fontWeight:600,fontFamily:F,lineHeight:1.4}}>{v}</span>
      </div>
    ))}
    <div style={{marginTop:20,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'14px 16px'}}>
      <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>✓ Your profile replaces your resume. We'll notify you the moment a role matches your criteria.</p>
    </div>
  </>;}

// ── Section registry ──────────────────────────────────────────────────────────
const SECTIONS=[
  {label:'Basic Info',   Comp:S1},{label:'Education',     Comp:S2},{label:'Work History', Comp:S3},
  {label:'Skills',       Comp:S4},{label:'Job Preferences',Comp:S5},{label:'Work Style',   Comp:S6},
  {label:'Personality',  Comp:S7},{label:'Goals',          Comp:S8},
];

// Derive approximate total years from jobs_history dates
function deriveExpYears(jobs:WorkJob[]):number{
  let total=0;
  for(const j of jobs){
    const parseDate=(s:string)=>{const[m,y]=s.split('/').map(Number);return isNaN(y)?null:new Date(y,(m||1)-1);};
    const start=parseDate(j.startDate);
    const end=j.current?new Date():parseDate(j.endDate);
    if(start&&end)total+=(end.getTime()-start.getTime())/(1000*60*60*24*365.25);
  }
  return Math.round(total)||0;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfileSurvey(){
  const {user,profile,loading,refreshProfile}=useUser();
  const router=useRouter();
  const supabase=useMemo(()=>createClient(),[]);
  const [showResume,setShowResume]=useState(false);
  const [step,setStep]=useState(0);
  const [data,setData]=useState<SurveyData>(INIT);
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState('');
  const [done,setDone]=useState(false);
  const [isEdit,setIsEdit]=useState(false);
  const total=SECTIONS.length;
  const isReview=step===total;

  useEffect(()=>{
    if(!profile)return;
    setIsEdit(!!profile.profile_complete);
    if(!profile.profile_complete)setShowResume(true);
    const fromProfile:SurveyData={
      firstName: profile.first_name??profile.name?.split(' ')[0]??'',
      lastName:  profile.last_name??profile.name?.split(' ').slice(1).join(' ')??'',
      email:     profile.email??'',
      phone:     profile.phone??'',
      location:  profile.location??'',
      zip:       profile.zip??'',
      workAuth:  profile.work_auth??'',
      eeoc:      (profile.eeoc as string[])??[],
      degrees:   (profile.degrees as Degree[])??[{...BLANK_DEGREE}],
      certs:     profile.certs??'',
      jobs:      (profile.jobs_history as WorkJob[])??[{...BLANK_JOB}],
      gaps:      profile.gaps??'',
      empStatus: profile.emp_status??'',
      skills:    (profile.skills as string[])??[],
      seniority: profile.seniority??'',
      industries:(profile.industries as string[])??[],
      targetTitles: Array.isArray(profile.target_titles)
        ?(profile.target_titles as string[])
        :(profile.target_titles?([(profile.target_titles as string)]):[]),
      idealSalary: profile.ideal_salary?Math.round(profile.ideal_salary/1000)
        :(profile.salary_max?Math.round(profile.salary_max/1000):100),
      minSalary: profile.min_salary?Math.round(profile.min_salary/1000)
        :(profile.salary_min?Math.round(profile.salary_min/1000):80),
      remotePreference:  profile.remote_preference??'',
      maxCommute:        profile.max_commute??30,
      employmentType:    (profile.employment_type as string[])??[],
      availability:      profile.availability??'',
      relocation:        profile.relocation??'',
      relocationRegions: profile.relocation_regions??'',
      travel:            profile.travel??'',
      companySize:       (profile.company_size as string[])??[],
      targetIndustries:  (profile.target_industries as string[])??[],
      targetCulture:     (profile.target_culture as string[])??[],
      mgmtStyle:    profile.mgmt_style??'',
      feedbackStyle:profile.feedback_pref??'',
      motivators:   (profile.motivators as string[])??[],
      personality:  (profile.personality as Record<string,number>)??{},
      primaryGoal:    profile.primary_goal??'',
      fiveYear:       profile.five_year??'',
      searchIntensity:profile.search_intensity??'',
      stayReasons:    (profile.stay_reasons as string[])??[],
      personalNote:   profile.bio??'',
    };
    if(!profile.profile_complete){
      try{const saved=localStorage.getItem(`matcht_profile_draft_${profile.id}`);if(saved){setData(JSON.parse(saved));return;}}catch{}
    }
    setData(fromProfile);
  },[profile?.id]);

  function go(n:number){
    const uid=profile?.id??user?.id;
    if(uid&&n>step){try{localStorage.setItem(`matcht_profile_draft_${uid}`,JSON.stringify(data));}catch{}}
    setStep(n);window.scrollTo({top:0,behavior:'smooth'});
  }

  async function submit(){
    const uid=profile?.id??user?.id;
    if(!uid)return;
    setSaving(true);setSaveError('');
    try{
      const totalExp=deriveExpYears(data.jobs)||null;
      const {error}=await supabase.from('profiles').upsert({
        id:uid,
        name:`${data.firstName} ${data.lastName}`.trim(),
        first_name:data.firstName,last_name:data.lastName,
        phone:data.phone||null,location:data.location||null,
        zip:data.zip||null,work_auth:data.workAuth||null,eeoc:data.eeoc,
        degrees:data.degrees,certs:data.certs||null,
        jobs_history:data.jobs,
        title:data.jobs[0]?.title||null,
        total_exp:totalExp,
        gaps:data.gaps||null,emp_status:data.empStatus||null,
        skills:data.skills,seniority:data.seniority||null,industries:data.industries,
        target_titles:data.targetTitles,
        ideal_salary:data.idealSalary*1000,
        min_salary:data.minSalary*1000,
        salary_min:data.minSalary*1000,
        salary_max:data.idealSalary*1000,
        salary_label:`$${data.minSalary}k–$${data.idealSalary}k`,
        remote_preference:data.remotePreference||null,
        max_commute:data.maxCommute,
        employment_type:data.employmentType,
        availability:data.availability||null,
        relocation:data.relocation||null,
        relocation_regions:data.relocationRegions||null,
        travel:data.travel||null,
        company_size:data.companySize,
        target_industries:data.targetIndustries,
        target_culture:data.targetCulture,
        mgmt_style:data.mgmtStyle||null,
        feedback_pref:data.feedbackStyle||null,
        motivators:data.motivators,
        personality:data.personality,
        primary_goal:data.primaryGoal||null,
        five_year:data.fiveYear||null,
        search_intensity:data.searchIntensity||null,
        stay_reasons:data.stayReasons,
        bio:data.personalNote||null,
        profile_complete:true,
        updated_at:new Date().toISOString(),
      });
      if(error)throw error;
      fetch('/api/match-scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seekerId:uid})});
      if(!profile?.profile_complete){
        fetch('/api/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'seeker-welcome',seekerId:uid})});
      }
      await refreshProfile();
      try{localStorage.removeItem(`matcht_profile_draft_${uid}`);}catch{}
      setDone(true);
    }catch(err:unknown){
      setSaveError((err as Error)?.message||'Save failed. Your answers are preserved — please try again.');
    }finally{setSaving(false);}
  }

  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',fontFamily:F,color:C.teal}}>Loading…</div>;

  if(done)return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',maxWidth:400}}>
        <div style={{fontSize:52,marginBottom:14}}>{isEdit?'✓':'🎉'}</div>
        <h1 style={{fontSize:24,fontWeight:800,color:C.slate,margin:'0 0 10px',letterSpacing:-0.5}}>{isEdit?'Profile updated.':'You\'re live.'}</h1>
        <p style={{color:C.gray600,fontSize:15,lineHeight:1.65,margin:'0 0 22px'}}>{isEdit?'Your changes are saved. Match scores will refresh shortly.':'Your profile is live. We\'ll notify you the moment a role matches. No applying. No forms. Just matches.'}</p>
        {!isEdit&&<div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:'16px 18px',marginBottom:20}}><p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0}}>Add a video intro to boost your visibility 4×. Takes 3 minutes.</p></div>}
        <button onClick={()=>router.push('/dashboard')} style={{padding:'12px 28px',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F}}>{isEdit?'Back to my matches →':'Go to my matches →'}</button>
      </div>
    </div>
  );

  if(showResume)return<ResumeUpload onSkip={()=>setShowResume(false)}/>;

  const SecComp=!isReview?SECTIONS[step].Comp:null;
  return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,paddingBottom:80}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:24,height:24,borderRadius:5,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:10,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:14,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
          <span style={{fontSize:11,color:C.gray400}}>/ Your Profile</span>
        </div>
        <span style={{fontSize:12,color:C.gray600,fontWeight:600}}>{isReview?'Review & submit':`${step+1} of ${total} — ${SECTIONS[step].label}`}</span>
      </div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 20px',overflowX:'auto'}}>
        <div style={{display:'flex',minWidth:'fit-content'}}>
          {SECTIONS.map((s,i)=>(
            <button key={i} onClick={()=>go(i)} style={{padding:'9px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${i===step?C.teal:'transparent'}`,color:i===step?C.teal:i<step?C.green:C.gray400,fontWeight:i===step?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4}}>
              {i<step&&<span style={{fontSize:9}}>✓</span>}{s.label}
            </button>
          ))}
          <button onClick={()=>go(total)} style={{padding:'9px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${isReview?C.teal:'transparent'}`,color:isReview?C.teal:C.gray400,fontWeight:isReview?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Review</button>
        </div>
      </div>
      <div style={{maxWidth:640,margin:'28px auto 0',padding:'0 16px'}}>
        <Progress step={step} total={total}/>
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'26px 24px',marginBottom:14}}>
          {isReview?<ReviewScreen data={data}/>:SecComp&&<SecComp d={data} set={setData}/>}
        </div>
        {saveError&&<div style={{color:C.red,fontSize:13,padding:'9px 12px',background:'#FDF2F2',border:`1px solid ${C.red}44`,borderRadius:7,marginBottom:8,fontFamily:F}}>⚠ {saveError}</div>}
        <div style={{display:'flex',gap:9}}>
          {step>0&&<button onClick={()=>go(step-1)} style={{flex:1,padding:'11px 0',borderRadius:8,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:F}}>← Back</button>}
          {!isReview
            ?<button onClick={()=>go(step+1)} style={{flex:2,padding:'11px 0',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F}}>{step<total-1?'Continue →':'Review my profile →'}</button>
            :<button onClick={submit} disabled={saving} style={{flex:2,padding:'11px 0',borderRadius:8,background:saving?C.gray400:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:14,cursor:saving?'default':'pointer',fontFamily:F}}>{saving?'Saving…':isEdit?'Save changes →':'Submit & go live →'}</button>}
        </div>
      </div>
    </div>
  );
}

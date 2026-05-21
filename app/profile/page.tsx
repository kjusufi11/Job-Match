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

const C = {
  bg:'#F0F4F7',white:'#FFFFFF',teal:'#1A8C8C',tealDim:'#1A8C8C12',tealBorder:'#1A8C8C35',
  slate:'#1E2D3A',gray100:'#E3ECF1',gray200:'#C8D8E4',gray400:'#8FAABB',gray600:'#4E6475',
  gray800:'#2B3D4D',border:'#D4E3EC',green:'#19A87A',greenDim:'#19A87A14',
  amber:'#C9870C',amberDim:'#C9870C14',red:'#C0392B',redDim:'#C0392B14',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

type Degree  = { level:string; field:string; university:string; gradYear:string; current:boolean };
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
type SetData  = React.Dispatch<React.SetStateAction<SurveyData>>;
type SecProps = { d:SurveyData; set:SetData };

const BLANK_DEGREE: Degree  = { level:'', field:'', university:'', gradYear:'', current:false };
const BLANK_JOB:   WorkJob  = { company:'', title:'', startDate:'', endDate:'', current:false, responsibilities:'', accomplishments:'' };
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

// ── UI primitives ─────────────────────────────────────────────────────────
function SLabel({c}:{c:React.ReactNode}){return<div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6,fontFamily:F}}>{c}</div>;}
function QLabel({c,req}:{c:React.ReactNode;req?:boolean}){return<div style={{fontSize:15,fontWeight:600,color:C.slate,marginBottom:8,fontFamily:F,lineHeight:1.4}}>{c}{req&&<span style={{color:C.red,marginLeft:3}}>*</span>}</div>;}
function Sub({c}:{c:React.ReactNode}){return<div style={{fontSize:13,color:C.gray600,marginBottom:12,fontFamily:F,lineHeight:1.55}}>{c}</div>;}
function HR(){return<div style={{borderTop:`1px solid ${C.border}`,margin:'24px 0'}}/>;}

function FInput({value,onChange,placeholder,type='text',disabled,style={}}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;disabled?:boolean;style?:React.CSSProperties}){
  return<input type={type} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:disabled?C.gray100:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,...style}}/>;
}
function FTA({value,onChange,placeholder,rows=3}:{value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number}){
  return<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,resize:'vertical',lineHeight:1.6}}/>;
}
function FSel({value,onChange,options,placeholder}:{value:string;onChange:(v:string)=>void;options:string[];placeholder?:string}){
  return<select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'10px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:value?C.slate:C.gray400,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,cursor:'pointer'}}>
    <option value="">{placeholder||'Select...'}</option>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>;
}
function Radio({options,value,onChange}:{options:string[];value:string;onChange:(v:string)=>void}){
  return<div style={{display:'flex',flexDirection:'column',gap:8}}>
    {options.map(o=><button key={o} onClick={()=>onChange(o)} style={{background:value===o?C.tealDim:C.bg,border:`1.5px solid ${value===o?C.teal:C.border}`,borderRadius:9,padding:'11px 14px',color:value===o?C.teal:C.gray600,fontWeight:value===o?600:400,fontSize:14,cursor:'pointer',textAlign:'left',fontFamily:F,transition:'all .15s',display:'flex',alignItems:'center',gap:10}}>
      <span style={{width:16,height:16,minWidth:16,borderRadius:'50%',border:`2px solid ${value===o?C.teal:C.gray200}`,background:value===o?C.teal:'transparent',display:'inline-block',transition:'all .15s'}}/>
      {o}
    </button>)}
  </div>;
}
function Pills({options,values,onChange,max}:{options:string[];values:string[];onChange:(v:string[])=>void;max?:number}){
  function toggle(v:string){if(values.includes(v))onChange(values.filter(x=>x!==v));else if(!max||values.length<max)onChange([...values,v]);}
  return<div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {options.map(o=><button key={o} onClick={()=>toggle(o)} style={{padding:'7px 14px',borderRadius:20,background:values.includes(o)?C.tealDim:C.bg,border:`1.5px solid ${values.includes(o)?C.teal:C.border}`,color:values.includes(o)?C.teal:C.gray600,fontWeight:values.includes(o)?700:400,fontSize:13,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{o}</button>)}
  </div>;
}

function MultiDropdown({options,values,onChange,placeholder}:{options:string[];values:string[];onChange:(v:string[])=>void;placeholder?:string}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const ref=useRef<HTMLDivElement>(null);
  const filtered=options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  useEffect(()=>{
    function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  function toggle(o:string){if(values.includes(o))onChange(values.filter(x=>x!==o));else onChange([...values,o]);}
  return<div ref={ref} style={{position:'relative'}}>
    <div onClick={()=>setOpen(o=>!o)} style={{minHeight:44,padding:'8px 13px',borderRadius:8,background:C.bg,border:`1.5px solid ${open?C.teal:C.border}`,cursor:'pointer',display:'flex',flexWrap:'wrap',gap:5,alignItems:'center',transition:'border-color .15s'}}>
      {values.length===0&&<span style={{color:C.gray400,fontSize:14,fontFamily:F}}>{placeholder}</span>}
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'2px 10px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>{v}<span onClick={e=>{e.stopPropagation();toggle(v);}} style={{cursor:'pointer',fontWeight:800,fontSize:14,lineHeight:1}}>×</span></span>)}
      <span style={{marginLeft:'auto',color:C.gray400,fontSize:11}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:4,zIndex:60,boxShadow:'0 4px 24px rgba(0,0,0,.1)',maxHeight:260,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`}}><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:'100%',padding:'7px 10px',borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.slate,fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:F}}/></div>
      <div style={{overflowY:'auto',flex:1}}>
        {filtered.map(o=><div key={o} onClick={()=>toggle(o)} style={{padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:9,background:values.includes(o)?C.tealDim:'transparent'}}>
          <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{values.includes(o)&&<span style={{color:C.white,fontSize:9,fontWeight:800}}>✓</span>}</div>
          <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F}}>{o}</span>
        </div>)}
        {filtered.length===0&&<div style={{padding:'16px',color:C.gray400,fontSize:13,textAlign:'center',fontFamily:F}}>No results</div>}
      </div>
    </div>}
  </div>;
}

function TagInput({values,onChange,suggestions,placeholder,max}:{values:string[];onChange:(v:string[])=>void;suggestions:string[];placeholder?:string;max?:number}){
  const [input,setInput]=useState('');
  const [showSug,setShowSug]=useState(false);
  const containerRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null);
  const filtered=input.length>1?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())&&!values.includes(s)).slice(0,8):[];
  useEffect(()=>{
    function h(e:MouseEvent){if(containerRef.current&&!containerRef.current.contains(e.target as Node))setShowSug(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  function add(val:string){const v=val.trim();if(!v||values.includes(v)||(max&&values.length>=max))return;onChange([...values,v]);setInput('');setShowSug(false);}
  function remove(v:string){onChange(values.filter(x=>x!==v));}
  return<div ref={containerRef} style={{position:'relative'}}>
    <div style={{minHeight:46,padding:'7px 10px',borderRadius:8,background:C.bg,border:`1.5px solid ${showSug?C.teal:C.border}`,display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',cursor:'text',transition:'border-color .15s'}} onClick={()=>inputRef.current?.focus()}>
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'4px 11px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:5,lineHeight:1}}>
        {v}<span onClick={()=>remove(v)} style={{cursor:'pointer',fontWeight:800,fontSize:13,lineHeight:1,opacity:.7}}>×</span>
      </span>)}
      <input ref={inputRef} value={input} onChange={e=>{setInput(e.target.value);setShowSug(true);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add(input);}if(e.key==='Backspace'&&!input&&values.length)remove(values[values.length-1]);}} onFocus={()=>setShowSug(true)} placeholder={values.length===0?placeholder:''} style={{border:'none',outline:'none',background:'none',fontSize:13,color:C.slate,fontFamily:F,minWidth:140,flex:1,padding:'2px 0'}}/>
    </div>
    {showSug&&filtered.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:3,zIndex:60,boxShadow:'0 4px 20px rgba(0,0,0,.1)',maxHeight:220,overflowY:'auto'}}>
      {filtered.map(s=><div key={s} onClick={()=>add(s)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}}
        onMouseEnter={e=>(e.currentTarget.style.background=C.tealDim)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{s}</div>)}
      {input.length>1&&!suggestions.find(s=>s.toLowerCase()===input.toLowerCase())&&
        <div onClick={()=>add(input)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.teal,fontWeight:600,fontFamily:F,borderTop:`1px solid ${C.border}`}}>+ Add "{input}"</div>}
    </div>}
  </div>;
}

function ACInput({value,onChange,suggestions,placeholder}:{value:string;onChange:(v:string)=>void;suggestions:string[];placeholder?:string}){
  const [input,setInput]=useState(value||'');
  const [show,setShow]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const filtered=input.length>1?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())).slice(0,8):[];
  useEffect(()=>{
    function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setShow(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  function select(v:string){setInput(v);onChange(v);setShow(false);}
  return<div ref={ref} style={{position:'relative'}}>
    <FInput value={input} onChange={v=>{setInput(v);onChange(v);setShow(true);}} placeholder={placeholder}/>
    {show&&filtered.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:8,marginTop:3,zIndex:60,boxShadow:'0 4px 20px rgba(0,0,0,.1)',maxHeight:200,overflowY:'auto'}}>
      {filtered.map(s=><div key={s} onClick={()=>select(s)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}}
        onMouseEnter={e=>(e.currentTarget.style.background=C.tealDim)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{s}</div>)}
    </div>}
  </div>;
}

function ScaleQ({question,low,high,value,onChange}:{question:string;low:string;high:string;value:number|undefined;onChange:(v:number)=>void}){
  return<div style={{marginBottom:16,padding:'16px',background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
    <div style={{fontSize:14,fontWeight:600,color:C.slate,marginBottom:12,fontFamily:F,lineHeight:1.45}}>{question}</div>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontSize:11,color:C.gray600,width:100,flexShrink:0,lineHeight:1.3,textAlign:'right'}}>{low}</span>
      <div style={{display:'flex',gap:6,flex:1}}>
        {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,height:38,borderRadius:8,border:`1.5px solid ${value===n?C.teal:C.border}`,background:value===n?C.teal:C.white,color:value===n?C.white:C.gray600,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{n}</button>)}
      </div>
      <span style={{fontSize:11,color:C.gray600,width:100,flexShrink:0,textAlign:'left',lineHeight:1.3}}>{high}</span>
    </div>
  </div>;
}

function Slider({value,onChange,min,max,step=1,format}:{value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;format:(v:number)=>string}){
  return<div>
    <div style={{textAlign:'center',marginBottom:6}}><span style={{fontSize:22,fontWeight:800,color:C.teal,fontFamily:F}}>{format(value)}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={{width:'100%',accentColor:C.teal,cursor:'pointer'}}/>
    <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
      <span style={{fontSize:11,color:C.gray400,fontFamily:F}}>{format(min)}</span>
      <span style={{fontSize:11,color:C.gray400,fontFamily:F}}>{format(max)}</span>
    </div>
  </div>;
}

function Progress({step,total}:{step:number;total:number}){
  const pct=Math.round((step/total)*100);
  return<div style={{marginBottom:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={{fontSize:12,color:C.gray600,fontFamily:F}}>{step<total?`Section ${step+1} of ${total}`:' Review & submit'}</span>
      <span style={{fontSize:12,fontWeight:700,color:C.teal,fontFamily:F}}>{pct}%</span>
    </div>
    <div style={{height:5,background:C.gray100,borderRadius:4,overflow:'hidden'}}>
      <div style={{width:`${pct}%`,height:'100%',borderRadius:4,background:`linear-gradient(90deg,${C.teal},#2AADAD)`,transition:'width .4s cubic-bezier(.4,0,.2,1)'}}/>
    </div>
    <div style={{display:'flex',gap:3,marginTop:6}}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{flex:1,height:3,borderRadius:3,background:i<step?C.teal:i===step?`${C.teal}55`:C.gray100,transition:'background .3s'}}/>
      ))}
    </div>
  </div>;
}

function Block({children,onRemove,canRemove,label}:{children:React.ReactNode;onRemove:()=>void;canRemove:boolean;label?:string}){
  return<div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:'18px 18px 14px',marginBottom:12,position:'relative'}}>
    {label&&<div style={{fontWeight:700,fontSize:11,color:C.teal,marginBottom:12,fontFamily:F,textTransform:'uppercase',letterSpacing:0.8}}>{label}</div>}
    {canRemove&&<button onClick={onRemove} style={{position:'absolute',top:14,right:14,background:C.redDim,border:`1px solid ${C.red}33`,borderRadius:6,color:C.red,fontSize:11,cursor:'pointer',padding:'3px 8px',fontWeight:700,fontFamily:F}}>Remove</button>}
    {children}
  </div>;
}

// ── Resume upload ─────────────────────────────────────────────────────────
function ResumeUpload({onSkip}:{onSkip:()=>void}){
  const [dragging,setDragging]=useState(false);
  const [file,setFile]=useState<File|null>(null);
  const ref=useRef<HTMLInputElement>(null);
  function handleFile(f:File|null){if(f&&(f.type==='application/pdf'||f.name.endsWith('.docx')))setFile(f);}
  return<div style={{background:C.bg,minHeight:'100vh',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
    <div style={{maxWidth:520,width:'100%'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20}}>
          <div style={{width:28,height:28,borderRadius:6,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:16,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
        </div>
        <h1 style={{fontSize:28,fontWeight:800,color:C.slate,margin:'0 0 12px',letterSpacing:-0.5,lineHeight:1.2}}>Got a resume?<br/>Let's use it one last time.</h1>
        <p style={{fontSize:15,color:C.gray600,margin:'0 auto',lineHeight:1.65,maxWidth:400}}>Upload it and we'll pre-fill your profile. After this, your Matcht profile does the work — no resume needed.</p>
      </div>
      <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'24px 22px'}}>
        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]??null);}} onClick={()=>ref.current?.click()} style={{border:`2px dashed ${dragging?C.teal:C.gray200}`,borderRadius:12,padding:'44px 24px',textAlign:'center',cursor:'pointer',background:dragging?C.tealDim:C.bg,transition:'all .2s'}}>
          <input ref={ref} type="file" accept=".pdf,.docx" onChange={e=>handleFile(e.target.files?.[0]??null)} style={{display:'none'}}/>
          {file
            ?<><div style={{fontSize:36,marginBottom:8}}>📄</div><div style={{fontWeight:700,fontSize:15,color:C.teal,marginBottom:4}}>{file.name}</div><div style={{fontSize:13,color:C.gray400}}>Ready</div></>
            :<><div style={{fontSize:36,marginBottom:10}}>📎</div><div style={{fontWeight:600,fontSize:15,color:C.slate,marginBottom:6}}>Drop your resume here</div><div style={{fontSize:13,color:C.gray400,marginBottom:12}}>or click to browse</div><div style={{fontSize:12,color:C.gray400}}>PDF or Word · Max 10MB</div></>}
        </div>
        {file&&<button onClick={onSkip} style={{width:'100%',padding:'13px 0',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:F,marginTop:14}}>Continue →</button>}
        <button onClick={onSkip} style={{width:'100%',padding:'11px 0',borderRadius:8,background:'none',border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginTop:8}}>
          {file?'Skip — fill in manually':'Start fresh — no resume'}
        </button>
      </div>
      <p style={{textAlign:'center',fontSize:12,color:C.gray400,marginTop:14}}>Your resume is only used to pre-fill — never shared with employers.</p>
    </div>
  </div>;
}

// ── Survey sections ───────────────────────────────────────────────────────
function S1({d,set}:SecProps){return<>
  <SLabel c="Section 1"/>
  <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Basic Information</h2>
  <Sub c="The fundamentals — used for location-based matching and contact."/>
  <HR/>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
    <div><QLabel c="First name" req/><FInput value={d.firstName} onChange={v=>set(x=>({...x,firstName:v}))} placeholder="Jane"/></div>
    <div><QLabel c="Last name" req/><FInput value={d.lastName} onChange={v=>set(x=>({...x,lastName:v}))} placeholder="Smith"/></div>
  </div>
  <div style={{marginBottom:16}}><QLabel c="Email address" req/><FInput value={d.email} onChange={v=>set(x=>({...x,email:v}))} placeholder="jane@example.com" type="email"/></div>
  <div style={{marginBottom:16}}><QLabel c="Phone number"/><FInput value={d.phone} onChange={v=>set(x=>({...x,phone:v}))} placeholder="+1 (555) 000-0000"/></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14,marginBottom:16}}>
    <div><QLabel c="City & state" req/><FInput value={d.location} onChange={v=>set(x=>({...x,location:v}))} placeholder="Chicago, IL"/></div>
    <div><QLabel c="ZIP code" req/><FInput value={d.zip} onChange={v=>set(x=>({...x,zip:v}))} placeholder="60601"/></div>
  </div>
  <HR/>
  <QLabel c="Legally authorized to work in the United States?" req/>
  <Radio options={['Yes, without sponsorship','Yes, but I require sponsorship','No']} value={d.workAuth} onChange={v=>set(x=>({...x,workAuth:v}))}/>
  <HR/>
  <QLabel c={<>Veteran / disability status <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(optional)</span></>}/>
  <Sub c="Used only for EEOC reporting — no effect on your match score."/>
  <Pills options={['U.S. Military Veteran','Person with a disability','Not a veteran / does not apply','Prefer not to answer']} values={d.eeoc} onChange={v=>set(x=>({...x,eeoc:v}))}/>
</>;}

function S2({d,set}:SecProps){
  function addDeg(){set(x=>({...x,degrees:[...x.degrees,{...BLANK_DEGREE}]}));}
  function updDeg(i:number,f:keyof Degree,v:string|boolean){set(x=>({...x,degrees:x.degrees.map((d,idx)=>idx===i?{...d,[f]:v}:d)}));}
  function remDeg(i:number){set(x=>({...x,degrees:x.degrees.filter((_,idx)=>idx!==i)}));}
  const hasDeg=(l:string)=>["Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree","PhD or Doctorate","Associate's degree"].includes(l);
  return<>
    <SLabel c="Section 2"/>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Education</h2>
    <Sub c="Add all degrees. You don't need a degree to use Matcht — this is for matching accuracy only."/>
    <HR/>
    {d.degrees.map((deg,i)=><Block key={i} onRemove={()=>remDeg(i)} canRemove={d.degrees.length>1} label={`Degree ${i+1}`}>
      <div style={{marginBottom:12}}><QLabel c="Level"/><FSel value={deg.level} onChange={v=>updDeg(i,'level',v)} options={EDUCATION_LEVELS_SEEKER} placeholder="Select level..."/></div>
      {hasDeg(deg.level)&&<>
        <div style={{marginBottom:12}}><QLabel c="Field of study / Major"/><FInput value={deg.field} onChange={v=>updDeg(i,'field',v)} placeholder="e.g. Computer Science, Finance"/></div>
        <div style={{marginBottom:12}}><QLabel c="University or institution"/><ACInput value={deg.university} onChange={v=>updDeg(i,'university',v)} suggestions={UNIVERSITIES} placeholder="Start typing your school..."/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div><QLabel c="Graduation year"/><FInput value={deg.gradYear} onChange={v=>updDeg(i,'gradYear',v)} placeholder="e.g. 2018"/></div>
          <div style={{paddingTop:30}}><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={deg.current} onChange={e=>updDeg(i,'current',e.target.checked)} style={{accentColor:C.teal,width:15,height:15}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>Currently enrolled</span></label></div>
        </div>
      </>}
    </Block>)}
    <button onClick={addDeg} style={{width:'100%',padding:'11px 0',borderRadius:8,background:'none',border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginBottom:20}}>+ Add another degree</button>
    <HR/>
    <QLabel c="Professional certifications or licenses"/>
    <Sub c="Any not captured above — separate with commas."/>
    <FInput value={d.certs} onChange={v=>set(x=>({...x,certs:v}))} placeholder="e.g. PMP, CPA, AWS Solutions Architect, Series 7"/>
  </>;}

function S3({d,set}:SecProps){
  function addJob(){set(x=>({...x,jobs:[...x.jobs,{...BLANK_JOB}]}));}
  function updJob(i:number,f:keyof WorkJob,v:string|boolean){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,[f]:v}:j)}));}
  function remJob(i:number){set(x=>({...x,jobs:x.jobs.filter((_,idx)=>idx!==i)}));}
  return<>
    <SLabel c="Section 3"/>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Work History</h2>
    <Sub c="Start with your most recent role. This replaces a resume — be thorough."/>
    <HR/>
    {d.jobs.map((job,i)=><Block key={i} onRemove={()=>remJob(i)} canRemove={d.jobs.length>1} label={i===0?'Most recent role':`Role ${i+1}`}>
      <div style={{marginBottom:12}}><QLabel c="Job title" req/><FInput value={job.title} onChange={v=>updJob(i,'title',v)} placeholder="e.g. Senior Product Manager"/></div>
      <div style={{marginBottom:12}}><QLabel c="Company" req/><FInput value={job.company} onChange={v=>updJob(i,'company',v)} placeholder="e.g. Acme Corp"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:8}}>
        <div><QLabel c="Start date"/><FInput value={job.startDate} onChange={v=>updJob(i,'startDate',v)} placeholder="MM/YYYY"/></div>
        <div><QLabel c="End date"/><FInput value={job.endDate} onChange={v=>updJob(i,'endDate',v)} placeholder="MM/YYYY" disabled={job.current}/></div>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:14}}><input type="checkbox" checked={job.current} onChange={e=>updJob(i,'current',e.target.checked)} style={{accentColor:C.teal,width:15,height:15}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>I currently work here</span></label>
      <div style={{marginBottom:12}}><QLabel c="Key responsibilities"/><FTA value={job.responsibilities} onChange={v=>updJob(i,'responsibilities',v)} placeholder="What did you own? What were your core duties?" rows={3}/></div>
      <QLabel c="Key accomplishments"/><FTA value={job.accomplishments} onChange={v=>updJob(i,'accomplishments',v)} placeholder="What did you achieve? Use numbers — e.g. grew revenue 40%, reduced churn 12%..." rows={3}/>
    </Block>)}
    <button onClick={addJob} style={{width:'100%',padding:'11px 0',borderRadius:8,background:'none',border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:F,marginBottom:20}}>+ Add another role</button>
    <HR/>
    <QLabel c={<>Gaps in work history? <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(optional)</span></>}/>
    <FTA value={d.gaps} onChange={v=>set(x=>({...x,gaps:v}))} placeholder="e.g. Took time off for family, freelanced, traveled..." rows={2}/>
    <HR/>
    <QLabel c="Current employment status"/>
    <Radio options={['Employed full-time','Employed part-time','Self-employed / Freelance','Currently unemployed','Student','Career break']} value={d.empStatus} onChange={v=>set(x=>({...x,empStatus:v}))}/>
  </>;}

function S4({d,set}:SecProps){return<>
  <SLabel c="Section 4"/>
  <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Skills</h2>
  <Sub c="Type any skill and press Enter. Be honest — overstating leads to bad matches."/>
  <HR/>
  <QLabel c="Your skills" req/>
  <Sub c="All skills in one place — technical, soft, and domain-specific. Type + Enter to add each one."/>
  <TagInput values={d.skills} onChange={v=>set(x=>({...x,skills:v}))} suggestions={SKILL_SUGGESTIONS} placeholder="e.g. Product Management, SQL, Leadership, Figma..."/>
  {d.skills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:8,fontFamily:F}}>{d.skills.length} skill{d.skills.length===1?'':'s'} added</div>}
  <HR/>
  <QLabel c="Overall experience level" req/>
  <Radio options={['Entry — building foundational skills','Mid-level — solid independent contributor','Senior — deep expertise, sometimes leads others','Lead / Principal — sets direction, mentors others','Executive — organizational leadership']} value={d.seniority} onChange={v=>set(x=>({...x,seniority:v}))}/>
  <HR/>
  <QLabel c="Industries you've worked in"/>
  <MultiDropdown options={INDUSTRIES} values={d.industries} onChange={v=>set(x=>({...x,industries:v}))} placeholder="Search and select industries..."/>
  {d.industries.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:8,fontFamily:F}}>{d.industries.length} selected</div>}
</>;}

function S5({d,set}:SecProps){
  const fmtS=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const fmtC=(v:number)=>v>=90?'90+ min':`${v} min`;
  return<>
    <SLabel c="Section 5"/>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Job Preferences</h2>
    <Sub c="Your ranges and non-negotiables. These filter out mismatches before you ever see them."/>
    <HR/>
    <QLabel c="Target job titles" req/>
    <Sub c="Add each title as a tag — press Enter after each one."/>
    <TagInput values={d.targetTitles} onChange={v=>set(x=>({...x,targetTitles:v}))} suggestions={TITLE_SUGGESTIONS} placeholder="e.g. Senior Product Manager, Director of Operations..."/>
    <HR/>
    <QLabel c={<>Ideal salary <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(base pay)</span></>} req/>
    <Sub c="The number you'd be excited about."/>
    <Slider value={d.idealSalary} onChange={v=>set(x=>({...x,idealSalary:v}))} min={30} max={500} step={5} format={fmtS}/>
    <div style={{marginTop:24}}>
      <QLabel c={<>Minimum acceptable salary <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(base pay)</span></>} req/>
      <Sub c="Your floor — we won't show you anything below this."/>
      <Slider value={d.minSalary} onChange={v=>set(x=>({...x,minSalary:Math.min(v,d.idealSalary)}))} min={30} max={500} step={5} format={fmtS}/>
    </div>
    <HR/>
    <QLabel c="Remote work preference" req/>
    <Radio options={['Remote only — I will not commute','Strongly prefer remote, open to occasional on-site','Hybrid — mix of remote and office is ideal','Flexible — whatever the role requires','On-site preferred']} value={d.remotePreference} onChange={v=>set(x=>({...x,remotePreference:v}))}/>
    {d.remotePreference&&!d.remotePreference.includes('Remote only')&&<div style={{marginTop:18}}>
      <QLabel c="Maximum one-way commute time"/>
      <Slider value={d.maxCommute} onChange={v=>set(x=>({...x,maxCommute:v}))} min={10} max={90} step={5} format={fmtC}/>
    </div>}
    <HR/>
    <QLabel c="Employment type" req/>
    <Pills options={EMPLOYMENT_TYPES} values={d.employmentType} onChange={v=>set(x=>({...x,employmentType:v}))}/>
    <HR/>
    <QLabel c="When can you start?" req/>
    <Radio options={['Immediately (within 2 weeks)','Within 1 month','1–3 months','3–6 months','Exploring — no fixed timeline']} value={d.availability} onChange={v=>set(x=>({...x,availability:v}))}/>
    <HR/>
    <QLabel c="Open to relocation?"/>
    <Radio options={['No — staying where I am','Yes — anywhere','Yes — specific regions only']} value={d.relocation} onChange={v=>set(x=>({...x,relocation:v}))}/>
    {d.relocation==='Yes — specific regions only'&&<div style={{marginTop:10}}><FInput value={d.relocationRegions} onChange={v=>set(x=>({...x,relocationRegions:v}))} placeholder="e.g. Southeast US, New York metro, Pacific Northwest"/></div>}
    <HR/>
    <QLabel c="Willing to travel?"/>
    <Radio options={TRAVEL_LEVELS} value={d.travel} onChange={v=>set(x=>({...x,travel:v}))}/>
    <HR/>
    <QLabel c="Preferred company size"/>
    <Pills options={['Startup (1–50)','Small (51–200)','Mid-size (201–1,000)','Large (1,001–10,000)','Enterprise (10,000+)','No preference']} values={d.companySize} onChange={v=>set(x=>({...x,companySize:v}))}/>
    <HR/>
    <QLabel c="Target industries"/>
    <Sub c="Leave blank to stay open to all."/>
    <MultiDropdown options={INDUSTRIES} values={d.targetIndustries} onChange={v=>set(x=>({...x,targetIndustries:v}))} placeholder="Search and select..."/>
    {d.targetIndustries.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:8,fontFamily:F}}>{d.targetIndustries.length} selected</div>}
  </>;}

function S6({d,set}:SecProps){return<>
  <SLabel c="Section 6"/>
  <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Work Style & Culture</h2>
  <Sub c="Matched directly against how companies describe themselves. The more honest, the better your matches."/>
  <HR/>
  <QLabel c="What kind of culture are you looking for?" req/>
  <Sub c="These exact descriptors are what companies use to describe their teams."/>
  <Pills options={CULTURE_DESCRIPTORS} values={d.targetCulture} onChange={v=>set(x=>({...x,targetCulture:v}))}/>
  <HR/>
  <QLabel c="Preferred management style" req/>
  <Radio options={MGMT_STYLES} value={d.mgmtStyle} onChange={v=>set(x=>({...x,mgmtStyle:v}))}/>
  <HR/>
  <QLabel c="How do you prefer to receive feedback?" req/>
  <Radio options={['Real-time — as I go','Regular check-ins (weekly or bi-weekly)','Formal periodic reviews (quarterly)','Self-directed — I ask when I need it']} value={d.feedbackStyle} onChange={v=>set(x=>({...x,feedbackStyle:v}))}/>
  <HR/>
  <QLabel c={<>What motivates you most? <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(pick up to 3)</span></>}/>
  <Pills options={['Meaningful impact / mission','Career growth & advancement','Compensation & financial rewards','Learning new skills','Creative freedom','Team & culture','Flexibility & autonomy','Recognition & visibility','Stability & security']} values={d.motivators} onChange={v=>set(x=>({...x,motivators:v}))} max={3}/>
  <div style={{fontSize:12,color:C.gray400,marginTop:8,fontFamily:F}}>{d.motivators.length}/3 selected</div>
</>;}

function S7({d,set}:SecProps){return<>
  <SLabel c="Section 7"/>
  <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Personality Profile</h2>
  <Sub c="Matched against what employers describe for their roles. No right or wrong answers."/>
  <HR/>
  <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'12px 16px',marginBottom:20}}>
    <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>Rate yourself 1–5. 1 = strongly left description, 5 = strongly right, 3 = balanced.</p>
  </div>
  {PERSONALITY_DIMS_SEEKER.map(q=><ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality[q.id]} onChange={v=>set(x=>({...x,personality:{...x.personality,[q.id]:v}}))}/>)}
</>;}

function S8({d,set}:SecProps){return<>
  <SLabel c="Section 8"/>
  <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Career Goals</h2>
  <Sub c="Understanding where you're headed helps us match you to roles that move you forward."/>
  <HR/>
  <QLabel c="Primary goal right now" req/>
  <Radio options={['Find a better-paying role','Advance to a more senior position','Switch industries or functions','Find better work-life balance','Return to work after a break','Find more stability or security','Find more meaningful / mission-driven work','Still exploring — not sure yet']} value={d.primaryGoal} onChange={v=>set(x=>({...x,primaryGoal:v}))}/>
  <HR/>
  <QLabel c="Where do you see yourself in 3–5 years?"/>
  <Radio options={['In a leadership or management role','Deep subject-matter expert / individual contributor','Running my own business or freelancing','Still growing in my current function','Not sure yet — exploring']} value={d.fiveYear} onChange={v=>set(x=>({...x,fiveYear:v}))}/>
  <HR/>
  <QLabel c="How actively are you searching right now?"/>
  <Radio options={['Actively — I want to move fast','Open to the right opportunity — not in a rush','Passively exploring — not actively applying','Employed and happy, but curious']} value={d.searchIntensity} onChange={v=>set(x=>({...x,searchIntensity:v}))}/>
  <HR/>
  <QLabel c="What would make you stay at your current job?"/>
  <Pills options={["Significant salary increase","Promotion or title change","More flexibility / remote options","Better management or culture","Nothing — I'm ready to leave","Not applicable"]} values={d.stayReasons} onChange={v=>set(x=>({...x,stayReasons:v}))}/>
  <HR/>
  <QLabel c={<>Anything else you'd like employers to know? <span style={{fontSize:12,fontWeight:400,color:C.gray400}}>(optional)</span></>}/>
  <Sub c="Your personal note — the human part a resume never captures."/>
  <FTA value={d.personalNote} onChange={v=>set(x=>({...x,personalNote:v}))} placeholder="e.g. Relocating to Austin in Q3. Looking for a company that values autonomy..." rows={4}/>
</>;}

function ReviewScreen({data}:{data:SurveyData}){
  const fmt=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const j=data.jobs[0];
  const rows:[string,string][]=[
    ['Name',`${data.firstName} ${data.lastName}`.trim()],
    ['Location',data.location],
    ['Work auth',data.workAuth],
    ['Most recent role',j?`${j.title} at ${j.company}`:''],
    ['Education',data.degrees[0]?.level??''],
    ['Skills',data.skills.length?`${data.skills.length} added — ${data.skills.slice(0,3).join(', ')}${data.skills.length>3?'...':''}`:'-'],
    ['Target titles',data.targetTitles.join(', ')||'-'],
    ['Ideal salary',data.idealSalary?fmt(data.idealSalary):'-'],
    ['Min salary',data.minSalary?fmt(data.minSalary):'-'],
    ['Remote pref',data.remotePreference||'-'],
    ['Availability',data.availability||'-'],
    ['Culture',data.targetCulture.slice(0,3).join(', ')||'-'],
    ['Mgmt style',data.mgmtStyle||'-'],
    ['Primary goal',data.primaryGoal||'-'],
    ['Search status',data.searchIntensity||'-'],
  ];
  return<>
    <SLabel c="Review"/>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 4px',letterSpacing:-0.5,fontFamily:F}}>Review your profile</h2>
    <Sub c="Once submitted, your profile goes live and matching begins immediately. You can edit anytime."/>
    <HR/>
    {rows.filter(([,v])=>v&&v!=='-').map(([l,v])=>(
      <div key={l} style={{display:'flex',borderBottom:`1px solid ${C.border}`,padding:'11px 0',gap:12}}>
        <span style={{fontSize:13,color:C.gray600,width:130,flexShrink:0,fontFamily:F}}>{l}</span>
        <span style={{fontSize:13,color:C.slate,fontWeight:600,fontFamily:F,lineHeight:1.4}}>{v}</span>
      </div>
    ))}
    <div style={{marginTop:24,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'14px 16px'}}>
      <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>✓ Your profile replaces your resume. We'll notify you the moment a role matches your criteria.</p>
    </div>
  </>;}

const SECTIONS=[
  {label:'Basic Info',  Comp:S1},{label:'Education',    Comp:S2},{label:'Work History', Comp:S3},
  {label:'Skills',      Comp:S4},{label:'Preferences',  Comp:S5},{label:'Work Style',   Comp:S6},
  {label:'Personality', Comp:S7},{label:'Goals',        Comp:S8},
];

function deriveExpYears(jobs:WorkJob[]):number{
  let total=0;
  for(const j of jobs){
    const pd=(s:string)=>{const[m,y]=s.split('/').map(Number);return isNaN(y)?null:new Date(y,(m||1)-1);};
    const s=pd(j.startDate);
    const e=j.current?new Date():pd(j.endDate);
    if(s&&e&&e>s)total+=(e.getTime()-s.getTime())/(1000*60*60*24*365.25);
  }
  return Math.round(total)||0;
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProfileSurvey(){
  const {user,profile,loading,refreshProfile}=useUser();
  const router=useRouter();
  const supabase=useMemo(()=>createClient(),[]);

  // null = not yet determined; avoids flashing survey before resume screen decision
  const [showResume,setShowResume]=useState<boolean|null>(null);
  const [step,setStep]=useState(0);
  const [data,setData]=useState<SurveyData>(INIT);
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState('');
  const [done,setDone]=useState(false);
  const [isEdit,setIsEdit]=useState(false);
  const [autoSaved,setAutoSaved]=useState(false);
  const total=SECTIONS.length;
  const isReview=step===total;

  // Pre-fill from DB + restore localStorage draft
  useEffect(()=>{
    if(loading)return;
    // loading finished but profile still null — new user whose row may not exist yet; show resume screen
    if(!profile){setShowResume(true);return;}
    setIsEdit(!!profile.profile_complete);
    setShowResume(!profile.profile_complete);
    const fp:SurveyData={
      firstName:profile.first_name??profile.name?.split(' ')[0]??'',
      lastName: profile.last_name??profile.name?.split(' ').slice(1).join(' ')??'',
      email:profile.email??'',phone:profile.phone??'',location:profile.location??'',
      zip:profile.zip??'',workAuth:profile.work_auth??'',eeoc:(profile.eeoc as string[])??[],
      degrees:(profile.degrees as Degree[])??[{...BLANK_DEGREE}],certs:profile.certs??'',
      jobs:(profile.jobs_history as WorkJob[])??[{...BLANK_JOB}],gaps:profile.gaps??'',empStatus:profile.emp_status??'',
      skills:(profile.skills as string[])??[],seniority:profile.seniority??'',industries:(profile.industries as string[])??[],
      targetTitles:Array.isArray(profile.target_titles)?(profile.target_titles as string[]):(profile.target_titles?[(profile.target_titles as string)]:[]),
      idealSalary:profile.ideal_salary?Math.round(profile.ideal_salary/1000):(profile.salary_max?Math.round(profile.salary_max/1000):100),
      minSalary:profile.min_salary?Math.round(profile.min_salary/1000):(profile.salary_min?Math.round(profile.salary_min/1000):80),
      remotePreference:profile.remote_preference??'',maxCommute:profile.max_commute??30,
      employmentType:(profile.employment_type as string[])??[],availability:profile.availability??'',
      relocation:profile.relocation??'',relocationRegions:profile.relocation_regions??'',travel:profile.travel??'',
      companySize:(profile.company_size as string[])??[],targetIndustries:(profile.target_industries as string[])??[],
      targetCulture:(profile.target_culture as string[])??[],mgmtStyle:profile.mgmt_style??'',
      feedbackStyle:profile.feedback_pref??'',motivators:(profile.motivators as string[])??[],
      personality:(profile.personality as Record<string,number>)??{},
      primaryGoal:profile.primary_goal??'',fiveYear:profile.five_year??'',searchIntensity:profile.search_intensity??'',
      stayReasons:(profile.stay_reasons as string[])??[],personalNote:profile.bio??'',
    };
    if(!profile.profile_complete){
      try{const s=localStorage.getItem(`matcht_profile_draft_${profile.id}`);if(s){setData(JSON.parse(s));return;}}catch{}
    }
    setData(fp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[loading,profile?.id]);

  // Auto-save to localStorage (800ms debounce after any data change)
  useEffect(()=>{
    const uid=profile?.id??user?.id;
    if(!uid)return;
    const t=setTimeout(()=>{
      try{
        localStorage.setItem(`matcht_profile_draft_${uid}`,JSON.stringify(data));
        setAutoSaved(true);
        setTimeout(()=>setAutoSaved(false),2000);
      }catch{}
    },800);
    return()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);

  function go(n:number){setStep(n);window.scrollTo({top:0,behavior:'smooth'});}

  async function submit(){
    const uid=profile?.id??user?.id;
    if(!uid)return;
    setSaving(true);setSaveError('');

    const timeoutP=new Promise<never>((_,rej)=>
      setTimeout(()=>rej(new Error('Save timed out after 10 seconds. Your data is saved locally — check your connection and try again.')),10000)
    );

    try{
      const totalExp=deriveExpYears(data.jobs)||null;
      const upsertP=supabase.from('profiles').upsert({
        id:uid,
        name:`${data.firstName} ${data.lastName}`.trim(),
        first_name:data.firstName,last_name:data.lastName,
        phone:data.phone||null,location:data.location||null,
        zip:data.zip||null,work_auth:data.workAuth||null,eeoc:data.eeoc,
        degrees:data.degrees,certs:data.certs||null,
        jobs_history:data.jobs,title:data.jobs[0]?.title||null,total_exp:totalExp,
        gaps:data.gaps||null,emp_status:data.empStatus||null,
        skills:data.skills,seniority:data.seniority||null,industries:data.industries,
        target_titles:data.targetTitles,
        ideal_salary:data.idealSalary*1000,min_salary:data.minSalary*1000,
        salary_min:data.minSalary*1000,salary_max:data.idealSalary*1000,
        salary_label:`$${data.minSalary}k–$${data.idealSalary}k`,
        remote_preference:data.remotePreference||null,max_commute:data.maxCommute,
        employment_type:data.employmentType,availability:data.availability||null,
        relocation:data.relocation||null,relocation_regions:data.relocationRegions||null,
        travel:data.travel||null,company_size:data.companySize,
        target_industries:data.targetIndustries,target_culture:data.targetCulture,
        mgmt_style:data.mgmtStyle||null,feedback_pref:data.feedbackStyle||null,
        motivators:data.motivators,personality:data.personality,
        primary_goal:data.primaryGoal||null,five_year:data.fiveYear||null,
        search_intensity:data.searchIntensity||null,stay_reasons:data.stayReasons,
        bio:data.personalNote||null,profile_complete:true,
        updated_at:new Date().toISOString(),
      });

      const {error}=await Promise.race([upsertP,timeoutP]);
      if(error)throw error;

      fetch('/api/match-scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seekerId:uid})}).catch(()=>{});
      if(!profile?.profile_complete){
        fetch('/api/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'seeker-welcome',seekerId:uid})}).catch(()=>{});
      }
      refreshProfile().catch(()=>{});
      try{localStorage.removeItem(`matcht_profile_draft_${uid}`);}catch{}
      setDone(true);
    }catch(err:unknown){
      setSaveError((err as Error)?.message||'Save failed. Your answers are saved locally — please try again.');
    }finally{
      setSaving(false);
    }
  }

  // Show loading until showResume is determined
  if(loading||showResume===null){
    return<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',fontFamily:F,gap:14}}>
      <div style={{width:28,height:28,borderRadius:6,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:C.white}}>M</div>
      <span style={{fontSize:14,color:C.gray600}}>Loading your profile…</span>
    </div>;
  }

  if(done)return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',maxWidth:420}}>
        <div style={{fontSize:52,marginBottom:14}}>{isEdit?'✓':'🎉'}</div>
        <h1 style={{fontSize:26,fontWeight:800,color:C.slate,margin:'0 0 10px',letterSpacing:-0.5}}>{isEdit?'Profile updated.':'You\'re live.'}</h1>
        <p style={{color:C.gray600,fontSize:15,lineHeight:1.65,margin:'0 0 24px'}}>{isEdit?'Your changes are saved. Match scores will update shortly.':'Your profile is live. We\'ll notify you the moment a role matches. No applying. No forms. Just matches.'}</p>
        {!isEdit&&<div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:'16px 18px',marginBottom:22}}><p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0}}>Add a video intro to boost your visibility 4×. Takes 3 minutes.</p></div>}
        <button onClick={()=>router.push('/dashboard')} style={{padding:'13px 30px',borderRadius:8,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:F}}>{isEdit?'Back to my matches →':'Go to my matches →'}</button>
      </div>
    </div>
  );

  if(showResume)return<ResumeUpload onSkip={()=>setShowResume(false)}/>;

  const SecComp=!isReview?SECTIONS[step].Comp:null;

  return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,paddingBottom:100}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .sc{animation:fadeUp .2s cubic-bezier(.4,0,.2,1)}
        input[type=range]{height:5px;background:${C.gray100};border-radius:3px;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:${C.teal};cursor:pointer;box-shadow:0 1px 6px rgba(26,140,140,.4)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:${C.teal};cursor:pointer;border:none}
      `}</style>

      {/* Sticky header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 24px',height:54,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:24,height:24,borderRadius:5,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:10,color:C.white}}>M</div>
          <span style={{fontWeight:800,fontSize:14,color:C.slate,letterSpacing:-0.3}}>Matcht</span>
          <span style={{fontSize:11,color:C.gray400}}>/ {isEdit?'Edit Profile':'Your Profile'}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {autoSaved&&<span style={{fontSize:11,color:C.green,fontFamily:F,fontWeight:600,transition:'opacity .3s'}}>✓ Draft saved</span>}
          <span style={{fontSize:12,color:C.gray600,fontWeight:600}}>{isReview?'Review & submit':`${step+1} / ${total} — ${SECTIONS[step].label}`}</span>
        </div>
      </div>

      {/* Section tab bar */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,overflowX:'auto',WebkitOverflowScrolling:'touch' as React.CSSProperties['WebkitOverflowScrolling']}}>
        <div style={{display:'flex',minWidth:'fit-content',padding:'0 8px'}}>
          {SECTIONS.map((s,i)=>(
            <button key={i} onClick={()=>go(i)} style={{padding:'10px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${i===step?C.teal:'transparent'}`,color:i===step?C.teal:i<step?C.green:C.gray400,fontWeight:i===step?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4,transition:'color .15s'}}>
              {i<step&&<span style={{fontSize:10}}>✓</span>}{s.label}
            </button>
          ))}
          <button onClick={()=>go(total)} style={{padding:'10px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${isReview?C.teal:'transparent'}`,color:isReview?C.teal:C.gray400,fontWeight:isReview?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap',transition:'color .15s'}}>Review</button>
        </div>
      </div>

      {/* Content area */}
      <div style={{maxWidth:640,margin:'28px auto 0',padding:'0 16px'}}>
        <Progress step={step} total={total}/>

        <div key={step} className="sc" style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'28px 24px',marginBottom:16}}>
          {isReview?<ReviewScreen data={data}/>:SecComp&&<SecComp d={data} set={setData}/>}
        </div>

        {saveError&&(
          <div style={{padding:'14px 16px',background:'#FDF2F2',border:`1px solid ${C.red}44`,borderRadius:9,marginBottom:12,fontFamily:F,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0}}>⚠</span>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:C.red,marginBottom:4}}>Save failed</div>
              <div style={{fontSize:13,color:C.red,lineHeight:1.5}}>{saveError}</div>
              <button onClick={submit} disabled={saving} style={{marginTop:10,padding:'7px 16px',borderRadius:7,background:C.red,color:C.white,border:'none',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:F}}>Try again →</button>
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:10}}>
          {step>0&&<button onClick={()=>go(step-1)} style={{flex:1,padding:'13px 0',borderRadius:9,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:F}}>← Back</button>}
          {!isReview
            ?<button onClick={()=>go(step+1)} style={{flex:2,padding:'13px 0',borderRadius:9,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:F,boxShadow:'0 2px 10px rgba(26,140,140,.25)'}}>
              {step<total-1?'Continue →':'Review my profile →'}
            </button>
            :<button onClick={submit} disabled={saving} style={{flex:2,padding:'13px 0',borderRadius:9,background:saving?C.gray400:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:saving?'default':'pointer',fontFamily:F,boxShadow:saving?'none':'0 2px 10px rgba(26,140,140,.25)',transition:'all .2s'}}>
              {saving?'Saving… (up to 10s)':isEdit?'Save changes →':'Submit & go live →'}
            </button>}
        </div>
        <p style={{fontSize:11,color:C.gray400,textAlign:'center',marginTop:10,fontFamily:F,lineHeight:1.4}}>Your data auto-saves as you go. If the save fails, all answers are preserved locally.</p>
      </div>
    </div>
  );
}

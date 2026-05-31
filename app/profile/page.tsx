'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import {
  INDUSTRIES, CULTURE_DESCRIPTORS, EMPLOYMENT_TYPES, MGMT_STYLES, TRAVEL_LEVELS,
  SKILL_SUGGESTIONS, UNIVERSITIES, TITLE_SUGGESTIONS, EDUCATION_LEVELS_SEEKER,
  PERSONALITY_DIMS_SEEKER, LANGUAGES as LANG_LIST, LANGUAGE_PROFICIENCY,
} from '@/lib/constants';

const C = {
  bg:'#F0F4F7',white:'#FFFFFF',teal:'#1A8C8C',tealDim:'#1A8C8C12',tealBorder:'#1A8C8C35',
  tealDark:'#116060',slate:'#1E2D3A',gray100:'#E3ECF1',gray200:'#C8D8E4',gray400:'#8FAABB',
  gray600:'#4E6475',gray800:'#2B3D4D',border:'#D4E3EC',green:'#19A87A',greenDim:'#19A87A14',
  amber:'#C9870C',amberDim:'#C9870C14',red:'#C0392B',redDim:'#C0392B14',purple:'#6B5EA8',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";
// Inlined at build time — safe to use in browser fetch calls
const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Types ─────────────────────────────────────────────────────────────────────
type Degree   = { level:string; field:string; university:string; gradYear:string; current:boolean; gpa:string; activities:string };
type WorkJob  = { company:string; title:string; location:string; startMonth:string; startYear:string; endMonth:string; endYear:string; current:boolean; employmentType:string; description:string; accomplishments:string[]; reasonForLeaving:string };
type Cert     = { name:string; issuer:string; date:string; expiry:string; credentialId:string };
type Volunteer= { org:string; role:string; cause:string; startYear:string; endYear:string; current:boolean; description:string };
type Project  = { name:string; description:string; url:string; startYear:string; endYear:string };
type Award    = { name:string; issuer:string; year:string };
type Language = { language:string; proficiency:string };

type SurveyData = {
  firstName:string; lastName:string; email:string; phone:string; location:string; zip:string;
  headline:string; linkedin:string; website:string; otherLink:string; workAuth:string;
  gender:string; race:string; veteran:string; disability:string;
  summary:string; accomplishments:string[];
  degrees:Degree[]; certifications:Cert[]; testScores:Record<string,string>;
  jobs:WorkJob[]; volunteer:Volunteer[]; gaps:string; empStatus:string;
  skills:string[]; seniority:string; languages:Language[]; projects:Project[]; awards:Award[];
  targetTitles:string[]; idealSalary:number; minSalary:number;
  remotePreference:string; maxCommute:number; employmentType:string[];
  availability:string; relocation:string; relocationRegions:string; travel:string;
  companySize:string[]; targetIndustries:string[];
  targetCulture:string[]; mgmtStyle:string; feedbackStyle:string; motivators:string[]; industries:string[];
  personality:Record<string,number>; commStyle:string; mistakeStyle:string;
  primaryGoal:string; fiveYear:string; searchIntensity:string; stayReasons:string[]; referralSource:string; personalNote:string;
};
type SetData  = React.Dispatch<React.SetStateAction<SurveyData>>;
type SecProps = { d:SurveyData; set:SetData; errors?:Record<string,string> };
type SaveEntry = { section:string; status:'saved'|'failed'|'timeout'; msg:string; time:string };

const BD:Degree   = { level:'',field:'',university:'',gradYear:'',current:false,gpa:'',activities:'' };
const BJ:WorkJob  = { company:'',title:'',location:'',startMonth:'',startYear:'',endMonth:'',endYear:'',current:false,employmentType:'',description:'',accomplishments:['','',''],reasonForLeaving:'' };
const BC:Cert     = { name:'',issuer:'',date:'',expiry:'',credentialId:'' };
const BV:Volunteer= { org:'',role:'',cause:'',startYear:'',endYear:'',current:false,description:'' };
const BP:Project  = { name:'',description:'',url:'',startYear:'',endYear:'' };
const BAw:Award   = { name:'',issuer:'',year:'' };
const BL:Language = { language:'',proficiency:'' };

const INIT:SurveyData = {
  firstName:'',lastName:'',email:'',phone:'',location:'',zip:'',
  headline:'',linkedin:'',website:'',otherLink:'',workAuth:'',
  gender:'',race:'',veteran:'',disability:'',
  summary:'',accomplishments:['','',''],
  degrees:[{...BD}],certifications:[],testScores:{},
  jobs:[{...BJ}],volunteer:[],gaps:'',empStatus:'',
  skills:[],seniority:'',languages:[{...BL}],projects:[],awards:[],
  targetTitles:[],idealSalary:100,minSalary:75,
  remotePreference:'',maxCommute:30,employmentType:[],
  availability:'',relocation:'',relocationRegions:'',travel:'',
  companySize:[],targetIndustries:[],
  targetCulture:[],mgmtStyle:'',feedbackStyle:'',motivators:[],industries:[],
  personality:{},commStyle:'',mistakeStyle:'',
  primaryGoal:'',fiveYear:'',searchIntensity:'',stayReasons:[],referralSource:'',personalNote:'',
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Card({children,style={}}:{children:React.ReactNode;style?:React.CSSProperties}){
  return<div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'26px 24px',...style}}>{children}</div>;
}
function FL({children,required,optional,hint}:{children:React.ReactNode;required?:boolean;optional?:boolean;hint?:string}){
  return<div style={{marginBottom:7}}>
    <div style={{fontSize:14,fontWeight:600,color:C.slate,fontFamily:F,display:'flex',alignItems:'center',gap:6}}>
      {children}
      {required&&<span style={{color:C.red,fontSize:13}}>*</span>}
      {optional&&<span style={{fontSize:11,fontWeight:500,color:C.gray400,background:C.gray100,padding:'1px 7px',borderRadius:8}}>optional</span>}
    </div>
    {hint&&<div style={{fontSize:12,color:C.gray400,marginTop:2,fontFamily:F}}>{hint}</div>}
  </div>;
}
function ST({section,title,sub}:{section:string;title:string;sub?:string}){
  return<div style={{marginBottom:20}}>
    <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:1.4,marginBottom:4,fontFamily:F}}>{section}</div>
    <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 6px',letterSpacing:-0.5,fontFamily:F,lineHeight:1.2}}>{title}</h2>
    {sub&&<p style={{fontSize:14,color:C.gray600,margin:0,fontFamily:F,lineHeight:1.6}}>{sub}</p>}
  </div>;
}
function Div({label}:{label?:string}){
  if(label)return<div style={{display:'flex',alignItems:'center',gap:10,margin:'22px 0'}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.gray400,fontWeight:600,whiteSpace:'nowrap',fontFamily:F}}>{label}</span><div style={{flex:1,height:1,background:C.border}}/></div>;
  return<div style={{borderTop:`1px solid ${C.border}`,margin:'22px 0'}}/>;
}
function TI({value,onChange,placeholder,type='text',disabled=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;disabled?:boolean}){
  return<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    style={{width:'100%',padding:'11px 14px',borderRadius:8,background:disabled?C.gray100:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,transition:'border .15s'}}
    onFocus={e=>(e.target.style.border=`1.5px solid ${C.teal}`)}
    onBlur={e=>(e.target.style.border=`1.5px solid ${C.border}`)}/>;
}
function TA({value,onChange,placeholder,rows=3,hint}:{value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number;hint?:string}){
  return<div>
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{width:'100%',padding:'11px 14px',borderRadius:8,background:C.bg,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,resize:'vertical',lineHeight:1.6,transition:'border .15s'}}
      onFocus={e=>(e.target.style.border=`1.5px solid ${C.teal}`)}
      onBlur={e=>(e.target.style.border=`1.5px solid ${C.border}`)}/>
    {hint&&<div style={{fontSize:11,color:C.gray400,marginTop:3,fontFamily:F}}>{hint}</div>}
  </div>;
}
function Sel({value,onChange,options,placeholder,disabled=false}:{value:string;onChange:(v:string)=>void;options:string[];placeholder?:string;disabled?:boolean}){
  return<select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:'100%',padding:'11px 14px',borderRadius:8,background:disabled?C.gray100:C.bg,border:`1.5px solid ${C.border}`,color:value?C.slate:C.gray400,fontSize:14,outline:'none',boxSizing:'border-box' as const,fontFamily:F,cursor:disabled?'default':'pointer'}}>
    <option value="">{placeholder||'Select...'}</option>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>;
}
function RG({options,value,onChange}:{options:string[];value:string;onChange:(v:string)=>void}){
  return<div style={{display:'flex',flexDirection:'column',gap:8}}>
    {options.map(o=><label key={o} onClick={()=>onChange(o)} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'10px 14px',borderRadius:9,background:value===o?C.tealDim:C.bg,border:`1.5px solid ${value===o?C.teal:C.border}`,transition:'all .15s'}}>
      <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${value===o?C.teal:C.gray200}`,background:value===o?C.teal:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
        {value===o&&<div style={{width:7,height:7,borderRadius:'50%',background:C.white}}/>}
      </div>
      <span style={{fontSize:14,color:value===o?C.teal:C.slate,fontWeight:value===o?600:400,fontFamily:F}}>{o}</span>
    </label>)}
  </div>;
}
function CG({options,values,onChange,max,columns=1}:{options:string[];values:string[];onChange:(v:string[])=>void;max?:number;columns?:number}){
  function toggle(v:string){if(values.includes(v))onChange(values.filter(x=>x!==v));else if(!max||values.length<max)onChange([...values,v]);}
  return<div style={{display:'grid',gridTemplateColumns:`repeat(${columns},1fr)`,gap:8}}>
    {options.map(o=><label key={o} onClick={()=>toggle(o)} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',padding:'10px 13px',borderRadius:9,background:values.includes(o)?C.tealDim:C.bg,border:`1.5px solid ${values.includes(o)?C.teal:C.border}`,transition:'all .15s'}}>
      <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        {values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800,lineHeight:1}}>✓</span>}
      </div>
      <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F,lineHeight:1.3}}>{o}</span>
    </label>)}
  </div>;
}
function MD({options,values,onChange,placeholder,max}:{options:string[];values:string[];onChange:(v:string[])=>void;placeholder?:string;max?:number}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const filtered=options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  function toggle(o:string){if(values.includes(o))onChange(values.filter(x=>x!==o));else if(!max||values.length<max)onChange([...values,o]);}
  return<div ref={ref} style={{position:'relative'}}>
    <div onClick={()=>setOpen(o=>!o)} style={{minHeight:44,padding:'8px 12px',borderRadius:8,background:C.bg,border:`1.5px solid ${open?C.teal:C.border}`,cursor:'pointer',display:'flex',flexWrap:'wrap',gap:5,alignItems:'center',transition:'border .15s'}}>
      {values.length===0&&<span style={{color:C.gray400,fontSize:14,fontFamily:F}}>{placeholder}</span>}
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'3px 10px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>
        {v}<span onClick={e=>{e.stopPropagation();toggle(v);}} style={{cursor:'pointer',fontWeight:700,fontSize:14,lineHeight:1}}>×</span>
      </span>)}
      <span style={{marginLeft:'auto',color:C.gray400,fontSize:11,flexShrink:0}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,.12)',maxHeight:260,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`}}>
        <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
          style={{width:'100%',padding:'7px 11px',borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.slate,fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:F}}/>
      </div>
      <div style={{overflowY:'auto',flex:1}}>
        {filtered.map(o=><div key={o} onClick={()=>toggle(o)} style={{padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,background:values.includes(o)?C.tealDim:'none',transition:'background .1s'}}>
          <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${values.includes(o)?C.teal:C.gray200}`,background:values.includes(o)?C.teal:'none',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {values.includes(o)&&<span style={{color:C.white,fontSize:10,fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:13,color:values.includes(o)?C.teal:C.slate,fontWeight:values.includes(o)?600:400,fontFamily:F}}>{o}</span>
        </div>)}
        {filtered.length===0&&<div style={{padding:'14px',color:C.gray400,fontSize:13,textAlign:'center',fontFamily:F}}>No results</div>}
      </div>
      {max&&<div style={{padding:'8px 14px',borderTop:`1px solid ${C.border}`,fontSize:11,color:C.gray400,fontFamily:F}}>{values.length}/{max} selected</div>}
    </div>}
  </div>;
}
function TagInput({values,onChange,suggestions=[],placeholder,max}:{values:string[];onChange:(v:string[])=>void;suggestions?:string[];placeholder?:string;max?:number}){
  const [input,setInput]=useState('');
  const [showSug,setShowSug]=useState(false);
  const [focused,setFocused]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node)){setShowSug(false);setFocused(false);}}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const filtered=input.length>0?suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())&&!values.includes(s)).slice(0,8):[];
  function add(val:string){const v=val.trim();if(!v||values.includes(v)||(max&&values.length>=max))return;onChange([...values,v]);setInput('');}
  function remove(v:string){onChange(values.filter(x=>x!==v));}
  return<div ref={ref} style={{position:'relative'}}>
    <div style={{minHeight:46,padding:'7px 10px',borderRadius:8,background:C.bg,border:`1.5px solid ${focused?C.teal:C.border}`,display:'flex',flexWrap:'wrap',gap:5,alignItems:'center',cursor:'text',transition:'border .15s'}}
      onClick={()=>inputRef.current?.focus()}>
      {values.map(v=><span key={v} style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,color:C.teal,borderRadius:12,padding:'3px 10px',fontSize:12,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:4}}>
        {v}<span onClick={()=>remove(v)} style={{cursor:'pointer',fontWeight:700,fontSize:14,lineHeight:1}}>×</span>
      </span>)}
      <input ref={inputRef} value={input}
        onChange={e=>{setInput(e.target.value);setShowSug(true);}}
        onFocus={()=>{setFocused(true);setShowSug(true);}}
        onKeyDown={e=>{
          if((e.key==='Enter'||e.key===',')&&input){e.preventDefault();add(input);}
          if(e.key==='Backspace'&&!input&&values.length)remove(values[values.length-1]);
        }}
        placeholder={values.length===0?placeholder:''}
        style={{border:'none',outline:'none',background:'none',fontSize:13,color:C.slate,fontFamily:F,minWidth:140,flex:1,padding:'2px 0'}}/>
    </div>
    {showSug&&(filtered.length>0||(input.length>0&&!suggestions.includes(input)))&&<div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,.12)',overflow:'hidden'}}>
      {filtered.map(s=><div key={s} onClick={()=>add(s)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}} onMouseEnter={e=>(e.currentTarget.style.background=C.tealDim)} onMouseLeave={e=>(e.currentTarget.style.background='none')}>{s}</div>)}
      {input.length>0&&!values.includes(input)&&<div onClick={()=>add(input)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.teal,fontWeight:600,fontFamily:F,borderTop:filtered.length?`1px solid ${C.border}`:'none',background:C.tealDim}}>+ Add "{input}"</div>}
    </div>}
    {max&&<div style={{fontSize:11,color:values.length>=max?C.amber:C.gray400,marginTop:4,fontFamily:F}}>{values.length}/{max} added</div>}
  </div>;
}
function AI({value,onChange,suggestions,placeholder}:{value:string;onChange:(v:string)=>void;suggestions:string[];placeholder?:string}){
  const [show,setShow]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setShow(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const filtered=value.length>1?suggestions.filter(s=>s.toLowerCase().includes(value.toLowerCase())).slice(0,8):[];
  return<div ref={ref} style={{position:'relative'}}>
    <TI value={value} onChange={v=>{onChange(v);setShow(true);}} placeholder={placeholder}/>
    {show&&filtered.length>0&&<div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:C.white,border:`1.5px solid ${C.teal}`,borderRadius:10,zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,.12)',maxHeight:200,overflowY:'auto'}}>
      {filtered.map(s=><div key={s} onClick={()=>{onChange(s);setShow(false);}} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:C.slate,fontFamily:F}} onMouseEnter={e=>(e.currentTarget.style.background=C.tealDim)} onMouseLeave={e=>(e.currentTarget.style.background='none')}>{s}</div>)}
    </div>}
  </div>;
}
function Slider({value,onChange,min,max,step=1,format,label}:{value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;format:(v:number)=>string;label?:string}){
  return<div>
    {label&&<div style={{fontSize:13,color:C.gray600,marginBottom:6,fontFamily:F}}>{label}</div>}
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={{width:'100%',accentColor:C.teal,height:5}}/>
    <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(min)}</span>
      <span style={{fontSize:15,fontWeight:800,color:C.teal,fontFamily:F}}>{format(value)}</span>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{format(max)}</span>
    </div>
  </div>;
}
function ScaleQ({question,low,high,value,onChange}:{question:string;low:string;high:string;value:number|undefined;onChange:(v:number)=>void}){
  return<div style={{marginBottom:22}}>
    <div style={{fontSize:14,color:C.slate,marginBottom:10,fontFamily:F,lineHeight:1.5,fontWeight:500}}>{question}</div>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:12,color:C.gray600,width:120,flexShrink:0,lineHeight:1.4,fontFamily:F}}>{low}</span>
      <div style={{display:'flex',gap:7,flex:1}}>
        {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,height:38,borderRadius:8,border:`1.5px solid ${value===n?C.teal:C.border}`,background:value===n?C.teal:C.bg,color:value===n?C.white:C.gray600,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{n}</button>)}
      </div>
      <span style={{fontSize:12,color:C.gray600,width:120,flexShrink:0,textAlign:'right',lineHeight:1.4,fontFamily:F}}>{high}</span>
    </div>
  </div>;
}
function Block({children,title,onRemove,canRemove,accent=C.teal}:{children:React.ReactNode;title?:string;onRemove?:()=>void;canRemove?:boolean;accent?:string}){
  return<div style={{background:C.white,borderRadius:12,border:`1.5px solid ${C.border}`,padding:'20px 18px',marginBottom:12,position:'relative'}}>
    {title&&<div style={{fontSize:12,fontWeight:700,color:accent,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:F}}>{title}</div>}
    {canRemove&&onRemove&&<button onClick={onRemove} style={{position:'absolute',top:14,right:14,background:'none',border:'none',color:C.gray400,fontSize:20,cursor:'pointer',lineHeight:1,padding:0}}>×</button>}
    {children}
  </div>;
}
function ErrMsg({msg}:{msg?:string}){
  if(!msg)return null;
  return<div style={{color:C.red,fontSize:12,marginTop:4,fontFamily:F,fontWeight:500}}>{msg}</div>;
}
function AddBtn({onClick,label}:{onClick:()=>void;label:string}){
  return<button onClick={onClick} style={{width:'100%',padding:'11px 0',borderRadius:9,background:'none',border:`1.5px dashed ${C.teal}`,color:C.teal,fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:F,marginBottom:6,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
    <span style={{fontSize:18,lineHeight:1}}>+</span> {label}
  </button>;
}
function Progress({step,total,sections}:{step:number;total:number;sections:{label:string}[]}){
  const pct=Math.round(((step)/(total))*100);
  const mins=Math.max(1,Math.round((total-step)*2.5));
  return<div style={{marginBottom:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <span style={{fontSize:13,color:C.gray600,fontFamily:F,fontWeight:500}}>{step===0?'Starting up':step>=total?'Almost done':`Section ${step} of ${total}`}</span>
      <span style={{fontSize:12,color:C.gray400,fontFamily:F}}>{step>=total?'Review your answers':`~${mins} min remaining`}</span>
    </div>
    <div style={{height:6,background:C.gray100,borderRadius:3,overflow:'hidden'}}>
      <div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:`linear-gradient(90deg, ${C.teal}, ${C.tealDark})`,transition:'width .5s ease'}}/>
    </div>
    <div style={{display:'flex',gap:3,marginTop:6}}>
      {sections.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?C.teal:i===step-1?C.tealDim:C.gray100,transition:'background .3s'}}/>)}
    </div>
  </div>;
}

// ── Resume Upload (inline Step 0) ─────────────────────────────────────────────
function ResumeUpload(){
  const [dragging,setDragging]=useState(false);
  const [file,setFile]=useState<File|null>(null);
  const ref=useRef<HTMLInputElement>(null);
  function handleFile(f:File|null){if(f&&(f.type==='application/pdf'||f.name.endsWith('.docx')||f.name.endsWith('.doc')))setFile(f);}
  return<div>
    <div style={{textAlign:'center',marginBottom:28}}>
      <div style={{fontSize:44,marginBottom:12}}>📄</div>
      <h2 style={{fontSize:22,fontWeight:800,color:C.slate,margin:'0 0 10px',letterSpacing:-0.5,lineHeight:1.2}}>Got a resume? Let&apos;s use it one last time.</h2>
      <p style={{fontSize:14,color:C.gray600,margin:0,lineHeight:1.7}}>Upload it and we&apos;ll pre-fill your profile. After this, your Matcht profile <em>is</em> your resume — working for you 24/7.</p>
    </div>
    <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
      onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]??null);}}
      onClick={()=>ref.current?.click()}
      style={{border:`2px dashed ${dragging?C.teal:file?C.green:C.gray200}`,borderRadius:12,padding:'28px 24px',textAlign:'center',cursor:'pointer',background:dragging?C.tealDim:file?C.greenDim:C.bg,transition:'all .2s',marginBottom:14}}>
      <input ref={ref} type="file" accept=".pdf,.doc,.docx" onChange={e=>handleFile(e.target.files?.[0]??null)} style={{display:'none'}}/>
      {file?<>
        <div style={{fontSize:28,marginBottom:6}}>✅</div>
        <div style={{fontWeight:700,fontSize:14,color:C.green,marginBottom:3}}>{file.name}</div>
        <div style={{fontSize:12,color:C.gray400}}>Click to choose a different file</div>
      </>:<>
        <div style={{fontSize:28,marginBottom:8}}>📎</div>
        <div style={{fontWeight:600,fontSize:14,color:C.slate,marginBottom:4}}>Drop your resume here</div>
        <div style={{fontSize:12,color:C.gray400,marginBottom:6}}>or click to browse · PDF, DOC, DOCX</div>
      </>}
    </div>
    <p style={{textAlign:'center',fontSize:11,color:C.gray400,margin:0,lineHeight:1.5}}>Used only to pre-fill your profile. Never shared with employers.</p>
  </div>;
}

// ── Section 1: Basic Info & Online Presence ───────────────────────────────────
function S1({d,set,errors}:SecProps){
  const [zipFetching,setZipFetching]=useState(false);
  const [locationLocked,setLocationLocked]=useState(()=>d.zip.length===5&&/^\d{5}$/.test(d.zip)&&d.location.trim()!=='');
  async function lookupZip(zip:string){
    setZipFetching(true);
    try{
      const res=await fetch(`https://api.zippopotam.us/us/${zip}`);
      if(!res.ok)return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const j:any=await res.json();
      const city=j.places?.[0]?.['place name'];const state=j.places?.[0]?.['state abbreviation'];
      if(city&&state){set(x=>({...x,location:`${city}, ${state}`,zip}));setLocationLocked(true);}
    }catch{}finally{setZipFetching(false);}
  }
  return<>
  <ST section="Section 1 of 9" title="Basic Information" sub="Contact details and your online presence. Used for matching, communication, and your public profile."/>
  <Div/>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
    <div><FL required>First name</FL><TI value={d.firstName} onChange={v=>set(x=>({...x,firstName:v}))} placeholder="Jane"/><ErrMsg msg={errors?.firstName}/></div>
    <div><FL required>Last name</FL><TI value={d.lastName} onChange={v=>set(x=>({...x,lastName:v}))} placeholder="Smith"/><ErrMsg msg={errors?.lastName}/></div>
  </div>
  <div style={{marginBottom:16}}><FL required>Email address</FL><TI value={d.email} onChange={v=>set(x=>({...x,email:v}))} placeholder="jane@example.com" type="email"/><ErrMsg msg={errors?.email}/></div>
  <div style={{marginBottom:16}}><FL optional>Phone number</FL><TI value={d.phone} onChange={v=>set(x=>({...x,phone:v}))} placeholder="+1 (555) 000-0000"/></div>
  <div style={{marginBottom:16}}>
    <FL required>ZIP code</FL>
    <TI value={d.zip} onChange={v=>{set(x=>({...x,zip:v}));if(v.length===5&&/^\d{5}$/.test(v))lookupZip(v);}} placeholder="60601"/>
    {zipFetching&&<div style={{fontSize:11,color:C.teal,marginTop:3,fontFamily:F}}>Looking up city…</div>}
    <ErrMsg msg={errors?.zip}/>
  </div>
  {locationLocked?(
    <div style={{marginBottom:16}}>
      <FL required>City & state</FL>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{flex:1,padding:'11px 14px',borderRadius:8,background:C.gray100,border:`1.5px solid ${C.border}`,color:C.slate,fontSize:14,fontFamily:F,lineHeight:'1.2'}}>{d.location}</div>
        <button onClick={()=>setLocationLocked(false)} style={{fontSize:12,color:C.teal,background:'none',border:`1px solid ${C.tealBorder}`,borderRadius:6,padding:'6px 10px',cursor:'pointer',fontFamily:F,fontWeight:600,whiteSpace:'nowrap'}}>Edit</button>
      </div>
      <ErrMsg msg={errors?.location}/>
    </div>
  ):(
    <div style={{marginBottom:16}}>
      <FL required hint="Enter your ZIP above to auto-fill, or type your city and state here">City & state</FL>
      <TI value={d.location} onChange={v=>set(x=>({...x,location:v}))} placeholder="Chicago, IL"/>
      <ErrMsg msg={errors?.location}/>
    </div>
  )}
  <Div label="Professional headline"/>
  <div style={{marginBottom:16}}>
    <FL optional hint="Your professional tagline — shown on your profile. 120 characters max.">Headline</FL>
    <TI value={d.headline} onChange={v=>set(x=>({...x,headline:v.slice(0,120)}))} placeholder="e.g. Senior Product Manager · Scaling B2B SaaS · Ex-Google"/>
    <div style={{fontSize:11,color:d.headline.length>100?C.amber:C.gray400,marginTop:3,textAlign:'right',fontFamily:F}}>{d.headline.length}/120</div>
  </div>
  <Div label="Online presence"/>
  <div style={{marginBottom:12}}><FL optional>LinkedIn URL</FL><TI value={d.linkedin} onChange={v=>set(x=>({...x,linkedin:v}))} placeholder="https://linkedin.com/in/yourname"/></div>
  <div style={{marginBottom:12}}><FL optional>Personal website or portfolio</FL><TI value={d.website} onChange={v=>set(x=>({...x,website:v}))} placeholder="https://yourname.com"/></div>
  <div style={{marginBottom:16}}><FL optional>GitHub, Dribbble, Behance, or other</FL><TI value={d.otherLink} onChange={v=>set(x=>({...x,otherLink:v}))} placeholder="https://github.com/yourname"/></div>
  <Div label="Eligibility"/>
  <div style={{marginBottom:16}}>
    <FL required>Are you legally authorized to work in the United States?</FL>
    <RG options={['Yes, without sponsorship','Yes, but I require sponsorship','No']} value={d.workAuth} onChange={v=>set(x=>({...x,workAuth:v}))}/>
    <ErrMsg msg={errors?.workAuth}/>
  </div>
  <Div label="Voluntary self-identification (optional)"/>
  <p style={{fontSize:13,color:C.gray400,margin:'0 0 12px',fontFamily:F,lineHeight:1.6}}>Entirely optional — used only for EEOC compliance reporting with enterprise clients. No effect on your match score or visibility.</p>
  <div style={{marginBottom:12}}><FL optional>Gender identity</FL><Sel value={d.gender} onChange={v=>set(x=>({...x,gender:v}))} options={['Male','Female','Non-binary','Prefer to self-describe','Prefer not to answer']}/></div>
  <div style={{marginBottom:12}}><FL optional>Race / ethnicity</FL><Sel value={d.race} onChange={v=>set(x=>({...x,race:v}))} options={['American Indian or Alaska Native','Asian','Black or African American','Hispanic or Latino','Native Hawaiian or Other Pacific Islander','White','Two or more races','Prefer not to answer']}/></div>
  <div style={{marginBottom:12}}><FL optional>Veteran status</FL><Sel value={d.veteran} onChange={v=>set(x=>({...x,veteran:v}))} options={['Not a veteran','Active duty military','U.S. Military Veteran','Disabled veteran','Prefer not to answer']}/></div>
  <div><FL optional>Disability status</FL><Sel value={d.disability} onChange={v=>set(x=>({...x,disability:v}))} options={['No disability','Yes, I have a disability','Prefer not to answer']}/></div>
</>;}

// ── Section 2: Professional Summary ──────────────────────────────────────────
function S2({d,set}:SecProps){return<>
  <ST section="Section 2 of 9" title="Professional Summary" sub="Your story in your own words. The most human part of your profile — the part a resume never captures."/>
  <Div/>
  <div style={{marginBottom:20}}>
    <FL optional hint="Write like you're introducing yourself to a hiring manager at a conference. 2,000 characters max.">About you</FL>
    <TA value={d.summary} onChange={v=>set(x=>({...x,summary:v.slice(0,2000)}))} placeholder={'Who are you professionally? What drives you? What\'s your superpower? What are you looking for next?\n\nExample: "I\'m a product leader with 10 years building B2B SaaS at companies from seed to IPO..."'} rows={8}/>
    <div style={{fontSize:11,color:d.summary.length>1800?C.amber:C.gray400,marginTop:3,textAlign:'right',fontFamily:F}}>{d.summary.length}/2,000</div>
  </div>
  <div style={{marginBottom:20}}>
    <FL optional hint="Specific, quantifiable wins you want employers to notice immediately.">Top 3 career accomplishments</FL>
    {[0,1,2].map(i=><div key={i} style={{marginBottom:8}}>
      <TI value={d.accomplishments[i]||''} onChange={v=>set(x=>({...x,accomplishments:x.accomplishments.map((a,idx)=>idx===i?v:a)}))} placeholder={i===0?'e.g. Grew ARR from $2M to $18M in 24 months as Head of Growth':i===1?'e.g. Led a team of 12 engineers to ship the core platform 3 months ahead of schedule':'e.g. Reduced customer churn by 34% through a new onboarding program'}/>
    </div>)}
  </div>
</>;}

// ── Section 3: Education ──────────────────────────────────────────────────────
function S3({d,set}:SecProps){
  const hasDeg=(l:string)=>["Bachelor's degree","Master's degree","MBA","JD / Law degree","MD / Medical degree","PhD or Doctorate","Associate's degree"].includes(l);
  function addDeg(){set(x=>({...x,degrees:[...x.degrees,{...BD}]}));}
  function updD(i:number,k:keyof Degree,v:string|boolean){set(x=>({...x,degrees:x.degrees.map((d,idx)=>idx===i?{...d,[k]:v}:d)}));}
  function remD(i:number){set(x=>({...x,degrees:x.degrees.filter((_,idx)=>idx!==i)}));}
  function addC(){set(x=>({...x,certifications:[...x.certifications,{...BC}]}));}
  function updC(i:number,k:keyof Cert,v:string){set(x=>({...x,certifications:x.certifications.map((c,idx)=>idx===i?{...c,[k]:v}:c)}));}
  function remC(i:number){set(x=>({...x,certifications:x.certifications.filter((_,idx)=>idx!==i)}));}
  return<>
    <ST section="Section 3 of 9" title="Education" sub="Add all degrees, certifications, and credentials."/>
    <Div label="Degrees & programs"/>
    {d.degrees.map((deg,i)=><Block key={i} title={i===0?'Primary degree':'Additional degree'} onRemove={()=>remD(i)} canRemove={d.degrees.length>1}>
      <div style={{marginBottom:12}}><FL>Degree level</FL><Sel value={deg.level} onChange={v=>updD(i,'level',v)} options={EDUCATION_LEVELS_SEEKER} placeholder="Select level..."/></div>
      {hasDeg(deg.level)&&<>
        <div style={{marginBottom:12}}><FL>Field of study / Major</FL><TI value={deg.field} onChange={v=>updD(i,'field',v)} placeholder="e.g. Computer Science, Business Administration"/></div>
        <div style={{marginBottom:12}}><FL>University or institution</FL><AI value={deg.university} onChange={v=>updD(i,'university',v)} suggestions={UNIVERSITIES} placeholder="Start typing your school..."/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
          <div><FL>Graduation year</FL><TI value={deg.gradYear} onChange={v=>updD(i,'gradYear',v)} placeholder="2018"/></div>
          <div><FL optional>GPA</FL><TI value={deg.gpa} onChange={v=>updD(i,'gpa',v)} placeholder="3.8"/></div>
          <div style={{paddingTop:26}}><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={deg.current} onChange={e=>updD(i,'current',e.target.checked)} style={{accentColor:C.teal,width:16,height:16}}/><span style={{fontSize:13,color:C.slate,fontFamily:F}}>Currently enrolled</span></label></div>
        </div>
        <div style={{marginBottom:8}}><FL optional>Activities, societies, or thesis</FL><TI value={deg.activities} onChange={v=>updD(i,'activities',v)} placeholder="e.g. Investment club president, Thesis: ML in credit risk"/></div>
      </>}
    </Block>)}
    <AddBtn onClick={addDeg} label="Add another degree or program"/>
    <Div label="Certifications & licenses"/>
    {d.certifications.map((cert,i)=><Block key={i} title={`Certification ${i+1}`} onRemove={()=>remC(i)} canRemove={true}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div><FL>Certification name</FL><TI value={cert.name} onChange={v=>updC(i,'name',v)} placeholder="e.g. AWS Solutions Architect"/></div>
        <div><FL>Issuing organization</FL><TI value={cert.issuer} onChange={v=>updC(i,'issuer',v)} placeholder="e.g. Amazon Web Services"/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <div><FL>Issue date</FL><TI value={cert.date} onChange={v=>updC(i,'date',v)} placeholder="MM/YYYY"/></div>
        <div><FL>Expiry (if any)</FL><TI value={cert.expiry} onChange={v=>updC(i,'expiry',v)} placeholder="MM/YYYY or N/A"/></div>
        <div><FL optional>Credential ID</FL><TI value={cert.credentialId} onChange={v=>updC(i,'credentialId',v)} placeholder="ABC-12345"/></div>
      </div>
    </Block>)}
    <AddBtn onClick={addC} label="Add a certification or license"/>
    <Div label="Test scores (optional)"/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      {([['GMAT','gmat'],['GRE','gre'],['LSAT','lsat'],['MCAT','mcat'],['Bar Exam','bar'],['CFA Level','cfa']] as [string,string][]).map(([label,key])=><div key={key}><FL optional>{label}</FL><TI value={d.testScores[key]||''} onChange={v=>set(x=>({...x,testScores:{...x.testScores,[key]:v}}))} placeholder="Score or pass/fail"/></div>)}
    </div>
  </>;}

// ── Section 4: Work History ───────────────────────────────────────────────────
function S4({d,set,errors}:SecProps){
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years=Array.from({length:40},(_,i)=>(new Date().getFullYear()-i).toString());
  function addJ(){set(x=>({...x,jobs:[...x.jobs,{...BJ}]}));}
  function updJ(i:number,k:keyof WorkJob,v:string|boolean){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,[k]:v}:j)}));}
  function updA(i:number,ai:number,v:string){set(x=>({...x,jobs:x.jobs.map((j,idx)=>idx===i?{...j,accomplishments:j.accomplishments.map((a,aidx)=>aidx===ai?v:a)}:j)}));}
  function remJ(i:number){set(x=>({...x,jobs:x.jobs.filter((_,idx)=>idx!==i)}));}
  function addV(){set(x=>({...x,volunteer:[...x.volunteer,{...BV}]}));}
  function updV(i:number,k:keyof Volunteer,v:string|boolean){set(x=>({...x,volunteer:x.volunteer.map((v2,idx)=>idx===i?{...v2,[k]:v}:v2)}));}
  function remV(i:number){set(x=>({...x,volunteer:x.volunteer.filter((_,idx)=>idx!==i)}));}
  return<>
    <ST section="Section 4 of 9" title="Work History" sub="This replaces your resume entirely. The more detail you provide, the better your matches."/>
    <Div label="Professional experience"/>
    {d.jobs.map((job,i)=><Block key={i} title={i===0?'Most recent role':`Previous role ${i}`} onRemove={()=>remJ(i)} canRemove={d.jobs.length>1}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div><FL required>Job title</FL><TI value={job.title} onChange={v=>updJ(i,'title',v)} placeholder="e.g. Senior Product Manager"/></div>
        <div><FL required>Company</FL><TI value={job.company} onChange={v=>updJ(i,'company',v)} placeholder="e.g. Acme Corp"/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div><FL optional>Location</FL><TI value={job.location} onChange={v=>updJ(i,'location',v)} placeholder="e.g. Chicago, IL or Remote"/></div>
        <div><FL optional>Employment type</FL><Sel value={job.employmentType} onChange={v=>updJ(i,'employmentType',v)} options={['Full-time','Part-time','Contract','Internship','Freelance','Temporary']}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div>
          <FL>Start date</FL>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            <Sel value={job.startMonth} onChange={v=>updJ(i,'startMonth',v)} options={months} placeholder="Month"/>
            <Sel value={job.startYear} onChange={v=>updJ(i,'startYear',v)} options={years} placeholder="Year"/>
          </div>
        </div>
        <div>
          <FL>End date</FL>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            <Sel value={job.endMonth} onChange={v=>updJ(i,'endMonth',v)} options={months} placeholder="Month" disabled={job.current}/>
            <Sel value={job.endYear} onChange={v=>updJ(i,'endYear',v)} options={years} placeholder="Year" disabled={job.current}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:7,marginTop:7,cursor:'pointer'}}><input type="checkbox" checked={job.current} onChange={e=>updJ(i,'current',e.target.checked)} style={{accentColor:C.teal,width:14,height:14}}/><span style={{fontSize:12,color:C.slate,fontFamily:F}}>I currently work here</span></label>
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <FL optional hint="What did you own? What were your core responsibilities?">Role description</FL>
        <TA value={job.description} onChange={v=>updJ(i,'description',v)} placeholder="Describe your role, team size, scope of responsibilities..." rows={3}/>
      </div>
      <div style={{marginBottom:10}}>
        <FL optional hint="Use numbers where possible — revenue, growth %, team size, cost savings.">Key accomplishments</FL>
        {job.accomplishments.map((acc,ai)=><div key={ai} style={{marginBottom:7}}>
          <TI value={acc} onChange={v=>updA(i,ai,v)} placeholder={ai===0?'e.g. Grew ARR from $2M to $18M in 24 months':ai===1?'e.g. Led team of 12 engineers to ship core platform 3 months early':'e.g. Reduced churn by 34% through new onboarding program'}/>
        </div>)}
      </div>
      {!job.current&&<div>
        <FL optional>Reason for leaving (not shown to recruiters)</FL>
        <Sel value={job.reasonForLeaving} onChange={v=>updJ(i,'reasonForLeaving',v)} options={['Better opportunity','Layoff / reduction in force','Company closed','Seeking career growth','Relocation','Personal reasons','Contract ended','Pursuing education','Other']} placeholder="Select a reason..."/>
      </div>}
    </Block>)}
    <AddBtn onClick={addJ} label="Add another role"/>
    <Div label="Volunteer experience (optional)"/>
    <p style={{fontSize:13,color:C.gray400,margin:'0 0 12px',fontFamily:F}}>Volunteer work can be just as relevant as paid experience and is a factor in culture and mission-driven matching.</p>
    {d.volunteer.map((v,i)=><Block key={i} title={`Volunteer role ${i+1}`} onRemove={()=>remV(i)} canRemove={true} accent={C.green}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div><FL>Organization</FL><TI value={v.org} onChange={val=>updV(i,'org',val)} placeholder="e.g. Habitat for Humanity"/></div>
        <div><FL>Role</FL><TI value={v.role} onChange={val=>updV(i,'role',val)} placeholder="e.g. Board Member, Volunteer Coach"/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
        <div><FL>Cause / focus area</FL><TI value={v.cause} onChange={val=>updV(i,'cause',val)} placeholder="e.g. Housing, Education"/></div>
        <div><FL>Start year</FL><Sel value={v.startYear} onChange={val=>updV(i,'startYear',val)} options={years} placeholder="Year"/></div>
        <div>
          <FL>End year</FL>
          <Sel value={v.endYear} onChange={val=>updV(i,'endYear',val)} options={years} placeholder="Year" disabled={v.current}/>
          <label style={{display:'flex',alignItems:'center',gap:6,marginTop:5,cursor:'pointer'}}><input type="checkbox" checked={v.current} onChange={e=>updV(i,'current',e.target.checked)} style={{accentColor:C.teal,width:13,height:13}}/><span style={{fontSize:11,color:C.slate,fontFamily:F}}>Ongoing</span></label>
        </div>
      </div>
      <div><FL optional>Description</FL><TA value={v.description} onChange={val=>updV(i,'description',val)} placeholder="What did you do? What impact did it have?" rows={2}/></div>
    </Block>)}
    <AddBtn onClick={addV} label="Add volunteer experience"/>
    <Div label="Employment gaps"/>
    <div style={{marginBottom:16}}><FL optional hint="Only share what you're comfortable with.">Any gaps you'd like to explain?</FL><TA value={d.gaps} onChange={v=>set(x=>({...x,gaps:v}))} placeholder="e.g. Took 18 months off to care for a family member. Returned to work in 2023." rows={2}/></div>
    <FL required>Current employment status</FL>
    <RG options={['Employed full-time','Employed part-time','Self-employed / Freelance','Currently unemployed','Student','Career break (planned)']} value={d.empStatus} onChange={v=>set(x=>({...x,empStatus:v}))}/>
    <ErrMsg msg={errors?.empStatus}/>
  </>;}

// ── Section 5: Skills & Expertise ────────────────────────────────────────────
function S5({d,set,errors}:SecProps){
  function addP(){set(x=>({...x,projects:[...x.projects,{...BP}]}));}
  function updP(i:number,k:keyof Project,v:string){set(x=>({...x,projects:x.projects.map((p,idx)=>idx===i?{...p,[k]:v}:p)}));}
  function remP(i:number){set(x=>({...x,projects:x.projects.filter((_,idx)=>idx!==i)}));}
  return<>
    <ST section="Section 5 of 9" title="Skills & Expertise" sub="Type any skill and press Enter. The more accurately you represent your skills, the better your matches."/>
    <Div/>
    <div style={{marginBottom:20}}>
      <FL required hint="Include technical, functional, and interpersonal skills all in one place. Press Enter or comma to add.">Your skills</FL>
      <TagInput values={d.skills} onChange={v=>set(x=>({...x,skills:v}))} suggestions={SKILL_SUGGESTIONS} placeholder="e.g. Product Management, SQL, Leadership, React..."/>
      {d.skills.length>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>{d.skills.length} skills added · type to add more</div>}
      <ErrMsg msg={errors?.skills}/>
    </div>
    <div style={{marginBottom:20}}>
      <FL required>Overall seniority level</FL>
      <RG options={['Entry — building foundational skills (0–2 yrs)','Mid-level — solid independent contributor (3–5 yrs)','Senior — deep expertise, sometimes leads others (6–10 yrs)','Lead / Principal — sets direction, mentors others (10+ yrs)','Executive — organizational leadership']} value={d.seniority} onChange={v=>set(x=>({...x,seniority:v}))}/>
      <ErrMsg msg={errors?.seniority}/>
    </div>
    <Div label="Languages"/>
    {d.languages.map((lang,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,marginBottom:8,alignItems:'end'}}>
      <div><FL>Language</FL><AI value={lang.language} onChange={v=>set(x=>({...x,languages:x.languages.map((l,idx)=>idx===i?{...l,language:v}:l)}))} suggestions={LANG_LIST} placeholder="e.g. Spanish"/></div>
      <div><FL>Proficiency</FL><Sel value={lang.proficiency} onChange={v=>set(x=>({...x,languages:x.languages.map((l,idx)=>idx===i?{...l,proficiency:v}:l)}))} options={LANGUAGE_PROFICIENCY} placeholder="Select level..."/></div>
      {d.languages.length>1&&<button onClick={()=>set(x=>({...x,languages:x.languages.filter((_,idx)=>idx!==i)}))} style={{background:'none',border:'none',color:C.gray400,fontSize:20,cursor:'pointer',paddingBottom:6}}>×</button>}
    </div>)}
    <AddBtn onClick={()=>set(x=>({...x,languages:[...x.languages,{...BL}]}))} label="Add a language"/>
    <Div label="Projects & portfolio (optional)"/>
    <p style={{fontSize:13,color:C.gray400,margin:'0 0 12px',fontFamily:F}}>Personal projects, side projects, open source contributions, or notable work samples.</p>
    {d.projects.map((p,i)=><Block key={i} title={`Project ${i+1}`} onRemove={()=>remP(i)} canRemove={true} accent={C.purple}>
      <div style={{marginBottom:10}}><FL>Project name</FL><TI value={p.name} onChange={v=>updP(i,'name',v)} placeholder="e.g. OpenBudget, Personal Finance App"/></div>
      <div style={{marginBottom:10}}><FL>Description</FL><TA value={p.description} onChange={v=>updP(i,'description',v)} placeholder="What did you build? What problem does it solve? What was your role?" rows={3}/></div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:10}}>
        <div><FL optional>URL</FL><TI value={p.url} onChange={v=>updP(i,'url',v)} placeholder="https://..."/></div>
        <div><FL>Start year</FL><TI value={p.startYear} onChange={v=>updP(i,'startYear',v)} placeholder="2022"/></div>
        <div><FL>End year</FL><TI value={p.endYear} onChange={v=>updP(i,'endYear',v)} placeholder="2023 or Present"/></div>
      </div>
    </Block>)}
    <AddBtn onClick={addP} label="Add a project"/>
    <Div label="Honors, awards & publications (optional)"/>
    {d.awards.map((a,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'end'}}>
      <div><FL>Award or honor</FL><TI value={a.name} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,name:v}:aw)}))} placeholder="e.g. Forbes 30 Under 30, Dean's List"/></div>
      <div><FL>Issuer</FL><TI value={a.issuer} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,issuer:v}:aw)}))} placeholder="e.g. Forbes"/></div>
      <div><FL>Year</FL><TI value={a.year} onChange={v=>set(x=>({...x,awards:x.awards.map((aw,idx)=>idx===i?{...aw,year:v}:aw)}))} placeholder="2022"/></div>
      <button onClick={()=>set(x=>({...x,awards:x.awards.filter((_,idx)=>idx!==i)}))} style={{background:'none',border:'none',color:C.gray400,fontSize:20,cursor:'pointer',paddingBottom:6}}>×</button>
    </div>)}
    <AddBtn onClick={()=>set(x=>({...x,awards:[...x.awards,{...BAw}]}))} label="Add an award or publication"/>
  </>;}

// ── Section 6: Job Preferences ───────────────────────────────────────────────
function S6({d,set,errors}:SecProps){
  const fmtS=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const fmtC=(v:number)=>v>=90?'90+ min':`${v} min`;
  return<>
    <ST section="Section 6 of 9" title="Job Preferences & Critical Needs" sub="Your ranges and non-negotiables. These automatically filter out roles before you ever see them — so be honest."/>
    <Div/>
    <div style={{marginBottom:20}}>
      <FL required hint="Add each title as a tag — press Enter after each one.">Target job titles</FL>
      <TagInput values={d.targetTitles} onChange={v=>set(x=>({...x,targetTitles:v}))} suggestions={TITLE_SUGGESTIONS} placeholder="e.g. Senior Product Manager, Director of Operations..."/>
      <ErrMsg msg={errors?.targetTitles}/>
    </div>
    <Div label="Salary"/>
    <div style={{marginBottom:16}}>
      <FL required hint="The number you'd be thrilled to accept. Not your floor.">Ideal salary (base pay only)</FL>
      <Slider value={d.idealSalary} onChange={v=>set(x=>({...x,idealSalary:Math.max(v,x.minSalary)}))} min={30} max={500} step={5} format={fmtS}/>
    </div>
    <div style={{marginBottom:20}}>
      <FL required hint="Your absolute floor. We will not show you anything below this.">Minimum acceptable salary (base pay only)</FL>
      <Slider value={d.minSalary} onChange={v=>set(x=>({...x,minSalary:Math.min(v,x.idealSalary)}))} min={30} max={500} step={5} format={fmtS}/>
      {d.idealSalary-d.minSalary>0&&<div style={{fontSize:12,color:C.gray400,marginTop:6,fontFamily:F}}>Acceptable range: {fmtS(d.minSalary)} – {fmtS(d.idealSalary)}</div>}
    </div>
    <Div label="Location & remote"/>
    <div style={{marginBottom:16}}><FL required>Remote work preference</FL><RG options={['Remote only — I will not commute','Strongly prefer remote, open to occasional on-site','Hybrid — mix of remote and office is ideal','Flexible — whatever the role requires','On-site preferred']} value={d.remotePreference} onChange={v=>set(x=>({...x,remotePreference:v}))}/><ErrMsg msg={errors?.remotePreference}/></div>
    {!d.remotePreference.includes('Remote only')&&d.remotePreference&&<div style={{marginBottom:16}}><FL hint="Based on your ZIP code, we filter roles by drive/transit time.">Maximum one-way commute you&apos;d accept</FL><Slider value={d.maxCommute} onChange={v=>set(x=>({...x,maxCommute:v}))} min={10} max={90} step={5} format={fmtC}/></div>}
    <div style={{marginBottom:16}}><FL>Open to relocation?</FL><RG options={['No — staying where I am','Yes — anywhere','Yes — specific regions only']} value={d.relocation} onChange={v=>set(x=>({...x,relocation:v}))}/>{d.relocation?.includes('specific regions')&&<div style={{marginTop:8}}><TI value={d.relocationRegions} onChange={v=>set(x=>({...x,relocationRegions:v}))} placeholder="e.g. Southeast US, New York metro, Pacific Northwest"/></div>}</div>
    <Div label="Role type & timing"/>
    <div style={{marginBottom:16}}><FL required>Employment type</FL><CG options={EMPLOYMENT_TYPES} values={d.employmentType} onChange={v=>set(x=>({...x,employmentType:v}))} columns={2}/><ErrMsg msg={errors?.employmentType}/></div>
    <div style={{marginBottom:16}}><FL required>When are you available to start?</FL><RG options={['Immediately (within 2 weeks)','Within 1 month','1–3 months','3–6 months','Exploring — no fixed timeline']} value={d.availability} onChange={v=>set(x=>({...x,availability:v}))}/><ErrMsg msg={errors?.availability}/></div>
    <div style={{marginBottom:16}}><FL>Willing to travel for work?</FL><RG options={TRAVEL_LEVELS} value={d.travel} onChange={v=>set(x=>({...x,travel:v}))}/></div>
    <Div label="Company preferences"/>
    <div style={{marginBottom:16}}><FL>Preferred company size</FL><CG options={['Startup (1–50)','Small (51–200)','Mid-size (201–1,000)','Large (1,001–10,000)','Enterprise (10,000+)','No preference']} values={d.companySize} onChange={v=>set(x=>({...x,companySize:v}))} columns={2}/></div>
    <div style={{marginBottom:16}}>
      <FL optional>Industries you&apos;d like to work in</FL>
      <p style={{fontSize:13,color:C.gray400,margin:'0 0 8px',fontFamily:F}}>Leave blank to stay open to all.</p>
      <MD options={INDUSTRIES} values={d.targetIndustries} onChange={v=>set(x=>({...x,targetIndustries:v}))} placeholder="Search and select industries..."/>
    </div>
  </>;}

// ── Section 7: Work Style & Culture ──────────────────────────────────────────
function S7({d,set,errors}:SecProps){return<>
  <ST section="Section 7 of 9" title="Work Style & Culture" sub="These answers are matched directly against how companies describe themselves. The more honest you are, the better your matches."/>
  <Div/>
  <div style={{marginBottom:16}}><FL required hint="These exact descriptors are what companies use to describe their culture — overlap = culture match score.">What kind of culture are you looking for?</FL><CG options={CULTURE_DESCRIPTORS} values={d.targetCulture} onChange={v=>set(x=>({...x,targetCulture:v}))} columns={2}/><ErrMsg msg={errors?.targetCulture}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL required>Preferred management style from your direct manager</FL><RG options={MGMT_STYLES} value={d.mgmtStyle} onChange={v=>set(x=>({...x,mgmtStyle:v}))}/><ErrMsg msg={errors?.mgmtStyle}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL required>How do you prefer to receive feedback?</FL><RG options={['Real-time — as I go','Regular check-ins (weekly or bi-weekly)','Formal periodic reviews (quarterly)','Self-directed — I ask when I need it']} value={d.feedbackStyle} onChange={v=>set(x=>({...x,feedbackStyle:v}))}/><ErrMsg msg={errors?.feedbackStyle}/></div>
  <Div/>
  <div style={{marginBottom:16}}>
    <FL hint="Pick up to 3.">What motivates you most at work?</FL>
    <CG options={['Meaningful impact / mission','Career growth & advancement','Compensation & financial rewards','Learning new skills','Creative freedom','Team & culture','Flexibility & autonomy','Recognition & visibility','Stability & security','Ownership & autonomy']} values={d.motivators} onChange={v=>set(x=>({...x,motivators:v}))} max={3} columns={2}/>
    <div style={{fontSize:11,color:C.gray400,marginTop:6,fontFamily:F}}>{d.motivators.length}/3 selected</div>
  </div>
  <Div/>
  <div style={{marginBottom:16}}><FL optional>Industries you&apos;ve worked in</FL><MD options={INDUSTRIES} values={d.industries} onChange={v=>set(x=>({...x,industries:v}))} placeholder="Search and select industries..."/></div>
</>;}

// ── Section 8: Personality ────────────────────────────────────────────────────
function S8({d,set}:SecProps){return<>
  <ST section="Section 8 of 9" title="Personality & Behavioral Profile" sub="Our workplace-calibrated personality assessment. No right or wrong answers — just be honest."/>
  <Div/>
  <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:'14px 16px',marginBottom:24}}>
    <p style={{fontSize:13,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>Rate yourself 1–5 on each scale. 1 = strongly left, 5 = strongly right, 3 = balanced. Your scores are compared against what employers say their role requires.</p>
  </div>
  {PERSONALITY_DIMS_SEEKER.map(q=><ScaleQ key={q.id} question={q.q} low={q.low} high={q.high} value={d.personality[q.id]} onChange={v=>set(x=>({...x,personality:{...x.personality,[q.id]:v}}))}/>)}
  <Div/>
  <div style={{marginBottom:16}}>
    <FL>Communication style</FL>
    <RG options={['Direct and concise — I say exactly what I mean','Diplomatic — I\'m very mindful of how things land','Expressive — I bring energy and enthusiasm to everything','Analytical — I lead with data, evidence, and logic']} value={d.commStyle} onChange={v=>set(x=>({...x,commStyle:v}))}/>
  </div>
  <Div/>
  <div>
    <FL>When you make a mistake at work, you typically...</FL>
    <RG options={['Own it immediately, fix it, and move on without dwelling','Analyze carefully what went wrong before moving forward','Take it hard personally but use it as fuel to improve','Focus energy on prevention systems so it doesn\'t happen again']} value={d.mistakeStyle} onChange={v=>set(x=>({...x,mistakeStyle:v}))}/>
  </div>
</>;}

// ── Section 9: Goals & Intentions ────────────────────────────────────────────
function S9({d,set,errors}:SecProps){return<>
  <ST section="Section 9 of 9" title="Career Goals & Intentions" sub="Understanding where you're headed helps us find roles that are a genuine step forward — not lateral moves you'll regret."/>
  <Div/>
  <div style={{marginBottom:16}}><FL required>What&apos;s your primary goal right now?</FL><RG options={['Find a significantly better-paying role','Advance to a more senior position','Switch industries or functions entirely','Find better work-life balance / less demanding pace','Return to work after a career break','Find more stability and job security','Find more meaningful or mission-driven work','Start something of my own — exploring options','Still figuring it out — open to conversations']} value={d.primaryGoal} onChange={v=>set(x=>({...x,primaryGoal:v}))}/><ErrMsg msg={errors?.primaryGoal}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL>Where do you see yourself in 3–5 years?</FL><RG options={['In a leadership or people management role','A deep subject-matter expert / senior individual contributor','Running my own business or freelancing full-time','Still growing within my current function and domain','I genuinely don\'t know yet — I\'m keeping options open']} value={d.fiveYear} onChange={v=>set(x=>({...x,fiveYear:v}))}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL>How actively are you searching right now?</FL><RG options={['Actively — I want to move fast and am interviewing now','Open to the right opportunity — not in a rush','Passively exploring — not actively applying anywhere','Happily employed but curious what\'s out there']} value={d.searchIntensity} onChange={v=>set(x=>({...x,searchIntensity:v}))}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL>What would it take for you to stay at your current job? (if applicable)</FL><CG options={['Significant salary increase (20%+)','Promotion or meaningful title change','More remote flexibility','Better management or cultural changes','Nothing — I am ready to leave regardless','Not applicable (currently unemployed or in school)']} values={d.stayReasons} onChange={v=>set(x=>({...x,stayReasons:v}))} columns={2}/></div>
  <Div/>
  <div style={{marginBottom:16}}><FL optional>How did you hear about Matcht?</FL><Sel value={d.referralSource} onChange={v=>set(x=>({...x,referralSource:v}))} options={['Friend or colleague referral','LinkedIn','Google search','Instagram / TikTok / social media','Reddit','Newsletter or blog','News article','App store','Other']}/></div>
  <Div/>
  <div style={{marginBottom:16}}>
    <FL optional hint="This never appears to recruiters — it's your personal context for us.">Anything else we should know?</FL>
    <TA value={d.personalNote} onChange={v=>set(x=>({...x,personalNote:v}))} placeholder="e.g. I'm relocating to Austin in Q3 2026. I'm only looking at FinTech roles. My portfolio is at..." rows={4}/>
  </div>
</>;}

// ── Review ────────────────────────────────────────────────────────────────────
function ReviewScreen({data}:{data:SurveyData}){
  const fmtS=(v:number)=>v>=500?'$500k+':`$${v}k`;
  const sections=[
    {title:'Contact & Identity',items:[['Name',`${data.firstName} ${data.lastName}`.trim()],['Location',data.location],['Headline',data.headline],['Work authorization',data.workAuth]] as [string,string][]},
    {title:'Education',items:data.degrees?.filter(d=>d.level).map(d=>[d.level,d.university?`${d.university}${d.gradYear?`, ${d.gradYear}`:''}`:d.gradYear||'']) as [string,string][]},
    {title:'Work History',items:data.jobs?.filter(j=>j.company).map(j=>[j.title,`${j.company}${j.current?' (current)':''}`]) as [string,string][]},
    {title:'Skills',items:[['Total skills',`${data.skills?.length||0} added`],['Top skills',data.skills?.slice(0,5).join(', ')||''],['Seniority',data.seniority]] as [string,string][]},
    {title:'Job Preferences',items:[['Target titles',data.targetTitles?.slice(0,3).join(', ')],['Ideal salary',data.idealSalary?fmtS(data.idealSalary):''],['Minimum salary',data.minSalary?fmtS(data.minSalary):''],['Remote preference',data.remotePreference],['Availability',data.availability]] as [string,string][]},
    {title:'Work Style',items:[['Culture',data.targetCulture?.slice(0,3).join(', ')],['Mgmt style',data.mgmtStyle],['Motivators',data.motivators?.slice(0,3).join(', ')]] as [string,string][]},
    {title:'Goals',items:[['Primary goal',data.primaryGoal],['Search status',data.searchIntensity]] as [string,string][]},
  ];
  return<>
    <ST section="Final step" title="Review your profile" sub="Check everything looks right. Once you submit, your profile goes live and we start matching you immediately. You can edit anything at any time."/>
    <Div/>
    {sections.map(s=>s.items?.some(([,v])=>v)&&<div key={s.title} style={{marginBottom:20}}>
      <div style={{fontSize:12,fontWeight:700,color:C.teal,textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:F}}>{s.title}</div>
      {s.items?.filter(([,v])=>v).map(([l,v])=><div key={l} style={{display:'flex',borderBottom:`1px solid ${C.border}`,padding:'9px 0',gap:12}}>
        <span style={{fontSize:13,color:C.gray600,width:140,flexShrink:0,fontFamily:F}}>{l}</span>
        <span style={{fontSize:13,color:C.slate,fontWeight:500,fontFamily:F,lineHeight:1.4}}>{v}</span>
      </div>)}
    </div>)}
    <div style={{marginTop:20,background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:'16px 18px'}}>
      <p style={{fontSize:14,color:C.teal,fontWeight:600,margin:0,fontFamily:F}}>✓ Your Matcht profile is your new resume. It works for you 24/7 — no more applying blind, no more filling out forms from scratch.</p>
    </div>
  </>;
}

const SECTIONS=[
  {label:'Basic Info',Comp:S1},{label:'Summary',Comp:S2},{label:'Education',Comp:S3},
  {label:'Work History',Comp:S4},{label:'Skills',Comp:S5},{label:'Preferences',Comp:S6},
  {label:'Work Style',Comp:S7},{label:'Personality',Comp:S8},{label:'Goals',Comp:S9},
];

function validateSection(step:number,d:SurveyData):Record<string,string>{
  const e:Record<string,string>={};
  if(step===1){
    if(!d.firstName.trim())e.firstName='First name is required';
    if(!d.lastName.trim())e.lastName='Last name is required';
    if(!d.email.trim())e.email='Email address is required';
    if(!d.location.trim())e.location='City & state is required';
    if(!d.zip.trim())e.zip='ZIP code is required';
    if(!d.workAuth)e.workAuth='Please select your work authorization status';
  }
  if(step===4){
    if(!d.empStatus)e.empStatus='Please select your current employment status';
  }
  if(step===5){
    if(d.skills.length===0)e.skills='Add at least one skill';
    if(!d.seniority)e.seniority='Please select your seniority level';
  }
  if(step===6){
    if(d.targetTitles.length===0)e.targetTitles='Add at least one target job title';
    if(!d.remotePreference)e.remotePreference='Please select your remote work preference';
    if(d.employmentType.length===0)e.employmentType='Select at least one employment type';
    if(!d.availability)e.availability='Please select your availability';
  }
  if(step===7){
    if(d.targetCulture.length===0)e.targetCulture='Select at least one culture descriptor';
    if(!d.mgmtStyle)e.mgmtStyle='Please select your preferred management style';
    if(!d.feedbackStyle)e.feedbackStyle='Please select your preferred feedback style';
  }
  if(step===9){
    if(!d.primaryGoal)e.primaryGoal='Please select your primary goal';
  }
  return e;
}

function deriveExpYears(jobs:WorkJob[]):number{
  const mos=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now=new Date();
  return Math.round(jobs.reduce((acc,j)=>{
    const sy=j.startYear?parseInt(j.startYear):NaN;
    const sm=j.startMonth?mos.indexOf(j.startMonth):0;
    const ey=j.current?now.getFullYear():(j.endYear?parseInt(j.endYear):NaN);
    const em=j.current?now.getMonth():(j.endMonth?mos.indexOf(j.endMonth):11);
    if(isNaN(sy)||isNaN(ey))return acc;
    const s=new Date(sy,sm);const e=new Date(ey,em);
    return e>s?acc+(e.getTime()-s.getTime())/(1000*60*60*24*365.25):acc;
  },0))||0;
}

function migrateJob(raw:Record<string,unknown>):WorkJob{
  if(typeof raw.startYear==='string'&&raw.startYear)return raw as unknown as WorkJob;
  const mos=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const pd=(s:string)=>{const p=(s||'').split('/');if(p.length===2){const m=parseInt(p[0]);return{month:mos[m-1]||'',year:p[1]};}return{month:'',year:''};};
  const st=pd(String(raw.startDate||''));const en=pd(String(raw.endDate||''));
  return{company:String(raw.company||''),title:String(raw.title||''),location:'',
    startMonth:st.month,startYear:st.year,endMonth:en.month,endYear:en.year,
    current:Boolean(raw.current),employmentType:'',
    description:String(raw.responsibilities||''),
    accomplishments:[String(raw.accomplishments||''),'',''],reasonForLeaving:''};
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfileSurvey(){
  const {user,profile,loading,refreshProfile}=useUser();
  const router=useRouter();
  const supabase=useMemo(()=>createClient(),[]);
  const prefillDone=useRef(false);

  const [step,setStep]=useState(-1);
  const [data,setData]=useState<SurveyData>(INIT);
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState('');
  const [done,setDone]=useState(false);
  const [isEdit,setIsEdit]=useState(false);
  const [autoSaved,setAutoSaved]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [savingSection,setSavingSection]=useState(false);
  const [sectionSaved,setSectionSaved]=useState(false);
  const [showDraftBanner,setShowDraftBanner]=useState(false);
  const [saveLog,setSaveLog]=useState<SaveEntry[]>([]);
  const [slowSave,setSlowSave]=useState(false);
  const total=SECTIONS.length;
  const isReview=step>total;

  // Pre-fill from DB + restore localStorage draft
  useEffect(()=>{
    if(loading)return;
    const uid=profile?.id??user?.id;

    if(!profile){
      // No DB row yet — brand-new user
      if(uid){
        try{
          const hasSeen=localStorage.getItem(`matcht_resume_seen_${uid}`)==='true';
          if(!hasSeen){prefillDone.current=true;setStep(0);return;}
          const stepStr=localStorage.getItem(`matcht_profile_step_${uid}`);
          if(stepStr){const n=parseInt(stepStr);if(n>=1&&n<=total+1)setStep(n);}
          const s=localStorage.getItem(`matcht_profile_draft_${uid}`);
          if(s){prefillDone.current=true;setData(JSON.parse(s) as SurveyData);setShowDraftBanner(true);return;}
        }catch{}
      }
      prefillDone.current=true;setStep(0);return;
    }

    setIsEdit(!!profile.profile_complete);

    const fp:SurveyData={
      firstName:profile.first_name??profile.name?.split(' ')[0]??'',
      lastName:profile.last_name??profile.name?.split(' ').slice(1).join(' ')??'',
      email:profile.email??'',phone:profile.phone??'',location:profile.location??'',
      zip:profile.zip??'',
      headline:profile.headline??'',linkedin:profile.linkedin??'',
      website:profile.website??'',otherLink:profile.other_link??'',
      workAuth:profile.work_auth??'',
      gender:profile.gender??'',race:profile.race??'',veteran:profile.veteran??'',disability:profile.disability??'',
      summary:profile.summary??'',
      accomplishments:Array.isArray(profile.accomplishments)&&(profile.accomplishments as string[]).length===3
        ?(profile.accomplishments as string[])
        :['','',''],
      degrees:Array.isArray(profile.degrees)&&(profile.degrees as Record<string,unknown>[]).length>0
        ?(profile.degrees as Record<string,unknown>[]).map(d=>({level:String(d.level||''),field:String(d.field||''),university:String(d.university||''),gradYear:String(d.gradYear||''),current:Boolean(d.current),gpa:String(d.gpa||''),activities:String(d.activities||'')}))
        :[{...BD}],
      certifications:Array.isArray(profile.certifications)
        ?(profile.certifications as Record<string,unknown>[]).map(c=>({name:String(c.name||''),issuer:String(c.issuer||''),date:String(c.date||''),expiry:String(c.expiry||''),credentialId:String(c.credentialId||'')}))
        :[],
      testScores:(profile.test_scores as Record<string,string>)??{},
      jobs:Array.isArray(profile.jobs_history)&&(profile.jobs_history as Record<string,unknown>[]).length>0
        ?(profile.jobs_history as Record<string,unknown>[]).map(migrateJob)
        :[{...BJ}],
      volunteer:Array.isArray(profile.volunteer)
        ?(profile.volunteer as Record<string,unknown>[]).map(v=>({org:String(v.org||''),role:String(v.role||''),cause:String(v.cause||''),startYear:String(v.startYear||''),endYear:String(v.endYear||''),current:Boolean(v.current),description:String(v.description||'')}))
        :[],
      gaps:profile.gaps??'',empStatus:profile.emp_status??'',
      skills:Array.isArray(profile.skills)?profile.skills as string[]:[],
      seniority:profile.seniority??'',
      languages:Array.isArray(profile.languages)&&(profile.languages as Record<string,string>[]).length>0
        ?(profile.languages as Record<string,string>[]).map(l=>({language:l.language||'',proficiency:l.proficiency||''}))
        :[{...BL}],
      projects:Array.isArray(profile.projects)
        ?(profile.projects as Record<string,unknown>[]).map(p=>({name:String(p.name||''),description:String(p.description||''),url:String(p.url||''),startYear:String(p.startYear||''),endYear:String(p.endYear||'')}))
        :[],
      awards:Array.isArray(profile.awards)
        ?(profile.awards as Record<string,string>[]).map(a=>({name:a.name||'',issuer:a.issuer||'',year:a.year||''}))
        :[],
      targetTitles:Array.isArray(profile.target_titles)?profile.target_titles as string[]:[],
      idealSalary:profile.ideal_salary?Math.round(profile.ideal_salary/1000):(profile.salary_max?Math.round(profile.salary_max/1000):100),
      minSalary:profile.min_salary?Math.round(profile.min_salary/1000):(profile.salary_min?Math.round(profile.salary_min/1000):75),
      remotePreference:profile.remote_preference??'',maxCommute:profile.max_commute??30,
      employmentType:Array.isArray(profile.employment_type)?profile.employment_type as string[]:[],
      availability:profile.availability??'',relocation:profile.relocation??'',
      relocationRegions:profile.relocation_regions??'',travel:profile.travel??'',
      companySize:Array.isArray(profile.company_size)?profile.company_size as string[]:[],
      targetIndustries:Array.isArray(profile.target_industries)?profile.target_industries as string[]:[],
      targetCulture:Array.isArray(profile.target_culture)?profile.target_culture as string[]:[],
      mgmtStyle:profile.mgmt_style??'',feedbackStyle:profile.feedback_pref??'',
      motivators:Array.isArray(profile.motivators)?profile.motivators as string[]:[],
      industries:Array.isArray(profile.industries)?profile.industries as string[]:[],
      personality:(profile.personality as Record<string,number>)??{},
      commStyle:profile.comm_style??'',mistakeStyle:profile.mistake_style??'',
      primaryGoal:profile.primary_goal??'',fiveYear:profile.five_year??'',
      searchIntensity:profile.search_intensity??'',
      stayReasons:Array.isArray(profile.stay_reasons)?profile.stay_reasons as string[]:[],
      referralSource:profile.referral_source??'',personalNote:profile.bio??'',
    };

    if(profile.profile_complete){
      // Returning user with complete profile — edit mode, start at section 1
      prefillDone.current=true;setStep(1);setData(fp);return;
    }

    // Incomplete profile — check resume screen and restore draft/step
    const id=profile.id;
    // Skip resume page if localStorage flag is set OR if profile already has data in DB
    const hasSeen=localStorage.getItem(`matcht_resume_seen_${id}`)==='true'||!!(profile.first_name||profile.headline||profile.summary);
    if(!hasSeen){prefillDone.current=true;setStep(0);return;}
    try{
      const stepStr=localStorage.getItem(`matcht_profile_step_${id}`);
      if(stepStr){const n=parseInt(stepStr);if(n>=1&&n<=total+1)setStep(n);}
      const s=localStorage.getItem(`matcht_profile_draft_${id}`);
      if(s){prefillDone.current=true;setData(JSON.parse(s) as SurveyData);setShowDraftBanner(true);return;}
    }catch{}
    prefillDone.current=true;setStep(1);setData(fp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[loading,profile?.id]);

  // Auto-save to localStorage (800ms debounce) — only after pre-fill has run
  useEffect(()=>{
    if(!prefillDone.current)return;
    const uid=profile?.id??user?.id;
    if(!uid)return;
    const t=setTimeout(()=>{
      try{localStorage.setItem(`matcht_profile_draft_${uid}`,JSON.stringify(data));setAutoSaved(true);setTimeout(()=>setAutoSaved(false),2000);}catch{}
    },800);
    return()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);

  function go(n:number){
    setErrors({});setStep(n);window.scrollTo({top:0,behavior:'smooth'});
    const uid=profile?.id??user?.id;
    if(uid)try{
      if(n>=1)localStorage.setItem(`matcht_resume_seen_${uid}`,'true');
      localStorage.setItem(`matcht_profile_step_${uid}`,String(n));
    }catch{}
  }

  async function signOut(){
    const uid=profile?.id??user?.id;
    if(uid){
      try{localStorage.removeItem(`matcht_profile_draft_${uid}`);}catch{}
      try{localStorage.removeItem(`matcht_profile_step_${uid}`);}catch{}
    }
    try{await Promise.race([fetch('/api/auth/signout',{method:'POST'}),new Promise(r=>setTimeout(r,3000))]);}catch{}
    window.location.href='/';
  }

  async function saveProgress(d:SurveyData):Promise<boolean>{
    const uid=profile?.id??user?.id;
    if(!uid)return false;
    const sectionLabel=isReview?'Review':(SECTIONS[step-1]?.label??`Section ${step}`);
    const saveTime=new Date().toLocaleTimeString();
    const role=profile?.role??'seeker';
    setSectionSaved(false);
    try{
      // Section-specific payloads — only the fields for THIS section.
      // Smaller payloads, faster DB writes, and isolated failures.
      // BUG FIX: total_exp was a float (e.g. 5.2) but the DB column is integer.
      //          Use Math.round() to avoid "invalid input syntax for type integer" errors.
      const base={id:uid,role};
      let sectionPayload:Record<string,unknown>;
      if(step===1){
        sectionPayload={...base,
          name:`${d.firstName} ${d.lastName}`.trim(),
          first_name:d.firstName,last_name:d.lastName,
          phone:d.phone||null,location:d.location||null,zip:d.zip||null,
          work_auth:d.workAuth||null,headline:d.headline||null,
          linkedin:d.linkedin||null,website:d.website||null,other_link:d.otherLink||null,
          gender:d.gender||null,race:d.race||null,veteran:d.veteran||null,disability:d.disability||null,
        };
      }else if(step===2){
        sectionPayload={...base,summary:d.summary||null,accomplishments:d.accomplishments};
      }else if(step===3){
        sectionPayload={...base,degrees:d.degrees,certifications:d.certifications,test_scores:d.testScores};
      }else if(step===4){
        sectionPayload={...base,
          jobs_history:d.jobs,title:d.jobs[0]?.title||null,
          total_exp:Math.round(deriveExpYears(d.jobs))||null,
          volunteer:d.volunteer,gaps:d.gaps||null,emp_status:d.empStatus||null,
        };
      }else if(step===5){
        sectionPayload={...base,
          skills:d.skills,seniority:d.seniority||null,
          languages:d.languages.filter(l=>l.language),
          projects:d.projects,awards:d.awards,industries:d.industries,
        };
      }else if(step===6){
        sectionPayload={...base,
          target_titles:d.targetTitles,
          ideal_salary:d.idealSalary*1000,min_salary:d.minSalary*1000,
          salary_min:d.minSalary*1000,salary_max:d.idealSalary*1000,
          salary_label:`$${d.minSalary}k–$${d.idealSalary}k`,
          remote_preference:d.remotePreference||null,max_commute:d.maxCommute,
          employment_type:d.employmentType,availability:d.availability||null,
          relocation:d.relocation||null,relocation_regions:d.relocationRegions||null,
          travel:d.travel||null,company_size:d.companySize,target_industries:d.targetIndustries,
        };
      }else if(step===7){
        sectionPayload={...base,target_culture:d.targetCulture,mgmt_style:d.mgmtStyle||null,feedback_pref:d.feedbackStyle||null,motivators:d.motivators};
      }else if(step===8){
        sectionPayload={...base,personality:d.personality,comm_style:d.commStyle||null,mistake_style:d.mistakeStyle||null};
      }else if(step===9){
        sectionPayload={...base,primary_goal:d.primaryGoal||null,five_year:d.fiveYear||null,search_intensity:d.searchIntensity||null,stay_reasons:d.stayReasons,referral_source:d.referralSource||null,bio:d.personalNote||null};
      }else{
        // Fallback: minimal base — shouldn't normally be hit
        sectionPayload=base;
      }

      const bodyStr=JSON.stringify(sectionPayload);
      console.log('[saveProgress]',sectionLabel,'— payload:',bodyStr.length,'bytes, step:',step);

      // Step 1: get/refresh session with its own timeout (separates auth latency from DB latency)
      const sessionRace=await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error('Session refresh timed out — reload the page to re-authenticate')),8000)),
      ]);
      const token=sessionRace.data?.session?.access_token;
      if(!token)throw new Error('Not signed in — please reload and sign in again');

      // Step 2: direct REST upsert bypassing @supabase/ssr session wrapper.
      // Matches the Node.js test approach (100–300ms) — avoids the SSR client's
      // internal token-refresh blocking behaviour that was causing 8s+ hangs.
      const slowTimer=setTimeout(()=>setSlowSave(true),5000);
      try{
        const res=await Promise.race([
          fetch(`${SB_URL}/rest/v1/profiles`,{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'apikey':SB_ANON,
              'Authorization':`Bearer ${token}`,
              'Prefer':'resolution=merge-duplicates,return=minimal',
            },
            body:bodyStr,
          }),
          new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error('Save timed out. Your data is saved locally.')),12000)),
        ]);
        if(!res.ok){
          const errBody=await res.json().catch(()=>({})) as {message?:string};
          throw new Error(errBody.message||`Server error ${res.status}`);
        }
      }finally{
        clearTimeout(slowTimer);setSlowSave(false);
      }

      setSectionSaved(true);setSaveError('');setTimeout(()=>setSectionSaved(false),3000);
      setSaveLog(prev=>[{section:sectionLabel,status:'saved' as const,msg:'',time:saveTime},...prev].slice(0,20));
      refreshProfile().catch(()=>{});
      return true;
    }catch(err:unknown){
      const msg=(err as {message?:string})?.message||'Save failed. Check your connection and try again.';
      const status:SaveEntry['status']=msg.toLowerCase().includes('timeout')||msg.toLowerCase().includes('timed out')?'timeout':'failed';
      console.error('[saveProgress] error:', err);
      setSaveError(msg);
      setSaveLog(prev=>[{section:sectionLabel,status,msg,time:saveTime},...prev].slice(0,20));
      return false;
    }finally{setSavingSection(false);} // savingSection kept for submit spinner; not set by saveProgress
  }

  async function submit(){
    console.log('submit clicked');
    const uid=profile?.id??user?.id;
    if(!uid){console.error('[submit] abort: no uid');return;}
    setSaving(true);setSaveError('');
    try{
      // All section data already saved by saveProgress on each Continue click.
      // Only need to flip profile_complete — tiny operation.
      const completeTimeout=new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error('Profile complete request timed out')),10000));
      const res=await Promise.race([fetch('/api/profile/complete',{method:'POST'}),completeTimeout]);
      if(!res.ok){
        const j=await res.json().catch(()=>({})) as {error?:string};
        throw new Error(j.error||`Server error ${res.status}`);
      }
      fetch('/api/match-scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seekerId:uid})}).catch(()=>{});
      if(!profile?.profile_complete){
        fetch('/api/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'seeker-welcome',seekerId:uid})}).catch(()=>{});
      }
      // Await refresh so dashboard sees profile_complete=true before user navigates there
      await refreshProfile().catch(()=>{});
      try{localStorage.removeItem(`matcht_profile_draft_${uid}`);}catch{}
      try{localStorage.removeItem(`matcht_profile_step_${uid}`);}catch{}
      try{localStorage.removeItem(`matcht_resume_seen_${uid}`);}catch{}
      setDone(true);
    }catch(err:unknown){
      setSaveError((err as Error)?.message||'Save failed. Your answers are saved locally — please try again.');
    }finally{setSaving(false);}
  }

  if(loading||step<0){
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

  const SecComp=!isReview?SECTIONS[step-1]?.Comp:null;

  return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:F,paddingBottom:100}}>
      <style>{`
        input[type=range]{height:5px;background:${C.gray100};border-radius:3px;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:${C.teal};cursor:pointer;box-shadow:0 1px 6px rgba(26,140,140,.4)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:${C.teal};cursor:pointer;border:none}
      `}</style>

      {/* Sticky progress header — no logo (Nav already has it) */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:12,position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
        {sectionSaved&&<span style={{fontSize:11,color:C.green,fontWeight:600,fontFamily:F}}>✓ Saved</span>}
        {slowSave&&!sectionSaved&&<span style={{fontSize:11,color:C.amber,fontWeight:600,fontFamily:F}}>Still saving… hang tight</span>}
        {!savingSection&&!sectionSaved&&!slowSave&&autoSaved&&<span style={{fontSize:11,color:C.gray400,fontWeight:500,fontFamily:F}}>✓ Draft saved</span>}
        {saveError&&!slowSave&&<span style={{fontSize:11,color:C.amber,fontWeight:600,fontFamily:F}}>⚠ {saveError}</span>}
        <span style={{fontSize:12,color:C.gray600,fontWeight:500,fontFamily:F}}>
          {step===0?'Step 0 · Resume upload':isReview?'Review & submit':`${step} of ${total} · ${SECTIONS[step-1]?.label}`}
        </span>
        {isEdit&&step>0&&<button onClick={()=>go(0)} style={{fontSize:12,color:C.teal,background:'none',border:`1px solid ${C.tealBorder}`,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:F,fontWeight:600,whiteSpace:'nowrap'}}>📄 Import resume</button>}
      </div>

      {/* Section tab bar — hidden on step 0 */}
      {step>0&&<div style={{background:C.white,borderBottom:`1px solid ${C.border}`,overflowX:'auto'}}>
        <div style={{display:'flex',minWidth:'fit-content',padding:'0 12px'}}>
          {SECTIONS.map((s,i)=>{
            const n=i+1;const done2=n<step;const active=n===step&&!isReview;
            return<button key={i} onClick={()=>go(n)} style={{padding:'10px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${active?C.teal:done2?C.green:'transparent'}`,color:active?C.teal:done2?C.green:C.gray400,fontWeight:active?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:5,transition:'all .2s'}}>
              {done2&&<span style={{fontSize:10}}>✓</span>}{s.label}
            </button>;
          })}
          <button onClick={()=>go(total+1)} style={{padding:'10px 12px',border:'none',background:'none',borderBottom:`2.5px solid ${isReview?C.teal:'transparent'}`,color:isReview?C.teal:C.gray400,fontWeight:isReview?700:500,fontSize:12,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Review</button>
        </div>
      </div>}

      {/* Content */}
      <div style={{maxWidth:680,margin:'28px auto 0',padding:'0 16px'}}>
        {showDraftBanner&&step>0&&(
          <div style={{background:C.tealDim,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13,color:C.teal,fontFamily:F,fontWeight:600}}>
            <span>📋 Draft restored — picking up where you left off. Your answers are safe.</span>
            <button onClick={()=>setShowDraftBanner(false)} style={{background:'none',border:'none',color:C.teal,cursor:'pointer',fontSize:18,lineHeight:1,padding:'0 0 0 12px',fontWeight:400}}>×</button>
          </div>
        )}
        {step>0&&<Progress step={Math.max(0,step-1)} total={total} sections={SECTIONS}/>}
        <Card style={{marginBottom:14}}>
          {step===0&&<ResumeUpload/>}
          {step>0&&!isReview&&Object.keys(errors).length>0&&<div style={{background:C.redDim,border:`1px solid ${C.red}`,borderRadius:9,padding:'12px 16px',marginBottom:20,fontSize:13,color:C.red,fontFamily:F,fontWeight:600}}>Please fill in the required fields highlighted below.</div>}
          {step>0&&(isReview?<ReviewScreen data={data}/>:SecComp?<SecComp d={data} set={setData} errors={errors}/>:null)}
        </Card>

        {saveError&&step>0&&<div style={{background:C.amberDim,border:`1px solid ${C.amber}`,borderRadius:9,padding:'12px 16px',marginBottom:12,fontSize:13,color:C.amber,fontFamily:F,fontWeight:600}}>{saveError}</div>}

        {/* Nav buttons */}
        <div style={{display:'flex',gap:10}}>
          {step>1&&<button onClick={()=>go(step-1)} style={{flex:1,padding:'13px 0',borderRadius:9,background:C.white,border:`1.5px solid ${C.border}`,color:C.gray600,fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:F}}>← Back</button>}
          {step===0
            ?<button onClick={()=>go(1)} style={{flex:2,padding:'13px 0',borderRadius:9,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:F,boxShadow:`0 2px 12px ${C.teal}44`}}>
                Fill in my profile manually →
              </button>
            :!isReview
              ?<button onClick={()=>{
                  const errs=validateSection(step,data);
                  if(Object.keys(errs).length>0){setErrors(errs);window.scrollTo({top:0,behavior:'smooth'});return;}
                  const uid=profile?.id??user?.id;
                  if(uid)try{localStorage.setItem(`matcht_profile_draft_${uid}`,JSON.stringify(data));}catch{}
                  saveProgress(data).catch(()=>{});
                  go(step+1);
                }} style={{flex:2,padding:'13px 0',borderRadius:9,background:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:F,boxShadow:`0 2px 12px ${C.teal}44`}}>
                  {step<total?'Continue →':'Review my profile →'}
                </button>
              :<button onClick={submit} disabled={saving} style={{flex:2,padding:'13px 0',borderRadius:9,background:saving?C.gray400:C.teal,color:C.white,border:'none',fontWeight:700,fontSize:15,cursor:saving?'not-allowed':'pointer',fontFamily:F,boxShadow:saving?'none':`0 2px 12px ${C.teal}44`}}>
                  {saving?'Saving…':'Submit & go live →'}
                </button>
          }
        </div>
        {step>0&&<p style={{textAlign:'center',fontSize:12,color:C.gray400,marginTop:10,fontFamily:F}}>Saved to Supabase on every section. You won&apos;t lose anything.</p>}
      </div>

      {/* ── Debug save log — fixed bottom-right, persists across steps ── */}
      {saveLog.length>0&&(
        <div style={{position:'fixed',bottom:16,right:16,zIndex:9999,pointerEvents:'none'}}>
        <div style={{background:'#0f172a',color:'#e2e8f0',borderRadius:10,padding:'10px 14px',maxWidth:400,fontFamily:'monospace',fontSize:11,boxShadow:'0 4px 24px rgba(0,0,0,.5)',maxHeight:260,overflowY:'auto',pointerEvents:'auto'}}>
          <div style={{fontWeight:700,marginBottom:6,fontSize:10,letterSpacing:'.12em',color:'#64748b',textTransform:'uppercase',display:'flex',justifyContent:'space-between'}}>
            <span>Debug · Save Log</span>
            <span style={{color:saveLog.some(e=>e.status!=='saved')?'#f87171':'#4ade80'}}>
              {saveLog.filter(e=>e.status==='saved').length}✓ {saveLog.filter(e=>e.status!=='saved').length}✗
            </span>
          </div>
          {saveLog.map((e,i)=>(
            <div key={i} style={{display:'flex',gap:6,alignItems:'flex-start',marginBottom:4,borderBottom:i<saveLog.length-1?'1px solid #1e293b':'none',paddingBottom:4}}>
              <span style={{flexShrink:0,color:e.status==='saved'?'#4ade80':e.status==='timeout'?'#fb923c':'#f87171'}}>
                {e.status==='saved'?'✓':e.status==='timeout'?'⏱':'✗'}
              </span>
              <span style={{color:'#cbd5e1',flexShrink:0,minWidth:90}}>{e.section}</span>
              <span style={{color:'#94a3b8',flex:1,wordBreak:'break-word'}}>{e.status==='saved'?'Saved':`${e.status}: ${e.msg.slice(0,80)}`}</span>
              <span style={{color:'#475569',flexShrink:0,marginLeft:4}}>{e.time}</span>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

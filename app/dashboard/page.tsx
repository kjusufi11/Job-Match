'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/app/providers';
import type { Profile } from '@/lib/types';

// BOM-safe env var access
const SB_URL  = (process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '').replace(/^﻿/, '').trim();
const SB_ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '').trim();

const C = {
  bg:'#F0F4F7', white:'#FFFFFF',
  teal:'#1A8C8C', tealDim:'#1A8C8C12', tealBorder:'#1A8C8C35',
  slate:'#1E2D3A', gray100:'#E3ECF1', gray200:'#C8D8E4',
  gray400:'#8FAABB', gray600:'#4E6475', border:'#D4E3EC',
  green:'#19A87A', greenDim:'#19A87A14', greenBorder:'#19A87A40',
  amber:'#C9870C', amberDim:'#C9870C14', amberBorder:'#C9870C40',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

type Job = { title?:string; company?:string; location?:string; startMonth?:string; startYear?:string; endMonth?:string; endYear?:string; current?:boolean; description?:string };

function calcStrength(p: Profile): number {
  const checks = [
    !!(p.first_name || p.name),
    !!(p.headline || p.title),
    !!p.location,
    !!p.summary,
    !!(Array.isArray(p.jobs_history) && (p.jobs_history as Job[]).some(j => j.company || j.title)),
    !!(Array.isArray(p.skills) && (p.skills as string[]).length > 0),
    !!(Array.isArray(p.degrees) && (p.degrees as Record<string,unknown>[]).some(d => d.level || d.university)),
    !!(Array.isArray(p.target_titles) && (p.target_titles as string[]).length > 0),
    !!(p.salary_label || p.min_salary || p.salary_min),
    !!(Array.isArray(p.target_culture) && (p.target_culture as string[]).length > 0),
    !!(p.personality && Object.keys(p.personality).length > 0),
    !!p.primary_goal,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function Dashboard() {
  const { user, profile: ctxProfile, loading, supabaseUrl, supabaseKey, getToken } = useUser();
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Redirect to login if no user after 3 s; redirect recruiters to their dashboard
  useEffect(() => {
    if (!loading && !user) { window.location.href = '/login'; return; }
    if (!loading && profile?.role === 'recruiter') { window.location.href = '/recruiter/dashboard'; return; }
    if (!user) {
      timerRef.current = setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id, profile?.role]);

  // Use context profile the moment it arrives
  useEffect(() => {
    if (ctxProfile) {
      console.log('[Dashboard] profile from context:', ctxProfile);
      setProfile(ctxProfile);
    }
  }, [ctxProfile]);

  // Direct Supabase fetch — fires as soon as auth resolves
  useEffect(() => {
    if (!user?.id || loading) return;       // wait for providers to finish so token is ready
    const token = getToken();
    const url   = supabaseUrl || SB_URL;
    const key   = supabaseKey || SB_ANON;
    if (!token || !url || !key) {
      console.warn('[Dashboard] fetch skipped — token:', !!token, 'url:', url?.slice(0,30));
      return;
    }
    console.log('[Dashboard] fetching directly from Supabase…');
    fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
    })
      .then(r => { console.log('[Dashboard] fetch status:', r.status); return r.ok ? r.json() : null; })
      .then((rows: Profile[] | null) => {
        if (rows?.[0]) {
          console.log('[Dashboard] full profile from direct fetch:', rows[0]);
          setProfile(rows[0]);
        }
      })
      .catch(e => console.error('[Dashboard] fetch error:', e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  // ── Derived display values (using actual DB column names) ────────────────
  const p          = profile;
  const firstName  = p?.first_name ?? p?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '';
  const fullName   = p?.name ?? [p?.first_name, p?.last_name].filter(Boolean).join(' ') ?? '';
  const targetRole = (p?.headline ?? p?.title) ?? null;          // headline is usually null; title has the value
  const expStr     = p?.experience_level                          // "10+ yrs" style string
                   ?? (p?.total_exp != null ? `${p.total_exp} yr${p.total_exp !== 1 ? 's' : ''}` : null);
  const salaryStr  = p?.salary_label
                   ?? (p?.salary_min || p?.min_salary
                       ? `$${Math.round(((p?.salary_min ?? p?.min_salary) as number) / 1000)}k – $${Math.round(((p?.salary_max ?? p?.ideal_salary) as number) / 1000)}k`
                       : null);
  const skills     = Array.isArray(p?.skills) ? (p!.skills as string[]).filter(Boolean) : [];
  const isLive     = !!p?.profile_complete;
  const strength   = p ? calcStrength(p) : 0;
  const strengthColor = strength >= 80 ? C.green : strength >= 50 ? C.amber : C.teal;

  // Most recent job — pick first entry with at least a company or title
  const recentJob  = (Array.isArray(p?.jobs_history) ? (p!.jobs_history as Job[]) : [])
                       .find(j => j.company || j.title) ?? null;
  const jobDates   = recentJob
    ? recentJob.current
      ? `${[recentJob.startMonth, recentJob.startYear].filter(Boolean).join(' ') || 'Started'} – Present`
      : [recentJob.startMonth, recentJob.startYear].filter(Boolean).join(' ')
    : '';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.slate, letterSpacing: -0.5 }}>
            Welcome back{firstName ? `, ${firstName}` : ''}.
          </h1>
          {isLive
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.greenDim, border: `1px solid ${C.greenBorder}`, color: C.green, fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 20 }}>✓ Your profile is live</span>
            : <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.amberDim, border: `1px solid ${C.amberBorder}`, color: C.amber, fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 20, textDecoration: 'none' }}>Complete your profile →</a>
          }
        </div>

        {/* ── Profile summary ───────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '22px 24px', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Initials avatar */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.tealDim, border: `2px solid ${C.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: C.teal, flexShrink: 0 }}>
              {(firstName[0] ?? '?').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.slate, marginBottom: 3 }}>
                {fullName || <Add href="/profile" label="Add your name" />}
              </div>
              <div style={{ fontSize: 13, color: C.gray600, marginBottom: 12 }}>
                {targetRole || <Add href="/profile" label="Add target job title" />}
              </div>
              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                <MetaItem icon="📍" value={p?.location ?? null} prompt="Add location" />
                <MetaItem icon="⏱" value={expStr}              prompt="Add experience" />
                <MetaItem icon="💰" value={salaryStr}           prompt="Add salary range" />
                <MetaItem icon="🎯" value={p?.seniority ?? null} prompt="Add seniority" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile strength ─────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.slate }}>Profile strength</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: strengthColor }}>{strength}%</span>
          </div>
          <div style={{ height: 8, background: C.gray100, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${strength}%`, height: '100%', background: strengthColor, borderRadius: 4, transition: 'width .6s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: C.gray600 }}>
            {strength === 0
              ? 'Loading…'
              : strength < 50
                ? 'Keep going — a complete profile gets 3× more recruiter views.'
                : strength < 80
                  ? 'Almost there — a few more sections will maximise your matches.'
                  : 'Strong profile — you\'re well-positioned for matches.'}
          </div>
        </div>

        {/* ── Skills ───────────────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <CardLabel>Skills</CardLabel>
          {skills.length > 0
            ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {skills.map(s => (
                  <span key={s} style={{ fontSize: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 11px', color: C.gray600, fontWeight: 500 }}>{s}</span>
                ))}
                <a href="/profile" style={{ fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600, padding: '4px 6px' }}>+ Add more</a>
              </div>
            : <Add href="/profile" label="Add your skills" />
          }
        </div>

        {/* ── Most recent role ─────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <CardLabel>Most recent role</CardLabel>
          {recentJob
            ? <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.slate }}>{recentJob.title || '—'}</div>
                <div style={{ fontSize: 13, color: C.gray600, marginTop: 2 }}>
                  {recentJob.company || ''}
                  {recentJob.location ? ` · ${recentJob.location}` : ''}
                </div>
                {jobDates && <div style={{ fontSize: 12, color: C.gray400, marginTop: 3 }}>{jobDates}</div>}
                {recentJob.description && (
                  <div style={{ fontSize: 12, color: C.gray600, marginTop: 8, lineHeight: 1.6, maxWidth: 560 }}>
                    {recentJob.description.slice(0, 200)}{recentJob.description.length > 200 ? '…' : ''}
                  </div>
                )}
              </div>
            : <Add href="/profile" label="Add your work history" />
          }
        </div>

        {/* ── Job preferences summary ───────────────────────────── */}
        {p && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
            <CardLabel>Job preferences</CardLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <PrefItem label="Availability" value={p.availability ?? null} />
              <PrefItem label="Work style"   value={p.remote_preference ?? null} />
              <PrefItem label="Relocation"   value={p.relocation ?? null} />
              <PrefItem label="Search status" value={p.search_intensity ?? null} />
            </div>
          </div>
        )}

        {/* ── Matches placeholder ───────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${C.tealDim} 0%, #E6F2F2 100%)`, border: `1.5px dashed ${C.tealBorder}`, borderRadius: 14, padding: '28px 24px', marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 6 }}>Your matches will appear here</div>
          <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.65, maxWidth: 420, margin: '0 auto' }}>
            Once recruiters post roles, we score them against your full profile automatically. You'll be notified the moment a strong match is found — no applying required.
          </div>
        </div>

        {/* ── Edit profile ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <a href="/profile" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 9, background: C.teal, color: C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: F }}>
            {isLive ? 'Edit your profile →' : 'Complete your profile →'}
          </a>
        </div>

      </div>
    </div>
  );
}

// ── Micro-components ─────────────────────────────────────────────────────────

function CardLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{children}</div>;
}

function Add({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={{ fontSize: 13, color: C.teal, textDecoration: 'none', fontWeight: 600, borderBottom: `1px dashed ${C.teal}` }}>
      {label} →
    </a>
  );
}

function MetaItem({ icon, value, prompt }: { icon: string; value: string | null; prompt: string }) {
  if (value) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.gray600 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>{value}
      </span>
    );
  }
  return (
    <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>
      <span>{icon}</span><span style={{ borderBottom: `1px dashed ${C.teal}` }}>{prompt} →</span>
    </a>
  );
}

function PrefItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div style={{ minWidth: 160 }}>
      <div style={{ fontSize: 11, color: C.gray400, fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{value}</div>
    </div>
  );
}

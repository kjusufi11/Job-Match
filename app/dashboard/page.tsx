'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/app/providers';
import type { Profile } from '@/lib/types';

function clean(s: string | undefined): string { return (s ?? '').replace(/^﻿/, '').trim(); }
const SB_URL  = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SB_ANON = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const C = {
  bg:'#F0F4F7', white:'#FFFFFF',
  teal:'#1A8C8C', tealDim:'#1A8C8C12', tealBorder:'#1A8C8C35', tealDark:'#116060',
  slate:'#1E2D3A', gray100:'#E3ECF1', gray400:'#8FAABB', gray600:'#4E6475', border:'#D4E3EC',
  green:'#19A87A', greenDim:'#19A87A14', greenBorder:'#19A87A40',
  amber:'#C9870C', amberDim:'#C9870C14', amberBorder:'#C9870C40',
  purple:'#6B5EA8', purpleDim:'#6B5EA814',
};
const F = "'Plus Jakarta Sans','Helvetica Neue',sans-serif";

function profileStrength(p: Profile): number {
  const checks = [
    !!(p.first_name || p.name),
    !!p.headline,
    !!p.location,
    !!p.summary,
    Array.isArray(p.jobs_history) && (p.jobs_history as unknown[]).length > 0,
    Array.isArray(p.skills) && (p.skills as string[]).length > 0,
    Array.isArray(p.degrees) && (p.degrees as unknown[]).length > 0,
    Array.isArray(p.target_titles) && (p.target_titles as string[]).length > 0,
    !!(p.salary_label || p.min_salary || p.salary_min),
    Array.isArray(p.target_culture) && (p.target_culture as string[]).length > 0,
    !!(p.personality && Object.keys(p.personality).length > 0),
    !!p.primary_goal,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function fmtSalary(min?: number | null, max?: number | null, label?: string | null): string {
  if (label) return label;
  if (min && max) return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;
  if (min) return `$${Math.round(min / 1000)}k+`;
  return '';
}

function fmtDates(start: string, end: string, current: boolean): string {
  if (!start) return '';
  return current ? `${start} – Present` : end ? `${start} – ${end}` : start;
}

export default function Dashboard() {
  const { user, profile: ctxProfile, loading, supabaseUrl, supabaseKey, getToken } = useUser();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(ctxProfile);
  const [fetched, setFetched] = useState(false);

  // Seed from context immediately if available, then refresh directly from DB
  useEffect(() => {
    if (ctxProfile && !fetched) setProfile(ctxProfile);
  }, [ctxProfile, fetched]);

  // Redirect to login after 3s if no user
  useEffect(() => {
    if (!loading && !user) { window.location.href = '/login'; return; }
    if (!user) {
      timerRef.current = setTimeout(() => { if (!user) window.location.href = '/login'; }, 3000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  // Direct fetch from Supabase as soon as we have a token + user id
  useEffect(() => {
    if (!user?.id) return;
    const token = getToken();
    const url = supabaseUrl || SB_URL;
    const key  = supabaseKey || SB_ANON;
    if (!token || !url || !key) return;

    fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((rows: Profile[] | null) => {
        if (rows?.[0]) { setProfile(rows[0]); setFetched(true); }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, getToken]);

  const p = profile;
  const firstName = p?.first_name ?? p?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '';
  const fullName  = p?.name ?? '';
  const isLive    = !!p?.profile_complete;
  const skills    = (Array.isArray(p?.skills) ? p!.skills as string[] : []).slice(0, 12);
  const strength  = p ? profileStrength(p) : 0;
  const salaryStr = fmtSalary(p?.min_salary ?? p?.salary_min, p?.ideal_salary ?? p?.salary_max, p?.salary_label);
  const recentJob = Array.isArray(p?.jobs_history) && (p!.jobs_history as Record<string,unknown>[]).length > 0
    ? (p!.jobs_history as Record<string,unknown>[])[0]
    : null;

  const strengthColor = strength >= 80 ? C.green : strength >= 50 ? C.amber : C.teal;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ── Header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.slate, letterSpacing: -0.5 }}>
              Welcome back{firstName ? `, ${firstName}` : ''}.
            </h1>
          </div>
          {isLive
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.greenDim, border: `1px solid ${C.greenBorder}`, color: C.green, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>✓ Profile live</span>
            : p
              ? <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.amberDim, border: `1px solid ${C.amberBorder}`, color: C.amber, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, textDecoration: 'none' }}>Complete your profile →</a>
              : null
          }
        </div>

        {/* ── Profile summary card ──────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '22px 24px', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.tealDim, border: `2px solid ${C.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: C.teal, flexShrink: 0 }}>
              {(firstName?.[0] ?? '?').toUpperCase()}
            </div>
            {/* Identity */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.slate, marginBottom: 2 }}>
                {fullName || <Prompt href="/profile" text="Add your name" />}
              </div>
              <div style={{ fontSize: 13, color: C.gray600, marginBottom: 10 }}>
                {p?.headline || <Prompt href="/profile" text="Add target job title" />}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <Meta icon="📍" value={p?.location} prompt="Add location" />
                <Meta icon="⏱" value={p?.total_exp != null ? `${p.total_exp} yr${p.total_exp !== 1 ? 's' : ''} exp` : null} prompt="Add experience" />
                <Meta icon="💰" value={salaryStr || null} prompt="Add salary range" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile strength ─────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.slate }}>Profile strength</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: strengthColor }}>{strength}%</span>
          </div>
          <div style={{ height: 7, background: C.gray100, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${strength}%`, height: '100%', background: strengthColor, borderRadius: 4, transition: 'width .6s ease' }} />
          </div>
          {strength < 100 && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.gray600 }}>
              {strength < 50 ? 'Keep going — a complete profile gets 3× more recruiter views.' : strength < 80 ? 'Almost there — fill in a few more sections to maximise matches.' : 'Great profile — just a few finishing touches left.'}
            </div>
          )}
        </div>

        {/* ── Skills ───────────────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <SectionHeader label="Skills" />
          {skills.length > 0
            ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {skills.map(s => <span key={s} style={{ fontSize: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 11px', color: C.gray600, fontWeight: 500 }}>{s}</span>)}
              </div>
            : <Prompt href="/profile" text="Add your skills" />
          }
        </div>

        {/* ── Most recent role ─────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 12 }}>
          <SectionHeader label="Most recent role" />
          {recentJob
            ? <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.slate }}>{String(recentJob.title || '')}</div>
                <div style={{ fontSize: 13, color: C.gray600, marginTop: 2 }}>
                  {String(recentJob.company || '')}
                  {recentJob.location ? ` · ${recentJob.location}` : ''}
                </div>
                <div style={{ fontSize: 12, color: C.gray400, marginTop: 3 }}>
                  {fmtDates(
                    `${recentJob.startMonth || ''} ${recentJob.startYear || ''}`.trim(),
                    `${recentJob.endMonth || ''} ${recentJob.endYear || ''}`.trim(),
                    !!recentJob.current,
                  )}
                </div>
                {recentJob.description && (
                  <div style={{ fontSize: 12, color: C.gray600, marginTop: 8, lineHeight: 1.55, maxWidth: 560 }}>
                    {String(recentJob.description).slice(0, 180)}{String(recentJob.description).length > 180 ? '…' : ''}
                  </div>
                )}
              </div>
            : <Prompt href="/profile" text="Add your work history" />
          }
        </div>

        {/* ── Matches placeholder ───────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${C.tealDim} 0%, #E8F4F4 100%)`, border: `1.5px dashed ${C.tealBorder}`, borderRadius: 14, padding: '28px 24px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 6 }}>Your matches will appear here</div>
          <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            Once recruiters post roles, we score them against your full profile automatically. You'll get notified the moment a strong match is found — no applying required.
          </div>
        </div>

        {/* ── Edit profile ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <a href="/profile" style={{ display: 'inline-block', padding: '11px 24px', borderRadius: 9, background: C.teal, color: C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: F }}>
            {isLive ? 'Edit your profile' : 'Complete your profile'} →
          </a>
        </div>

      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{label}</div>;
}

function Meta({ icon, value, prompt }: { icon: string; value: string | null | undefined; prompt: string }) {
  if (value) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.gray600 }}>
        <span>{icon}</span>{value}
      </span>
    );
  }
  return (
    <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>
      {icon} <span style={{ borderBottom: `1px dashed ${C.teal}` }}>Add {prompt.replace('Add ', '')}</span>
    </a>
  );
}

function Prompt({ href, text }: { href: string; text: string }) {
  return (
    <a href={href} style={{ fontSize: 13, color: C.teal, textDecoration: 'none', fontWeight: 600, borderBottom: `1px dashed ${C.teal}`, whiteSpace: 'nowrap' }}>
      {text} →
    </a>
  );
}

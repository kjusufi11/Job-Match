'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Card, SHead, Badge, Spinner } from '@/components/ui';

const TABS = [['overview', 'Overview'], ['users', 'Users'], ['jobs', 'Jobs'], ['flags', 'Flags']];

export default function Admin() {
  const { profile, loading } = useUser();
  const supabase = createClient();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data ?? []));
    supabase.from('jobs').select('*, profiles:recruiter_id(name, company_name)').order('created_at', { ascending: false }).then(({ data }) => setJobs(data ?? []));
  }, [profile, supabase]);

  if (loading) return <Spinner />;
  if (!profile || profile.role !== 'admin') {
    return <div style={{ padding: 40, textAlign: 'center', fontFamily: F, color: C.red }}>Access denied.</div>;
  }

  const seekers = users.filter(u => u.role === 'seeker');
  const recruiters = users.filter(u => u.role === 'recruiter');
  const activeJobs = jobs.filter(j => j.status === 'active');

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <SHead title="Admin Dashboard" sub="Internal view — manage users, jobs, and flags." />
          <Badge color={C.purple} dim={C.purpleDim} style={{ fontSize: 12, padding: '4px 10px' }}>Admin</Badge>
        </div>

        <div style={{ display: 'flex', gap: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, marginBottom: 20, width: 'fit-content' }}>
          {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 14px', borderRadius: 7, background: tab === k ? C.teal : 'none', color: tab === k ? C.white : C.gray600, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}>{l}</button>)}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8 }}>
            {[['Total users', users.length, C.teal], ['Job seekers', seekers.length, C.green], ['Recruiters', recruiters.length, C.purple], ['Active jobs', activeJobs.length, C.amber]].map(([l, v, col]) => (
              <Card key={l as string} style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: col as string }}>{v as number}</div>
                <div style={{ fontSize: 11, color: C.gray600, marginTop: 2 }}>{l as string}</div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.slate, margin: '0 0 14px' }}>All users</h3>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}`, padding: '11px 0', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ width: 33, height: 33, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: C.teal, flexShrink: 0 }}>{u.name?.[0] ?? '?'}</div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.slate }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: C.gray600 }}>{u.email} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
                <Badge color={u.role === 'recruiter' ? C.purple : C.teal} dim={u.role === 'recruiter' ? C.purpleDim : C.tealDim}>{u.role}</Badge>
              </div>
            ))}
          </Card>
        )}

        {tab === 'jobs' && (
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.slate, margin: '0 0 14px' }}>All job postings</h3>
            {jobs.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}`, padding: '11px 0', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.slate }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: C.gray600 }}>{j.profiles?.company_name ?? j.profiles?.name} · {new Date(j.created_at).toLocaleDateString()}</div>
                </div>
                <Badge color={j.status === 'active' ? C.green : C.amber} dim={j.status === 'active' ? C.greenDim : C.amberDim}>{j.status}</Badge>
              </div>
            ))}
          </Card>
        )}

        {tab === 'flags' && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: C.gray400, fontSize: 14 }}>Flag queue is empty. Build a flagging system in v2.</div>
        )}
      </div>
    </div>
  );
}

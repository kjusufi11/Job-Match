'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Card, SHead, FField, PBtn, Toggle, Spinner } from '@/components/ui';

const TABS = [['account', 'Account'], ['notifications', 'Notifications'], ['privacy', 'Privacy'], ['billing', 'Billing']];

export default function Settings() {
  const { profile, loading, refreshProfile } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState('account');
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', newPw: '' });
  const [prefs, setPrefs] = useState({
    emailMatches: true, emailViewed: true, emailFeedback: true,
    smsAlerts: false, visibility: 'recruiters', searchable: true,
  });

  // Populate form from profile once loaded
  useEffect(() => {
    if (!profile) return;
    setForm(f => ({ ...f, name: profile.name ?? '', email: profile.email ?? '' }));
    setPrefs({
      emailMatches: profile.notif_email_matches ?? true,
      emailViewed:  profile.notif_email_viewed  ?? true,
      emailFeedback:profile.notif_email_feedback ?? true,
      smsAlerts:    profile.notif_sms_alerts     ?? false,
      visibility:   profile.visibility ?? 'recruiters',
      searchable:   profile.searchable ?? true,
    });
  }, [profile?.id]);

  async function save() {
    if (!profile) return;
    await supabase.from('profiles').update({
      name: form.name,
      email: form.email,
      visibility: prefs.visibility,
      searchable: prefs.searchable,
      notif_email_matches:  prefs.emailMatches,
      notif_email_viewed:   prefs.emailViewed,
      notif_email_feedback: prefs.emailFeedback,
      notif_sms_alerts:     prefs.smsAlerts,
    }).eq('id', profile.id);
    if (form.newPw.length >= 6) await supabase.auth.updateUser({ password: form.newPw });
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteAccount() {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      alert('Failed to delete account. Please try again or contact support.');
      setDeleting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <SHead title="Settings" />
        <div style={{ display: 'flex', gap: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, marginBottom: 20, width: 'fit-content' }}>
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 14px', borderRadius: 7, background: tab === k ? C.teal : 'none', color: tab === k ? C.white : C.gray600, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: F }}>{l}</button>
          ))}
        </div>

        {tab === 'account' && (
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.slate, margin: '0 0 16px' }}>Account details</h3>
            <FField label="Full name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Jane Smith" />
            <FField label="Email address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="jane@example.com" type="email" />
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0', paddingTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.slate, margin: '0 0 10px' }}>Change password</h4>
              <FField label="New password" value={form.newPw} onChange={v => setForm(f => ({ ...f, newPw: v }))} placeholder="Min. 6 chars" type="password" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PBtn onClick={save}>Save changes</PBtn>
              {saved && <span style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>✓ Saved</span>}
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.red, margin: '0 0 8px' }}>Danger zone</h4>
              <button onClick={deleteAccount} disabled={deleting} style={{ background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: deleting ? 'default' : 'pointer', fontFamily: F, opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </Card>
        )}

        {tab === 'notifications' && (
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.slate, margin: '0 0 16px' }}>Notification preferences</h3>
            <Toggle label="New job matches" sub="Email" value={prefs.emailMatches} onChange={v => setPrefs(p => ({ ...p, emailMatches: v }))} />
            <Toggle label="Recruiter viewed my profile" sub="Email" value={prefs.emailViewed} onChange={v => setPrefs(p => ({ ...p, emailViewed: v }))} />
            <Toggle label="I receive feedback" sub="Email" value={prefs.emailFeedback} onChange={v => setPrefs(p => ({ ...p, emailFeedback: v }))} />
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
            <Toggle label="SMS alerts" sub="Text for urgent notifications" value={prefs.smsAlerts} onChange={v => setPrefs(p => ({ ...p, smsAlerts: v }))} />
            <PBtn onClick={save} style={{ marginTop: 14 }}>Save preferences</PBtn>
            {saved && <span style={{ color: C.green, fontWeight: 600, fontSize: 13, marginLeft: 10 }}>✓ Saved</span>}
          </Card>
        )}

        {tab === 'privacy' && (
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.slate, margin: '0 0 16px' }}>Privacy settings</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray800, marginBottom: 8 }}>Profile visibility</div>
              {(['recruiters', 'everyone', 'nobody'] as const).map(o => (
                <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9, cursor: 'pointer' }}>
                  <input type="radio" name="vis" checked={prefs.visibility === o} onChange={() => setPrefs(p => ({ ...p, visibility: o }))} style={{ accentColor: C.teal }} />
                  <span style={{ fontSize: 13, color: C.slate, fontWeight: prefs.visibility === o ? 600 : 400 }}>{{ recruiters: 'Recruiters only', everyone: 'Everyone', nobody: 'Nobody (hidden)' }[o]}</span>
                </label>
              ))}
            </div>
            <Toggle label="Appear in recruiter search" sub="Allow recruiters to find your profile" value={prefs.searchable} onChange={v => setPrefs(p => ({ ...p, searchable: v }))} />
            <PBtn onClick={save} style={{ marginTop: 12 }}>Save preferences</PBtn>
            {saved && <span style={{ color: C.green, fontWeight: 600, fontSize: 13, marginLeft: 10 }}>✓ Saved</span>}
          </Card>
        )}

        {tab === 'billing' && (
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.slate, margin: '0 0 4px' }}>Current plan</h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: C.tealDim, border: `1px solid ${C.tealBorder}`, borderRadius: 9, padding: '11px 14px', margin: '10px 0 18px' }}>
              <div>
                <div style={{ fontWeight: 800, color: C.teal, fontSize: 15 }}>Job Seeker Free</div>
                <div style={{ fontSize: 12, color: C.gray600, marginTop: 2 }}>Free forever · Unlimited matching</div>
              </div>
            </div>
            <p style={{ color: C.gray600, fontSize: 13, margin: '0 0 16px' }}>Stripe billing integration coming soon.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

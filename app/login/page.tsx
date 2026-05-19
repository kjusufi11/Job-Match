'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C, F, FField, PBtn } from '@/components/ui';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true); setErr('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) { setErr(error.message); setLoading(false); return; }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    router.push(profile?.role === 'recruiter' ? '/recruiter/jobs' : '/dashboard');
  }

  return (
    <div style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: C.bg, fontFamily: F }}>
      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '40px 32px', width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: '0 0 3px', letterSpacing: -0.5 }}>Sign in to Matcht</h2>
        <p style={{ color: C.gray600, fontSize: 13, margin: '0 0 24px' }}>Welcome back.</p>
        <FField label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" type="email" />
        <FField label="Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Your password" type="password" />
        {err && <p style={{ color: C.red, fontSize: 13, margin: '0 0 10px' }}>{err}</p>}
        <PBtn onClick={signIn} full disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</PBtn>
        <p style={{ textAlign: 'center', color: C.gray400, fontSize: 12, marginTop: 14 }}>
          No account?{' '}
          <a href="/signup" style={{ color: C.teal, fontWeight: 600 }}>Create one free</a>
        </p>
      </div>
    </div>
  );
}

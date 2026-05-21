'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C, F, FField, FLabel, PBtn } from '@/components/ui';

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function next() {
    if (!form.name.trim() || !form.email.trim()) { setErr('Please fill in all fields.'); return; }
    setErr(''); setStep(2);
  }

  async function create() {
    if (!form.password || form.password.length < 6) { setErr('Min. 6 characters.'); return; }
    setLoading(true);
    setErr('');

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, role: form.role },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) { setErr(error.message); setLoading(false); return; }

    router.push(form.role === 'recruiter' ? '/recruiter/post' : '/dashboard');
  }

  return (
    <div style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: C.bg, fontFamily: F }}>
      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '40px 32px', width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 5px' }}>Step {step} of 2</p>
          <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
            {[1, 2].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= step ? C.teal : C.gray100, transition: 'background .3s' }} />)}
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: C.slate, margin: '0 0 3px', letterSpacing: -0.5 }}>{step === 1 ? 'Create your account' : 'Secure your account'}</h2>
          <p style={{ color: C.gray600, fontSize: 13, margin: 0 }}>{step === 1 ? 'Free for job seekers — no card needed.' : 'Pick a strong password.'}</p>
        </div>

        {step === 1 ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <FLabel>I am a…</FLabel>
              <div style={{ display: 'flex', gap: 7, marginTop: 5 }}>
                {[['seeker', 'Job Seeker'], ['recruiter', 'Recruiter']].map(([v, l]) => (
                  <button key={v} onClick={() => setForm(f => ({ ...f, role: v }))} style={{ flex: 1, padding: '8px 0', borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: F, background: form.role === v ? C.tealDim : C.bg, color: form.role === v ? C.teal : C.gray600, border: `1.5px solid ${form.role === v ? C.teal : C.border}` }}>{l}</button>
                ))}
              </div>
            </div>
            <FField label="Full name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Jane Smith" />
            <FField label="Email address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="jane@example.com" type="email" />
            {err && <p style={{ color: C.red, fontSize: 13, margin: '0 0 8px' }}>{err}</p>}
            <PBtn onClick={next} full style={{ marginTop: 3 }}>Continue →</PBtn>
          </>
        ) : (
          <>
            <FField label="Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Min. 6 characters" type="password" />
            {err && <p style={{ color: C.red, fontSize: 13, margin: '0 0 8px' }}>{err}</p>}
            <PBtn onClick={create} full disabled={loading}>{loading ? 'Creating…' : 'Create account →'}</PBtn>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: C.gray600, fontSize: 13, cursor: 'pointer', marginTop: 8, fontFamily: F }}>← Back</button>
          </>
        )}

        <p style={{ textAlign: 'center', color: C.gray400, fontSize: 12, marginTop: 14 }}>
          Have an account?{' '}
          <a href="/login" style={{ color: C.teal, fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

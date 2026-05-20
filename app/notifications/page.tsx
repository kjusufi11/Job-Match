'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, SHead, Spinner } from '@/components/ui';
import type { Notification } from '@/lib/types';

const icons: Record<string, string> = { match: '🎯', viewed: '👁', feedback: '💬', shortlist: '⭐', system: '🔔' };

export default function Notifications() {
  const { profile, loading } = useUser();
  const supabase = createClient();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(() => setFetching(false), 5000);
    supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setNotifs((data ?? []) as Notification[]); })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setFetching(false); });
    return () => clearTimeout(timer);
  }, [profile, supabase]);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  if (loading || fetching) return <Spinner />;

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <SHead title="Notifications" sub={`${unread} unread`} />
          {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: C.teal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Mark all read</button>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {notifs.length === 0 && <div style={{ textAlign: 'center', padding: '44px 0', color: C.gray400, fontSize: 14 }}>You're all caught up.</div>}
          {notifs.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ background: n.read ? C.white : C.tealDim, borderRadius: 11, border: `1.5px solid ${n.read ? C.border : C.tealBorder}`, padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icons[n.type] ?? '🔔'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: C.slate, fontWeight: n.read ? 400 : 600, margin: '0 0 3px', lineHeight: 1.5 }}>{n.text}</p>
                <p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal, flexShrink: 0, marginTop: 5 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

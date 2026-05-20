'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { C, F, Card, SHead, Badge, GBtn, PBtn, Spinner } from '@/components/ui';
import type { Job } from '@/lib/types';

type JobRow = Job & { applicant_count: number; shortlisted_count: number };

export default function RecJobs() {
  const { profile, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(() => setFetching(false), 5000);
    async function load() {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', profile!.id)
          .order('created_at', { ascending: false });

        if (data?.length) {
          const jobIds = data.map((j: Job) => j.id);
          const { data: apps } = await supabase.from('applications').select('job_id, status').in('job_id', jobIds);

          const countMap: Record<string, { total: number; shortlisted: number }> = {};
          (apps ?? []).forEach((a: any) => {
            if (!countMap[a.job_id]) countMap[a.job_id] = { total: 0, shortlisted: 0 };
            countMap[a.job_id].total++;
            if (a.status === 'shortlisted') countMap[a.job_id].shortlisted++;
          });

          setJobs(data.map((j: Job) => ({ ...j, applicant_count: countMap[j.id]?.total ?? 0, shortlisted_count: countMap[j.id]?.shortlisted ?? 0 })));
        }
      } catch {
        // render empty on error
      } finally {
        clearTimeout(timer);
        setFetching(false);
      }
    }
    load();
    return () => clearTimeout(timer);
  }, [profile, supabase]);

  async function toggleStatus(jobId: string, current: string) {
    const next = current === 'active' ? 'paused' : 'active';
    await supabase.from('jobs').update({ status: next }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: next as Job['status'] } : j));
  }

  if (loading || fetching) return <Spinner />;

  const activeCount = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = jobs.reduce((a, j) => a + j.applicant_count, 0);
  const totalShortlisted = jobs.reduce((a, j) => a + j.shortlisted_count, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: F, padding: '28px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <SHead title="Job Postings" sub={`Welcome back, ${profile?.name?.split(' ')[0] ?? 'recruiter'}.`} />
          <PBtn onClick={() => router.push('/recruiter/post')}>+ Post a job</PBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8, marginBottom: 18 }}>
          {[['Active jobs', activeCount, C.teal], ['Total applicants', totalApplicants, C.slate], ['Shortlisted', totalShortlisted, C.green]].map(([l, v, col]) => (
            <Card key={l as string} style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: col as string }}>{v as number}</div>
              <div style={{ fontSize: 11, color: C.gray600, marginTop: 2 }}>{l as string}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {jobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: C.gray400, fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              No jobs posted yet.
              <br />
              <PBtn onClick={() => router.push('/recruiter/post')} style={{ marginTop: 16 }}>Post your first job →</PBtn>
            </div>
          )}
          {jobs.map(j => (
            <Card key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '16px 18px' }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.slate }}>{j.title}</span>
                  <Badge color={j.status === 'active' ? C.green : C.amber} dim={j.status === 'active' ? C.greenDim : C.amberDim}>{j.status === 'active' ? 'Active' : 'Paused'}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.gray600 }}>
                  Posted {new Date(j.created_at).toLocaleDateString()} · {j.applicant_count} applicants · {j.shortlisted_count} shortlisted
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <GBtn onClick={() => router.push(`/recruiter/candidates/${j.id}`)} style={{ padding: '6px 12px', fontSize: 12 }}>View candidates</GBtn>
                <GBtn onClick={() => toggleStatus(j.id, j.status)} style={{ padding: '6px 12px', fontSize: 12 }}>{j.status === 'active' ? 'Pause' : 'Resume'}</GBtn>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

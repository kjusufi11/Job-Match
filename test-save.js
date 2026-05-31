// test-save.js — automated end-to-end save test
// Run: node test-save.js
// Tests the Supabase profiles upsert directly with service role, bypassing auth.
// This catches DB-level failures (schema mismatch, RLS, constraints) without needing
// a browser session.

// Parse .env.local manually (no dotenv dependency needed)
const fs = require('fs');
try {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)/);
    if (m) process.env[m[1]] = m[2].trim();
  });
} catch {}
const { createClient } = require('@supabase/supabase-js');

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !SRK) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const service = createClient(URL, SRK, { auth: { autoRefreshToken: false, persistSession: false } });
const anon    = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });

function ms(n) { return `${n}ms`; }
function pass(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); }
function section(n, t) { console.log(`\n[${n}] ${t}`); }

async function run() {
  let failures = 0;

  // ── 1. Connectivity ───────────────────────────────────────────────────────────
  section(1, 'Supabase connectivity');
  const t0 = Date.now();
  const { data: connData, error: connErr } = await service.from('profiles').select('id').limit(1);
  const connMs = Date.now() - t0;
  if (connErr) {
    fail(`Cannot reach profiles table: ${connErr.message} [${ms(connMs)}]`);
    failures++;
    console.error('\nCannot continue without DB access. Check your service role key and network.\n');
    process.exit(1);
  } else {
    pass(`Connected to profiles table in ${ms(connMs)}`);
  }

  // ── 2. Find a test user ───────────────────────────────────────────────────────
  section(2, 'Find test user');
  const { data: users, error: usersErr } = await service.from('profiles').select('id, name, email, role').limit(3);
  if (usersErr || !users?.length) {
    fail(`No profiles found: ${usersErr?.message ?? 'empty table'}`);
    failures++;
    console.error('Cannot run upsert test without an existing profile row. Create an account first.');
    process.exit(1);
  }
  const testUser = users[0];
  pass(`Using profile: ${testUser.id} (${testUser.name || testUser.email || 'unnamed'})`);
  console.log(`    All found: ${users.map(u => u.id.slice(0, 8) + '…').join(', ')}`);

  // ── 3. Minimal upsert ─────────────────────────────────────────────────────────
  section(3, 'Minimal upsert (id + role + name — role is NOT NULL)');
  const t1 = Date.now();
  const { error: minErr } = await service.from('profiles').upsert({ id: testUser.id, role: testUser.role ?? 'seeker', name: testUser.name || 'Test' });
  const minMs = Date.now() - t1;
  if (minErr) {
    fail(`Minimal upsert failed in ${ms(minMs)}: ${minErr.message} (code: ${minErr.code})`);
    failures++;
  } else {
    pass(`Minimal upsert succeeded in ${ms(minMs)}`);
  }

  // ── 4. Section-specific payload upsert (mirrors new saveProgress approach) ────
  section(4, 'Section payloads upsert (new approach: section-by-section, total_exp as int)');
  const fullPayload = {
    id: testUser.id,
    role: testUser.role ?? 'seeker',
    name: 'Test User',
    first_name: 'Test', last_name: 'User',
    phone: null, location: 'New York, NY', zip: '10001',
    work_auth: 'US Citizen',
    headline: 'Senior Software Engineer — automated test',
    linkedin: null, website: null, other_link: null,
    gender: null, race: null, veteran: null, disability: null,
    summary: 'Automated test user. This row is written by test-save.js.',
    accomplishments: ['Led team of 5 engineers', 'Shipped to 1M users', 'Cut costs 30%'],
    degrees: [{ level: "Bachelor's", field: 'Computer Science', university: 'MIT', gradYear: '2018', current: false, gpa: '3.8', activities: '' }],
    certifications: [],
    test_scores: {},
    jobs_history: [{
      company: 'Acme Corp', title: 'Software Engineer', location: 'New York, NY',
      startMonth: 'Jan', startYear: '2019', endMonth: '', endYear: '', current: true,
      employmentType: 'Full-time',
      description: 'Built web applications using React and Node.js.',
      accomplishments: ['Reduced page load by 40%', 'Led migration to TypeScript', ''],
      reasonForLeaving: ''
    }],
    title: 'Software Engineer', total_exp: 5, // FIX: integer not float
    volunteer: [], gaps: null, emp_status: 'Employed',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    seniority: 'Senior',
    languages: [{ language: 'English', proficiency: 'Native' }],
    projects: [], awards: [], industries: ['Technology'],
    target_titles: ['Senior Engineer', 'Staff Engineer', 'Tech Lead'],
    ideal_salary: 180000, min_salary: 150000,
    salary_min: 150000, salary_max: 180000, salary_label: '$150k–$180k',
    remote_preference: 'Remote or hybrid', max_commute: 30,
    employment_type: ['Full-time'],
    availability: 'Open to opportunities', relocation: 'No',
    relocation_regions: null, travel: 'Up to 25%',
    company_size: ['Series B–C', 'Large company'],
    target_industries: ['Technology', 'Finance'],
    target_culture: ['Fast-paced', 'Collaborative', 'Mission-driven'],
    mgmt_style: 'Coaching / mentoring', feedback_pref: 'Direct and frequent',
    motivators: ['Technical challenges', 'Impact', 'Autonomy'],
    personality: { openness: 4, conscientiousness: 5, extraversion: 3, agreeableness: 4, neuroticism: 2 },
    comm_style: 'Async-first', mistake_style: 'Take ownership and fix it',
    primary_goal: 'Career growth',
    five_year: 'Engineering manager or principal engineer',
    search_intensity: 'Actively looking',
    stay_reasons: ['Better compensation', 'More growth opportunities'],
    referral_source: 'LinkedIn',
    bio: 'Automated test payload — safe to ignore.',
    profile_complete: false,
  };

  const body = JSON.stringify(fullPayload);
  console.log(`    Payload size: ${body.length} bytes (${(body.length / 1024).toFixed(1)} KB)`);

  const t2 = Date.now();
  const { error: fullErr } = await service.from('profiles').upsert(fullPayload);
  const fullMs = Date.now() - t2;
  if (fullErr) {
    fail(`Full upsert failed in ${ms(fullMs)}: ${fullErr.message} (code: ${fullErr.code})`);
    console.error('    Full error object:', JSON.stringify(fullErr, null, 4));
    failures++;
  } else {
    pass(`Full upsert succeeded in ${ms(fullMs)}`);
  }

  // ── 4b. Test each section payload individually ────────────────────────────────
  section('4b', 'Section-by-section payloads (mirrors new saveProgress)');
  const sectionPayloads = [
    { name: 'S1 Basic Info', payload: { id: testUser.id, role: 'seeker', name: 'Test User', first_name: 'Test', last_name: 'User', phone: null, location: 'New York, NY', zip: '10001', work_auth: 'US Citizen', headline: 'Engineer', linkedin: null, website: null, other_link: null, gender: null, race: null, veteran: null, disability: null } },
    { name: 'S2 Summary', payload: { id: testUser.id, role: 'seeker', summary: 'Test summary', accomplishments: ['A1', 'A2', 'A3'] } },
    { name: 'S3 Education', payload: { id: testUser.id, role: 'seeker', degrees: [{ level: "Bachelor's", field: 'CS', university: 'MIT', gradYear: '2018', current: false, gpa: '3.8', activities: '' }], certifications: [], test_scores: {} } },
    { name: 'S4 Work History', payload: { id: testUser.id, role: 'seeker', jobs_history: [{ company: 'Acme', title: 'Engineer', location: 'NY', startMonth: 'Jan', startYear: '2019', endMonth: '', endYear: '', current: true, employmentType: 'Full-time', description: 'Built things', accomplishments: ['Did stuff', '', ''], reasonForLeaving: '' }], title: 'Engineer', total_exp: 5, volunteer: [], gaps: null, emp_status: 'Employed' } },
    { name: 'S5 Skills', payload: { id: testUser.id, role: 'seeker', skills: ['JavaScript', 'React'], seniority: 'Senior', languages: [{ language: 'English', proficiency: 'Native' }], projects: [], awards: [], industries: ['Technology'] } },
    { name: 'S6 Preferences', payload: { id: testUser.id, role: 'seeker', target_titles: ['Engineer'], ideal_salary: 180000, min_salary: 150000, salary_min: 150000, salary_max: 180000, salary_label: '$150k–$180k', remote_preference: 'Remote', max_commute: 30, employment_type: ['Full-time'], availability: 'Open', relocation: 'No', relocation_regions: null, travel: 'None', company_size: ['Large'], target_industries: ['Tech'] } },
    { name: 'S7 Work Style', payload: { id: testUser.id, role: 'seeker', target_culture: ['Collaborative'], mgmt_style: 'Coaching', feedback_pref: 'Direct', motivators: ['Impact'] } },
    { name: 'S8 Personality', payload: { id: testUser.id, role: 'seeker', personality: { openness: 4, conscientiousness: 5, extraversion: 3, agreeableness: 4, neuroticism: 2 }, comm_style: 'Async', mistake_style: 'Own it' } },
    { name: 'S9 Goals', payload: { id: testUser.id, role: 'seeker', primary_goal: 'Growth', five_year: 'Lead engineer', search_intensity: 'Active', stay_reasons: ['Pay'], referral_source: 'LinkedIn', bio: 'Test bio' } },
  ];
  for (const { name, payload } of sectionPayloads) {
    const ts = Date.now();
    const { error: sErr } = await service.from('profiles').upsert(payload);
    const tMs = Date.now() - ts;
    if (sErr) { fail(`${name}: ${sErr.message} [${ms(tMs)}]`); failures++; }
    else { pass(`${name}: OK [${ms(tMs)}]`); }
  }

  // ── 5. Repeat 5× to detect intermittent failures ──────────────────────────────
  section(5, 'Repeat upsert 5× (intermittency check)');
  let repFail = 0;
  for (let i = 0; i < 5; i++) {
    const tr = Date.now();
    const { error: rErr } = await service.from('profiles').upsert({ id: testUser.id, role: testUser.role ?? 'seeker', name: `Test ${i+1}` });
    const trMs = Date.now() - tr;
    if (rErr) {
      fail(`Run ${i+1}: ${rErr.message} [${ms(trMs)}]`);
      repFail++;
    } else {
      pass(`Run ${i+1}: OK [${ms(trMs)}]`);
    }
  }
  if (repFail > 0) failures += repFail;

  // ── 6. API auth timing (anon getUser — expect error, measure latency) ─────────
  section(6, 'Auth API latency (anon getUser — expects "no session" error)');
  const t3 = Date.now();
  const { error: authErr } = await anon.auth.getUser();
  const authMs = Date.now() - t3;
  if (authMs > 3000) {
    fail(`getUser() took ${ms(authMs)} — dangerously slow, will cause save timeouts`);
    failures++;
  } else {
    pass(`getUser() responded in ${ms(authMs)} (expected error: ${authErr?.message ?? 'none'})`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  if (failures === 0) {
    console.log('ALL TESTS PASSED ✓ — DB layer is healthy. Save failures are likely auth/network.');
  } else {
    console.log(`FAILURES: ${failures} — check the errors above for root cause.`);
    process.exit(1);
  }
}

run().catch(e => {
  console.error('\nUnexpected crash:', e.message);
  process.exit(1);
});

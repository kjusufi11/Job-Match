// test-full-flow.js — full end-to-end test with real auth + RLS
// Tests: zip lookup, anon-key profile save (RLS), profile/complete API
// Run: node test-full-flow.js
// Requires: node test-save.js passes first (DB layer healthy)

const fs = require('fs');
const https = require('https');
try {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)/);
    if (m) process.env[m[1]] = m[2].trim();
  });
} catch {}
const { createClient } = require('@supabase/supabase-js');

const URL_  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SRK   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROD  = process.env.NEXT_PUBLIC_SITE_URL || 'https://getmatcht.com';

if (!URL_ || !SRK || !ANON) {
  console.error('Missing required env vars in .env.local');
  process.exit(1);
}

const service = createClient(URL_, SRK, { auth: { autoRefreshToken: false, persistSession: false } });

function ms(n) { return `${n}ms`; }
function pass(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); }
function section(n, t) { console.log(`\n[${n}] ${t}`); }

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  let failures = 0;
  let testUserId = null;
  const testEmail = `autotest-${Date.now()}@matcht-test.invalid`;
  const testPass  = 'AutoTest_Pass123!';

  // ── 1. Zip lookup API ─────────────────────────────────────────────────────
  section(1, 'Zip lookup API (api.zippopotam.us)');
  try {
    const t0 = Date.now();
    const { status, body } = await httpsGet('https://api.zippopotam.us/us/10001');
    const ms0 = Date.now() - t0;
    if (status !== 200) {
      fail(`HTTP ${status} [${ms(ms0)}]`); failures++;
    } else {
      const j = JSON.parse(body);
      const city = j.places?.[0]?.['place name'];
      const state = j.places?.[0]?.['state abbreviation'];
      if (city && state === 'NY') {
        pass(`10001 → ${city}, ${state} [${ms(ms0)}]`);
      } else {
        fail(`Unexpected result: ${city}, ${state} [${ms(ms0)}]`); failures++;
      }
    }
    const { status: s2, body: b2 } = await httpsGet('https://api.zippopotam.us/us/99999');
    if (s2 === 404) {
      pass(`Invalid zip 99999 → 404 (expected)`);
    } else {
      fail(`Invalid zip returned ${s2}, expected 404`); failures++;
    }
  } catch (e) {
    fail(`Zip API request failed: ${e.message}`); failures++;
  }

  // ── 2. Create ephemeral test user ─────────────────────────────────────────
  section(2, 'Create ephemeral test user via service role');
  try {
    const { data: { user: u }, error: createErr } = await service.auth.admin.createUser({
      email: testEmail,
      password: testPass,
      email_confirm: true,
    });
    if (createErr || !u) {
      fail(`createUser failed: ${createErr?.message ?? 'no user returned'}`); failures++;
      console.error('\nCannot continue auth tests without test user.\n');
      process.exit(1);
    }
    testUserId = u.id;
    pass(`Created test user: ${testEmail} (${testUserId.slice(0,8)}…)`);

    // Upsert minimal profile row (a DB trigger may have already created it on user creation)
    const { error: profErr } = await service.from('profiles').upsert({ id: testUserId, role: 'seeker', name: 'Auto Test' });
    if (profErr) { fail(`Profile insert failed: ${profErr.message}`); failures++; }
    else { pass('Inserted minimal profile row'); }
  } catch (e) {
    fail(`Unexpected error: ${e.message}`); failures++;
    process.exit(1);
  }

  // ── 3. Sign in with anon key (tests real auth path) ───────────────────────
  section(3, 'Sign in as test user with anon key');
  let authedClient = null;
  let accessToken = null;
  try {
    const anonClient = createClient(URL_, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
    const t1 = Date.now();
    const { data: { session }, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPass,
    });
    const ms1 = Date.now() - t1;
    if (signInErr || !session) {
      fail(`signInWithPassword failed: ${signInErr?.message ?? 'no session'} [${ms(ms1)}]`); failures++;
    } else {
      accessToken = session.access_token;
      pass(`Signed in [${ms(ms1)}] — token: ${accessToken.slice(0,20)}…`);
      authedClient = createClient(URL_, ANON, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
    }
  } catch (e) {
    fail(`Unexpected error: ${e.message}`); failures++;
  }

  if (!authedClient || !accessToken) {
    console.error('\nSkipping RLS tests — no authenticated client.\n');
  } else {
    // ── 4. All 9 section upserts via direct REST fetch (mirrors new saveProgress) ──
    // Uses explicit Bearer token in Authorization header — same code path as production.
    section(4, 'All 9 section upserts via direct REST fetch with explicit token (RLS)');
    const id = testUserId;

    async function directUpsert(payload) {
      const res = await fetch(`${URL_}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      return res;
    }

    const sectionPayloads = [
      { name: 'S1 Basic Info', payload: { id, role:'seeker', name:'Auto Test', first_name:'Auto', last_name:'Test', phone: null, location:'New York, NY', zip:'10001', work_auth:'US Citizen', headline:'Engineer', linkedin:null, website:null, other_link:null, gender:null, race:null, veteran:null, disability:null } },
      { name: 'S2 Summary', payload: { id, role:'seeker', summary:'Auto test summary.', accomplishments:['A1','A2','A3'] } },
      { name: 'S3 Education', payload: { id, role:'seeker', degrees:[{level:"Bachelor's",field:'CS',university:'MIT',gradYear:'2018',current:false,gpa:'3.8',activities:''}], certifications:[], test_scores:{} } },
      { name: 'S4 Work History', payload: { id, role:'seeker', jobs_history:[{company:'Acme',title:'Engineer',location:'NY',startMonth:'Jan',startYear:'2019',endMonth:'',endYear:'',current:true,employmentType:'Full-time',description:'Built things',accomplishments:['Did stuff','',''],reasonForLeaving:''}], title:'Engineer', total_exp:5, volunteer:[], gaps:null, emp_status:'Employed' } },
      { name: 'S5 Skills', payload: { id, role:'seeker', skills:['JavaScript','React'], seniority:'Senior', languages:[{language:'English',proficiency:'Native'}], projects:[], awards:[], industries:['Technology'] } },
      { name: 'S6 Preferences', payload: { id, role:'seeker', target_titles:['Engineer'], ideal_salary:180000, min_salary:150000, salary_min:150000, salary_max:180000, salary_label:'$150k–$180k', remote_preference:'Remote', max_commute:30, employment_type:['Full-time'], availability:'Open', relocation:'No', relocation_regions:null, travel:'None', company_size:['Large'], target_industries:['Tech'] } },
      { name: 'S7 Work Style', payload: { id, role:'seeker', target_culture:['Collaborative'], mgmt_style:'Coaching', feedback_pref:'Direct', motivators:['Impact'] } },
      { name: 'S8 Personality', payload: { id, role:'seeker', personality:{openness:4,conscientiousness:5,extraversion:3,agreeableness:4,neuroticism:2}, comm_style:'Async', mistake_style:'Own it' } },
      { name: 'S9 Goals', payload: { id, role:'seeker', primary_goal:'Growth', five_year:'Lead engineer', search_intensity:'Active', stay_reasons:['Pay'], referral_source:'LinkedIn', bio:'Auto test bio' } },
    ];

    for (const { name, payload } of sectionPayloads) {
      const ts = Date.now();
      try {
        await directUpsert(payload);
        pass(`${name}: OK [${ms(Date.now()-ts)}]`);
      } catch (e) {
        fail(`${name}: ${e.message} [${ms(Date.now()-ts)}]`); failures++;
      }
    }

    // ── 5. Set profile_complete via service role (mirrors /api/profile/complete) ──
    section(5, 'Set profile_complete=true (mirrors /api/profile/complete)');
    try {
      const t2 = Date.now();
      const { error: completeErr } = await service.from('profiles')
        .update({ profile_complete: true })
        .eq('id', testUserId);
      const ms2 = Date.now() - t2;
      if (completeErr) { fail(`profile_complete update failed: ${completeErr.message} [${ms(ms2)}]`); failures++; }
      else { pass(`profile_complete set to true [${ms(ms2)}]`); }

      // Verify the DB row
      const { data: row, error: readErr } = await service.from('profiles').select('profile_complete,name,zip,location,total_exp').eq('id', testUserId).single();
      if (readErr) { fail(`Read-back failed: ${readErr.message}`); failures++; }
      else {
        if (row.profile_complete) pass(`DB confirms profile_complete=true`);
        else { fail(`profile_complete is still false`); failures++; }
        if (row.zip === '10001') pass(`zip saved correctly: ${row.zip}`);
        else { fail(`zip expected 10001 got ${row.zip}`); failures++; }
        if (row.location === 'New York, NY') pass(`location saved correctly: ${row.location}`);
        else { fail(`location expected 'New York, NY' got ${row.location}`); failures++; }
        if (row.total_exp === 5) pass(`total_exp saved as integer: ${row.total_exp}`);
        else { fail(`total_exp expected 5 (int) got ${row.total_exp} (${typeof row.total_exp})`); failures++; }
      }
    } catch (e) {
      fail(`Unexpected error: ${e.message}`); failures++;
    }
  }

  // ── 6. Code-level verification of UI fixes ────────────────────────────────
  section(6, 'Code-level verification of UI fixes');
  try {
    const navSrc = fs.readFileSync('components/Nav.tsx', 'utf8');
    if (navSrc.includes('user.email') && navSrc.includes("router.push('/dashboard')") && !navSrc.includes('/settings')) {
      pass(`Nav.tsx: shows user.email + Dashboard, no Settings link`);
    } else {
      fail(`Nav.tsx: expected user.email + /dashboard, not found or Settings still present`); failures++;
    }
    if (!navSrc.includes('My Matches') && !navSrc.includes('My Profile') && !navSrc.includes('Notifications')) {
      pass(`Nav.tsx: old seeker links removed`);
    } else {
      fail(`Nav.tsx: old links still present`); failures++;
    }
  } catch (e) { fail(`Nav.tsx read failed: ${e.message}`); failures++; }

  try {
    const provSrc = fs.readFileSync('app/providers.tsx', 'utf8');
    if (!provSrc.includes('timedOut) return') && provSrc.includes('if (cancelled) return')) {
      pass(`providers.tsx: timedOut removed from early-return guard`);
    } else {
      fail(`providers.tsx: timedOut still blocking session resolution`); failures++;
    }
  } catch (e) { fail(`providers.tsx read failed: ${e.message}`); failures++; }

  try {
    const pageSrc = fs.readFileSync('app/profile/page.tsx', 'utf8');
    if (pageSrc.includes("console.log('submit clicked')")) {
      pass(`profile/page.tsx: console.log('submit clicked') present`);
    } else {
      fail(`profile/page.tsx: console.log('submit clicked') not found`); failures++;
    }
    if (pageSrc.includes("pointerEvents:'none'") && pageSrc.includes("pointerEvents:'auto'")) {
      pass(`profile/page.tsx: debug panel has pointerEvents:none outer + auto inner`);
    } else {
      fail(`profile/page.tsx: debug panel pointer-events fix not found`); failures++;
    }
    if (pageSrc.indexOf('<FL required>ZIP code</FL>') < pageSrc.indexOf('<FL required>City & state</FL>')) {
      pass(`profile/page.tsx: ZIP field appears before City & state`);
    } else {
      fail(`profile/page.tsx: ZIP is NOT before City & state`); failures++;
    }
    if (pageSrc.includes('rest/v1/profiles') && pageSrc.includes("'Prefer':'resolution=merge-duplicates") && pageSrc.includes('slowSave')) {
      pass(`profile/page.tsx: saveProgress uses direct REST fetch + slowSave indicator`);
    } else {
      fail(`profile/page.tsx: direct-fetch save approach not found`); failures++;
    }
    if (pageSrc.includes('profile_complete:true') && pageSrc.includes("window.location.href='/dashboard'") && !pageSrc.includes("fetch('/api/profile/complete'")) {
      pass(`profile/page.tsx: submit() uses direct REST upsert for profile_complete, hard-redirects to /dashboard`);
    } else {
      fail(`profile/page.tsx: submit() still uses /api/profile/complete route or missing hard redirect`); failures++;
    }
    if (pageSrc.includes('getToken') && pageSrc.includes('const token=getToken()') && !pageSrc.includes('tokenRef=useRef')) {
      pass(`profile/page.tsx: token from context getToken() — no local getSession() calls`);
    } else {
      fail(`profile/page.tsx: getToken() pattern not found or tokenRef still present`); failures++;
    }
    // Verify saveProgress uses getToken() not getSession()
    const saveProgressBody = pageSrc.slice(pageSrc.indexOf('async function saveProgress'));
    const saveEnd = saveProgressBody.indexOf('\n  async function ') || saveProgressBody.indexOf('\n  function ') || saveProgressBody.length;
    const spBody = saveProgressBody.slice(0, saveEnd);
    if (spBody.includes('getToken()') && !spBody.includes('getSession()')) {
      pass(`profile/page.tsx: saveProgress uses context getToken() — no blocking getSession() call`);
    } else {
      fail(`profile/page.tsx: saveProgress still calls getSession() directly`); failures++;
    }
  } catch (e) { fail(`profile/page.tsx read failed: ${e.message}`); failures++; }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  section('cleanup', 'Remove ephemeral test user');
  if (testUserId) {
    try {
      await service.from('profiles').delete().eq('id', testUserId);
      const { error: delErr } = await service.auth.admin.deleteUser(testUserId);
      if (delErr) { fail(`deleteUser: ${delErr.message}`); }
      else { pass(`Deleted test user ${testEmail}`); }
    } catch (e) {
      fail(`Cleanup failed: ${e.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  if (failures === 0) {
    console.log('ALL TESTS PASSED ✓');
  } else {
    console.log(`FAILURES: ${failures} — check errors above.`);
    process.exit(1);
  }
}

run().catch(e => {
  console.error('\nUnexpected crash:', e.message);
  process.exit(1);
});

/**
 * Deletes prior test jobs and inserts 3 new ones calibrated to Krenar's actual profile:
 *   skills: ['Adaptability']
 *   salary: $360k–$490k
 *   target_culture: ['Fast-paced & high-energy']
 *   mgmt_style: 'Hands-off — sets goals and trusts the team'
 *   feedback_pref: 'Regular check-ins (weekly or bi-weekly)'
 *   remote_preference: 'Flexible — whatever the role requires' → always 100
 *   personality: {} empty → always 50
 *   industries: [] empty → always 65
 *   total_exp: null → always 65
 *   availability: 'Immediately (within 2 weeks)' → always 100
 *
 * Predicted scores with weights (skills=3, salary=3, exp=3, personality=2, loc=2, industry=2, work_style=3, avail=2):
 *   Job 1 "Head of Product" — target ~86% excellent
 *     skills=100(1/1), salary=100(fits), loc=100, exp=65, ws=100(culture+mgmt+feedback all match), pers=50, ind=65, avail=100
 *   Job 2 "Revenue Operations Lead" — target ~73% good
 *     skills=50(1/2), salary=90(job pays more), loc=100, exp=65, ws=68(culture partial), pers=50, ind=65, avail=100
 *   Job 3 "Data Engineer" — target ~54% fair
 *     skills=0(no match), salary=57(seeker wants more), loc=100, exp=65, ws=28(no culture match), pers=50, ind=65, avail=100
 */
const https = require('https');

const SB_URL = 'eanhvbvdjfkiiagkxtoo.supabase.co';
const KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RID    = 'dc69b907-63e9-4bda-a3cf-8da480a88061';

// IDs of previously inserted test jobs to delete
const DELETE_IDS = [
  'cc79b08c-07c3-4125-b16f-3760fd7b7b07',
  '7afe75fe-44e0-4714-84df-6e921e0997c4',
  '5f9d7a3c-c051-44c8-b6e4-58cd300b7cb9',
];

function req(method, hostname, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    };
    if (method === 'POST') headers['Prefer'] = 'return=representation';
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const r = https.request({ hostname, path, method, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

const sb  = (m, p, b) => req(m, SB_URL, p, b);
const api = (b) => req('POST', 'www.getmatcht.com', '/api/match-scores', b);

async function main() {
  // Clean up old jobs (cascade deletes match_scores via FK)
  console.log('Deleting old test jobs...');
  for (const id of DELETE_IDS) {
    const r = await sb('DELETE', `/rest/v1/jobs?id=eq.${id}`, null);
    console.log(`  delete ${id.slice(0,8)} → ${r.status}`);
  }

  // Job 1: Head of Product — ~86% excellent
  // skills=100 salary=100 loc=100 exp=65 ws=100 pers=50 ind=65 avail=100
  // weighted: (100×3+100×3+50×2+100×2+65×3+65×2+100×3+100×2)/20 = 1725/20 = 86%
  const JOB1 = {
    recruiter_id:         RID,
    company_name:         'Apex Growth Partners',
    company_industries:   ['Venture Capital', 'Private Equity'],
    company_stage:        'Growth-stage startup (Series A–C)',
    hq_location:          'New York, NY',
    company_desc:         'Apex Growth Partners is a venture firm that builds high-growth software companies across fintech and enterprise SaaS. We back bold founders and give them the operational support they need to scale.',
    title:                'Head of Product',
    employment_type:      ['Full-time'],
    remote_policy:        'Remote only',
    description:          'Own the product vision and roadmap for our flagship portfolio company. Work directly with the CEO, lead a team of 4 PMs, and set the pace for quarterly planning. This role requires someone who moves fast, makes sharp decisions, and thrives with autonomy.',
    min_exp:              8,
    experience_level:     'VP / Director (8–12 years)',
    required_skills:      ['Adaptability'],
    nice_skills:          ['Go-to-market', 'Customer discovery', 'Product analytics'],
    soft_skills_required: [],
    preferred_industries: [],
    show_salary:          true,
    salary_min:           350000,
    salary_max:           500000,
    show_equity:          true,
    benefits:             ['Equity', 'Health insurance', 'Unlimited PTO', '401k match'],
    team_culture:         ['Fast-paced & high-energy'],
    mgmt_style:           'Hands-off — sets goals and trusts the team',
    feedback_culture:     'Regular check-ins (weekly or bi-weekly)',
    weight_skills:        3,
    weight_salary:        3,
    weight_experience:    3,
    weight_education:     2,
    weight_culture:       3,
    weight_location:      2,
    weight_availability:  2,
    weight_work_style:    3,
    weight_personality:   2,
    weight_industry:      2,
    status:               'active',
  };

  // Job 2: Revenue Operations Lead — ~73% good
  // skills=50(1/2) salary=90(job>seeker) loc=100 exp=65 ws=68(culture partial,mgmt match,feedback miss) pers=50 ind=65 avail=100
  // weighted: (50×3+90×3+50×2+100×2+65×3+65×2+68×3+100×2)/20 = 1454/20 = 72.7% → 73%
  const JOB2 = {
    recruiter_id:         RID,
    company_name:         'Halo Commerce',
    company_industries:   ['E-commerce', 'Retail Tech'],
    company_stage:        'Late-stage / pre-IPO',
    hq_location:          'Austin, TX',
    company_desc:         "Halo Commerce is a fast-growing B2B e-commerce enablement platform trusted by 3,000+ retailers globally. We're pre-IPO and scaling rapidly.",
    title:                'Revenue Operations Lead',
    employment_type:      ['Full-time'],
    remote_policy:        'Hybrid',
    office_location:      'Austin, TX — 2 days/week',
    description:          "Drive revenue efficiency across Sales, Marketing, and Customer Success. Build reporting infrastructure, run pipeline analysis, and own the forecasting process. You'll report to the CRO and work cross-functionally with senior leadership.",
    min_exp:              5,
    experience_level:     'Senior / Lead (5–8 years)',
    required_skills:      ['Adaptability', 'Data Analysis'],
    nice_skills:          ['Salesforce', 'SQL', 'Tableau'],
    soft_skills_required: [],
    preferred_industries: ['E-commerce', 'SaaS'],
    show_salary:          true,
    salary_min:           500000,
    salary_max:           650000,
    show_equity:          true,
    benefits:             ['Health insurance', 'Equity', '401k', 'Flexible PTO'],
    team_culture:         ['Fast-paced & high-energy', 'Results-driven'],
    mgmt_style:           'Hands-off — sets goals and trusts the team',
    feedback_culture:     'As-needed — people ask when they want it',
    weight_skills:        3,
    weight_salary:        3,
    weight_experience:    3,
    weight_education:     2,
    weight_culture:       3,
    weight_location:      2,
    weight_availability:  2,
    weight_work_style:    3,
    weight_personality:   2,
    weight_industry:      2,
    status:               'active',
  };

  // Job 3: Data Engineer — ~54% fair
  // skills=0(no match) salary=57(seeker wants more) loc=100 exp=65 ws=28(no culture,mgmt mismatch) pers=50 ind=65 avail=100
  // weighted: (0×3+57×3+50×2+100×2+65×3+65×2+28×3+100×2)/20 = 1086/20 = 54.3% → 54%
  const JOB3 = {
    recruiter_id:         RID,
    company_name:         'Regional Manufacturing Co',
    company_industries:   ['Manufacturing', 'Industrial'],
    company_stage:        'Private company (established)',
    hq_location:          'Cleveland, OH',
    company_desc:         'Mid-sized manufacturer of industrial equipment, 500 employees, 3 plants. We are building out our data infrastructure for the first time and need a hands-on engineer to lead it.',
    title:                'Data Engineer',
    employment_type:      ['Full-time'],
    remote_policy:        'On-site',
    office_location:      'Cleveland, OH',
    description:          'Build and maintain our new data warehouse, integrate ERP and production systems, and create dashboards for plant managers. This is a technical individual contributor role in a traditional manufacturing environment.',
    min_exp:              3,
    experience_level:     'Mid-level (3–5 years)',
    required_skills:      ['Python', 'SQL', 'Data Warehousing'],
    nice_skills:          ['dbt', 'Snowflake', 'ERP integrations'],
    soft_skills_required: [],
    preferred_industries: ['Manufacturing', 'Industrial'],
    show_salary:          true,
    salary_min:           200000,
    salary_max:           280000,
    show_equity:          false,
    benefits:             ['Health insurance', '401k', 'PTO'],
    team_culture:         ['Stability', 'Process-oriented', 'Hierarchy'],
    mgmt_style:           'Structured — clear expectations and regular feedback',
    feedback_culture:     'Formal periodic reviews (quarterly)',
    weight_skills:        3,
    weight_salary:        3,
    weight_experience:    3,
    weight_education:     2,
    weight_culture:       3,
    weight_location:      2,
    weight_availability:  2,
    weight_work_style:    3,
    weight_personality:   2,
    weight_industry:      2,
    status:               'active',
  };

  console.log('\nInserting redesigned test jobs...');
  const ids = [];
  for (const [label, job] of [['Head of Product', JOB1], ['Revenue Ops Lead', JOB2], ['Data Engineer', JOB3]]) {
    const r = await sb('POST', '/rest/v1/jobs', job);
    if (r.status >= 400) {
      console.error(`FAIL [${label}]: ${r.body?.message || JSON.stringify(r.body)}`);
      ids.push(null);
    } else {
      const id = Array.isArray(r.body) ? r.body[0]?.id : r.body?.id;
      console.log(`OK   [${label}] id=${id}`);
      ids.push(id);
    }
  }

  console.log('\nTriggering match scoring...');
  const labels = ['Head of Product', 'Revenue Ops Lead', 'Data Engineer'];
  for (let i = 0; i < ids.length; i++) {
    if (!ids[i]) continue;
    const r = await api({ jobId: ids[i] });
    console.log(`  score [${labels[i]}] → ${r.status} ${JSON.stringify(r.body)}`);
  }

  console.log('\nVerifying scores for Krenar...');
  const SEEKER = '32af0ce1-7483-4780-84b8-8a20c370e47f';
  const scores = await sb('GET', `/rest/v1/match_scores?seeker_id=eq.${SEEKER}&order=total_score.desc&select=total_score,score_skills,score_salary,score_work_style,score_location,job_id`, null);
  if (Array.isArray(scores.body)) {
    scores.body.forEach(m => {
      const id = m.job_id ? m.job_id.slice(0, 8) : '?';
      console.log(`  job=${id} total=${m.total_score}% skills=${m.score_skills} salary=${m.score_salary} ws=${m.score_work_style} loc=${m.score_location}`);
    });
  }
}

main().catch(console.error);

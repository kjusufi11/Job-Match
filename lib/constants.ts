export const SKILLS_ALL = [
  'Leadership', 'Communication', 'Data Analysis', 'Project Management',
  'Sales', 'Marketing', 'Engineering', 'Design', 'Finance', 'Operations',
  'Customer Success', 'Product Management', 'Strategy', 'Recruiting', 'Legal', 'Logistics',
];

export const INDS_ALL = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Media', 'Legal', 'Consulting', 'Non-profit', 'Real Estate', 'Government',
];

export const PQAS = [
  { q: 'Work style', opts: ['Structured & process-driven', 'Flexible & adaptive', 'Collaborative & team-focused', 'Independent & self-directed'] },
  { q: 'Ideal environment', opts: ['Fast-paced startup', 'Established corporation', 'Remote-first culture', 'Hybrid / flexible'] },
  { q: 'Feedback preference', opts: ['Frequent check-ins', 'Periodic reviews', 'As-needed only', 'Peer-based feedback'] },
];

export const SALARY_LABELS = ['Under $60k', '$60–100k', '$100–150k', '$150–200k', '$200k+'];

export const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'Under $60k':   { min: 0,      max: 60000  },
  '$60–100k':     { min: 60000,  max: 100000 },
  '$100–150k':    { min: 100000, max: 150000 },
  '$150–200k':    { min: 150000, max: 200000 },
  '$200k+':       { min: 200000, max: 500000 },
};

export const EXP_LEVELS = ['0–2 yrs', '3–5 yrs', '6–10 yrs', '10+ yrs'];

export const REMOTE_OPTIONS = ['Remote only', 'Hybrid', 'On-site', 'Open to anything'];

export const WEIGHT_LABELS: Record<string, string> = {
  skills:       'Skills match',
  salary:       'Salary alignment',
  experience:   'Years of experience',
  personality:  'Culture & personality',
  location:     'Location preference',
  industry:     'Industry background',
  work_style:   'Work style alignment',
  availability: 'Availability',
};

export const WEIGHT_LEVEL_LABELS = ['Low', 'Low-Med', 'Medium', 'High', 'Critical'];

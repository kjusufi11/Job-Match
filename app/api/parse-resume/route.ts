import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON — no markdown, no code blocks, no explanation. Follow the exact schema provided.`;

const USER_PROMPT = (text: string) => `Extract the following fields from this resume. Return ONLY a JSON object matching this exact schema. Use null for missing strings, [] for missing arrays, false for missing booleans.

Schema:
{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "headline": string | null,
  "summary": string | null,
  "skills": string[],
  "jobs": [
    {
      "company": string,
      "title": string,
      "location": string | null,
      "startMonth": string | null,
      "startYear": string | null,
      "endMonth": string | null,
      "endYear": string | null,
      "current": boolean,
      "description": string | null
    }
  ],
  "degrees": [
    {
      "level": string | null,
      "field": string | null,
      "university": string | null,
      "gradYear": string | null,
      "gpa": string | null
    }
  ]
}

Rules:
- For months use 3-letter abbreviations: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
- For degree level map to one of exactly: "High school diploma" | "Associate's degree" | "Bachelor's degree" | "Master's degree" | "MBA" | "JD / Law degree" | "MD / Medical degree" | "PhD or Doctorate" — or null if unclear
- headline: short professional tagline, 100 chars max. Derive from most recent title + industry if not explicit
- summary: the professional summary/about section verbatim, 2000 chars max
- skills: extract all technical and professional skills as individual strings
- For current jobs set current=true and endMonth/endYear to null
- Order jobs with most recent first

Resume text:
${text}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured on this server.' },
      { status: 500 }
    );
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get('file') as File | null;
  } catch {
    return NextResponse.json({ error: 'Invalid request — expected multipart/form-data.' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large — 10 MB limit.' }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // ── Extract raw text ─────────────────────────────────────────────────────────
  let rawText = '';
  try {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');

    if (isPdf) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      rawText = result.text;
    } else if (isDocx) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Upload a PDF or DOCX.' }, { status: 422 });
    }
  } catch (err) {
    console.error('[parse-resume] text extraction failed:', err);
    return NextResponse.json({ error: 'Could not read file. Make sure it is a valid PDF or DOCX.' }, { status: 422 });
  }

  if (!rawText.trim()) {
    return NextResponse.json({ error: 'No text found in file. Try a different resume format.' }, { status: 422 });
  }

  // Trim to ~12 000 chars (~3 000 tokens) — enough for any resume
  const truncated = rawText.slice(0, 12000);

  // ── Send to GPT-4o ────────────────────────────────────────────────────────────
  let parsed: Record<string, unknown> = {};
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: USER_PROMPT(truncated) },
      ],
      temperature: 0,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });
    const content = completion.choices[0]?.message?.content ?? '{}';
    parsed = JSON.parse(content);
  } catch (err) {
    console.error('[parse-resume] OpenAI error:', err);
    return NextResponse.json({ error: 'AI parsing failed. Continue filling in manually.' }, { status: 500 });
  }

  return NextResponse.json({
    ...parsed,
    resumeText: rawText.slice(0, 50000),
  });
}

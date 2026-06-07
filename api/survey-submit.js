import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const config = {
  runtime: 'nodejs'
};

const localBackupPath = path.join(process.cwd(), '.deepsleep', 'survey-submissions.jsonl');

const requiredFields = [
  'fullName',
  'ageGroup',
  'state',
  'livelihood',
  'householdIncome',
  'awarenessEducationLoan',
  'receivingScholarship',
  'dbtLinked',
  'financialAidReducedBurden',
  'subsidyLowersBills',
  'budgetUseGood'
];

function cleanString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return !value || /^[0-9+\-\s()]{7,20}$/.test(value);
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body || '{}');
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}');
}

async function appendLocalBackup(record) {
  await fs.mkdir(path.dirname(localBackupPath), { recursive: true });
  await fs.appendFile(localBackupPath, `${JSON.stringify(record)}\n`, 'utf8');
}

async function forwardToGoogleSheets(record) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return { storage: 'local-backup', webhookConfigured: false };
  }

  const url = new URL(webhookUrl);
  if (process.env.GOOGLE_SHEETS_WEBHOOK_SECRET) {
    url.searchParams.set('secret', process.env.GOOGLE_SHEETS_WEBHOOK_SECRET);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Google Sheets webhook failed with ${response.status}. ${details}`.trim());
  }

  return { storage: 'google-sheets', webhookConfigured: true };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await readJson(req);

    if (cleanString(payload.company)) {
      return res.status(400).json({ error: 'Spam check failed' });
    }

    const normalized = {
      submittedAt: new Date().toISOString(),
      surveyName: cleanString(payload.surveyName) || 'economics-survey',
      sessionId: cleanString(payload.sessionId),
      fullName: cleanString(payload.fullName),
      phone: cleanString(payload.phone),
      email: cleanString(payload.email),
      ageGroup: cleanString(payload.ageGroup),
      gender: cleanString(payload.gender),
      state: cleanString(payload.state),
      livelihood: cleanString(payload.livelihood),
      householdIncome: cleanString(payload.householdIncome),
      awarenessEducationLoan: cleanString(payload.awarenessEducationLoan),
      receivingScholarship: cleanString(payload.receivingScholarship),
      improvedCircleCount: cleanString(payload.improvedCircleCount),
      participationBarrier: cleanString(payload.participationBarrier),
      relianceDecrease: cleanString(payload.relianceDecrease),
      applyMethod: cleanString(payload.applyMethod),
      informedLevel: cleanString(payload.informedLevel),
      transparentTerms: cleanString(payload.transparentTerms),
      lostWages: cleanString(payload.lostWages),
      dbtMiddlemenRemoved: cleanString(payload.dbtMiddlemenRemoved),
      dbtLinked: cleanString(payload.dbtLinked),
      financialAidReducedBurden: cleanString(payload.financialAidReducedBurden),
      budgetUseGood: cleanString(payload.budgetUseGood),
      benefitTypeImpact: cleanString(payload.benefitTypeImpact),
      subsidyLowersBills: cleanString(payload.subsidyLowersBills),
      preferenceType: cleanString(payload.preferenceType),
      techInvestmentLikelihood: cleanString(payload.techInvestmentLikelihood),
      notes: cleanString(payload.notes),
      pageUrl: cleanString(payload.pageUrl),
      referrer: cleanString(payload.referrer),
      utmSource: cleanString(payload.utmSource),
      utmMedium: cleanString(payload.utmMedium),
      utmCampaign: cleanString(payload.utmCampaign),
      utmContent: cleanString(payload.utmContent),
      utmTerm: cleanString(payload.utmTerm),
      locale: cleanString(payload.locale),
      timezone: cleanString(payload.timezone),
      screenSize: cleanString(payload.screenSize),
      userAgent: cleanString(payload.userAgent)
    };

    for (const key of requiredFields) {
      if (!normalized[key]) {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }

    if (!isValidEmail(normalized.email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!isValidPhone(normalized.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    let supabaseSaved = false;
    if (supabase) {
      try {
        const dbPayload = {
          survey_name: normalized.surveyName,
          session_id: normalized.sessionId,
          full_name: normalized.fullName,
          phone: normalized.phone,
          email: normalized.email,
          age_group: normalized.ageGroup,
          gender: normalized.gender,
          state: normalized.state,
          livelihood: normalized.livelihood,
          household_income: normalized.householdIncome,
          awareness_education_loan: normalized.awarenessEducationLoan,
          receiving_scholarship: normalized.receivingScholarship,
          improved_circle_count: normalized.improvedCircleCount,
          participation_barrier: normalized.participationBarrier,
          reliance_decrease: normalized.relianceDecrease,
          apply_method: normalized.applyMethod,
          informed_level: normalized.informedLevel,
          transparent_terms: normalized.transparentTerms,
          lost_wages: normalized.lostWages,
          dbt_middlemen_removed: normalized.dbtMiddlemenRemoved,
          dbt_linked: normalized.dbtLinked,
          financial_aid_reduced_burden: normalized.financialAidReducedBurden,
          budget_use_good: normalized.budgetUseGood,
          benefit_type_impact: normalized.benefitTypeImpact,
          subsidy_lowers_bills: normalized.subsidyLowersBills,
          preference_type: normalized.preferenceType,
          tech_investment_likelihood: normalized.techInvestmentLikelihood,
          notes: normalized.notes,
          page_url: normalized.pageUrl,
          referrer: normalized.referrer,
          utm_source: normalized.utmSource,
          utm_medium: normalized.utmMedium,
          utm_campaign: normalized.utmCampaign,
          utm_content: normalized.utmContent,
          utm_term: normalized.utmTerm,
          locale: normalized.locale,
          timezone: normalized.timezone,
          screen_size: normalized.screenSize,
          user_agent: normalized.userAgent
        };

        const { error: sbError } = await supabase
          .from('survey_submissions')
          .insert(dbPayload);

        if (sbError) throw sbError;
        supabaseSaved = true;
      } catch (sbErr) {
        console.error('Failed to save survey to Supabase:', sbErr);
      }
    }

    const sheetsResult = await forwardToGoogleSheets(normalized);
    let backupSaved = false;

    try {
      await appendLocalBackup(normalized);
      backupSaved = true;
    } catch (backupError) {
      console.warn('Local survey backup unavailable:', backupError);
    }

    if (sheetsResult.storage === 'local-backup' && !backupSaved && !supabaseSaved) {
      return res.status(503).json({
        error: 'Survey storage is not configured'
      });
    }

    return res.status(200).json({
      ok: true,
      storage: supabaseSaved
        ? 'supabase'
        : (sheetsResult.storage === 'local-backup' && backupSaved ? 'local-backup' : sheetsResult.storage)
    });
  } catch (error) {
    console.error('Survey submission failed:', error);
    return res.status(500).json({
      error: 'Survey submission failed'
    });
  }
}

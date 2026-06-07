import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const deepSleepDir = path.join(projectRoot, '.deepsleep');
const scoutFeedPath = path.join(dataDir, 'scout-feed.json');
const scoutMemoryPath = path.join(deepSleepDir, 'scout-memory.json');
const scoutActivityPath = path.join(deepSleepDir, 'scout-activity.jsonl');
const scoutWorkerStatePath = path.join(deepSleepDir, 'scout-worker.json');

const DEFAULT_SOURCES = [
  {
    id: 'myscheme',
    label: 'myScheme',
    url: 'https://www.myscheme.gov.in/',
    categoryHint: 'Government Schemes',
    stateHint: 'All States'
  },
  {
    id: 'nsp',
    label: 'National Scholarship Portal',
    url: 'https://scholarships.gov.in/',
    categoryHint: 'Scholarships',
    stateHint: 'All States'
  },
  {
    id: 'pm-kisan',
    label: 'PM-Kisan',
    url: 'https://pmkisan.gov.in/',
    categoryHint: 'Agriculture',
    stateHint: 'All States'
  },
  {
    id: 'mahadbt',
    label: 'MahaDBT',
    url: 'https://mahadbt.maharashtra.gov.in/',
    categoryHint: 'Scholarships',
    stateHint: 'Maharashtra'
  },
  {
    id: 'mahaswayam',
    label: 'MahaSwayam',
    url: 'https://rojgar.mahaswayam.gov.in/',
    categoryHint: 'Employment',
    stateHint: 'Maharashtra'
  }
];

const DEFAULT_FEED = {
  version: 1,
  status: 'idle',
  updatedAt: null,
  summary: 'Background scout is ready but has not completed its first run yet.',
  engine: {
    mode: 'background-worker',
    agent: 'web-agent-inspired',
    memory: 'deepsleep-inspired'
  },
  sources: [],
  discoveries: [],
  logs: [
    '[AGENT] Waiting for a background scout cycle...',
    '[AGENT] Official portal snapshots will appear here once the worker runs.'
  ]
};

function buildModel() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return null;

  const openai = createOpenAI({
    apiKey,
    baseURL: 'https://gateway.ai.vercel.com/v1'
  });

  return openai('openai/gpt-5.4');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html, fallback) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) return fallback;
  return stripHtml(titleMatch[1]).slice(0, 200) || fallback;
}

function extractJsonBlock(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function sanitizeDiscovery(discovery, index) {
  return {
    id: discovery.id || `SCOUT-${String(index + 1).padStart(3, '0')}`,
    kind: ['new', 'updated', 'monitoring'].includes(discovery.kind) ? discovery.kind : 'monitoring',
    title: String(discovery.title || `Monitoring insight ${index + 1}`).trim(),
    summary: String(discovery.summary || 'Official source snapshot captured.').trim(),
    sourceLabel: String(discovery.sourceLabel || 'Official source').trim(),
    sourceUrl: String(discovery.sourceUrl || '').trim(),
    category: String(discovery.category || 'Government Schemes').trim(),
    state: String(discovery.state || 'All States').trim(),
    confidence: ['high', 'medium', 'low'].includes(discovery.confidence) ? discovery.confidence : 'medium'
  };
}

function buildFallbackDiscoveries(snapshots) {
  const successful = snapshots.filter((snapshot) => snapshot.ok);

  if (!successful.length) {
    return [
      {
        id: 'SCOUT-001',
        kind: 'monitoring',
        title: 'Background monitor is online',
        summary: 'The scout worker is active, but the latest cycle could not fetch a clean official snapshot. It will retry automatically.',
        sourceLabel: 'Background worker',
        sourceUrl: '',
        category: 'Monitoring',
        state: 'All States',
        confidence: 'low'
      }
    ];
  }

  return successful.slice(0, 3).map((snapshot, index) => ({
    id: `SCOUT-${String(index + 1).padStart(3, '0')}`,
    kind: index === 0 ? 'updated' : 'monitoring',
    title: snapshot.title || `${snapshot.label} monitoring snapshot`,
    summary: `Scout reviewed ${snapshot.label} and captured a fresh official snapshot. Review the linked source for the latest scheme or policy details before acting.`,
    sourceLabel: snapshot.label,
    sourceUrl: snapshot.url,
    category: snapshot.categoryHint,
    state: snapshot.stateHint,
    confidence: 'medium'
  }));
}

function buildFallbackLogs(snapshots, reason) {
  const logs = [
    `[AGENT] Starting background cycle (${reason})...`
  ];

  for (const snapshot of snapshots) {
    if (snapshot.ok) {
      logs.push(`[AGENT] Captured ${snapshot.label}: ${snapshot.title || 'snapshot saved'}.`);
    } else {
      logs.push(`[AGENT] ${snapshot.label} fetch failed: ${snapshot.error}.`);
    }
  }

  logs.push('[AGENT] Stored fallback insights and refreshed local memory.');
  return logs.slice(-8);
}

async function fetchSourceSnapshot(source, logs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  const startedAt = new Date().toISOString();

  try {
    logs.push(`[AGENT] Fetching ${source.label}...`);
    const response = await fetch(source.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'FinSchemeScout/1.0 (+https://finscheme.com)'
      }
    });

    const html = await response.text();
    const title = extractTitle(html, source.label);
    const text = stripHtml(html).slice(0, 12000);

    return {
      ...source,
      ok: response.ok,
      status: response.status,
      fetchedAt: startedAt,
      title,
      text,
      error: response.ok ? null : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      ...source,
      ok: false,
      status: null,
      fetchedAt: startedAt,
      title: source.label,
      text: '',
      error: error.name === 'AbortError' ? 'timeout' : error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateDiscoveriesWithModel({ snapshots, previousFeed, reason }) {
  const model = buildModel();
  if (!model) return null;

  const relevantSnapshots = snapshots
    .filter((snapshot) => snapshot.ok && snapshot.text)
    .slice(0, 4)
    .map((snapshot) => ({
      label: snapshot.label,
      url: snapshot.url,
      title: snapshot.title,
      categoryHint: snapshot.categoryHint,
      stateHint: snapshot.stateHint,
      excerpt: snapshot.text.slice(0, 2500)
    }));

  if (!relevantSnapshots.length) return null;

  const previousTitles = Array.isArray(previousFeed?.discoveries)
    ? previousFeed.discoveries.map((item) => item.title).slice(0, 10)
    : [];

  const prompt = [
    'You are FinScheme Scout, a background research agent for Indian government schemes and policy updates.',
    'The agent is inspired by Firecrawl web-agent workflows and must stay conservative.',
    'Only use the provided official page snapshots. If a concrete new scheme/update is not obvious, return a monitoring insight instead of inventing anything.',
    'Prefer citizen-facing items: scholarships, welfare benefits, employment schemes, farmer support, women or child support, and state scheme updates.',
    'Return strict JSON with this shape:',
    '{"summary":"...","discoveries":[{"id":"SCOUT-001","kind":"new|updated|monitoring","title":"...","summary":"...","sourceLabel":"...","sourceUrl":"...","category":"...","state":"...","confidence":"high|medium|low"}],"logs":["..."]}',
    `Run reason: ${reason}.`,
    previousTitles.length
      ? `Avoid repeating these existing titles unless the snapshot clearly supports them: ${previousTitles.join(' | ')}`
      : 'There are no previous titles to avoid.',
    `Official snapshots: ${JSON.stringify(relevantSnapshots)}`
  ].join('\n\n');

  const result = await generateText({
    model,
    prompt,
    temperature: 0.2
  });

  const jsonBlock = extractJsonBlock(result.text);
  if (!jsonBlock) return null;

  const parsed = JSON.parse(jsonBlock);
  const discoveries = Array.isArray(parsed.discoveries)
    ? parsed.discoveries.slice(0, 3).map(sanitizeDiscovery)
    : [];

  return {
    summary: String(parsed.summary || '').trim(),
    discoveries,
    logs: Array.isArray(parsed.logs)
      ? parsed.logs.map((line) => String(line).trim()).filter(Boolean).slice(0, 8)
      : []
  };
}

async function ensureDirectories() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(deepSleepDir, { recursive: true });
}

export async function readScoutFeed() {
  try {
    const raw = await fs.readFile(scoutFeedPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_FEED };
  }
}

async function writeScoutFeed(feed) {
  await fs.writeFile(scoutFeedPath, JSON.stringify(feed, null, 2), 'utf8');
}

async function writeScoutMemory(feed) {
  const memory = {
    version: 1,
    meta: {
      project_root: projectRoot,
      updated_at: feed.updatedAt,
      engine: 'deepsleep-inspired',
      scout_status: feed.status
    },
    project: {
      summary: 'FinScheme AI Scheme Scout monitors official scheme and policy portals for new or updated citizen-facing opportunities.',
      goals: [
        'Track high-signal official updates.',
        'Preserve concise recent context for later runs.',
        'Avoid inventing unsupported scheme announcements.'
      ]
    },
    session: {
      last_dream_at: feed.updatedAt,
      summary: feed.summary,
      recent_sources: feed.sources.map((source) => ({
        label: source.label,
        ok: source.ok,
        title: source.title,
        fetchedAt: source.fetchedAt
      })),
      recent_discoveries: feed.discoveries.map((item) => ({
        title: item.title,
        kind: item.kind,
        sourceLabel: item.sourceLabel
      }))
    },
    ephemeral: {
      recent_logs: feed.logs.slice(-8),
      open_questions: [],
      recent_changes: [
        'data/scout-feed.json',
        '.deepsleep/scout-memory.json'
      ]
    }
  };

  await fs.writeFile(scoutMemoryPath, JSON.stringify(memory, null, 2), 'utf8');
  await fs.appendFile(scoutActivityPath, JSON.stringify({
    updatedAt: feed.updatedAt,
    status: feed.status,
    summary: feed.summary,
    discoveries: feed.discoveries.map((item) => item.title)
  }) + '\n', 'utf8');
}

export async function writeWorkerState(partialState) {
  await ensureDirectories();

  let previous = {};
  try {
    previous = JSON.parse(await fs.readFile(scoutWorkerStatePath, 'utf8'));
  } catch {
    previous = {};
  }

  const nextState = {
    ...previous,
    ...partialState
  };

  await fs.writeFile(scoutWorkerStatePath, JSON.stringify(nextState, null, 2), 'utf8');
  return nextState;
}

export async function clearWorkerState() {
  try {
    await fs.unlink(scoutWorkerStatePath);
  } catch {
    // No-op when the file does not exist.
  }
}

export async function runSchemeScout(options = {}) {
  const {
    reason = 'manual',
    maxSources = DEFAULT_SOURCES.length
  } = options;

  await ensureDirectories();

  const previousFeed = await readScoutFeed();
  const logBuffer = [];
  const sources = DEFAULT_SOURCES.slice(0, maxSources);
  const snapshots = await Promise.all(sources.map((source) => fetchSourceSnapshot(source, logBuffer)));

  let aiResult = null;
  let aiUnavailable = false;
  try {
    aiResult = await generateDiscoveriesWithModel({
      snapshots,
      previousFeed,
      reason
    });
  } catch (error) {
    aiUnavailable = true;
    logBuffer.push(`[AGENT] AI summarization fallback triggered: ${error.message}.`);
  }

  if (!aiResult) {
    aiUnavailable = true;
  }

  const fallbackDiscoveries = buildFallbackDiscoveries(snapshots);
  const discoveries = aiResult?.discoveries?.length ? aiResult.discoveries : fallbackDiscoveries;
  const summary = aiResult?.summary || (
    aiUnavailable
      ? 'Background scout refreshed official portal snapshots using fallback extraction because AI summarization was unavailable.'
      : 'Background scout refreshed official portal snapshots and updated the local cache.'
  );
  const logs = aiResult?.logs?.length
    ? aiResult.logs
    : [...logBuffer, ...buildFallbackLogs(snapshots, reason)].slice(-8);
  const updatedAt = new Date().toISOString();
  const hadSuccessfulFetch = snapshots.some((snapshot) => snapshot.ok);

  const feed = {
    version: 1,
    status: hadSuccessfulFetch ? (aiResult ? 'ready' : 'fallback') : 'error',
    updatedAt,
    summary,
    engine: {
      mode: 'background-worker',
      agent: 'web-agent-inspired',
      memory: 'deepsleep-inspired'
    },
    sources: snapshots.map((snapshot) => ({
      id: snapshot.id,
      label: snapshot.label,
      url: snapshot.url,
      ok: snapshot.ok,
      status: snapshot.status,
      title: snapshot.title,
      fetchedAt: snapshot.fetchedAt,
      error: snapshot.error
    })),
    discoveries,
    logs
  };

  await writeScoutFeed(feed);
  await writeScoutMemory(feed);
  await writeWorkerState({
    pid: process.pid,
    lastRunAt: updatedAt,
    lastStatus: feed.status,
    lastSummary: feed.summary,
    heartbeatAt: updatedAt
  });

  return feed;
}

export {
  DEFAULT_FEED,
  scoutFeedPath,
  scoutMemoryPath,
  scoutWorkerStatePath,
  projectRoot,
  sleep
};

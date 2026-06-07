import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

export const config = {
  runtime: 'nodejs'
};

async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
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
    const task = payload.task || '';
    const agents = payload.agents || 'assistant';
    const model = payload.model || 'gemini/gemini-2.5-flash';

    if (!task) {
      return res.status(400).json({ error: 'Missing required parameter: task' });
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const isWin = process.platform === 'win32';
    const pythonCmd = isWin ? 'python' : 'python3';
    const scriptPath = path.join(process.cwd(), 'api', 'praison-swarm.py');

    const args = [
      scriptPath,
      '--task', task,
      '--agents', agents,
      '--model', model,
      '--verbose', '1'
    ];

    // Stream process start
    res.write(`data: ${JSON.stringify({ type: 'sys', text: `Spawning Python script: ${pythonCmd} api/praison-swarm.py` })}\n\n`);

    const child = spawn(pythonCmd, args, {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    child.stdout.on('data', (data) => {
      const text = data.toString('utf8');
      res.write(`data: ${JSON.stringify({ type: 'stdout', text })}\n\n`);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString('utf8');
      res.write(`data: ${JSON.stringify({ type: 'stderr', text })}\n\n`);
    });

    child.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'stderr', text: `Process error: ${err.message}` })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'exit', code: -1 })}\n\n`);
      res.end();
    });

    child.on('close', (code) => {
      res.write(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Praison run error:', error);
    try {
      res.write(`data: ${JSON.stringify({ type: 'stderr', text: `Internal server error: ${error.message}` })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'exit', code: 500 })}\n\n`);
    } catch {
      // Ignore if response headers already closed
    }
    res.end();
  }
}

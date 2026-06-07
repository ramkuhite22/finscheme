import { readScoutFeed, runSchemeScout } from './_scheme-scout-core.js';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    if (req.method === 'POST') {
      const feed = await runSchemeScout({ reason: 'api-refresh' });
      res.status(200).json(feed);
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const feed = await readScoutFeed();
    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({
      error: 'Scout request failed',
      details: error.message
    });
  }
}

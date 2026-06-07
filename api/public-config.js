export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
    surveySheetsConfigured: Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL)
  });
}

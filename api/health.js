/**
 * @file api/health.js
 * Health monitoring endpoint for TransitPulse API.
 * Compatible with Vercel Serverless Functions and Node.js HTTP servers.
 */

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const isLtaConfigured = Boolean(process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim() !== '');

  const payload = {
    status: 'ok',
    service: 'TransitPulse LTA Bus API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    lta_configured: isLtaConfigured,
    endpoints: {
      health: '/api/health',
      busArrival: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7'
    },
    message: isLtaConfigured
      ? 'LTA_ACCOUNT_KEY is configured.'
      : 'LTA_ACCOUNT_KEY environment variable is not yet configured. Provide it in Vercel or local environment.'
  };

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(payload, null, 2));
}

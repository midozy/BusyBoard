// Vercel Serverless Function for BusyBoard Status API
// State is persisted in Upstash Redis (Vercel Marketplace) so it survives
// cold starts and is shared across all function instances.

const REDIS_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY   = 'busyboard:state';

const DEFAULT_STATE = {
  status: 'available',
  customMessage: '',
  panelHidden: false,
  theme: 'light'
};

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`Redis error ${r.status}`);
  return (await r.json()).result;
}

async function loadState() {
  const raw = await redis(['GET', STATE_KEY]);
  return { ...DEFAULT_STATE, ...(raw ? JSON.parse(raw) : {}) };
}

async function saveState(state) {
  await redis(['SET', STATE_KEY, JSON.stringify(state)]);
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache-Control is set per-method below (GET gets edge caching, POST stays no-store)

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!REDIS_URL || !REDIS_TOKEN) {
    res.status(500).json({ error: 'Redis is not configured' });
    return;
  }

  try {
    // GET /api/status
    if (req.method === 'GET') {
      const state = await loadState();
      // Let the CDN edge cache this for 5 s and serve stale up to 30 s while
      // revalidating — collapses N simultaneous client polls into 1 origin hit.
      // POST responses stay no-store so writes are never cached.
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
      res.status(200).json(state);
      return;
    }

    // POST /api/status
    if (req.method === 'POST') {
      res.setHeader('Cache-Control', 'no-store');
      const { status, customMessage, panelHidden, theme } = req.body || {};

      if (status === undefined && panelHidden === undefined && theme === undefined) {
        res.status(400).json({ error: 'Bad request' });
        return;
      }

      // Update only the fields that are provided
      const state = await loadState();
      if (status !== undefined) state.status = status;
      if (customMessage !== undefined) state.customMessage = customMessage;
      if (panelHidden !== undefined) state.panelHidden = panelHidden;
      if (theme !== undefined) state.theme = theme;

      await saveState(state);
      res.status(200).json(state);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: 'Storage error' });
  }
};

// Vercel Serverless Function for BusyBoard Status API
// Note: This is stateless - each user will have their own localStorage state

let state = { status: 'available', customMessage: '' };

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // GET /api/status
  if (req.method === 'GET') {
    res.status(200).json(state);
    return;
  }

  // POST /api/status
  if (req.method === 'POST') {
    try {
      const { status, customMessage } = req.body;
      
      if (status) {
        state = {
          status,
          customMessage: customMessage || ''
        };
        res.status(200).json(state);
      } else {
        res.status(400).json({ error: 'Bad request' });
      }
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};

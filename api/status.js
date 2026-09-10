// Vercel Serverless Function for BusyBoard Status API
// Note: This is stateless - state persists only during function lifetime
// For true persistence, use Vercel KV or a database

let state = { 
  status: 'available', 
  customMessage: '',
  panelHidden: false,
  theme: 'light'
};

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
      const { status, customMessage, panelHidden, theme } = req.body;
      
      if (status !== undefined || panelHidden !== undefined || theme !== undefined) {
        // Update only the fields that are provided
        if (status !== undefined) state.status = status;
        if (customMessage !== undefined) state.customMessage = customMessage;
        if (panelHidden !== undefined) state.panelHidden = panelHidden;
        if (theme !== undefined) state.theme = theme;
        
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

// Simple API key middleware - checks env PUBLIC_API_KEY or api_keys table
const pool = require('../config/db');

const apiKeyAuth = async (req, res, next) => {
  try {
    const incoming = req.headers['x-api-key'] || req.query.api_key;
    if (!incoming) return res.status(401).json({ message: 'API key required' });

    if (process.env.PUBLIC_API_KEY && incoming === process.env.PUBLIC_API_KEY) {
      return next();
    }

    // DB lookup (if table exists)
    try {
      const [rows] = await pool.query('SELECT id, name, active FROM api_keys WHERE api_key = ? LIMIT 1', [incoming]);
      if (rows && rows.length > 0 && rows[0].active) return next();
    } catch (dbErr) {
      console.warn('apiKeyAuth db check failed', dbErr.message || dbErr);
    }

    return res.status(403).json({ message: 'Invalid API key' });
  } catch (err) {
    console.error('apiKeyAuth error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { apiKeyAuth };
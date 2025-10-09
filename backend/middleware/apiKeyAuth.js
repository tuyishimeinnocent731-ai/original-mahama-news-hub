const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'API Key is required.' });
    }
    
    const prefix = apiKey.substring(0, 8);

    try {
        const [keyRows] = await pool.query('SELECT user_id, key_hash FROM api_keys WHERE prefix = ?', [prefix]);

        if (keyRows.length === 0) {
            return res.status(401).json({ message: 'Invalid API Key.' });
        }
        
        const { user_id, key_hash } = keyRows[0];
        
        const isMatch = await bcrypt.compare(apiKey, key_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid API Key.' });
        }
        
        // Key is valid, fetch user and attach to request
        const [userRows] = await pool.query('SELECT id, name, email, role, subscription FROM users WHERE id = ?', [user_id]);

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'User associated with API key not found.' });
        }
        
        req.user = userRows[0];

        // Update last_used timestamp (fire and forget)
        pool.query('UPDATE api_keys SET last_used = NOW() WHERE prefix = ?', [prefix]);
        
        next();

    } catch (error) {
        next(error);
    }
};

module.exports = { apiKeyAuth };

const axios = require('axios');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/external/sync
 * Body: { source: 'newsapi' | 'gnews' | 'all' }
 * Requires admin. Performs a best-effort insert for new articles.
 */
const syncExternal = async (req, res, next) => {
  try {
    const source = (req.body.source || 'all').toLowerCase();
    const inserted = [];

    const upsertArticle = async (a) => {
      if (!a.url) return null;
      const [exists] = await pool.query('SELECT id FROM articles WHERE url = ? LIMIT 1', [a.url]);
      if (exists && exists.length > 0) return null;
      const id = `article-${uuidv4()}`;
      const article = {
        id,
        title: a.title || 'Untitled',
        description: a.description || '',
        body: a.content || a.description || '',
        author: a.author || 'External',
        url: a.url,
        urlToImage: a.urlToImage || a.image || null,
        category: a.source_category || 'World',
        tags: JSON.stringify(a.tags || []),
        published_at: a.publishedAt || new Date(),
        created_at: new Date()
      };
      await pool.query('INSERT INTO articles SET ?', article);
      return article;
    };

    if ((source === 'newsapi' || source === 'all') && process.env.NEWSAPI_KEY) {
      const key = process.env.NEWSAPI_KEY;
      const response = await axios.get('https://newsapi.org/v2/top-headlines', { params: { language: 'en', pageSize: 50, apiKey: key }});
      for (const it of (response.data.articles || [])) {
        const up = await upsertArticle(it);
        if (up) inserted.push(up);
      }
    }

    if ((source === 'gnews' || source === 'all') && process.env.GNEWS_KEY) {
      const key = process.env.GNEWS_KEY;
      const response = await axios.get('https://gnews.io/api/v4/top-headlines', { params: { token: key, lang: 'en', max: 50 }});
      for (const it of (response.data.articles || [])) {
        const up = await upsertArticle(it);
        if (up) inserted.push(up);
      }
    }

    res.json({ inserted: inserted.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { syncExternal };

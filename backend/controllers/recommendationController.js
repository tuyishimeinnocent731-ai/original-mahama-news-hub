const pool = require('../config/db');

/**
 * GET /api/recommendations?userId=...&count=...
 * If userId not provided, return trending by views.
 * If user has preferred_categories/preferred_tags, prefer those.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const count = parseInt(req.query.count || '10', 10);

    if (!userId) {
      const [rows] = await pool.query(
        'SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?',
        [count]
      );
      return res.json(rows);
    }

    const [rows] = await pool.query('SELECT preferred_categories, preferred_tags FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
    const settings = rows && rows.length > 0 ? rows[0] : null;
    const categories = settings && settings.preferred_categories ? JSON.parse(settings.preferred_categories) : [];
    const tags = settings && settings.preferred_tags ? JSON.parse(settings.preferred_tags) : [];

    // Simple hybrid scoring
    let base = 'SELECT *, (CASE WHEN LOWER(category) IN (?) THEN 2 ELSE 0 END)';
    const params = [categories.map(c => c.toLowerCase())];

    if (tags.length > 0) {
      base += ' + (CASE ';
      base += tags.map(() => ' WHEN tags LIKE ? THEN 1').join('');
      base += ' ELSE 0 END)';
      params.push(...tags.map(t => `%${t}%`));
    } else {
      base += ' AS score';
    }

    base += ' FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY score DESC, published_at DESC LIMIT ?';
    params.push(count);

    const [articles] = await pool.query(base, params);

    if (!articles || articles.length === 0) {
      const [fallback] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(fallback);
    }
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };

const pool = require('../config/db');

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const count = parseInt(req.query.count || '10', 10);

    if (!userId) {
      const [rows] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(rows);
    }

    const [rows] = await pool.query('SELECT preferred_categories, preferred_tags FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
    const settings = rows && rows.length > 0 ? rows[0] : null;
    const categories = settings && settings.preferred_categories ? JSON.parse(settings.preferred_categories) : [];
    const tags = settings && settings.preferred_tags ? JSON.parse(settings.preferred_tags) : [];

    let params = [];
    let q = 'SELECT *, (CASE WHEN LOWER(category) IN (?) THEN 2 ELSE 0 END)';
    params.push(categories.map(c => c.toLowerCase()));

    if (tags.length > 0) {
      q += ' + (CASE ';
      q += tags.map(() => ' WHEN tags LIKE ? THEN 1').join('');
      q += ' ELSE 0 END)';
      params.push(...tags.map(t => `%${t}%`));
    } else {
      q += ' AS score';
    }
    q += ' FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY score DESC, published_at DESC LIMIT ?';
    params.push(count);

    const [articles] = await pool.query(q, params);
    if (articles && articles.length > 0) return res.json(articles);

    // Collaborative-ish fallback
    const [userViews] = await pool.query('SELECT article_id FROM user_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 50', [userId]);
    if (!userViews || userViews.length === 0) {
      const [trending] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(trending);
    }
    const viewedIds = userViews.map(v => v.article_id);
    const [others] = await pool.query(
      `SELECT DISTINCT uv2.article_id as id, a.* FROM user_views uv1
       JOIN user_views uv2 ON uv1.user_id = uv2.user_id
       JOIN articles a ON a.id = uv2.article_id
       WHERE uv1.article_id IN (?) AND uv2.article_id NOT IN (?) AND (a.scheduled_for IS NULL OR a.scheduled_for <= NOW())
       ORDER BY uv2.viewed_at DESC LIMIT ?`,
      [viewedIds, viewedIds, count]
    );
    return res.json(others);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };

const pool = require('../config/db');

const recordView = async (req, res, next) => {
  try {
    const user = req.user || null;
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ message: 'articleId required' });
    await pool.query('UPDATE articles SET views = COALESCE(views,0) + 1 WHERE id = ?', [articleId]);
    const insert = { article_id: articleId, user_id: user ? user.id : null, viewed_at: new Date() };
    await pool.query('INSERT INTO user_views SET ?', insert);
    res.json({ message: 'Recorded' });
  } catch (err) { next(err); }
};

const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const [rows] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [limit]);
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { recordView, getTrending };

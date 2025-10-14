const pool = require('../config/db');

/**
 * GET /api/search?q=...&page=1&limit=10
 * Set USE_FULLTEXT=true in .env if you created FULLTEXT index on articles(title, description, body)
 */
const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ message: 'q parameter is required' });

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const useFulltext = process.env.USE_FULLTEXT === 'true';

    if (useFulltext) {
      const [rows] = await pool.query(
        `SELECT *, MATCH(title, description, body) AGAINST(?) AS score
         FROM articles
         WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE)
           AND (scheduled_for IS NULL OR scheduled_for <= NOW())
         ORDER BY score DESC
         LIMIT ? OFFSET ?`,
        [q, q, limit, offset]
      );
      const [countRes] = await pool.query(
        `SELECT COUNT(*) as total FROM articles WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE) AND (scheduled_for IS NULL OR scheduled_for <= NOW())`,
        [q]
      );
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const likeQ = `%${q}%`;
      const [rows] = await pool.query(
        `SELECT * FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT ? OFFSET ?`,
        [likeQ, likeQ, likeQ, limit, offset]
      );
      const [countRes] = await pool.query(
        `SELECT COUNT(*) as total FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW())`,
        [likeQ, likeQ, likeQ]
      );
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { search };

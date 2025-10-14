const pool = require('../config/db');
const Typesense = require('typesense');

const typesenseClient = (process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY) ? new Typesense.Client({
  nodes: [{ host: process.env.TYPESENSE_HOST, port: process.env.TYPESENSE_PORT || '8108', protocol: process.env.TYPESENSE_PROTO || 'http' }],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2
}) : null;

const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ message: 'q parameter required' });
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    if (typesenseClient) {
      const searchParams = { q, query_by: 'title,description,body', per_page: limit, page };
      const resTs = await typesenseClient.collections('articles').documents().search(searchParams);
      return res.json({ articles: resTs.hits.map(h => h.document), totalPages: Math.ceil((resTs.found || 0) / limit), currentPage: page });
    }

    const useFulltext = process.env.USE_FULLTEXT === 'true';
    const offset = (page - 1) * limit;
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
      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM articles WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE)`, [q]);
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const likeQ = `%${q}%`;
      const [rows] = await pool.query(`SELECT * FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT ? OFFSET ?`, [likeQ, likeQ, likeQ, limit, offset]);
      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?)`, [likeQ, likeQ, likeQ]);
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { search };

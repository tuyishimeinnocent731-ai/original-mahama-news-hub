const pool = require('../config/db');

const getBookmarks = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const [rows] = await pool.query('SELECT b.id, b.article_id, a.title, a.url, a.urlToImage, b.created_at FROM bookmarks b JOIN articles a ON a.id = b.article_id WHERE b.user_id = ? ORDER BY b.created_at DESC', [user.id]);
    res.json(rows);
  } catch (err) { next(err); }
};

const addBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ message: 'articleId required' });
    const [exists] = await pool.query('SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ? LIMIT 1', [user.id, articleId]);
    if (exists && exists.length > 0) return res.status(200).json({ message: 'Already bookmarked' });
    const insert = { user_id: user.id, article_id: articleId, created_at: new Date() };
    const [result] = await pool.query('INSERT INTO bookmarks SET ?', insert);
    res.status(201).json({ id: result.insertId, ...insert });
  } catch (err) { next(err); }
};

const removeBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    await pool.query('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, user.id]);
    res.json({ message: 'Bookmark removed' });
  } catch (err) { next(err); }
};

module.exports = { getBookmarks, addBookmark, removeBookmark };

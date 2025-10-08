const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });


const getArticlesByCategory = (category) => {
    switch (category.toLowerCase()) {
        case 'world': return ['world', 'europe', 'asia', 'americas', 'africa'];
        case 'business': return ['business', 'markets', 'companies', 'economy'];
        case 'technology': return ['technology', 'ai', 'gadgets', 'innovation'];
        case 'entertainment': return ['entertainment', 'movies', 'music', 'gaming'];
        default: return [category.toLowerCase()];
    }
}

const getAllArticles = async (req, res) => {
    const { category = 'World', page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    try {
        const categories = getArticlesByCategory(category);

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM articles WHERE LOWER(category) IN (?) AND (scheduled_for IS NULL OR scheduled_for <= NOW())',
            [categories]
        );
        const totalArticles = countResult[0].total;
        const totalPages = Math.ceil(totalArticles / limitNum);

        const [articles] = await pool.query(
            `SELECT * FROM articles WHERE LOWER(category) IN (?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT ? OFFSET ?`,
            [categories, limitNum, offset]
        );
        res.json({ articles, totalPages, currentPage: pageNum });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchArticles = async (req, res) => {
    const { query, category, author, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Add to search history if a user is logged in
    if (req.user && query) {
        pool.query('INSERT INTO search_history (user_id, query) VALUES (?, ?)', [req.user.id, query]);
    }

    try {
        let countSql = `SELECT COUNT(*) as total FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW())`;
        let sql = `SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW())`;
        const params = [];
        const countParams = [];

        if (query) {
            const clause = ' AND (title LIKE ? OR description LIKE ? OR body LIKE ?)';
            sql += clause;
            countSql += clause;
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        if (category) {
            const catClause = ' AND category = ?';
            sql += catClause;
            countSql += catClause;
            params.push(category);
            countParams.push(category);
        }
        if (author) {
            const authClause = ' AND author = ?';
            sql += authClause;
            countSql += authClause;
            params.push(author);
            countParams.push(author);
        }
        
        const [countResult] = await pool.query(countSql, countParams);
        const totalArticles = countResult[0].total;
        const totalPages = Math.ceil(totalArticles / limitNum);
        
        sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [articles] = await pool.query(sql, params);
        res.json({ articles, totalPages, currentPage: pageNum });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTopStories = async (req, res) => {
    try {
        const [articles] = await pool.query(
            'SELECT * FROM articles WHERE scheduled_for IS NULL OR scheduled_for <= NOW() ORDER BY view_count DESC, published_at DESC LIMIT 4'
        );
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getSuggestions = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    try {
        const [articles] = await pool.query(
            "SELECT * FROM articles WHERE title LIKE ? AND (scheduled_for IS NULL OR scheduled_for <= NOW()) LIMIT 5",
            [`%${query}%`]
        );
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getArticleById = async (req, res) => {
    try {
        pool.query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

        const [articles] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (articles.length > 0) {
            res.json(articles[0]);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRelatedArticles = async (req, res) => {
    const { id } = req.params;
    try {
        const [currentArticles] = await pool.query('SELECT category FROM articles WHERE id = ?', [id]);
        if (currentArticles.length === 0) return res.status(404).json({ message: 'Article not found' });
        
        const { category } = currentArticles[0];
        const [related] = await pool.query(
            'SELECT * FROM articles WHERE category = ? AND id != ? AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT 4',
            [category, id]
        );
        res.json(related);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const createArticle = async (req, res) => {
    const { title, description, body, author, category, scheduledFor } = req.body;
    
    let urlToImage;
    if (req.body.urlToImage) { // If base64 string is passed
        urlToImage = req.body.urlToImage;
    } else if (req.file) { // If file is uploaded
        urlToImage = `/uploads/${req.file.filename}`;
    }

    if (!title || !description || !body || !author || !category) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const newArticle = {
            id: `article-${uuidv4()}`,
            title, description, body, author, category, url_to_image: urlToImage,
            source_name: 'Mahama News Hub',
            published_at: scheduledFor ? null : new Date(),
            scheduled_for: scheduledFor ? new Date(scheduledFor) : null,
        };
        await pool.query('INSERT INTO articles SET ?', newArticle);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, description, body, author, category, scheduledFor, urlToImage: bodyUrlToImage } = req.body;

    try {
        const [articles] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
        if (articles.length === 0) return res.status(404).json({ message: 'Article not found' });
        
        let url_to_image;
        if (req.file) {
            url_to_image = `/uploads/${req.file.filename}`;
        } else if (bodyUrlToImage) {
            url_to_image = bodyUrlToImage;
        } else {
            url_to_image = articles[0].url_to_image;
        }

        const updatedArticle = {
            title, description, body, author, category, url_to_image,
            scheduled_for: scheduledFor ? new Date(scheduledFor) : null,
        };

        await pool.query('UPDATE articles SET ? WHERE id = ?', [updatedArticle, id]);
        res.json({ id, ...updatedArticle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Article deleted' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createComment = async (req, res) => {
    const { articleId, body, parentId } = req.body;
    const userId = req.user.id;

    if (!body) {
        return res.status(400).json({ message: 'Comment body cannot be empty.' });
    }

    try {
        const newComment = {
            id: `comment-${uuidv4()}`,
            article_id: articleId,
            user_id: userId,
            body,
            parent_id: parentId || null
        };
        await pool.query('INSERT INTO comments SET ?', newComment);

        const [commentRows] = await pool.query(`
            SELECT c.*, u.name as author_name, u.avatar as author_avatar 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [newComment.id]);

        res.status(201).json(commentRows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while posting comment.' });
    }
};

const getCommentsForArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const [comments] = await pool.query(`
            SELECT c.*, u.name as author_name, u.avatar as author_avatar 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.article_id = ? 
            ORDER BY c.created_at ASC
        `, [id]);
        
        const commentMap = {};
        const nestedComments = [];
        comments.forEach(comment => {
            commentMap[comment.id] = {...comment, replies: []};
        });
        comments.forEach(comment => {
            if (comment.parent_id) {
                if (commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
                }
            } else {
                nestedComments.push(commentMap[comment.id]);
            }
        });

        res.json(nestedComments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
};

module.exports = {
    getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, searchArticles, getTopStories, getSuggestions, getRelatedArticles, upload, createComment, getCommentsForArticle
};
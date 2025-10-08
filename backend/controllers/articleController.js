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
    const { category = 'World' } = req.query;
    try {
        const categories = getArticlesByCategory(category);
        const [articles] = await pool.query(
            `SELECT * FROM articles WHERE LOWER(category) IN (?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC`,
            [categories]
        );
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchArticles = async (req, res) => {
    const { query, category, author } = req.query;
    
    // Add to search history if a user is logged in
    if (req.user && query) {
        await pool.query('INSERT INTO search_history (user_id, query) VALUES (?, ?)', [req.user.id, query]);
    }

    try {
        let sql = `SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW())`;
        const params = [];

        if (query) {
            sql += ' AND (title LIKE ? OR description LIKE ? OR body LIKE ?)';
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }
        if (author) {
            sql += ' AND author = ?';
            params.push(author);
        }
        sql += ' ORDER BY published_at DESC';

        const [articles] = await pool.query(sql, params);
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTopStories = async (req, res) => {
    try {
        const [articles] = await pool.query(
            'SELECT * FROM articles WHERE scheduled_for IS NULL OR scheduled_for <= NOW() ORDER BY published_at DESC LIMIT 4'
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

module.exports = {
    getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, searchArticles, getTopStories, getSuggestions, getRelatedArticles, upload
};

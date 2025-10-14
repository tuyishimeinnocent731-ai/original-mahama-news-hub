const express = require('express');
const router = express.Router();
const { getAllArticles, getArticleById, searchArticles, getTopStories } = require('../controllers/articleController');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');

// All routes in this file are protected by API key
router.use(apiKeyAuth);

router.get('/articles', getAllArticles);
router.get('/articles/search', searchArticles);
router.get('/articles/top-stories', getTopStories);
router.get('/articles/:id', getArticleById);

module.exports = router;
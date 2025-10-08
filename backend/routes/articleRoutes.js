const express = require('express');
const router = express.Router();
const { 
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    getTopStories,
    getSuggestions,
    getRelatedArticles
} = require('../controllers/articleController');
const { protect, subAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../controllers/articleController');

router.route('/')
    .get(getAllArticles)
    .post(protect, subAdmin, upload.single('image'), createArticle);

router.get('/search', searchArticles);
router.get('/top-stories', getTopStories);
router.get('/suggestions', getSuggestions);

router.route('/:id')
    .get(getArticleById)
    .put(protect, subAdmin, upload.single('image'), updateArticle)
    .delete(protect, subAdmin, deleteArticle);

router.get('/:id/related', getRelatedArticles);

module.exports = router;

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
    getRelatedArticles,
    getCommentsForArticle,
    createComment,
    getAllComments,
    deleteComment,
} = require('../controllers/articleController');
const { protect, subAdmin, admin } = require('../middleware/authMiddleware');
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

router.route('/:id/comments')
    .get(getCommentsForArticle)
    .post(protect, createComment);

// Admin comment management
router.get('/comments/all', protect, admin, getAllComments);
router.delete('/comments/:id', protect, admin, deleteComment);


module.exports = router;
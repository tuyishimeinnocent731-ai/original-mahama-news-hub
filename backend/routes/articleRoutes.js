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
    updateCommentStatus,
} = require('../controllers/articleController');
const { protect, subAdmin, admin } = require('../middleware/authMiddleware');
const { upload } = require('../controllers/articleController');
const { validateArticle, validateComment } = require('../middleware/validationMiddleware');

router.route('/')
    .get(getAllArticles)
    .post(protect, subAdmin, upload.single('image'), validateArticle, createArticle);

router.get('/search', searchArticles);
router.get('/top-stories', getTopStories);
router.get('/suggestions', getSuggestions);

router.route('/:id')
    .get(getArticleById)
    .put(protect, subAdmin, upload.single('image'), validateArticle, updateArticle)
    .delete(protect, subAdmin, deleteArticle);

router.get('/:id/related', getRelatedArticles);

router.route('/:id/comments')
    .get(getCommentsForArticle)
    .post(protect, validateComment, createComment);

// Admin comment management
router.get('/comments/all', protect, admin, getAllComments);
router.put('/comments/:commentId/status', protect, admin, updateCommentStatus);
router.delete('/comments/:commentId', protect, admin, deleteComment);


module.exports = router;

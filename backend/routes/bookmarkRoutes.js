const express = require('express');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(protect);
router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:id', removeBookmark);
module.exports = router;

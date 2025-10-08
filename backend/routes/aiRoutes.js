const express = require('express');
const router = express.Router();
const { 
    summarize, 
    getKeyPoints, 
    askAboutArticle, 
    generateImage, 
    translate
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require a logged-in user
router.use(protect);

router.post('/summarize', summarize);
router.post('/key-points', getKeyPoints);
router.post('/ask', askAboutArticle);
router.post('/generate-image', generateImage);
router.post('/translate', translate);

module.exports = router;
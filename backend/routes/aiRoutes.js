const express = require('express');
const router = express.Router();
const { 
    summarize, 
    getKeyPoints, 
    askAboutArticle, 
    generateImage, 
    translate,
    generateVideo,
    getVideoOperation,
    upload
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require a logged-in user
router.use(protect);

router.post('/summarize', summarize);
router.post('/key-points', getKeyPoints);
router.post('/ask', askAboutArticle);
router.post('/generate-image', generateImage);
router.post('/translate', translate);

// NEW routes for video generation
router.post('/generate-video', upload.single('image'), generateVideo);
router.post('/get-video-operation', getVideoOperation);


module.exports = router;

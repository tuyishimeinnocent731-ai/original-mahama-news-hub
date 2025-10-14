const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

// public: can accept userId query param for personalized results
router.get('/', getRecommendations);

module.exports = router;

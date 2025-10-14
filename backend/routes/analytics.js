const express = require('express');
const { recordView, getTrending } = require('../controllers/analyticsController');
const router = express.Router();
router.post('/view', recordView);
router.get('/trending', getTrending);
module.exports = router;

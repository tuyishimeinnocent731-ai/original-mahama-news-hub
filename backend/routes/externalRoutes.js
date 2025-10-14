const express = require('express');
const router = express.Router();
const { syncExternal } = require('../controllers/externalController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only admins should trigger full syncs by default
router.post('/sync', protect, admin, syncExternal);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getNavLinks, updateNavLinks, getSiteSettings, updateSiteSettings } = require('../controllers/siteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/nav-links')
    .get(getNavLinks)
    .put(protect, admin, updateNavLinks);

router.route('/settings')
    .get(getSiteSettings)
    .put(protect, admin, updateSiteSettings);

module.exports = router;
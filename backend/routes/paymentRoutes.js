const express = require('express');
const router = express.Router();
const { createCheckoutSession, createPortalSession, getConfig } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', getConfig);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/customer-portal', protect, createPortalSession);

module.exports = router;
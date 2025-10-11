const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validationMiddleware');

router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

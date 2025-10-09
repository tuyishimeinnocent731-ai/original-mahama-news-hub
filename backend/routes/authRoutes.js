const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginWithGoogle } = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validationMiddleware');

router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);

module.exports = router;
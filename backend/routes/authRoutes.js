const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', verifyToken, getProfile);

module.exports = router;

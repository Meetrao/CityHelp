const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserStats } = require('../controllers/leaderboardController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get('/stats', verifyToken, getUserStats);

module.exports = router;
